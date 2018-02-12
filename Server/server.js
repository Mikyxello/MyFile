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
var FileReader = require('filereader');
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
app.use('/img', express.static(__dirname + '/img'));
app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/Client'));

app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

/* Opening express server on WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;
var a_t = '';


/* Automatic request on every page for checking if is logged in */
app.post('/username', function(req, res) {
	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
		if (error) {
			res.end();
		} else {
			var parsedData = JSON.parse(data);
			res.send(inspect(parsedData.screen_name));
		} 
	});
});

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
	/* Variables for filenaming */
	var filename = req.query.filename;
	var outputformat = req.query.outputformat;
	var name = filename.substr(0, filename.lastIndexOf('.'));
	var outputfile = name + "." + outputformat;	// File to upload

	var message="Ho convertito il mio file " + filename + " tramite MyFile!";
	
	var media_id;
	var data;
   	var file;

   	/* If the file is an image, upload it with the post */
	if(outputformat == 'jpg' || outputformat == 'png') {

		try {
			/* Create a BASE64 encoded file for upload */
			file = new Buffer(fs.readFileSync(outputfile)).toString('base64');

			/* Upload it on Twitter */
			consumer.post('https://upload.twitter.com/1.1/media/upload.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, {media: file}, function(error, upload, response) {
				if(error){
					log("[ERROR]"+error);
					res.redirect('/index');
				}
				else {
					log("[UPLOADED]"+outputfile);

					/* Take media_id_string on Twitter */
					var json_uploaded = JSON.parse(upload);
					media_id = inspect(json_uploaded.media_id_string);
					media_id = media_id.replace(/['"]+/g, '');

					data = {
						status: message,
						media_ids: media_id
					};

					/* Post the created tweet with message and image on your Twitter account */
					consumer.post('https://api.twitter.com/1.1/statuses/update.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, data, function(error, tweet, response) {
						if(error){
							log("[ERROR]"+inspect(error));
							res.redirect('/index');
						}
						else {
							log("[TWEET]"+message+" - [IMAGE]"+outputfile);
							res.redirect('/converter');
						} 
					});
				} 
			});
		} catch(err) {
			log("[ERROR] Upload error");
			res.redirect('/index');
		}
	}
	/* If isn't an image, Twitter doens't allow you to publish that file on a tweet */
	else {
		data = {
			status: message
		};

		consumer.post('https://api.twitter.com/1.1/statuses/update.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, data, function(error, tweet, response) {
			if(error){
				log("[ERROR]"+inspect(error));
				res.redirect('/index');
			}
			else {
				log("[TWEET]"+message);
				res.redirect('/converter');
			} 
		});
	}

});

/* Login on Twitter via oAuth */
app.get('/twitterlogin', function(req,res) {
	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
		if (error) {
			res.redirect('/sessions/connect');
		} else {
			res.redirect('/index');
		} 
	});
});


/* oAuth Twitter functions */
app.get('/sessions/connect', function(req, res){
	consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
		if (error) {
			res.status(500).send("Error getting OAuth request token : " + inspect(error));
		} else {
			req.session.oauthRequestToken = oauthToken;
			req.session.oauthRequestTokenSecret = oauthTokenSecret;
			res.redirect("https://twitter.com/oauth/authorize?oauth_token="+req.session.oauthRequestToken);      
		}
	});
});
app.get('/sessions/callback', function(req, res){
	consumer.getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
		if (error) {
			res.status(500).send("Error getting OAuth access token : " + inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + inspect(results) + "]");
		} else {
			req.session.oauthAccessToken = oauthAccessToken;
			req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
			log("[LOGIN] Effettuato login!");
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

/* Logout from Twitter */
app.get('/logout', function(req, res){
	log("[LOGOUT] Logout effettuato!");
	req.session.destroy();
	res.redirect('/index');
});


/* WebSocket connection received from client */
wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);

	active_connection = ws;

	ws.on('message', function incoming(message) {
		var aux_message = JSON.parse(message);

		var inputformat = aux_message.inputformat;
		var inputfile = aux_message.inputfile;
		var outputformat = aux_message.outputformat;

		var result = convertion(inputformat, inputfile, outputformat);

		ws.send(result);
	});

	ws.on('error', function(error) {
		log("[ERROR WS Client] Error");
		ws.close();
	});

	log("[CONNECTION] Connection enstablished with " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Log with the IP of client
});

/* If closed the WebSocket */
wss.on('close', function close() {
	log("[SERVER] Closed");	
	active_connection=null;
});

wss.on('error', function(error) {
	log("[ERROR WS SERVER] Error");
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
    var cloudconvert = new (require('cloudconvert'))('5zghuavyniAgSNYpu8ie9raQnVWheyAGJ8fOdJcjdcaiZo2KA-NwykB_9tn3erCkh3zYsoTnyoFeX6y0klcYPQ');
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

		var msg = string;
		
		ch.publish(ex, '', new Buffer(msg));
		console.log(msg);
		});
	});
}
