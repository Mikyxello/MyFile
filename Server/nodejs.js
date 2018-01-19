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
	
	console.log("FIN");
});

function convertion(pathfile, inputformat, inputfile, outputformat) {
	var result = "Failed";
	 
	var fs = require('fs'),
    cloudconvert = new (require('cloudconvert'))('GOF05MzbYRdxGeKiQAzsdm968KU1-rV099JMD2oRMkjtFP4SZbggvhn4qjKKutxM2xUQGq0jm3sa6LXqW6BPUA');
 
	fs.createReadStream(inputfile)
	.pipe(cloudconvert.convert({
	"inputformat": inputformat,
	"outputformat": outputformat,
	"input": "upload",
	"filename": inputfile,
	"timeout": 10
	}))
	.pipe(fs.createWriteStream('converted.'+outputformat));

	return result;
}

app.listen("8080");