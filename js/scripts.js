/* Documentation by http://www.filezigzag.com/api */

/* Header
POST /jobs HTTP/1.1
Host: http://api.filezigzag.com/fzz.svc/
token: <your API token here>
Content-Type: application/json

URL = http://api.filezigzag.com/fzz.svc/convertfile

{
	"target":"png", 
	"category":"image",
	"source":"https://www.filezigzag.com/2/ea6bc5d3-03ca-44d4-b524-afd374ef7636/avi_to_mp4.jpg"
}

{
  "Convertfile": {
    "id": <file id>
  }
}
*/

/* NON FUNZIONANTI */

/* TEST IN NODEJS
function convert(file) {
	var request = require("request");

	var requestData = {
		'target':'png',
		'category':'image',
		'source': 'https://jpeg.org/images/jpeg-home.jpg'
	};

	var options = {  
	    url: 'http://api.filezigzag.com/fzz.svc/convertfile',
	    method: 'POST',
	    headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json',
	        'token': '3ee1b804-a811-43c4-9300-0d72a10e0282-886ece8e-e9a4-4102-ae1f-4ad1e690693c',
	        'Host': 'http://api.filezigzag.com/fzz.svc/'
    	},
    	json: true,
    	body: JSON.stringify(requestData)
	};

	request(options, function(err, res, body) {
		alert(res);
	});
}
*/

/* TEST CON AJAX
function convert(file) {
	$.ajax({
	    type: "POST",
	    url: "http://api.filezigzag.com/fzz.svc/convertfile",                        
	    dataType: "text",
	    contentType: "application/json",
	   	headers: {
	   		"Access-Control-Allow-Origin": "*",
	   		"Cache-Control": "no-cache",
	   		"Access-Control-Allow-Methods": "GET, POST",
	   		"Access-Control-Allow-Headers": "Content-Type, Accept",
	   		'Accept': 'application/json',
	        'Content-Type': 'application/json',
	        'token': '3ee1b804-a811-43c4-9300-0d72a10e0282-886ece8e-e9a4-4102-ae1f-4ad1e690693c',
	        'Host': 'http://api.filezigzag.com/fzz.svc/'
	    },
	    data: "{'target':'png', 'category':'image', 'source': 'https://jpeg.org/images/jpeg-home.jpg'}",         
	    success:function(data, status) {             
	        console.log(data); //gives 1                
	    },
	    error:function(request, status, error) {
	        alert("o0ops");           
	    }
	});
}
*/