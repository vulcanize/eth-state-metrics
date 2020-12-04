require('dotenv').config()
var process = require('process')
const express = require('express')
var CronJob = require('cron').CronJob;
const etherscan = require('./etherscan');
const AppError = require('./error');
const prom = require('./prometheus');
const DB = require('./db');

const startServer = () => {
    const server = express();

    server.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', prom.register.contentType)
            res.end(await prom.register.metrics())
        } catch (ex) {
            res.status(500).end(ex)
        }
    });

    const serverPort = process.env.SERVER_PORT || 3000;
    const serverHost = process.env.SERVER_HOST || '127.0.0.1';
    server.listen(serverPort, serverHost, () => console.log(`Http server running on port ${serverHost}:${serverPort}`));
}

const run = async () => {
    const statediffUser = process.env.STATEDIFF_PG_USER;
    const statediffPassword = process.env.STATEDIFF_PG_PASSWORD;
    const statediffDB = process.env.STATEDIFF_PG_DATABASE;
    const statediffHost = process.env.STATEDIFF_PG_HOST;
    const statediffPort = process.env.STATEDIFF_PG_PORT;

    const dbStateDiff = new DB('statediff', statediffUser, statediffPassword, statediffDB, statediffHost, statediffPort)
    const dbStateDiffBlockNumber = dbStateDiff.getBlockNumber();

    // Etherscan
    const etherscanBlock = etherscan.getBlockNumber();

    const results = await Promise.allSettled([
        etherscanBlock,
        dbStateDiffBlockNumber,

    ])

    for (const result of results) {
        if (result.status === 'rejected') {
            if (result.reason instanceof AppError) {
                const errorData = result.reason.data;
                console.log(errorData.type, errorData.message);
            } else {
                console.error(result.reason);
            }
        } else if (result.status === 'fulfilled') {
            const value = result.value;
            switch (value.type) {
                case 'etherscan':
                    prom.etherscanGauge.set(value.blockNumber);

                    break;
                case 'statediff':
                    prom.statediffDBGauge.set(value.blockNumber);

                    break;
            }
        }
    }
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
    startServer();

    let lock = false;

    var job = new CronJob(
        '*/10 * * * * *',
        async () => {
            if (lock) {
                console.log('Parallel process is executing. Skipping');
                return;
            }
            lock = true;

            try {
                await run();
            } catch (e) {
                console.error(e);
            }

            lock = false;
        },
        null,
        true
    );
}

main().catch((e) => console.error(e));

process.on('SIGINT', () => {
    console.info("Interrupted")
    process.exit(0)
})