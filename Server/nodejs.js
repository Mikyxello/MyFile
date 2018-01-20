var querystring = require('querystring');
var express = require('express');
var bodyParser = require('body-parser');
var url = require('url');
var http = require('http');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/convert', function(req, res){

	var pathfile = req.query.pathfile;
	var inputformat = req.query.inputformat;
	var inputfile = req.query.inputfile;
	var outputformat = req.query.outputformat;

	var result = convertion(pathfile, inputformat, inputfile, outputformat);
	
	console.log(req.headers['x-forwarded-for'] || req.connection.remoteAddress);
	res.send(result);
	//res.redirect('/');
});

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

var GoogleAuth = require('google-auth-library');
var auth = new GoogleAuth;
var client = new auth.OAuth2(CLIENT_ID, '', '');
client.verifyIdToken(
    token,
    CLIENT_ID,
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
    function(e, login) {
      var payload = login.getPayload();
      var userid = payload['sub'];
      // If request specified a G Suite domain:
      //var domain = payload['hd'];
    });
*/