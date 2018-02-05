function wsConnect() {
	if ("WebSocket" in window) {
		alert("WebSocket is supported by your Browser!");

		// Let us open a web socket
		var ws = new WebSocket("ws://127.0.0.1:8080/");

		ws.onopen = function() {
			// Web Socket is connected, send data using send()
			var mex = { 
				pathfile : document.convertion_body.pathfile,
				inputformat : document.convertion_body.inputformat,
				inputfile : document.convertion_body.inputfile,
				outputformat : document.convertion_body.outputformat 
			};
		
			ws.send(JSON.stringify(mex));
			alert("Message is sent...");
		};

		ws.onmessage = function (evt) {
			var received_msg = evt.data;
			alert("Message is received..."+received_msg);
			document.write("Message is received..."+received_msg);
		};

		ws.onclose = function() {
			// websocket is closed.
			alert("Connection is closed...");
		};

		window.onbeforeunload = function(event) {
			socket.close();
		};
	}

	else {
		// The browser doesn't support WebSocket
		alert("WebSocket NOT supported by your Browser!");
	}
}