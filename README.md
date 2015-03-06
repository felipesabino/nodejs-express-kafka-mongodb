# Node.js + Express + Kafka + Mongodb

## Environment setup with [Docker](https://www.docker.io/)

### Node

- Install [node v0.12](http://nodejs.org/download/)

- Install node-foreman `$ npm install -g foreman`

- run `$ npm install`


### Kafka

If you are using a Mac follow the instructions [here](https://docs.docker.com/installation/mac/) to setup a docker environment.

- Install [fig](http://orchardup.github.io/fig/install.html)

- Start the test environment
    - `fig up`
- Start a kafka shell
    - `./start-kafka-shell.sh <Docker Ip> <Zookeeper>`, example `./start-kafka-shell.sh 192.168.59.103:9092 192.168.59.103:2181`
- From within the shell, create a topic
    - `$KAFKA_HOME/bin/kafka-topics.sh --create --topic my-node-topic --partitions 2 --zookeeper $ZK --replication-factor 1`

- For more details and troubleshooting see [https://github.com/wurstmeister/kafka-docker](https://github.com/wurstmeister/kafka-docker)


## Running

- `$ nf start`

caveat: between restart, wait for a similar message before starting to avoid consumer connection error described in https://github.com/SOHU-Co/kafka-node/issues/90

(we set up `sessionTimeout: 1000` in the consumer ti make it less painful to test, this value shoued be increased in production to avoid zookeeper timeouts due to network glitches)

```
zookeeper_1 | 2015-02-19 11:28:58,000 [myid:] - INFO  [SessionTracker:ZooKeeperServer@347] - Expiring session 0x14ba15e9c0f0024, timeout of 4000ms exceeded
zookeeper_1 | 2015-02-19 11:28:58,002 [myid:] - INFO  [ProcessThread(sid:0 cport:-1)::PrepRequestProcessor@494] - Processed session termination for sessionid: 0x14ba15e9c0f0024
```

## Test Requests

- to send messages: `$ curl -X POST http://localhost:3001/`

- to read  last received message by worker: `$ curl http://localhost:3001/`

- to perform apache benchmark `$ ab -n 100 -c 5 -p -T 'application/x-www-form-urlencoded' http://localhost:3001/`


## References

- [wurstmeister/storm-kafka-0.8-plus-test](https://github.com/wurstmeister/storm-kafka-0.8-plus-test)
- [SOHU-Co/kafka-node](https://github.com/SOHU-Co/kafka-node/)
