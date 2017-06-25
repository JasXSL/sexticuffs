
var express = require('express');
var app = express();

var port = 8008; 
var server = app.listen(port, function(){ 
	console.log("Server online at ",port);
});

var io = require('socket.io').listen(server);

// Finds client sockets in a room
function numClients(room) {
    // get array of socket ids in this room
    var socketIds = io.sockets.adapter.rooms[room];
    if (socketIds) {
		return socketIds.length;
    }
    return 0;
}


/*
	Input: _GAME_, (str)task, (arr)args
	Output: _GAME_, (bool)byHost, (str)socketID, (str)task, (arr)args

	Output tasks should generally correlate to input task name
*/

// THIS is the socket
function SocketHandler(socket, task, args){

	var th = this;
	this.socket = socket;
	this.task = task;
	this.args = args;
	if(!this.args)
		this.args = [];
	else if(this.args.constructor !== Array)
		this.args = [this.args];
	

	
	// Front controller
		this._construct = function(){

			if(typeof this['pub'+this.task] !== 'function'){
				console.error('pub'+this.task, " is not a function.");
				return false;
			}

			var fn = this['pub'+this.task];

			if(fn.length > this.args.length){
				console.error('Invalid amount of arguments for ', this.task, 'got', this.args.length, 'expected', fn.length);
				return false;
			}

			fn.apply(this, this.args);
		};
	//


	


	// Helpers
		this.isHost = function(){ return socket._sexticuffs.host; };
		this.getRoom = function(){ return socket._sexticuffs.room; };


		// Sends an error message
		this.error = function(message){
			this.socket.emit('err', message);
		};

		// Sends a response. Lets you use a custom task
		this.output = function(task, args, to){
			if(to === undefined)
				to = io.to(socket._sexticuffs.room);
			
			to.emit('_GAME_', this.isHost(), socket.id, task, args);
		};

		// Creates a response to host
		this.respondToHost = function(data){
			var host = this.getHost();
			this.output(this.task, data, host);
		};

		// Creates a response to host
		this.respondToRoom = function(data){
			this.output(this.task, data);
		};

		// Creates a response to self
		this.respondToSelf = function(data){
			this.output(this.task, data, this.socket);
		};

		// Returns the host of the active room
		this.getHost = function(room){
			if(!room)
				room = this.getRoom();

			if(!io.nsps['/'].adapter.rooms[room]){
				return socket;
			}

			for(var socketId in io.nsps['/'].adapter.rooms[room].sockets){
				if(io.sockets.connected[socketId] && io.sockets.connected[socketId]._sexticuffs.host){
					return io.sockets.connected[socketId];
				}
			}
			// Not found, assume we are host
			return socket;
		};

	// 


	// Public

		// Party Management
			// joins a party by ID, if ID is false, create one instead
			// sends JoinParty to the sender & host with [roomID]
			this.pubJoinParty = function(id){
				// Leave any active room
				if(socket._sexticuffs.room){
					this.pubLeaveParty();
				}

				var room = Math.random().toString(36).substring(2);
				id = id.trim();
				if(id && id.length)
					room = id;
				
				var con = numClients(room);
				// Max 4 connections can be present prior to joining
				if(con >= 4){
					th.error('Party is full');
					return false;
				}

				// At least one player is in
				if(con){
					var host = th.getHost(room);
					if(host && host._sexticuffs.gameInProgress){
						return th.error("Can't join an ongoing game");
					}
				}

				socket.join(room);
				socket._sexticuffs.room = room;

				// This was a new room
				if(!con){
					socket._sexticuffs.host = true;
				}

				this.respondToHost([room]);
				if(!this.isHost()){
					this.respondToSelf([room]);
				}
			};

			// Leave the group
			this.pubLeaveParty = function(){
				// Disconnect everyone
				if(this.isHost()){
					this.output("HostDropped", []);
				}
				else{
					// Tell the host that you left
					this.respondToRoom([]);
				}
				// Leave the room
				this.socket.leave(this.socket._sexticuffs.room);
				this.socket._sexticuffs.room = null;
			};

			// Sends my character data to host
			this.pubSetCharacter = function(char){
				th.respondToHost([char]);
			};

			// HOST ONLY. Sends party data to everyone. Keep in mind party data is different from battle data, and may change mid battle if needed.
			this.pubUpdateCharacters = function(characters){
				if(!th.isHost())
					return;
				th.respondToRoom([characters]);
			};

			// Punts a player from the party. The disconnect handler will handle the rest
			this.pubKick = function(socketid){
				if(!th.isHost() && socketid !== th.socket.id)return;
				if(io.sockets.connected[socketid])
					io.sockets.connected[socketid].disconnect();
			};

		//

		// CHAT

			this.pubChat = function(message){
				this.respondToRoom([message]);
			};

		//

		// BATTLES
			this.pubStartBattle = function(){
				if(!th.isHost())return;
				th.socket._sexticuffs.gameInProgress = true;
				this.respondToRoom([]);
			};

			this.pubRefreshBattle = function(data){
				if(!th.isHost())return;
				this.respondToRoom([data]);
			};

			this.pubSelectPunishment = function(victimUUID, abilityID){
				this.respondToHost([victimUUID, abilityID]);
			};

			this.pubUseAbility = function(victimUUID, abilityUUID){
				this.respondToHost([victimUUID, abilityUUID]);
			};

			this.pubPickGem = function(index){
				this.respondToHost([index]);
			};

			// Forwards Scrolling battle text from host to party.
			this.pubSBT = function(uuid, amount, detrimental){
				if(!th.isHost())
					return;
				this.respondToRoom([uuid, amount, detrimental]);
			};

			// Forwards Talking heads from host to party.
			this.pubTalkingHeads = function(headsArr){
				if(!th.isHost())
					return;
				this.respondToRoom([headsArr]);
			};

			// Forwards hit visual from host to party
			this.pubHitVisual = function(uuid, detrimental){
				if(!th.isHost())
					return;
				this.respondToRoom([uuid, detrimental]);
			};
			

			this.pubAddToBattleLog = function(attackerUUID, victimUUID, text, classes, sound){
				if(!th.isHost()){
					return;
				}
				this.respondToRoom([attackerUUID, victimUUID, text, classes, sound]);
			};

			this.pubEndTurn = function(){
				this.respondToHost();
			};

			this.pubGameOver = function(winningTeam){
				if(!th.isHost())return;
				th.socket._sexticuffs.gameInProgress = false;
				this.respondToRoom([winningTeam]);
			};

		//


	// BEGIN!
	this._construct();
}







// IO connected
io.on('connection', function(socket){
	
	// make sure the socket has a base object
	socket._sexticuffs = {
		host : false,
		room : '',
		gameInProgress : false
	};


    console.log("A user connected:", socket.id);
	
	// Generic input
	socket.on('_GAME_', function(method, args){
		console.log("GAME method", method, "from", socket.id);
		new SocketHandler(socket, method, args);
	});

	// Special use case for disconnect, handled by SIO
	socket.on('disconnect', function(){
		console.log("A player disconnected");
		new SocketHandler(socket, 'LeaveParty', []);
	}); 

});


app.get('/', function (req, res) { // navigate here to see session ID
	res.send('It works!');
});







