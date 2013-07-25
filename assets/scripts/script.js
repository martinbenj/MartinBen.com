function fadeContent() { $("#content").hide().fadeIn(); }

function makeAjaxCall(partial) {

	$.ajax({
		type: "GET",
		url: partial,
		dataType: "html",
		success: function(html) {
			
		    $("#content").html(html);
		    fadeContent();
		    
		    $("form").submit(sendMail);
		  
        }
    });  
}

/*
function customFunc(partial) {

	$.ajax({
		type: "POST",
		url: "/renderPartial",
		data: { where : "there" },
		dataType: "html",
		success: function(data) {
			alert(data);
		 
        }
    });
    
}
*/


function sendMail(e) {

	e.preventDefault();

	var verifyEmail = false;
	var verifyBody = false;


	if (/\S+@\S+\.\S+/.test($("#email").val())) {
	
		verifyEmail = true;
		$("#email").removeClass('error'); 
	}
	
	else {
		$("html, body").animate({scrollTop:0}, 300);
		$("#email").addClass('error');
	}
	
	if ($("#body").val() != "" && $("#body").val() != undefined && $("#body").val() != null) {
		verifyBody = true;
		$("#body").removeClass('error');
		
	} 
	
	else {
		$("#body").addClass('error');
	}
	
	if (verifyEmail && verifyBody) {

		$.ajax({
			url : "/mail",
			type: "POST",
			data: { email : $("#email").val(), subject: $("#subject").val(), body: $("#body").val() },
			success: function(data) {
				
				$("#submit-inquiry").val("Thanks! I'll be in touch soon.").attr("disabled","true");
				
				$("input, textarea").addClass('faded');
				
				setTimeout(function(){
					
					window.location.hash = '/home';
					
				}, 3000);
				
			}
		
		});

	}
		
}


	var app = Davis(function () {
	
		this.get('/', function (req) {
			makeAjaxCall( "partials/_home.html" )
/* 			customFunc( "partials/_home.html" ); */
		})
		
		this.get('/contact', function(req) {
			makeAjaxCall( "partials/_contact.html" )
		})
		
		this.get('/blog', function(req) {
			makeAjaxCall( "partials/_posts.html" )
		})
	
		
		this.get('/blog/:id', function(req) {
			makeAjaxCall( req.params['id'] + "-navigation-true" )
		})
          
    })

    app.start()




$(document).ready(function(){

/* 	makeAjaxCall( "partials/_home.html" ) */

/*
	Path.root("#/home");
	
	Path.listen();
*/
	
});



