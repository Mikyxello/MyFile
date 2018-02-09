
/* Node Modules */
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var amqp =  require('amqplib/callback_api');
var WebSocket = require('ws');
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

app.get('/', function(req, res) {
	console.log("code taken");
	res.send('the access token is: ' + req.query.code);

	var formData = {
		code: req.query.code,
		client_id: '994040047931-2l5sg2eiko1ecuka90dooubk3dkadvvv.apps.googleusercontent.com',
		client_secret: '8o1Qiw5oczWCgsBle-_Tdgyg',
		redirect_uri: 'http://localhost:8080/index',
		grant_type: 'authorization_code'
	}

	request.post({url:'https://www.googleapis.com/oauth2/v4/token', form: formData}, function optionalCallback(err, httpResponse, body) {
	if (err) {
		return console.error('upload failed:', err);
	}
	console.log('Upload successful!  Server responded with:', body);
	var info = JSON.parse(body);
	res.send("Got the token "+ info.access_token);
	a_t = info.access_token;a_t = info.access_token;
});

/* ---- Pages redirect ----- */
app.get('/index', function(req, res) {
	res.redirect("index.html");
});

app.get('/loginpage', function(req, res) {
	res.redirect("login.html");
});

app.get('/team', function(req, res) {
	res.redirect("team.html");
});

app.get('/converter', function(req, res) {
	res.redirect("converter.html");
});
/* ----------------------- */

app.get('/convert', function(req, res){

	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;

	console.log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));

	var result = convertion(inputformat, inputfile, outputformat, "express");

	res.download(result);
});

app.get('/download', function(req, res){
	var filename = req.query.filename;
	res.download(filename);
});

app.get('/login', function(req, res) {
	res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri=http%3A%2F%2Flocalhost:8080&client_id=994040047931-2l5sg2eiko1ecuka90dooubk3dkadvvv.apps.googleusercontent.com");
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



/* Using CloudConvert API */
function convertion(inputformat, inputfile, outputformat, type) {
	var ret_string = "Conversion from " + inputfile + " to " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;

	log("[REQUEST]"+ret_string, type);

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

		log("[SUCCESS]"+ret_string, type);

		return inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;
	} catch(err){
		log("[ERROR]"+err.message, type);
		return err.message;
	}
}


wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);
	active_connection = ws;

	ws.on('message', function incoming(message) {
		var json_message = JSON.parse(message);

		var inputformat = json_message.inputformat;
		var inputfile = json_message.inputfile;
		var outputformat = json_message.outputformat;

		log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Checking IP connection (localhost, 127.0.0.1)

		var result = convertion(inputformat, inputfile, outputformat, "ws");

		ws.send(result);
	});
	
});

/* Logging via AMQP on RabbitMQ */

/* 
* Da modificare in log(string) {...} (senza type)
* eliminare quindi anche if else interno
*/
function log(string, type) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
		var ex = 'logger';
		
		var msg = "";

		ch.assertExchange(ex, 'fanout', {durable: false});

		msg = "[LOG]" + string;

		if(type == "ws") 
			msg += "[WebSocket]";
		else if (type == "express")
			msg += "[Express]"
		
		ch.publish(ex, '', new Buffer(msg));
		console.log(msg);
		});
	});
};

/* Starting WebSocket on port 8080 */
server.listen(8080, function listening() {
  console.log('[SERVER] Listening on %d', server.address().port);
});
