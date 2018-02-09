function wsConnect() {
	if ("WebSocket" in window) {
		var ws = new WebSocket("ws://127.0.0.1:8080/");

		/* Opening WebSocket client side */
		ws.onopen = function() {
			var inputformat = $("#inputformat").val();
			var inputfile = $("#filename").val();
			var outputformat = $("#outputformat").val();

			var mex = '{\
				"inputformat": "'+inputformat+'",\
				"inputfile": "'+inputfile+'",\
				"outputformat": "'+outputformat+'"\
			}';
		
			ws.send(mex);
			console.log("Request sent...");
		};

		/* Received message with the converted filename on server */
		ws.onmessage = function(evt) {
			var received_msg = evt.data;
			console.log("Received message: "+received_msg);

			document.getElementById("fileDownload").href = "http://127.0.0.1:8080/download?filename=" + received_msg;
			document.getElementById("fileDownload").download = received_msg;
			document.getElementById("fileDownload").style.visibility = "visible";

			ws.close();
		};

		ws.onclose = function() {
			console.log("Connection is closed...");
		};

		window.onbeforeunload = function(event) {
			socket.close();
		};
	}

	else {
		alert("WebSocket NOT supported by your Browser!");
	}
}


/* oAuth Functions */
function onSignIn(googleUser) {
	var profile = googleUser.getBasicProfile();
	console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
	var user = profile.getName();
	var image = profile.getImageUrl();
	var mail = profile.getEmail(); // This is null if the 'email' scope is not present.

	$(".table_login, .login_li, .g-signin2").css({"display":"none", "visibility":"hidden"});
	$(".logout_li, .profile_name_li, .profile_image_li, .table_user").css({"display":"", "visibility":""});

	$(".profile_image_li").html("<img src=\""+image+"\" height=\"60px\" width=\"60px\"> ");
	$(".profile_name_li").html(user + " ");

	$(".user_image").html("<img src=\""+image+"\">");
	$(".user_name").html(user);
	$(".user_email").html("<a href=\""+mail+"\">" + mail + "</a>");
	$(".login_title").html("Benvenuto " + user.substr(0, user.lastIndexOf(' ')));
}

function signOut() {
	var auth2 = gapi.auth2.getAuthInstance();
	auth2.signOut().then(function () {
		console.log('User signed out.');
	});

	var revokeAllScopes = function() {
		auth2.disconnect();
	}

	$(".table_login, .login_li, .g-signin2").css({"display":"", "visibility":""});
	$(".logout_li, .profile_image_li, .profile_name_li, .table_user").css({"display":"none", "visibility":"visible"});
	$(".login_title").html("Accedi");
}