## Build docker image
.PHONY: docker-build
docker-build:
	docker build -t vulcanize/eth-state-metrics -f Dockerfile .