/*

    This is essentially the party manager.
    It controls parties and coop inputs

*/
class Netcode {

    // Creates a connection. Only needed before joining a party. Offline play is fine.
    static ini(){

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

    }


    // COMM

        // Sends to server
        static output(task, args){
            if(!Netcode.Socket)
                return;
            Netcode.Socket.emit('_GAME_', task, args);
        }

        // Manually disconnects from the socket
        static disconnect(){
            
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

            GameAudio.playSound('disconnect');
            Netcode.Socket.disconnect();
            Netcode.Socket = null;
        }

        // Returns true if I am the host or disconnected
        static isHosting(){
            return Netcode.hosting || !Netcode.Socket;
        }



    // PLAYER Methods
        // Returns an integer with nr of player characters
        static getNumPCs(){
            var i, out = 0;
            for(i=0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].is_pc)
                    ++out;
            }
            if(out < 1)
                out = 1;
            return out;
        }
        
        // Gets the host
        static getHost(){
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].socket_id === Netcode.host_id && Netcode.players[i].is_pc && Netcode.host_id){
                    return Netcode.players[i];
                }
            }
            return Netcode.getMe();
        }

        // gets my character
        static getMe(){
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].UUID === Game.player.UUID)
                    return Netcode.players[i];
            }
            return Game.player;
        }

        // Returns a character by socket ID
        static getPlayerBySocketID(id){
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].socket_id === id){
                    return Netcode.players[i];
                }
            }
            return false;
        }

        // Returns a single character by UUID or false
        static getCharacterByUuid(uuid){
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].UUID === uuid){
                    return Netcode.players[i];
                }
            }
            return false;
        }

        // Returns a single character by ID
        static getCharacterById(id){
            for(let player of Netcode.players){
                if(player.id === id)
                    return player;
            }
            return false;
        }

        // Returns characters that validate with the conditions
        static filterCharactersByConditions(conds){
            let out = [];
            for(let player of Netcode.players){
                if(Condition.validateMultiple(conds, false, player, player, null, true))
                    out.push(player);
            }
            return out;
        }

        // Runs a fn(player); on all players
        static runOnPlayers(fn){
            for(var i =0; i<Netcode.players.length; ++i){
                fn(Netcode.players[i]);
            }
        }

        // Returns players by team NR
        static getPlayersOnTeam(team){
            let out = [];
            for(let player of Netcode.players){
                if(+player.team === +team)
                    out.push(player);
            }
            return out;
        }

        // Removes characters summoned by parent
        static removeCharactersByParent(parent){
            for(let i = 0; i<Netcode.players.length && Netcode.players.length; ++i){
                let p = Netcode.players[i];
                if(p.parent === parent){
                    Netcode.players.splice(i,1);
                    --i;
                }
            }
        }

        // Removes a character by object
        static removeCharacter(character){
            if(!this.isHost())
                return;

            let pos = Netcode.players.indexOf(character);
            if(~pos){
                Netcode.players.splice(pos, 1);
                this.refreshParty();
            }
        }

        // Wipes summoned players
        static wipeSummonedPlayers(){
            for(let i = 0; i<Netcode.players.length && Netcode.players.length; ++i){
                if(Netcode.players[i].summoned){
                    Netcode.players.splice(i, 1);
                    --i;
                }
            }
        }

        static removeNPCs(){

            for(let i =0; i<Netcode.players.length && Netcode.players.length; ++i){
                if(!Netcode.players[i].is_pc){
                    Netcode.players.splice(i, 1);
                    --i;
                }
            }

            if(Netcode.isHosting())
                Netcode.refreshParty();

        }



    // PUBLIC TASKS
        // Send tasks
        static partyJoin(id){
            Netcode.output('JoinParty', [id]);
        }

        // Sends my character data
        static setCharacter(){
            // Make sure my own character is up to date
            if(Netcode.isHosting()){
                // Emulate an input from the server
                new Netcode.input(true, Netcode.id, 'SetCharacter', [Game.player.hostExportFull(true)]);
                return;
            }
            Netcode.output('SetCharacter', [Game.player.hostExportFull(true)]);
        }
    
        // Send a chat message
        static chat(message){
            Netcode.output('Chat', [message]);
        }

        // Sends a punishment selection to host
        static selectPunishment(victimUUID, abilityID){
            Netcode.output("SelectPunishment", [victimUUID, abilityID]);
        }

        // Uses an ability
        static useAbility(victimUUID, abilityID){
            Netcode.output("UseAbility", [victimUUID, abilityID]);
        }

        // Picks a gem
        static pickGem(index){
            Netcode.output("PickGem", [index]);
        }

        // Ends your turn
        static endTurn(){
            Netcode.output("EndTurn");
        }

    // HOST TASKS

        // Similar to Game.startBattle
        static hostStartChallenge(challengeobj, stageobj){
            var p = [];
            // Purge previous NPCs
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].is_pc){
                    Netcode.players[i].team = Character.TEAM_PC;
                    p.push(Netcode.players[i]);
                }
            }

            let npcs = [];
            for(let npc of stageobj.npcs)
                npcs.push(npc.clone());

            Netcode.players = p.concat(npcs);
            Netcode.refreshParty();
            Netcode.hostRefreshBattle();
            
            Jasmop.Page.set('battle', [challengeobj, stageobj]);
        }

        // Sends lobby data to players
        static refreshParty(full){
            if(!Netcode.hosting)
                return;
            var p = [];
            for(var i =0; i<Netcode.players.length; ++i){
                p.push(Netcode.players[i].hostExportFull(full));
            }
            Netcode.output('UpdateCharacters', [p, false]);
        }

        // Takes an array of reduced player data or a single player data and sends them to be refreshed
        // Each player object has to contain a UUID, and then the rest of the values are optional
        static refreshData(players){
            if(!Netcode.hosting)
                return;

            if(players.constructor !== Array)
                players = [players];
            Netcode.output('UpdateCharacters', [players, true]);
        }

        // Kick a player
        static kick(socketid){
            if(!Netcode.hosting)
                return;

            Netcode.output('Kick', [socketid]);
        }

        // refreshes battle data
        static hostRefreshBattle(){
            if(!Netcode.hosting)
                return;

            let obj = {
                turn : B.turn,
                punishment_done : B.punishment_done,
                ended : B.ended,
                campaign : (B.campaign ? B.campaign.id : false),
                stage : (B.stage ? B.stage.id : false),
                intro : B.intro,
                total_turns : B.total_turns,
                paused : B.paused
            };
            Netcode.output("RefreshBattle", [obj]);
        }

        // Starts the battle
        static startBattle(){
            if(!Netcode.hosting)
                return;
            Netcode.output("StartBattle", []);
            Netcode.battleInProgress = true;
        }

        // Scrolling battle text
        static hostSBT(uuid, amount, detrimental){
            if(!Netcode.Socket || !Netcode.isHosting)
                return;
            Netcode.output("SBT", [uuid, amount, detrimental]);
        }

        // Hit visual
        static hostHitVisual(uuid, detrimental){
            if(!Netcode.Socket || !Netcode.isHosting)
                return;
            Netcode.output("HitVisual", [uuid, detrimental]);
        }
        
        // Sends talking heads to players.
        static hostTalkingHeads(heads){
            if(!Netcode.Socket || !Netcode.isHosting)
                return;
            Netcode.output("TalkingHeads", [heads]);
        }

        // Adds HTML to all players battle logs
        static hostAddToBattleLog(attackerUUID, victimUUID, text, classes, sound, raiser){

            if(!Netcode.hosting)
                return;

            Netcode.output("AddToBattleLog", [attackerUUID, victimUUID, text, classes, sound, raiser]);
        }

        // Game over!
        static hostGameOver(teamWon){

            if(!Netcode.isHost())
                return;

            Netcode.output("GameOver", [teamWon]);
            Netcode.battleInProgress = false;

            // Punt players that disconnected
            for(var i =0; i<Netcode.players.length && Netcode.players.length; ++i){
                var p = Netcode.players[i];
                if(!p.is_pc && p.socket_id.length){
                    Netcode.players.splice(i, 1);
                    --i;
                }
            }

        }


}

// Static vars
Netcode.Socket = null;              // IO
Netcode.id = '';                    // user ID
Netcode.hosting = false;
Netcode.players = [];               // Joined players data
Netcode.party_id = '';              // ID of party
Netcode.battleInProgress = false;
Netcode.host_id = '';                // socket ID of host
Netcode.isHost = Netcode.isHosting;






/** FRONT CONTROLLER for RECEIVE */
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
            Netcode.players = [];                       // Flush any previous players to make sure our character is sandboxed
            Netcode.hosting = this.byHost;              // We are the host
            this.isHost = Netcode.hosting;
        }
        else
            GameAudio.playSound('playerjoined');

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
                // Remove my old pre-connection character
                for(let i = 0; i<Netcode.players.length && Netcode.players.length; ++i){
                    if(Netcode.players[i].id === Game.player.id){
                        Netcode.players.splice(i, 1);
                        --i;
                    }
                }
                Netcode.setCharacter();
            }

        }

    };


    // Host only. Sets a character's data and lets everyone know
    this.pubSetCharacter = function(data){

        if(!Netcode.isHosting())
            return;

        // Don't import team, I am the one who decides teams
        if(data.hasOwnProperty('team'))
            delete data.team;
        
        // The player baseobject will be added on socket join rather than here
        var player = Netcode.getPlayerBySocketID(this.socketID);
        
        // This was a first load from main menu
        if(!Netcode.players.length){
            player = new Character();
            Netcode.players = [player];
        }

        if(!player)
            console.error("Socket ID not found in players", this.socketID, Netcode.players);
        player.is_pc = true;

        player.load(data);

        player.socket_id = socketID;

        // Update everyone else
        Netcode.refreshParty(true); // Full refresh
        Game.rebuildMultiplayerIcons();

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
            GameAudio.playSound('playerleft');

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
                B.statusTexts.add(player, player, '%a has disconnected and will be played by an NPC', true, false, false);
            }
        }

        // let everybody know
        Netcode.refreshParty();
        Game.rebuildMultiplayerIcons(); // Update icons
    };

    // The game has ended
    this.pubGameOver = function(winningTeam){};

    // Returns true if an object of arr has uuid
    this.pvtUuidInArray = function(arr, uuid){
        for(let p of arr){
            if(p.UUID === uuid)
                return true;
        }
        return false;
    };

    // returns an object of uuid => i
    this.pvtConvertToUuidIndexObj = function(arr){
        let out = {};
        for(let i =0; i<arr.length; ++i){
            out[arr[i].UUID] = i;
        }
        return out;
    };

    // Received an update from the host
    this.pubUpdateCharacters = function(){
        // Invalid sender or we're hosting
        if(!this.byHost || this.isHost)
            return;

        // Rebuild the players
        //Netcode.players = [];

        let players = args[0],
            reduced = args[1]       // This is data for a single character. Usually sent when picking a gem.
        ;

        for(let player of players){
            let uuid = player.UUID,
                p = Netcode.getCharacterByUuid(uuid);
            // Add new character
            if(!p){
                Netcode.players.push(new Character(player));
            }
            else{
                p.load(player);
            }
        }

        // Only update player status on full updates
        if(!reduced){
            // Delete unset players
            for(let i = 0; i<Netcode.players.length && Netcode.players.length; ++i){
                let player = Netcode.players[i];
                if(!this.pvtUuidInArray(players, player.UUID)){
                    Netcode.players.splice(i, 1);
                    --i;
                }
            }
        }

        // Sorting
        let reference = this.pvtConvertToUuidIndexObj(players);
        Netcode.players.sort(function(a, b) {
            return reference[a.UUID] - reference[b.UUID];
        });

        Game.rebuildMultiplayerIcons();

    };

    // this is just a placeholder to prevent error messages
    this.pubStartBattle = function(){
        if(!Netcode.hosting)
            Jasmop.Page.set('battle');
    };


    // Scrolling battle text
    this.pubSBT = function(uuid, amount, detrimental){};
    this.pubHitVisual = function(uuid, detrimental){};

    // Refreshes campaigns
    this.pubRefreshBattle = function(){
        // updates turn and generic properties
        var data = args[0];
        if(data.campaign)
            B.campaign = Challenge.get(data.campaign);
        if(data.stage)
            B.stage = B.campaign.getStage(data.stage);
    };
    this.pubUseAbility = function(){};
    this.pubAddToBattleLog = function(){};
    this.pubEndTurn = function(){};
    this.pubSelectPunishment = function(){};
    this.pubChat = function(){};    
    this.pubPickGem = function(){};    
    this.pubTalkingHeads = function(){};    

    // Run tasks before letting page know
    this._construct();

    // Let the active page know
    if(Jasmop.active_page.hasOwnProperty('onSocket')){
        Jasmop.active_page.onSocket(task, args, byHost, this.byMe, this.isHost, Netcode.getPlayerBySocketID(this.socketID));
    }


    

};


