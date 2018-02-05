var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var amqp =  require('amqplib/callback_api');
var webSocket = require('ws');


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

/* Receiving HTTP message via express node module*/
app.get('/convert', function(req, res){

	var pathfile = req.query.pathfile;
	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;
	

	log(inputformat,outputformat,0);
	var result = convertion(pathfile, inputformat, inputfile, outputformat);
	
	console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
	res.send(result);
	log(inputformat,outputformat,1);
});


/* Logging via AMQP on RabbitMQ */
function log(inputformat,outputformat,status) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
		var ex = 'logger';
		
		var msg = "";

		ch.assertExchange(ex, 'fanout', {durable: false});
		if (status==0){
			msg="[REQUEST] for convertion from "+inputformat+" to "+outputformat+" log";
		}
		if (status==1){
			msg="[SUCCESS] for convertion from "+inputformat+" to "+outputformat+" log";
		}
		
		ch.publish(ex, '', new Buffer(msg));
		console.log(msg);
		});
	});
};

/* Using CloudConvert API */
function convertion(pathfile, inputformat, inputfile, outputformat) {
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
		})).pipe(fs.createWriteStream(inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat));


		var ret_string = "Conversione di " + inputfile + "in " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat + " effettuata";
		console.log(ret_string);
		return ret_string;
	} catch(err){
		console.log(err.message);
		return err.message;
	}

}

app.listen("8080");

/* Metodo con WebSocket */

/*
var active_connection = null;
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);

	var obj_mes = JSON.parse(message);
		
	var pathfile = obj_mes.query.pathfile;
	var inputformat = obj_mes.query.inputformat;
	var inputfile = obj_mes.query.inputfile;
	var outputformat = obj_mes.query.outputformat; 
	
	log(inputformat,outputformat,0);
	var result = convertion(pathfile, inputformat, inputfile, outputformat);

	console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress);

	active_connection = ws;
	ws.send(JSON.stringify(result));

	ws.on('message', function incoming(message) {
    	console.log('received: %s', message);
	});
	
});

server.listen(8080, function listening() {
  console.log('Listening on %d', server.address().port);
});
*/


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
