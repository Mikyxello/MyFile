var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');
var amqp =  require('amqplib/callback_api');


var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

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
	//res.redirect('/');
});

function log(inputformat,outputformat,status) {
	amqp.connect('amqp://localhost', function(err, conn) {
		conn.createChannel(function(err, ch) {
		var q = 'logger';

		ch.assertQueue(q, {durable: false});
		if (status==0){
			var msg="richiesta di conversione da "+inputformat+" a "+outputformat+" ricevuta";
		}
		if (status==1){
			var msg="conferma conversione da "+inputformat+" a "+outputformat+" completata";
		}
		
		ch.sendToQueue(q, new Buffer(msg));
		console.log("messaggio inviato");
		});
	});
};


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

		return "Conversione di " + inputfile + "in " + inputfile.substr(0, inputfile.lastIndexOf('.'))+"."+outputformat + " effettuata";
	} catch(err){
		return err.message;
	}

}

app.listen("8080");


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
