var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var amqp =  require('amqplib/callback_api');
var WebSocket = require('ws');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

/* Receiving HTTP message via express node module*/
app.get('/convert', function(req, res){

	res.redirect("http://localhost/MyFile/Client/converter.html");

	var pathfile = req.query.pathfile;
	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;

	console.log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));

	var result = convertion(pathfile, inputformat, inputfile, outputformat);

	res.send(result);
});


/* Logging via AMQP on RabbitMQ */
function log(string) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
		var ex = 'logger';
		
		var msg = "";

		ch.assertExchange(ex, 'fanout', {durable: false});

		msg = "[LOG]" + string;
		
		ch.publish(ex, '', new Buffer(msg));
		console.log(msg);
		});
	});
};

/* Using CloudConvert API */
function convertion(pathfile, inputformat, inputfile, outputformat) {
	var ret_string = "Conversion from " + inputfile + " to " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;

	log("[REQUEST]"+ret_string);

	var fs = require('fs'),
    cloudconvert = new (require('cloudconvert'))('GOF05MzbYRdxGeKiQAzsdm968KU1-rV099JMD2oRMkjtFP4SZbggvhn4qjKKutxM2xUQGq0jm3sa6LXqW6BPUA');
 	try {
		fs.createReadStream(inputfile)
		.pipe(cloudconvert.convert({
		"inputformat": inputformat,
		"outputformat": outputformat,
		"input": "upload",
		"filename": inputfile,
		"timeout": 10
		})).on('error', function(e){log("[ERROR] " + e)})
		.pipe(fs.createWriteStream(inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat)).on('error', function(e){log("[ERROR] " + e)});

		log("[SUCCESS]"+ret_string);

		return ret_string;
	} catch(err){
		log("[ERROR]"+err.message);
		return err.message;
	}
}

/* Metodo con WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;

wss.on('connection', function connection(ws, req) {

	const location = url.parse(req.url, true);
	active_connection = ws;

	var result = "";

	ws.on('message', function incoming(message) {

		var json_message = JSON.parse(message);

		var pathfile = json_message.pathfile;
		var inputformat = json_message.inputformat;
		var inputfile = json_message.inputfile;
		var outputformat = json_message.outputformat;

		console.log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));

		result = convertion(pathfile, inputformat, inputfile, outputformat);
	});
	
	ws.send(result);
});

server.listen(8080, function listening() {
  console.log('[SERVER] Listening on %d', server.address().port);
});

/*
OAUTH, vedi Credential.json
var CLIENT_ID = 994040047931-omd8db1opge95bdvlbb93nhtki48kqro.apps.googleusercontent.com
var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, '', '');
client.verifyIdToken(
    token,
    CLIENT_ID,
    function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      // If request specified a G Suite domain:
      //var domain = payload['hd'];
    });
*/
