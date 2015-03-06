var moment = require('moment-timezone'),

    // Kafka setup
    kafka = require('kafka-node'),
    client = new kafka.Client(process.env.KAFKA_URL || '192.168.59.103:2181/', process.env.KAFKA_CONSUMER_ID || 'kafka-node-consumer', {
      sessionTimeout: 1000 // this is just to enable multiple restarts in debug and avoid https://github.com/SOHU-Co/kafka-node/issues/90 - should be removed in PRD
    }),
    HighLevelConsumer = kafka.HighLevelConsumer,

    // database
    mongojs = require('mongojs'),
    db = mongojs(process.env.MONGO_URL || 'localhost:27017/kafka');


var consumer = new HighLevelConsumer(
    client,
    [
        { topic: 'my-node-topic' }
    ],
    {
      groupId: 'worker.js' // this identifies consumer and make the offset consumption scoped to this key
    }
);

consumer.on('ready', function() {
  console.log('KAFKA consumer ready');
});

consumer.on('message', function (message) {

  // example message: {"topic":"my-node-topic","value":"{\"timestamp\":1425599538}","offset":0,"partition":0,"key":{"type":"Buffer","data":[]}}
  db.collection('kafka').update(
  {
    _id: 123456 //always overrite the same doc just for illustration
  },
  {
    '$set': {
      message: message,
      received_at: moment().unix()
    },
    '$inc': {
      messagesCount: 1
    }
  },
  {
    upsert: true
  }, function(err, data) {
    if(err) {
      console.log('MONGO error updating document: ' + err);
    } else {
      console.log('MONGO updating document OK:' + message.value);
    }
  });
});

consumer.on('error', function (err) {
  console.log('KAFKA consumer error:' + err);
});

process.on('beforeExit', function(code) {
  //force offset commit
  consumer.close(true, function(err, data) {
    console.log('KAFKA consumer commit ok :)');
  });
});
