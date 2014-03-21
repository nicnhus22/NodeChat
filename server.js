/*
 *	Imports that we need: http, MD5, Socket.IO
 */
var http = require('http');
var md5	 = require('MD5');

/*
 *	Create server and make it listen on port 1337
 */
httpServer = http.createServer(function(request, response) {
  console.log('User connecting...');
});
httpServer.listen(1337);

var io 			 = require('socket.io').listen(httpServer);
// Will contain the unique ID of every online user
var online_users = {};
// Will contain the message objects of the previous conversation
var message_hist = [];
// Will limit the history so that the retrieval is fast
var history		 = 20;
// Will keep track of all the usernames
var usernames    = [];
// Keep track of the user who sent the last message
var lastUserMessage = '';


/*
 *	Open socket
 */
io.sockets.on('connection', function(socket){

	var self = false;
	console.log('New user');

	// This will display all the online users to the client
	for(var user in online_users)
		socket.emit('newUser', online_users[user]);

	// This will dispay the history of previous users
	for(var msg in message_hist){
		socket.emit('newMsg', message_hist[msg]);
	}

	// Tell the client all the username already taken
	socket.emit('usernamePassing', usernames);
		

	/*
	 *	Message received
	 */
	 socket.on('newMsg', function(msg){
	 	msg.user  = self;
	 	date      = new Date();
	 	msg.h     = date.getHours();
	 	msg.m     = date.getMinutes();
	 	
	 	if(msg.m.toString().length == 1)
	 		msg.m = "0"+msg.m;
	 	
	 	// Handle history
	 	message_hist.push(msg);
	 	if(message_hist > history)
	 		message_hist.shift();

	 	io.sockets.emit('newMsg', msg);

	 });


	 socket.on('doneTyping', function(){
	 	socket.broadcast.emit('doneTyping');
	 });

	/*
	 *	Manage the user typing event
	 */
	 socket.on('userTyping', function(user){
	 	try {
	 		console.log(user);
	 		socket.broadcast.emit('userTyping', user.user.username);
	 	}catch(err){
	 		console.log(user);
	 		socket.broadcast.emit('userTyping', user.username);
	 	}
	 		
	 });


	/*
	 *	User connection
	 */
	socket.on('login', function(user){
		self = user;
		// Create unique ID for the new user
		self.id 	= user.mail.replace(/\./g, '_').replace('@','_');
		// Create user avatar
		self.avatar = 'https://gravatar.com/avatar/'+md5(user.mail)+'?s=32&d=identicon&r=PG';
		// Tell the user he's logged in
		socket.emit('logged', self);
		// Add user to the list to display them all on login
		online_users[self.id] = self;
		// Pass the number of online users in user object
		user.online_friends = Object.size(online_users);
		// Add the username to the list
		usernames.push(self.username);
		// Send info to all the users
		io.sockets.emit('newUser', user); 
	});

	/*
	 *	User disconnection
	 */
	socket.on('disconnect', function(){
		if(!self)
			return false;

		delete online_users[self.id];
		self.online_friends = Object.size(online_users);
		io.sockets.emit('delUser', self);
	});

	/*
	 *	Drawing received, emit to everyone
	
	 socket.on('newDrawing', function(msg){
	 	msg.user  = self;
	 	date      = new Date();
	 	msg.h     = date.getHours();
	 	msg.m     = date.getMinutes();
	 	
	 	if(msg.m.toString().length == 1)
	 		msg.m = "0"+msg.m;
	 	
	 	// Handle history
	 	message_hist.push(msg);
	 	if(message_hist > history)
	 		message_hist.shift();

	 	io.sockets.emit('newDrawing', msg);

	 }); */

});

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};