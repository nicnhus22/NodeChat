(function($){

	$.each(['#f00', '#ff0', '#0f0', '#0ff', '#00f', '#f0f', '#000', '#fff'], function() {
	      $('#colors_demo .tools').append("<a href='#colors_sketch' data-color='" + this + "' style='width: 10px; background: " + this + ";'></a> ");
	    });
	    $.each([3, 5, 10, 15], function() {
	      $('#colors_demo .tools').append("<a href='#colors_sketch' data-size='" + this + "' style='background: #ccc'>" + this + "</a> ");
	    });
	    $('#colors_sketch').sketch();


	

	// Create connection to the socket
	var socket    = io.connect('http://localhost:1337');
	// Handle on the template to inject using Mustache.js
	var msgtpl    = $('#msgtpl').html();
					$('#msgtpl').remove();
	// Array to keep track of all the usernames (autocheck)
	var usernames = [];

	// Variables to handle the user typing events
	var typingTimer;                
	var doneTypingInterval1 = 1;
	var doneTypingInterval2 = 1000;
	var userTaken = false;

	// Keep track of myself
	var self;

	// Check if canvas is shown
	var canvas_shown = false;

	

	// On form validation send emit the login event to the server
	// It'll create a new user
	$('#loginform').submit(function(event){
		event.preventDefault();

		// Proceed only if the username is not taken
		if(!userTaken){

			$('.global_container').animate({
		    top: '-100%',
			  }, 2000, function() {
			});

			setTimeout(function(){
				$('#right_side').fadeIn();
				$('#send_block').fadeIn();
				}, 
				2000
			);

			socket.emit('login', {
				username: $('#username').val(),
				mail	: $('#mail').val()
			});

			$('#login_block').remove();	
			$('#message').focus();
		}		

	});


	/*********************************************************************
	 *					SENDING EVENTS TO THE SERVER
	 *********************************************************************/
	/*
	 *	Manage the message sending
	 */
	 $('#sendMessage').submit(function(event){
	 	event.preventDefault();
	 	// Prevent user from sending empty strings
	 	if(($('#message').val().match(/\S/))){

	 		socket.emit('newMsg', {
	 			message : $('#message').val()
		 	});

		 	$('#message').val('');
		 	$('#message').focus();
	 	}
	 });


	/*********************************************************************
	 *					RECEIVING EVENTS & HANDLING THEM
	 *********************************************************************/

	/*
	 *	Manage the usernames checking
	 */
	socket.on('usernamePassing', function(usernameArray){ usernames = usernameArray; });
	/*
	 *	Manage the user successful connection
	 */
	socket.on('logged', function(user){ self = user });
	/*
	 *	Receive the event saying that a user has typed
	 */
	socket.on('userTyping', function(user_name){   $('#is_writing').html(user_name+' is typing...')   });	
	/*
	 *	Receive the event saying that a user has finished typing
	 */
	socket.on('doneTyping', function(){   $('#is_writing').html('')   });	

	/*
	 *	Manage the message receiving
	 */
	 socket.on('newMsg', function(msg){
	 	// Fill the template to display the message and its attributes
	 	$('#messages').append(Mustache.render(msgtpl, msg)+'<br/>');
	 	// Scroll to the bottom of the page to display newly sent message
	 	$('#messages').animate({
		    scrollTop: $("#messages")[0].scrollHeight,
		  }, 500, function() {
		});

	 	// Update the action in the feed box
		$('#feed_box ul').append('<li><i class="fa fa-comments-o"></i></i> &nbsp;'+msg.user.username+" posted a message</li>");
		// Scroll to bottom of the feed box
		$('#feed_box').scrollTop($('#feed_box').prop("scrollHeight"));
	 });

	/*
	 *	Manage the user connection
	 */
	socket.on('newUser', function(user){
		// Update the connection in the feed box
		$('#feed_box ul').append('<li><i class="fa fa-arrow-circle-o-right connect"></i> &nbsp;'+user.username+" has connected</li>");
		// Scroll to bottom of the feed box
		$('#feed_box').scrollTop($('#feed_box').prop("scrollHeight"));
		// Add the user from the list on the right nav
		$('#users ul ').append('<li id="'+user.id+'"><img class="chat_avatar" src="'+user.avatar+'"><div class="chat_username">'+user.username+'</div><br/></li>');
		// Update number of online users
		$('#num_online').html(user.online_friends);
	});

	/*
	 *	Manage the user disconnection
	 */
	socket.on('delUser', function(user){
		// Update the disconnection in the feed box
		$('#feed_box ul').append('<li><i class="fa fa-arrow-circle-o-left disconnect"></i> &nbsp;'+user.username+" has disconnected</li>");
		// Scroll to bottom of the feed box
		$('#feed_box').scrollTop($('#feed_box').prop("scrollHeight"));
		// Remove the user from the list on the right nav
		$('#'+user.id).remove();
		// Update number of online users
		$('#num_online').html(user.online_friends);
	});




	/*********************************************************************
	 *					USER EVENTS (KEYPRESS,KEYUP,KEY DOWN)
	 *********************************************************************/
	/*
	 *	Manage the user typing event
	 */
	$('#message').keypress(function(event){
	    socket.emit('userTyping', {
			user: self
		});
	});

	/*
	 *	Manage the username checking while the user is typing
	 */
	$('#message').keyup(function(){
	    clearTimeout(typingTimer);
	    typingTimer = setTimeout(doneTyping, doneTypingInterval2);
	});
	$('#message').keydown(function(){
	    clearTimeout(typingTimer);
	});
	function doneTyping () {
		socket.emit('doneTyping');
	}

	/*
	 *	Manage the username checking while the user is typing
	 */
	$('#username').keyup(function(){
	    clearTimeout(typingTimer);
	    typingTimer = setTimeout(checkUsername, doneTypingInterval1);
	});
	$('#username').keydown(function(){
	    clearTimeout(typingTimer);
	});
	function checkUsername () {
		USERNAME = $('#username').val();

	    for(var i=0; i<usernames.length; i++){
			if(USERNAME == usernames[i]){
				userTaken = true;
				$('#user_check').css('color','red');
				break;
			}else{
				$('#user_check').css('color','#fff');
				userTaken = false;
			}
		}
	}

	/*
	 *	Manage the drawing icon click
	 */
	$('#draw_icon').click(function(){
		
		if(!canvas_shown){
			$('#canvas_container').fadeIn();
			enableDraw();
			canvas_shown = true;
		}else{
			$('#canvas_container').fadeOut(); 
			canvas_shown = false;
		}
		
	});	


	function enableDraw(){




	}


})(jQuery);

