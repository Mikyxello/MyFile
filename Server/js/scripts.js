$(document).ready(function() {
	$.ajax({
		method: 'POST',
		url: 'http://127.0.0.1:8080/username',
		success: function(data) {
			if(data) {
				$("#user").html('<a href="https://twitter.com/' 
					+ data.replace(/['"]+/g, "") 
					+ '"><i class="fab fa-twitter"></i>' 
					+ data.replace(/['"]+/g, "")
					+ '</a>'
				);
				$("#user, #logout").css({
					"visibility": "",
					"display": "",
					"background-color": "#4AB3F4"
				});
				$("#login, #buttonlogin").css({
					"visibility": "hidden",
					"display": "none"
				});
				$(".login_title").text("Benvenuto " + data);
			}
		},
		error: function() {
			console.log("Error login");
			$("#user, #logout").css({
				"visibility": "hidden",
				"display": "none"
			});
			$("#login, #buttonlogin").css({
				"visibility": "",
				"display": ""
			});
		}
	});
});