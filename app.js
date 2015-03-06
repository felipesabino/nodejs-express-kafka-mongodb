var express = require('express'),
    moment = require('moment-timezone'),
    app = express(),

    // database
    mongojs = require('mongojs'),
    db = mongojs(process.env.MONGO_URL || 'localhost:27017/kafka'),

    // kafka
    kafka = require('kafka-node'),
    client = new kafka.Client(process.env.KAFKA_URL || '192.168.59.103:2181/', process.env.KAFKA_PRODUCER_ID || 'kafka-node-producer', {}),
    HighLevelProducer = kafka.HighLevelProducer,
    producer = new HighLevelProducer(client);

// Express setup
app.listen(process.env.PORT || 3001);

app.post('/', function(req, res) {

  var timestamp = moment().unix();

  // sends value to kafka
  var topicMessage = { topic: 'my-node-topic', messages: [
    // all messages must be string :S
    JSON.stringify({ timestamp: timestamp, rnd: Math.random() })
  ] };

  var payload = [ topicMessage ];

  producer.send(payload, function (err, data) {
    if (err) {
      res.send(500, err);
    } else {
      res.json(200, {timestamp: timestamp});
    }
  });

});

app.get('/', function(req, res) {
  db.collection('kafka').find({}, function(err, data) {
    if(err) {
      res.send(500, err);
    } else if (!data) {
      res.send(404, 'nothing found...');
    } else {
      res.json(200, data);
    }
  });
})


// Kafka events
producer.on('ready', function () {
  console.log('KAFKA producer ready');
});

producer.on('error', function (err) {
  console.log('KAFKA producer error:' + err);
})
