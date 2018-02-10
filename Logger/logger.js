var amqp =  require('amqplib/callback_api');

amqp.connect('amqp://localhost', function(err, conn) {

	console.log("AMQP Started");

	conn.createChannel(function(err, ch) {
		var ex = 'logger';
    
		ch.assertExchange(ex, 'fanout', {durable: false});
		ch.assertQueue('', {exclusive: true}, function(err, q) {
			ch.bindQueue(q.queue, ex, '');
			ch.consume(q.queue, function(msg) {
				console.log("%s", msg.content.toString());
			}, {noAck: true});
		});
	});
});


