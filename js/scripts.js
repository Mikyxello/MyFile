/* Documentation by http://www.filezigzag.com/api */

/* TOKEN By @Mikyxello */
var request_header = "\
	POST /jobs HTTP/1.1\
	Host: http://api.filezigzag.com/fzz.svc/\
	token: d571f022-b3b1-4f65-8b2c-7233755a64a7\
	Content-Type: application/json"

/* Example of convertion MP4 to AVI */
var json_mp4toavi_sample = {               
				"target":"avi", 
				"category":"video",
				"source":"https://www.filezigzag.com/119915/a9234dfe-02b9-4a0f-8664-bcd6fb218ba9/Components_GIF_gif.MP4",
				"backurl":"",
				"options": [{
					"width":"",
					"height":"200",
					"bitrate": "200",
					"audioquality":"8",
					"framrate": "20",
					"start":"00:00:00",
					"end":"00:10:00",
					"rotate":"0",
					"flip":"horizontally", 
					"watermarkimageurl":"",
					"changeaudiourl":""
                }]
}

/* Output Sample */
var json_output_sample = {
	"Convertfile": {
		"id": "a68f5430-3235-4e2d-894f-652df8257cda"
	}
}

/* METHOD POST */
var url_request = "http://api.filezigzag.com/fzz.svc/Getfile";

var json_get_sample = {
	"id":"9162555c-5faf-4bdc-a075-18a13684fb0a"
}

var json_get_output_sample = {
	"Getfile": {
		"Description": "Converted file avaliable",
		"FileURL": "https://filezigzag.s3.amazonaws.com/2/d3480506-dced-45c4-8aec-2f0e7f72cfb4/Components_GIF_gif_MP4_mp4.avi?AWSAccessKeyId=AKIAJP4TWG7FXXCF5XAQ&Expires=1480517001&Signature=y0dj0DxDIM3Oxr5hxg50CrQBgKQ%3D",
		"Status": "7"
	}
}