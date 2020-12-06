const client = require('prom-client');

const Registry = client.Registry;
const register = new Registry();
const prefix = 'eth_state_metrics_';

const etherscanGauge = new client.Gauge({ name: `${prefix}etherscan`, help: 'Etherscan Block Number', registers: [register]});
const statediffDBGauge = new client.Gauge({ name: `${prefix}statediff_db`, help: 'Statediff DB Block Number', registers: [register]});

module.exports = {etherscanGauge, statediffDBGauge, register};

