# Prometheus Metrics for Geth-Statediff

Server exposes `/metrics` endpoint with Prometheus metrics:
* `eth_state_metrics_etherscan` - latest block from Etherscan
* `eth_state_metrics_statediff_db` - latest block from Statediff Database

## How to run

### Locally


```
# copy config template
cp .env.example .env

# edit it and set Etherscan API Key and Database Credentials

# run server
node src/index.js 
```
And then open in browser `http://172.17.0.2:3000/metrics`

### Docker 

```
docker run \
    -e SERVER_HOST=0.0.0.0 \
    -e ETHERSCAN_API_KEY="https://api.etherscan.io" \
    -e ETHERSCAN_API_KEY=*** \
    -e STATEDIFF_PG_HOST=*** \
    -d vulcanize/eth-state-metrics
```