function create() {
	/* DEBUG OUTPUT */
	console.log("CREATE");
	/*--------------*/

	var selectedfile = $("#selectedfile").val();
    var inputformat = selectedfile.split('.').pop();
	var outputformat = $("#outputformat").val();
	var tmppath = $("#tmppath").val(); 
	var filename = $("#filename").val();

	/* DEBUG OUTPUT */
	console.log("SELECTEDFILE: " + selectedfile);
	console.log("INPUTFORMAT: " + inputformat);
	console.log("OUTPUTFORMAT: " + outputformat);
	console.log("TMPPATH: " + tmppath);
	console.log("FILENAME: " + filename);
	/*--------------*/

	$.ajax({
		method: "POST",
		url: "https://api.cloudconvert.com/process",
		headers: {
			"Authorization": "Bearer GOF05MzbYRdxGeKiQAzsdm968KU1-rV099JMD2oRMkjtFP4SZbggvhn4qjKKutxM2xUQGq0jm3sa6LXqW6BPUA",
			"Content-Type": "application/json"
		},
		data: '{\
			"inputformat": "'+inputformat+'",\
			"outputformat": "'+outputformat+'"\
		}',
		success: function(data) {

			/* DEBUG OUTPUT */
			console.log("CREATE SUCCESS");
			/*--------------*/

			var url = "https:"+data.url;
			var id = data.id;
			var host = data.host;

			/* DEBUG OUTPUT */
			console.log("URL: " + url);
			console.log("ID: " + id);
			console.log("HOST: " + host);
			/*--------------*/

			start(url, id, host, filename, outputformat, tmppath);
		},
		error: function(xhr, status, error) {
			/* DEBUG OUTPUT */
			console.log("CREATE ERROR");
			console.log("XHR: "+xhr);
			console.log("STATUS: "+status);
			console.log("ERROR: "+error);
			/*--------------*/
		}
	});
}

function start(url, id, host, filename, outputformat, tmppath) {
	/* DEBUG OUTPUT */
	console.log("START");
	/*--------------*/

	$.ajax({
		method: "POST",
		url: url,
		data: '{\
			"input": "download",\
			"file": "'+tmppath+'",\
			"outputformat": "'+outputformat+'",\
			"filename": "'+filename+'",\
			"download": true,\
			}',
		success: function() {
			/* DEBUG OUTPUT */
			console.log("START SUCCESS");
			/*--------------*/

			status(url);
		},
		error: function(xhr, status, error) {
			/* DEBUG OUTPUT */
			console.log("START ERROR")
			console.log("XHR: "+xhr);
			console.log("STATUS: "+status);
			console.log("ERROR: "+error);
			/*--------------*/
		}
	});
}

function status(url) {
	/* DEBUG OUTPUT */
	console.log("CONVERT");
	/*--------------*/

	/* DEBUG OUTPUT */
	console.log("URL: " + url);
	/*--------------*/

	$.ajax({
		method: "GET",
		url: url,
		success: function(data) {
			/* DEBUG OUTPUT */
			console.log("CONVERT SUCCESS");
			/*--------------*/

			/* DEBUG OUTPUT */
			console.log("CONVERT STEP: " + data.step);
			/*--------------*/			

			if(data.step == "wait") {
				/* DEBUG OUTPUT */
				console.log("CONVERT WAITING");
				/*--------------*/
				setTimeout(status(url),5000);
			}
			else if(data.step == "convert") {
				/* DEBUG OUTPUT */
				console.log("CONVERTING "+data.percent+"...");
				/*--------------*/
				setTimeout(status(url),5000);
			}
			else if(data.step == "finished") {
				/* DEBUG OUTPUT */
				console.log("CONVERT FINISHED");
				/*--------------*/
				download(data.url);
			}
			else if(data.step == "input") {
				/* DEBUG OUTPUT */
				console.log("CONVERT INPUT");
				setTimeout(status(url),5000);
				/*--------------*/
			}
			else if(data.step == "output") {
				/* DEBUG OUTPUT */
				console.log("CONVERT OUTPUT PRESO");
				setTimeout(status(url),5000);
				/*--------------*/
			}
			else if(data.step == "error") {
				/* DEBUG OUTPUT */
				console.log("CONVERT ERROR");
				/*--------------*/
			}
			else {
				/* DEBUG OUTPUT */
				console.log("CONVERT SUCCESS ERROR");
				/*--------------*/
			}
		},
		error: function(xhr, status, error) {
			/* DEBUG OUTPUT */
			console.log("STATUS ERROR");
			console.log("XHR: "+xhr);
			console.log("STATUS: "+status);
			console.log("ERROR: "+error);
			/*--------------*/
		}
	});
}

function download(url) {
	/* DEBUG OUTPUT */
	console.log("DOWNLOAD");
	/*--------------*/
	$.ajax({
		method: "GET",
		url: url
	});
}