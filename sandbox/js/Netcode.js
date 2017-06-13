var Netcode = {
    Socket : null,              // IO
    id : '',                    // user ID
    hosting : false,
    players : [],               // Joined players data
    party_id : '',              // ID of party
    battleInProgress : false,
    host_id : ''                // socket ID of host
    // Pages can create onSocket(task, subtask, args, byHost, byYou) to listen in
};

// Connects
Netcode.ini = function(){

    return new Promise(function(res){
        if(Netcode.Socket){
            res(Netcode.Socket);
            return;
        }

        Netcode.Socket = io();
        console.log("Connecting...");
        Netcode.Socket.on('connect', function(){
            console.log("Socket connected!");
            Netcode.id = Netcode.Socket.json.id;
            res(Netcode.Socket);
        });

        Netcode.Socket.on('disconnect', function(){
            Jasmop.Errors.addErrors("Multiplayer connection closed");
            Netcode.Socket = null;
            Netcode.disconnect();
        });

        Netcode.Socket.on('_GAME_', function(byHost, socketID, task, args){
            new Netcode.input(byHost, socketID, task, args);
        });

        Netcode.Socket.on('err', function(message){
            Jasmop.Errors.addErrors(message);
        });

    });

};

// HELPERS
    // Sends to server
    Netcode.output = function(task, args){
        if(!Netcode.Socket)
            return;
        Netcode.Socket.emit('_GAME_', task, args);
    };

    // Manually disconnects from the socket
    Netcode.disconnect = function(){
        
        Netcode.output('LeaveParty', []);
        Netcode.id = '';
        Netcode.host_id = '';
        Netcode.party_id = '';
        Netcode.hosting = false;
        Netcode.players = [Game.player];
        Netcode.battleInProgress = false;
        Game.rebuildMultiplayerIcons();
        
        if(Jasmop.active_page.hasOwnProperty('onSocket'))
            Jasmop.active_page.onSocket("disconnect", [], false, true);

        if(Netcode.Socket === null)
            return;

        Game.playSound('disconnect');
        Netcode.Socket.disconnect();
        Netcode.Socket = null;
    };

    // Gets the host
    Netcode.getHost = function(){
        for(var i =0; i<Netcode.players.length; ++i){
            if(Netcode.players[i].socket_id === Netcode.host_id && Netcode.players[i].is_pc && Netcode.host_id){
                return Netcode.players[i];
            }
        }
        return Netcode.getMe();
    };


    // gets my character
    Netcode.getMe = function(){
        for(var i =0; i<Netcode.players.length; ++i){
            if(Netcode.players[i].UUID === Game.player.UUID)
                return Netcode.players[i];
        }
        return Game.player;
    };

    // Returns a character by socket ID
    Netcode.getPlayerBySocketID = function(id){
        for(var i =0; i<Netcode.players.length; ++i){
            if(Netcode.players[i].socket_id === id){
                return Netcode.players[i];
            }
        }
        return false;
    };

    Netcode.getCharacterByUuid = function(uuid){
        for(var i =0; i<Netcode.players.length; ++i){
            if(Netcode.players[i].UUID === uuid){
                return Netcode.players[i];
            }
        }
        return false;
    };

    Netcode.isHosting = function(){
        return Netcode.hosting || !Netcode.Socket;
    };


//



/* TASKS YOU CAN SEND */
    // Send tasks
    Netcode.partyJoin = function(id){
        Netcode.output('JoinParty', [id]);
    };

    // Sends my character data
    Netcode.setCharacter = function(){
        Netcode.output('SetCharacter', [Game.player.hostExportFull()]);
    };

    // Sends lobby data to players
    Netcode.refreshParty = function(){
        if(!Netcode.hosting)
            return;

        

        var p = [];
        for(var i =0; i<Netcode.players.length; ++i){
            p.push(Netcode.players[i].hostExportFull());
        }

        Netcode.output('UpdateCharacters', [p]);
    };

    Netcode.kick = function(socketid){
        if(!Netcode.hosting)
            return;

        Netcode.output('Kick', [socketid]);
    };

    Netcode.chat = function(message){
        Netcode.output('Chat', [message]);
    };
    
    // refreshes battle data
    Netcode.hostRefreshBattle = function(){
        if(!Netcode.hosting)
            return;
        var B = Game.Battle;

        var obj = {
            turn : B.turn,
            punishment_done : B.punishment_done,
            ended : B.ended
        };
        Netcode.output("RefreshBattle", [obj]);
    };

    Netcode.startBattle = function(){
        if(!Netcode.hosting)
            return;
        Netcode.output("StartBattle", []);
        Netcode.battleInProgress = true;
    };

    Netcode.selectPunishment = function(victimUUID, abilityID){
        Netcode.output("SelectPunishment", [victimUUID, abilityID]);
    };

    Netcode.useAbility = function(victimUUID, abilityUUID){
        Netcode.output("UseAbility", [victimUUID, abilityUUID]);
    };

    Netcode.pickGem = function(index){
        Netcode.output("PickGem", [index]);
    };

    // Adds HTML to all players battle logs
    Netcode.hostAddToBattleLog = function(attackerUUID, victimUUID, text, classes, sound){

        if(!Netcode.hosting)
            return;

        Netcode.output("AddToBattleLog", [attackerUUID, victimUUID, text, classes, sound]);
    };

    Netcode.hostGameOver = function(teamWon){
        if(!Netcode.hosting)
            return;
        Netcode.output("GameOver", [teamWon]);
        Netcode.battleInProgress = false;
        // Punt players that disconnected
        for(var i =0; i<Netcode.players.length && Netcode.players.length; ++i){
            var p = Netcode.players[i];
            if(!p.is_pc && p.socket_id){
                Netcode.players.splice(i, 1);
                --i;
            }
        }

    };

    Netcode.endTurn = function(){
        Netcode.output("EndTurn");
    };


//





/** FRONT CONTROLLER */
Netcode.input = function(byHost, socketID, task, args){

    this.byMe = (socketID === Netcode.id);
    this.byHost = byHost;
    this.socketID = socketID;
    this.task = task;
    this.args = args;
    this.isHost = Netcode.hosting;     // I am host

    if(byHost){
        Netcode.host_id = socketID;
    }

    if(!this.args)
        this.args = [];
    else if(args.constructor !== Array)
        this.args = [this.args];

    var i, th = this;

    this._construct = function(){

        if(typeof this['pub'+this.task] !== 'function'){
            console.error('pub'+this.task, " is not a function");
            return false;
        }

        var fn = this['pub'+this.task];

        if(fn.length > this.args.length){
            console.error('Invalid amount of arguments for ', this.task, 'got', this.args.length, 'expected', fn.length);
            return false;
        }
        fn.apply(this, this.args);

    };



    // You or someone else has joined a party
    this.pubJoinParty = function(id){
        Netcode.party_id = id;
        // Joining a party determines if you're hosting or not
        if(this.byMe){
            Netcode.hosting = this.byHost;              // We are the host
            this.isHost = Netcode.hosting;
        }
        else
            Game.playSound('playerjoined');

        // Send character data
        if(!this.isHost){
            Netcode.setCharacter();
        }
        // We're hosting, so we have to add a dummy player until player data is received
        else{

            var player = Netcode.getPlayerBySocketID(socketID);

            // New player
            if(!player){
                player = new Character();
                player.socket_id = this.socketID;
                player.team = Character.TEAM_PC;
                Netcode.players.push(player);
            }

            // Add my own character if this was by me (by emulating a SetCharacter)
            if(this.byMe){
                
                // Check if offline me is present, if so, remove me
                for(var i =0; i<Netcode.players.length; ++i){
                    if(Netcode.players[i] === Game.player){
                        Netcode.players.splice(i, 1);
                        break;
                    }
                }

                // Emulate an input from the server
                this.pubSetCharacter(Game.player.hostExportFull());
            }

        }
    };




    // Host only. Sets a character's data and lets everyone know
    this.pubSetCharacter = function(data){
        if(!this.isHost)
            return;

        // Don't import team, I am the one who decides teams
        if(data.hasOwnProperty('team'))
            delete data.team;

        // The player baseobject will be added on socket join rather than here
        var player = Netcode.getPlayerBySocketID(this.socketID);
        if(!player)
            console.error("Socket ID not found in players", this.socketID, Netcode.players);
        player.is_pc = true;
        player.load(data);
        player.socket_id = socketID;

        // Update everyone else
        Netcode.refreshParty();
    };



    // Host has disconnected
    this.pubHostDropped = function(){
        if(!this.byHost)
            return;
        Jasmop.Errors.addErrors('The host has dropped the game');
        Netcode.disconnect();
    };



    // A player has left
    this.pubLeaveParty = function(){

        if(!this.byMe)
            Game.playSound('playerleft');

        // I left or am not host. The disconnect handler will manage this
        if(this.byMe || !this.isHost)
            return;

        // Somebody left my party! Punt them from the lobby.
        if(!Netcode.battleInProgress){
            for(i = 0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].socket_id === socketID){
                    Netcode.players.splice(i, 1);
                }
            }
        }
        // Battle in progress, make NPC
        else{
            var player = Netcode.getPlayerBySocketID(socketID);
            if(player){
                player.is_pc = false;
                Game.Battle.statusTexts.add(player, player, '%a has disconnected and will be played by an NPC', true, false, false);
            }
        }

        // let everybody know
        Netcode.refreshParty();
    };

    // The game has ended
    this.pubGameOver = function(winningTeam){};



    // Received an update from the host
    this.pubUpdateCharacters = function(){


        if(this.isHost){
            // Rebuild the bottom player bar
            Game.rebuildMultiplayerIcons();
        }

        // Invalid sender or we're hosting
        if(!this.byHost || this.isHost)
            return;

        // Rebuild the players
        //Netcode.players = [];

        var players = args[0];
        Netcode.players = [];
        // Now update and add
        for(i =0; i<players.length; ++i){
            Netcode.players.push(new Character(players[i]));
        }

        Game.rebuildMultiplayerIcons();

    };

    // this is just a placeholder to prevent error messages
    this.pubStartBattle = function(){
        if(!Netcode.hosting)
            Jasmop.Page.set('battle');
    };
    this.pubRefreshBattle = function(){};
    this.pubUseAbility = function(){};
    this.pubAddToBattleLog = function(){};
    this.pubEndTurn = function(){};
    this.pubSelectPunishment = function(){};
    this.pubChat = function(){};    
    this.pubPickGem = function(){};    
    

    // Run tasks before letting page know
    this._construct();

    // Let the active page know
    if(Jasmop.active_page.hasOwnProperty('onSocket')){
        Jasmop.active_page.onSocket(task, args, byHost, this.byMe, this.isHost, Netcode.getPlayerBySocketID(this.socketID));
    }


    

};


