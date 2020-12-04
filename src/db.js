const { Client } = require('pg');

class DB {
    constructor(type, user, password, database, host, port) {
        this.type = type;
        this.client = new Client({
            user,
            host,
            database,
            password,
            port,
        });

        this.connecting = false;
    }

    async getBlockNumber() {
        if (!this.connecting) {
            await this.connect();
            this.connecting = true;
        }

        return this.client.query('SELECT block_number FROM eth.header_cids ORDER BY block_number DESC LIMIT 1')
            .then((res) => {
                if (res.rows.length) {
                    return {
                        type: this.type,
                        blockNumber: parseInt(res.rows[0].block_number, 10),
                    }
                }

                return null;
            });

    }

    connect() {
        return this.client.connect();
    }
}

module.exports = DB;