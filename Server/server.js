/* Node Modules */
var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var url = require('url');
var util = require('util');
var amqp =  require('amqplib/callback_api');
var WebSocket = require('ws');
var fs = require('fs');
var request = require('request');
var path = require('path');
var oauth = require('oauth');
var TwitterPackage = require('twitter');
var session = require('express-session');
var inspect = require('util-inspect');
var logger = require('express-logger');
var cookieParser = require('cookie-parser');
var FileReader = require('filereader');
var MyBuffer = require('buffer');
var formidable = require('formidable');
var readline = require('readline');
var methodOverride = require('method-override');
/* ------------ */

/* Twitter app keys */
var _twitterConsumerKey = "g9fWPHBCmMyLyWVQwfLL6tfTs";
var _twitterConsumerSecret = "ek7h6Sgmm8HhaYGwTzz94OxYaNmKci2ca7Zr20zh7cP8jwgdnP";

/* oAuth instance */
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
app.use('Client/img', express.static(__dirname + '/img'));
app.use('Client/css', express.static(__dirname + '/css'));
app.use('Client/js', express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/Client'));

app.use(function(req, res, next) {
	res.locals.session = req.session;
	next();
});

/* Opening express server on WebSocket */
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
var active_connection = null;
var user;

/* ---- Pages redirect ----- */
app.get('/', function(req, res) {
	res.sendFile('Client/index.html', {root: __dirname });
});

app.get('/index', function(req, res) {
	res.sendFile('Client/index.html', {root: __dirname });
});

app.get('/login', function(req, res) {
	res.sendFile('Client/login.html', {root: __dirname });
});

app.get('/team', function(req, res) {
	res.sendFile('Client/team.html', {root: __dirname });
});

app.get('/converter', function(req, res) {
	res.sendFile('Client/converter.html', {root: __dirname });
});
/* ----------------------- */


/* Login on Twitter via oAuth */
app.get('/twitterlogin', function(req,res) {
	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
		if (error) {
			res.redirect('/sessions/connect');
		} else {
			res.redirect('/connect');
		} 
	});
});


/* oAuth Twitter functions */
app.get('/sessions/connect', function(req, res){
	consumer.getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results){
		if (error) {
			log("[ERROR] Impossible to request authorization");
			res.redirect('/login');
			//res.status(500).send("Error getting OAuth request token : " + inspect(error));
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
			log("[ERROR] Authorization negated by user");
			res.redirect('/login');
			//res.status(500).send("Error getting OAuth access token : " + inspect(error) + "[" + oauthAccessToken + "]" + "[" + oauthAccessTokenSecret + "]" + "[" + inspect(results) + "]");
		} else {
			req.session.oauthAccessToken = oauthAccessToken;
			req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
			log("[LOGIN] Effettuato login!");
			res.redirect('/index');
		}
	});
});

/* Logout from Twitter destroying session */
app.get('/logout', function(req, res){
	log("[LOGOUT] Logout effettuato!");
	req.session.destroy();
	res.redirect('/index');
	user = null;
});


/* Automatic request on every page for checking if is logged in and get the username */
app.post('/username', function(req, res) {
	consumer.get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, function (error, data, response) {
		if (error) {
			user = null;
			res.end();
		} else {
			/* Get username from received data from Twitter */
			var parsedData = JSON.parse(data);
			user = inspect(parsedData.screen_name).replace(/['"]+/g, "");
			res.send(inspect(parsedData.screen_name));
		} 
	});
});

/* Request for upload a file on server */
app.post('/upload', function(req, res) {
	var form = new formidable.IncomingForm();
	form.parse(req, function(err, fields, files) {

		/* Manage the temp path for creating new path with the file */
		var old_path = files.inputfile.path;
		var file_size = files.inputfile.size;
		var file_ext = files.inputfile.name.split('.').pop();
		var index = old_path.lastIndexOf('\\') + 1;
		var file_name = old_path.substr(index);

		/* If user logged in create new directory where upload the file with user name */
		if (user) {
			if (!fs.existsSync('./'+user)){
				fs.mkdirSync('./'+user);
			}
		}
		var new_path;
		if (user) new_path = path.join(process.cwd(), '/'+user+'/', files.inputfile.name);
		else new_path = path.join(process.cwd(), '/', files.inputfile.name);

		/* Create new file from the temp file */
		fs.readFile(old_path, function(err, data) {
			fs.writeFile(new_path, data, function(err) {
				fs.unlink(old_path, function(err) {
					if (err) {
						res.send("Error uploading file, try again in few time...");
						active_connection.close();
						active_connection = null;
					} else {
						log("[UPLOAD] File " + files.inputfile.name + " uploaded.");
						res.send("Uploaded");
						active_connection.send('Uploaded');	// Message for sending the second request of conversion
					}
				});
			});
		});
	});
});

/* Executing file download request (if logged in grab the file from the right directory) */
app.get('/download', function(req, res){
	var path_to = '';
	if(user) path_to = user+'/';
	var filename = req.query.filename;
	log("[DOWNLOAD]" + filename);
	res.download(path_to+filename);
});

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

	var path_to = '';
 	if (user) path_to = user+'/';

   	/* If the file is an image, upload it with the post */
	if(outputformat == 'jpg' || outputformat == 'png') {
		try {
			/* Create a BASE64 encoded file for upload */
			file = new Buffer(fs.readFileSync(path_to+outputfile)).toString('base64');

			/* Upload it on Twitter */
			consumer.post('https://upload.twitter.com/1.1/media/upload.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, {media: file}, function(error, upload, response) {
				if(error){
					/* Impossible to share file on Twitter cause the user isn't logged in */
					log("[TWITTER UPLOAD ERROR] Not logged in");
					req.session.error = 'Not logged in';
					res.send("Not logged in");
				}
				else {
					log("[TWITTER UPLOADED]"+outputfile);

					/* Take media_id_string on Twitter */
					var json_uploaded = JSON.parse(upload);
					media_id = inspect(json_uploaded.media_id_string);
					media_id = media_id.replace(/['"]+/g, '');

					data = {
						status: message,
						media_ids: media_id
					};

					/* Post the created Tweet with message and image on your Twitter account */
					consumer.post('https://api.twitter.com/1.1/statuses/update.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, data, function(error, tweet, response) {
						if(error){
							var json_error = JSON.parse(error);
							log("[TWEET ERROR]"+inspect(json_error.message));
							res.send(inspect(json_error.message));
						}
						else {
							log("[TWEET]"+message+" - [IMAGE]"+outputfile);
							res.send("Tweeted");
						} 
					});
				} 
			});
		} catch(err) {
			/* Catched buffer error */
			log("[TWITTER ERROR] Twitter upload error");
			res.send(err);
		}
	}
	/* If isn't an image, Twitter doens't allow you to publish that file on a tweet , generate a normal Tweet */
	else {
		data = {status: message};

		consumer.post('https://api.twitter.com/1.1/statuses/update.json', req.session.oauthAccessToken, req.session.oauthAccessTokenSecret, data, function(error, tweet, response) {
			if(error){
				/* Error generating the Tweet */
				log("[ERROR] Not logged in");
				res.send("Not logged in");
			}
			else {
				/* Tweet published */
				log("[TWEET]"+message);
				res.send("Tweeted");
			} 
		});
	}

});


/* WebSocket connection received from client */
wss.on('connection', function connection(ws, req) {
	const location = url.parse(req.url, true);

	active_connection = ws;

	/* When received the file data of the file which is being converted */
	ws.on('message', function incoming(message) {
		var aux_message = JSON.parse(message);

		var inputformat = aux_message.inputformat;
		var inputfile = aux_message.inputfile;
		var outputformat = aux_message.outputformat;

		convertion(inputformat, inputfile, outputformat);
	});

	/* When error on WebSocket (client), close the connection */
	ws.on('error', function(error) {
		ws.close();
		active_connection=null;
	});

	ws.on('close', function() {
		log("[CLIENT CLOSED] Closed connection with client");
		ws.close();
		active_connection=null;
	});

	log("[CONNECTION] Connection enstablished with " + (req.headers['x-forwarded-for'] || req.connection.remoteAddress));	// Log with the IP of client
});

/* If closed the WebSocket */
wss.on('close', function close() {
	log("[SERVER] Closed");	
	active_connection=null;
});

/* Error on the server's WebSocket */
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

	if("inputformat" == "outputformat") {
		log("[CONVERT ERROR] Error converting file");
		active_connection.send("Error: Impossible to convert");
		active_connection.close();
		active_connection = null;
		return "Impossible to convert";
	}

	/* Using CloudConvert Node Module with FileSystem Module for creating a new file, giving to API the existing file for convertion */
    var cloudconvert = new (require('cloudconvert'))('5zghuavyniAgSNYpu8ie9raQnVWheyAGJ8fOdJcjdcaiZo2KA-NwykB_9tn3erCkh3zYsoTnyoFeX6y0klcYPQ');
 	try {
 		var path_to = '';
 		if (user) path_to = user+'/';

 		/* Read the file to be converted, pass it to cloudconvert, create new file where is written the converted one */
		var stream = fs.createReadStream(path_to+inputfile)
		.pipe(cloudconvert.convert({
		"inputformat": inputformat,
		"outputformat": outputformat,
		"input": "upload",
		"filename": inputfile,
		"timeout": 10
		}))
		.pipe(fs.createWriteStream(path_to+inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat));

		/* When finished the creation of the new file, send the new filename to the client */
		stream.on('finish', function() {
			log("[SUCCESS]"+ret_string);
			active_connection.send(inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat);
			return inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat;
		});

		/* On error reading, converting or creating file */
		stream.on('error', function(e) {
			log("[CONVERT ERROR] Error converting file: "+inspect(e));
			active_connection.send("Error: Impossible to convert");
			active_connection.close();
			active_connection = null;
			return e;
		});
	} catch(err){
		/* Error on FileSystem catched */
		log("[ERROR]"+err.message);
		active_connection.send("Error: Failed to read/write file");
		active_connection.close();
		active_connection = null;
		throw err;
		return err;
	}
}

/* Logging via AMQP on RabbitMQ to Logger */
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
