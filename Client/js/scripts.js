function wsConnect() {
	if ("WebSocket" in window) {
		var ws = new WebSocket("ws://127.0.0.1:8080/");

		ws.onopen = function() {
			var pathfile = $("#pathfile").val();
			var inputformat = $("#inputformat").val();
			var inputfile = $("#filename").val();
			var outputformat = $("#outputformat").val();

			var mex = '{\
				"pathfile": "'+pathfile+'",\
				"inputformat": "'+inputformat+'",\
				"inputfile": "'+inputfile+'",\
				"outputformat": "'+outputformat+'"\
			}';
		
			ws.send(mex);
			console.log("Message sent");
		};

		ws.onmessage = function(evt) {
			var received_msg = evt.data;
			console.log("Received message: "+received_msg);
			ws.close();
		};

		ws.onclose = function() {
			console.log("Connection is closed...");
		};

		window.onbeforeunload = function(event) {
			//socket.close();
		};
	}

	else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
}