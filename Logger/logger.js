var amqp =  require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    var ex = 'logger';
    
	ch.assertExchange(ex, 'fanout', {durable: false});
	ch.assertQueue('', {exclusive: true}, function(err, q) {
      ch.bindQueue(q.queue, ex, '');
	  ch.consume(q.queue, function(msg) {
	  console.log(" Ricevuta %s", msg.content.toString());
      }, {noAck: true});
    });
  });
});


