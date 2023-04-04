How to get started with graph-node
```
git clone https://github.com/graphprotocol/graph-node
cd graph-node/docker

Insert the following two lines to environment variables of docker-compose.yaml file.
  GRAPH_ALLOW_NON_DETERMINISTIC_FULLTEXT_SEARCH: "true"
  GRAPH_ALLOW_NON_DETERMINISTIC_IPFS: "true"
  
./setup.sh
docker-compose up
```