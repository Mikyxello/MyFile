/* Documentation by http://www.filezigzag.com/api */

/* Header
POST /jobs HTTP/1.1
Host: http://api.filezigzag.com/fzz.svc/
token: <your API token here>
Content-Type: application/json
*/

// URL = http://api.filezigzag.com/fzz.svc/convertfile
/* 
{
	"target":"png", 
	"category":"image",
	"source":"https://www.filezigzag.com/2/ea6bc5d3-03ca-44d4-b524-afd374ef7636/avi_to_mp4.jpg"
}

{
  "Convertfile": {
    "id": "a68f5430-3235-4e2d-894f-652df8257cda"
  }
}
*/


// URL = http://api.filezigzag.com/fzz.svc/Getfile
/*
{
"id":"9162555c-5faf-4bdc-a075-18a13684fb0a"
}

{
  "Getfile": {
    "Description": "Converted file avaliable",
    "FileURL": "https://filezigzag.s3.amazonaws.com/2/d3480506-dced-45c4-8aec-2f0e7f72cfb4/Components_GIF_gif_MP4_mp4.avi?AWSAccessKeyId=AKIAJP4TWG7FXXCF5XAQ&Expires=1480517001&Signature=y0dj0DxDIM3Oxr5hxg50CrQBgKQ%3D",
    "Status": "7"
  }
}
Status 1: File Received , 2 Queue, 3 Processing, 4 Fail, 5 Lock, 6 Deleted, 7 Success, 8 Unknown Error
*/

function requestAjax() {
	var obj = {
		"target":"png",
		"category":"image",
		"source":"http://www.geektoolz.net/Content/Wallpapers/Single%20Screen/Mac-Leopard-Wallpaper.jpg"
	};

	var header = {
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
		"token": "3ee1b804-a811-43c4-9300-0d72a10e0282-886ece8e-e9a4-4102-ae1f-4ad1e690693c",
		"Host": "http://api.filezigzag.com/fzz.svc/",
		"Content-Type": "application/json"
	};

	$.ajax({
		type: "POST",
		url: "http://api.filezigzag.com/fzz.svc/convertfile",
		datatype: "json",
		data: JSON.stringify(obj),
		headers: header,
		crossDomain : true,
		xhrFields: {
			withCredentials: true
		},
		success: function(res) {alert(res.responseText);},
		error: function(res) {alert("Error " + res.status);}
	});
}