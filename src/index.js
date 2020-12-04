require('dotenv').config()
const express = require('express')
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

    server.listen(process.env.SERVER_PORT);
}

const main = async () => {
    startServer();

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
    // console.log(results);

    for (const result of results) {
        // console.log(result);

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

main().catch((e) => console.error(e));

