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