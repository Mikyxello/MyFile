/* Node Modules */
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var util = require('util');
var amqp =  require('amqplib/callback_api');
var WebSocket = require('ws');
var fs = require('fs');
var request = require('request');
var path = require('path');
var readline = require('readline');
var TwitterPackage = require('twitter');
var oauth = require('oauth');
var methodOverride = require('method-override');
var session = require('express-session');
var inspect = require('util-inspect');
var logger = require('express-logger');
var cookieParser = require('cookie-parser');
/* ------------ */

var _twitterConsumerKey = "g9fWPHBCmMyLyWVQwfLL6tfTs";
var _twitterConsumerSecret = "ek7h6Sgmm8HhaYGwTzz94OxYaNmKci2ca7Zr20zh7cP8jwgdnP";

var consumer = new oauth.OAuth(
    "https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token", 
    _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "http://127.0.0.1:8080/sessions/callback", "HMAC-SHA1");



/* Setting express module for http requests */
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());
app.use(logger({ path: "log/express.log"}));
app.use(cookieParser());
app.use(session({ secret: "very secret", resave: false, saveUninitialized: true}));

app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

/* Opening express server on WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;
var a_t = '';


/* ---- Pages redirect ----- */
app.get('/', function(req, res) {
	res.sendFile('Client/index.html', {root: __dirname });
});

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

app.get('/twittershare', function(req,res) {

});

/* Login on Twitter via oAuth */
app.get('/twitterlogin', function(req,res) {
	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
		if (error) {
			console.log(error)
			res.redirect('/sessions/connect');
		} else {
			var parsedData = JSON.parse(data);
			res.send('You are signed in: ' + inspect(parsedData.screen_name));
		} 
	});
});


app.get('/sessions/connect', function(req, res){
	consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
		if (error) {
			res.send("Error getting OAuth request token : " + inspect(error), 500);
		} else {  
			req.session.oauthRequestToken = oauthToken;
			req.session.oauthRequestTokenSecret = oauthTokenSecret;
			
			console.log("<<"+req.session.oauthRequestToken);
			console.log("<<"+req.session.oauthRequestTokenSecret);
			res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
		}
	});
});
app.get('/sessions/callback', function(req, res){
	console.log(">>"+req.session.oauthRequestToken);
	console.log(">>"+req.session.oauthRequestTokenSecret);
	console.log(">>"+req.query.oauth_verifier);
	consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
		if (error) {
			res.send("Error getting OAuth access token : " + inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + inspect(result) + "]", 500);
		} else {
			req.session.oauthAccessToken = oauthAccessToken;
			req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
			res.redirect('/index');
		}
	});
});


/* Executing file download request */
app.get('/download', function(req, res){
	var filename = req.query.filename;
	log("[DOWNLOAD]" + filename);
	res.download(filename);
});


/* WebSocket connection received from client */
wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);

	ws.on('message', function incoming(message) {
		var aux_message = JSON.parse(message);

		var inputformat = aux_message.inputformat;
		var inputfile = aux_message.inputfile;
		var outputformat = aux_message.outputformat;

		var result = convertion(inputformat, inputfile, outputformat);

		ws.send(result);
	});

	active_connection = ws;

	log("[CONNECTION] Connection enstablished with " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Log with the IP of client
});

wss.on('close', function close() {
	log("[SERVER] Closed");	
});

/* Starting WebSocket on port 8080 */
server.listen(8080, function listening() {
  console.log('[SERVER] Listening on %d', server.address().port);
  log("[SERVER] Boot server");
});


/* -------------------------------------------------------------------- Utils functions -------------------------------------------------------------------- */

/* Using CloudConvert API */
function convertion(inputformat, inputfile, outputformat) {
	/* Log string */
	var ret_string = "Conversion from " + inputfile + " to " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;
	log("[REQUEST]"+ret_string);
	/* Using CloudConvert Node Module with FileSystem Module for creating a new file, giving to API the existing file for convertion */
    var cloudconvert = new (require('cloudconvert'))('GOF05MzbYRdxGeKiQAzsdm968KU1-rV099JMD2oRMkjtFP4SZbggvhn4qjKKutxM2xUQGq0jm3sa6LXqW6BPUA');
 	try {
		var stream = fs.createReadStream(inputfile)
		.pipe(cloudconvert.convert({
		"inputformat": inputformat,
		"outputformat": outputformat,
		"input": "upload",
		"filename": inputfile,
		"timeout": 10
		}))
		.pipe(fs.createWriteStream(inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat));

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