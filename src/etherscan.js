const axios = require('axios');
const AppError = require('./error');

const etherscanClient = axios.create({
    baseURL: 'https://api.etherscan.io',
});


const getBlockNumber = () => {
    return etherscanClient.get(`/api?module=proxy&action=eth_blockNumber&apikey=${process.env.ETHERSCAN_API_KEY}`)
        .then((response) => {
            const data = response.data;

            // console.log(data);

            if (data.status === '0') {
                throw new AppError('etherscan', data.result);
            }

            return {
                type: 'etherscan',
                blockNumber: parseInt(data.result, 16),
            }
        })
}

module.exports = {getBlockNumber};
