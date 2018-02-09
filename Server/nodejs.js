
/* Node Modules */
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var amqp =  require('amqplib/callback_api');
var WebSocket = require('ws');
var fs = require('fs');
var request = require('request');
var path = require('path');
//var GoogleAuth = require('google-auth-library');
//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
/* ------------ */


/* Receiving HTTP message via express node module*/
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

/* Connection via WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;
var a_t = '';


app.get('/', function(req, res) {
	
	res.sendFile('Client/index.html', {root: __dirname });

	res.send('the access token is: ' + req.query.code);

	var formData = {
		code: req.query.code,
		client_id: '994040047931-2l5sg2eiko1ecuka90dooubk3dkadvvv.apps.googleusercontent.com',
		client_secret: '8o1Qiw5oczWCgsBle-_Tdgyg',
		redirect_uri: 'http://localhost:8080/index',
		grant_type: 'authorization_code'
	};

	request.post({url:'https://www.googleapis.com/oauth2/v4/token', form: formData}, function optionalCallback(err, httpResponse, body) {
		if (err) {
			return console.error('upload failed:', err);
		}
		console.log('Upload successful!  Server responded with:', body);
		var info = JSON.parse(body);
		res.send("Got the token "+ info.access_token);
		a_t = info.access_token;
	});
});

/* ---- Pages redirect ----- */
app.get('/index', function(req, res) {
	res.sendFile('Client/index.html', {root: __dirname });
});

app.get('/loginpage', function(req, res) {
	res.sendFile('Client/login.html', {root: __dirname });
});

app.get('/team', function(req, res) {
	res.sendFile('Client/team.html', {root: __dirname });
});

app.get('/converter', function(req, res) {
	res.sendFile('Client/converter.html', {root: __dirname });
});
/* ----------------------- */

/* Execute convertion request with API (see function convertion) */
app.get('/convert', function(req, res){

	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;

	var result = convertion(inputformat, inputfile, outputformat);

	active_connection.send(result);
	res.download(result);
});

/* Executing file download request */
app.get('/download', function(req, res){
	var filename = req.query.filename;
	log("[DOWNLOAD]" + filename);
	res.download(filename);
});

/* Executing login request */
app.get('/login', function(req, res) {
	res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http%3A%2F%2Flocalhost:8080&client_id=994040047931-2l5sg2eiko1ecuka90dooubk3dkadvvv.apps.googleusercontent.com");
	log("[LOGIN]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Log with the IP of client
});

app.get('/use_token', function(req, res){
	var options = {
		url: 'https://www.googleapis.com/calendar/v3/users/me/calendarList',	// ???
		headers: {
			'Authorization': 'Bearer '+a_t
		}
	};
	request(options, function callback(error, response, body) {
		if (!error && response.statusCode == 200) {
			var info = JSON.parse(body);
			console.log(info);
			res.send(info);
		}
		else {
			console.log(error);
		}
	});
});

/* WebSocket connection received from client */
wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);
	active_connection = ws;

	ws.onclose = function() {
		console.log("[CLIENT]Closed connection");			
	};

	log("[CONNECTION] Connection enstablished with " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Log with the IP of client
});

wss.on('close', function close() {
	log("[SERVER] Closed");	
});


/* Using CloudConvert API */
function convertion(inputformat, inputfile, outputformat) {
	/* Log string */
	var ret_string = "Conversion from " + inputfile + " to " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;
	log("[REQUEST]"+ret_string);

	/* Using CloudConvert Node Module with FileSystem Module for creating a new file, giving to API the existing file for convertion */
    var cloudconvert = new (require('cloudconvert'))('GOF05MzbYRdxGeKiQAzsdm968KU1-rV099JMD2oRMkjtFP4SZbggvhn4qjKKutxM2xUQGq0jm3sa6LXqW6BPUA');
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

		/* Return filename of the converted one */
		return inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;
	} catch(err){
		log("[ERROR]"+err.message);
		return err.message;
	}
}

/* Logging via AMQP on RabbitMQ */
function log(string) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
		var ex = 'logger';

		ch.assertExchange(ex, 'fanout', {durable: false});

		var msg = "[LOG]" + string;
		
		ch.publish(ex, '', new Buffer(msg));
		console.log(msg);
		});
	});
}

/* Starting WebSocket on port 8080 */
server.listen(8080, function listening() {
  console.log('[SERVER] Listening on %d', server.address().port);
  log("[SERVER] Boot server");
});
