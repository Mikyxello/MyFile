var amqp =  require('amqplib/callback_api');
var fs = require('fs');
var logger;

amqp.connect('amqp://localhost', function(err, conn) {

	console.log("AMQP Started");
	logger = fs.createWriteStream('log.txt', {flags: 'a'});

	conn.on('close', function() {
		console.log("Closing AMQP connection with server");
		logger.end();
	});

	conn.on('error', function(err) {
		console.log("Error during loggin");
		logger.end();
		throw err;
	});

	conn.createChannel(function(err, ch) {
		var ex = 'logger';

		ch.assertExchange(ex, 'fanout', {durable: false});
		ch.assertQueue('', {exclusive: true}, function(err, q) {
			ch.bindQueue(q.queue, ex, '');
			ch.consume(q.queue, function(msg) {
				console.log("%s", msg.content.toString());
				fs.access('log.txt', function (err) {
					if(err) {
						console.log("Errore lettura log.txt");
						throw err;
					}
					logger.write(msg.content.toString() + '\r\n');
				});
			}, {noAck: true});
		});
	});
});