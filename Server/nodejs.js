
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
app.get('/convert', function(req, res){

	var pathfile = req.query.pathfile;
	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;

	console.log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));

	var result = convertion(pathfile, inputformat, inputfile, outputformat, "express");

	res.download(result);
});

app.get('/download', function(req, res){
	var filename = req.query.filename;
	res.download(filename);
});

//app.listen("8080");


/* Logging via AMQP on RabbitMQ */
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

/* Using CloudConvert API */
function convertion(pathfile, inputformat, inputfile, outputformat, type) {
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

/* Connection via WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;

wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);
	active_connection = ws;

	ws.on('message', function incoming(message) {
		var json_message = JSON.parse(message);

		var pathfile = json_message.pathfile;
		var inputformat = json_message.inputformat;
		var inputfile = json_message.inputfile;
		var outputformat = json_message.outputformat;

		log("[IP]" + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Checking IP connection (localhost, 127.0.0.1)

		var result = convertion(pathfile, inputformat, inputfile, outputformat, "ws");

		ws.send(result);
	});
	
});

server.listen(8080, function listening() {
  console.log('[SERVER] Listening on %d', server.address().port);
});


/* oAuth Google with express */
/*
app.get('/tokensignin', function(req,res) {
	var CLIENT_ID = "994040047931-omd8db1opge95bdvlbb93nhtki48kqro.apps.googleusercontent.com";
	var token = req.query.idtoken;
	var GoogleAuth = require('google-auth-library');
	var auth = new GoogleAuth;
	var client = new auth.OAuth2(CLIENT_ID, '', '');
	client.verifyIdToken(
		token,
		CLIENT_ID, 
		function(e, login) {
			var payload = login.getPayload();
			var userid = payload['sub'];
		}
	);
});
*/


/* oAuth with Passport */
/*
passport.use(new GoogleStrategy({
    clientID: 994040047931-omd8db1opge95bdvlbb93nhtki48kqro.apps.googleusercontent.com,
    clientSecret: adQCgZrnVw4HKax2WhVIhmTk,
    callbackURL: "http://127.0.0.1:8080/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
*/