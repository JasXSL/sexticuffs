class Battle{

    constructor(page, campaign, stage){

        this.jasmop_page = page;                
        this.campaign = campaign;
        this.stage = stage;                     // If this fight is part of a campaign, this is the stage object

        this.total_turns = 0;                  // Total turns played
        this.turn = 0;                         // Turn from netcode
        this.page = $("#wrap[data-page=battle] #content");                      // Jquery DOM object where to put the content
        this.turn_done_alert = false;          // Alerted that turn is done
        this.turn_done_timer = null;           // Timer to trigger the turn done sound
        
        this.intro = false;                    // Intro is ongoing
        this.talkingHeads = [];                // Talking head queue
        this.talkingHeadQueue = false;         // A talking head is active
        this.talkingHeadTimer = null;

        this.bvars = {};                       // Battle vars that can be set or get by effects

        this.statusTexts = new StatusTexts(this);                 // Status text info

        this.ended = false;                    // Game has ended, but nobody has been punished.
        this.punishment_done = false;          // Punishment has ended and it's all done.
        
        
        this.queued_ability = null;            // Ability selected for the target picker
        this.winning_team = 0;                 // Cache of winning team after battle ends

        

    }

    // Begin the battle
    ini(){

        let i,
            players = Netcode.players,
            me = this.getMyCharacter(),
            th = this
        ;



        // Tell netcode to send battle start
        Netcode.startBattle();
        // Set music
        GameAudio.setMusic('battle');

        // RESET Stuff
            AIChat.reset();                             // Reset AI chats
            
            // Clear custom background
            $("#wrap").attr('style', '');

            // Reset the players
            for(let c of players){ 
                Netcode.players[i] = c;
                // This resets their status
                c.onBattleStart(this.stage);
            }
        //

        // bvars

            if(this.stage){
				// Set bvars used in stage
                for(let i in this.stage.bvars){
                    this.setBvar(i, this.stage.bvars[i]);
                }
				// Set bvars used in characters
				for(let p of Netcode.players){
					let bv = p.getBvars();
					for(let i in bv)
                    	this.setBvar(i, bv[i]);
                }
            }

        //


        // Add custom content to skeleton

            // Add the players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];
                this.addPlayerPortrait(p);
            }
            // move yourself to the bottom left
            $("#friends > div.bottom div.character.ME", this.page).appendTo($("#friends > div.bottom"));



            // Draw abilities
            let abilities = me.getAbilities();

            for(let ability of abilities){
                $("#abilities", this.page).append(ability.getButton());
            }


            // Add the end turn button
            $("#abilities", this.page).append('<div class="ability button endTurn">End Turn</div>');




        // 

        // Bind events

            // Make gem picker toggleable
            $("#gemPicker div.text").on('click', function(){
                $("#gemPicker div.gemsOffered").toggleClass('hidden');
            });

            // Bind gem pickers
            $("#gemPicker div.gemsOffered div.gem").on('click', function(){

                var index = +$(this).attr('data-index');
                if(!th.isHost()){
                    Netcode.pickGem(index);
                }

                else if(me.pickGem(index)){
                    th.updateUI();
                    if(me.offeredGemsPicked >= 3)
                        GameAudio.playSound('laser_close');
                    
                    th.sendPlayerGems();
                }

                GameAudio.playSound('gem_pick');

            });

            // Cancel ability
            $("#cancelAbility div.button").on('click', function(){
                if(!th.myTurn())
                    return;
                if($(this).parent().hasClass('hidden'))
                    return;
                th.closeTargetSelector();
            });

            // End turn button
            $("#abilities div.ability.endTurn").on('click', function(){
                if(!th.myTurn() || th.getMyCharacter().offeredGemsPicked < 3){return;}

                GameAudio.playSound('shake');

                if(!th.isHost())
                    Netcode.endTurn();
                else
                    th.advanceTurn();
            });

            // Ability button
            $("#abilities div.ability[data-uuid]", this.page).on('mouseover mouseout', function(event){
                th.updateGems(event);
            });

            // Bind chat
            $("#chat").on('keypress', function(event){
                if(event.keyCode !== 13)
                    return;
                
                if($("#chat").html())
                    Netcode.chat($("#chat").text());
                $(this).html('');
                return false;
            });

            /// Bind talking head click
            $("#talkingHead").on('click', function(){
                th.talkingHeadQueue = false;
                clearTimeout(th.talkingHeadTimer);
                th.advanceTalkingHead();
            });

        //


        // Begin
            // make sure players have full downloads of any custom character stuff
            Netcode.refreshParty(true);

            this.intro = true;
            this.talkingHeadQueue = false;
            this.talkingHeads = [];

            if(this.isHost()){
                // Randomize first player
                this.turn = Math.floor(Math.random()*Netcode.players.length);
                
                // There's an intro
                if(this.stage && this.stage.intro)
                    this.addTalkingHeads(this.stage.intro);
                // There's no intro
                else
                    this.advanceTalkingHead(); // Starts immediate
            }

            if(this.stage){
                $("#wrap").attr('style', 'background-image:url('+hsc(this.stage.background)+')');
                GameAudio.setMusic(this.stage.music);
            }

        //




    }

    


    // SUPPORT

        isHost(){
            return Netcode.Socket === null || Netcode.hosting;
        }

        // Returns your character object from Netcode.players
        getMyCharacter(){
            return Netcode.getMe();
        }

        // Returns the character object whose turn it is
        getTurnCharacter(){
            return Netcode.players[this.turn];
        }

        // Returns a character by UUID
        getCharacterByUuid(uuid){
            return Netcode.getCharacterByUuid(uuid);
        }

        // Returns TRUE if it's my turn
        myTurn(){
            return (this.getTurnCharacter() === this.getMyCharacter());
        }

        // Raises an event on all players, with attacker and victim same as player
        raiseEventOnPlayers(type, data){
            for(let player of Netcode.players){
                player.applyEffectEvent(type, data, player, player);
            }
        }

        // Data should be an array or a single object. Generic objects and ChallengeTalkingHead class objects are allowed
        addTalkingHeads(data){
            if(data.constructor !== Array){
                data = [data];
            }
            for(var i =0; i<data.length; ++i){
                if(data[i].constructor !== ChallengeTalkingHead)
                    data[i] = new ChallengeTalkingHead(data);
            }
            this.talkingHeads = this.talkingHeads.concat(data);

            this.advanceTalkingHead();
            Netcode.hostTalkingHeads(data);
        }


    //



    // Battle events

        // Turn has changed
        onTurnChange(){
            
            $("#abilities div.ability.endTurn").toggleClass('glow', false);
            clearTimeout(this.turn_done_timer);
            this.turn_done_alert = false;

            Netcode.hostRefreshBattle();
            Netcode.refreshParty();

            this.updateUI();

            if(this.myTurn()){
                // make sure the gem picker is toggled on by default
                $("#gemPicker div.gemsOffered").toggleClass('hidden', false);
                GameAudio.playSound('yourturn');
            }

            if(!Netcode.players[this.turn].is_pc && this.isHost()){
                this.playAI();
            }
        }

        // Battle has ended
        onVictory(winningTeam){
            Game.player.onBattleEnded(+winningTeam === this.getMyCharacter().team, this.campaign, this.stage);
            Netcode.refreshParty();
        }

    // 

    

    // bVars - Variables that effects and set and get from, and are used in math

        // Sets a bvar
        setBvar(id, val){
            this.bvars[id] = val;
        }

        // updates a bvar with a mathematical operation, ex: "bvar+1"
        // If bvar doesn't exist, it will be added with a value of 0
        setBvarMath(id, operations){
            if(!this.bvars.hasOwnProperty(id))
                this.bvars[id] = 0;
            
            let v = math.eval(operations, {bvar:this.bvars[id]});
            this.setBvar(id, v);
        }

        // Returns a bvar or 0 if it doesn't exist
        getBvar(id){
            if(this.bvars.hasOwnProperty(id))
                return this.bvars[id];
            return 0;
        }


    //

    
    
    // BATTLE

        // Advances to the next player
        advanceTurn(){
            if(this.ended){return;}
            // If battle has ended, deal with it and don't continue
            if(this.checkBattleEnded())
                return;

            Netcode.players[this.turn].onTurnEnd();


            for(var i=0; i<Netcode.players.length; ++i){
                ++this.turn;
                if(this.turn >= Netcode.players.length){ this.turn = 0; }
                if(Netcode.players[this.turn].hp > 0){

                    this.addToBattleLog(Netcode.players[this.turn], null, 'Turn changed to %a', 'turn');


                    Netcode.players[this.turn].onTurnStart();
                    ++this.total_turns;
                    // Player might have died
                    if(Netcode.players[this.turn].isDead()){
                        this.advanceTurn();
                    }
                    else{
                        this.onTurnChange();
                    }
                    return;
                }
            }
        }

        

        // Draws the target selector, or uses an ability if only 1 target is viable
        selectTarget(ability){

            var active = this.getTurnCharacter();

            if(active.offeredGemsPicked < 3){
                if(active === this.getMyCharacter()){
                    Jasmop.Errors.addErrors('Please select 3 gems first.');
                }
                return false;
            }
            
            var viable = ability.usableOn(Netcode.players, false, true);
            if(!viable){console.error("no viable targets for ability", ability, ability.usableOn(Netcode.players, true)); return;}

            if(viable.length === 1 || ability.aoe){
                if(viable.length === 1)
                    viable = viable[0];
                
                this.useAbility(ability, viable);
                return;
            }

            this.queued_ability = ability;

            // Draw target picker
            $("div.character[data-uuid]").each(function(){
                if(Asset.isUuidInArr(viable, $(this).attr('data-uuid'))){
                    $(this).toggleClass('selectable', true);
                }
            });
            $("#abilities").toggleClass('hidden', true);
            $("#cancelAbility").toggleClass('hidden', false);

        }

        // Closes the target selector on ability used or cancel
        closeTargetSelector(){
            $("div.character[data-uuid]").toggleClass('selectable', false);
            $("#abilities").toggleClass('hidden', false);
            $("#cancelAbility").toggleClass('hidden', true);
        }

        // Do heuristics for AI play
        playAI(){
            if(this.ended){return;}

            // AI will grab the first best gems
            let player = this.getTurnCharacter();

            for(let i =0; i<player.offeredGems.length && player.offeredGemsPicked < 3; ++i){
                player.pickGem(i); // Will return false if invalid anyways
            }

            // Make sure we only loop through this at start
            player.offeredGemsPicked = 3;

            // Output will be handled by the NPC actually running an action immediately
            AI.makePlay(player, Netcode.players);
        }

        // Current player using an ability on a target
        useAbility(ability, victim){

            // Intro is ongoing
            if(this.intro)
                return;
        
            let attacker = this.getTurnCharacter(), 
                me = this.getMyCharacter(), 
                hosting = this.isHost()
            ;

            // This was a punishment, let the punishment handler deal with it
            if(~Ability.PUNISHMENTS.indexOf(ability.id)){
                this.closeTargetSelector();
                if(!hosting)
                    return Netcode.selectPunishment(victim.UUID, ability.id);
                return this.drawPunishment(me, victim, ability.id);
            }
            

            if(!hosting){
                Netcode.useAbility(victim.UUID, ability.id);
                this.closeTargetSelector();
                return;
            }
            let successes = ability.useAgainst(victim);

            this.closeTargetSelector();
            
            
            Netcode.refreshParty(); // output player status to socket
            this.checkBattleEnded();
            this.updateUI();
            
            return true;
        }

    //



    // GAME END

        // Checks if battle has ended, and if so, selects the punishment picker
		// ignoreOnGameOver prevents a stack overflow
        checkBattleEnded(ignoreOnGameOver){
            if(!this.isHost())
                return;

			if(this.getBvar('_BLOCK_DEATH_')){
				return;
			}

            let teams = {}, p;
            for(let p of Netcode.players){
                if(!teams.hasOwnProperty("t_"+p.team)){
                    teams["t_"+p.team] = 0;
                }
                if(p.hp > 0 && !p.summoned && !p.nonessential){
                    ++teams["t_"+p.team];
                }
            }

            var standing = 0;
            for(let i in teams){
                if(teams[i]){
                    if(++standing >= 2){
                        return false;
                    }
                }
            }

			// Get punishment
            let victors = [];
            for(let i in teams){
                if(teams[i]){
                    this.winning_team = +i.substr(2);
                    // This is the winning team
                    for(var x =0; x<Netcode.players.length; ++x){
                        p = Netcode.players[x];
                        if(!p.isDead() && !p.summoned && !p.nonessential){
                            victors.push(p);
                        }
                    }

                    break;
                }
            }


			// 
			if(this.stage && this.stage.onGameOver.length && !ignoreOnGameOver){
				
				for(let fx of this.stage.onGameOver){

					let v = victors[0];
					let f = fx.clone();
					f._attacker = v;

					f.useAgainst(v, v, 1, null, false);

				}

				// Check again. Characters might have been restored
				return this.checkBattleEnded(true);
			}

            this.ended = true;
            this.addToBattleLog(null, null, 'The battle has ended!', 'important');

            for(let p of Netcode.players){
                p.onBattleEnd();
            }

            // Clear all summoned players
            Netcode.wipeSummonedPlayers();
            
            

            // Game has ended. Waiting to pick punishment
            this.raiseEventOnPlayers(EffectData.Triggers.gameEnded, []);

            var punishmentPicker = victors[Math.floor(Math.random()*victors.length)];
            this.addToBattleLog(punishmentPicker, null, '%a picks a punishment', 'important');

            // Set turn to the player who picks punishment, also raise win/loss events
            for(let i= 0; i< Netcode.players.length; ++i){ 
                var player = Netcode.players[i];
                if(player.UUID === punishmentPicker.UUID){
                    this.turn = i;
                }
                this.raiseEventOnPlayers(player.team === this.winning_team ? EffectData.Triggers.gameWon : EffectData.Triggers.gameLost, [], player, player);
            }

            this.onTurnChange();
            
            if(!punishmentPicker.is_pc)
                AI.pickPunishment(punishmentPicker, Netcode.players);

            return true;
        }

        // Draws the punishment out and adds buttons
        drawPunishment(attacker, victim, type){

            let me = this.getMyCharacter(),
                abil = Ability.get(type),
                text = Text.generate(attacker, victim, abil, true),
                out = text.convert(attacker, victim, abil),
                sound = text.sound
            ;

            if(!sound)
                sound = 'shake';
            GameAudio.playSound(text.sound);

            this.addToBattleLog(attacker, victim, out, 'rptext ability');
            this.statusTexts.output();

            $("#abilities").html(
                '<div class="button ability active rematch">Rematch!</div>'+
                '<div class="button ability active done">Done</div>'
            ).toggleClass('dead', false);


            this.onVictory(this.winning_team);

            Netcode.hostGameOver(this.winning_team);
            
            $("#abilities div.ability").on('click', function(){
                GameAudio.playSound('shake');
                if($(this).hasClass('rematch')){
                    Jasmop.Page.set('battle');
                }
                else{
                    if(this.campaign){
                        // Wipe players so they don't show up in skirmish
                        Netcode.removeNPCs();
                    }
                    Jasmop.Page.set('home', [(this.campaign ? 'campaignRoot' : 'lobby')]);
                }
            });

            this.closeTargetSelector();
            this.punishment_done = true;
            this.updateUI();

            Netcode.hostRefreshBattle();
        }

    //


    // LOGGING

        // Appends a chat element to the DOM
        addToBattleLog(attacker, victim, text, classes, overrideNetwork, sound, raiser){
            
            if(Jasmop.active_page !== this.jasmop_page){
                return;
            }

            let me = this.getMyCharacter(),
                txt = hsc(text), 
                c = classes
            ;

            if(victim)
                txt = txt.split('%t').join(victim.getName());
            if(attacker)
                txt = txt.split('%a').join(attacker.getName());
            if(raiser)
                txt = txt.split('%r').join(raiser.getName());
            


            if(attacker === me || victim === me)
                c+= ' me';
            if(attacker && attacker.team !== me.team)
                c+= ' opponent';
            
            if(sound)
                GameAudio.playSound(sound);

            let log = $("#battlescreen > #text", this.page);
            log.append('<div class="'+hsc(c)+'"><p>'+txt+'</p></div>');
            log[0].scrollTop = log[0].scrollHeight;

            while($('#battlescreen > #text > *').length > 100){
                $('#battlescreen > #text > *:first').remove();
            }

            // In an online game and hosting
            if(this.isHost() && !overrideNetwork){
                Netcode.hostAddToBattleLog((attacker ? attacker.UUID : null), (victim ? victim.UUID : null), text, classes, sound, (raiser ? raiser.UUID : null));
            }
        }

    //


    // VISUALS

        // Returns HTML with icon and info of an active effect on a player or a charge
        getFxIcon(name, description, icon, number, stacks, detrimental, attacker, victim, charged){
            
            let desc = new Text({text:Jasmop.Tools.htmlspecialchars(description)});

            if(!name.length && !description.length)
                return '';

            let out = '<div class="spellIcon '+(detrimental ? 'detrimental' : '')+(charged ? ' charged' : '')+'">';
                out+= '<div class="icon"><img src="'+hsc(icon)+'" /></div>';
                out+= '<div class="turns">'+(number === Infinity || number === null ? '' : number)+'</div>';
                out+= '<span class="tooltip">'+hsc(name)+(stacks > 1 ? ' x'+stacks : '')+'<br />'+
                    desc.convert(attacker, victim)
                        .split('%a').join(attacker ? attacker.getName() : 'Unknown')
                        .split('%t').join(victim ? victim.getName() : 'Unknown')+
                '</span>';
            out+= '</div>';

            return out;
	
        }

        // Updates the UI with the latest stats
        updateUI(){

            let me = this.getMyCharacter(), 
                i,
                isHost = this.isHost(),
                th = this
            ;

            // Update all players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];

                var portrait = $("div.character[data-uuid='"+p.UUID+"']", this.page);
                if(!portrait.length){
                    this.addPlayerPortrait(p);
                    portrait = $("div.character[data-uuid='"+p.UUID+"']", this.page);
                }

                $("div.armor > span", portrait).html(p.armor);
                $("div.hp > span", portrait).html(p.hp);
                $("div.mana.offensive > span", portrait).html(p.mana.offensive);
                $("div.mana.defensive > span", portrait).html(p.mana.defensive);
                $("div.mana.support > span", portrait).html(p.mana.support);
                

                $("div.armor", portrait).toggleClass('full', p.armor === p.getMaxArmor());
                $("div.hp", portrait).toggleClass('full', p.hp === p.getMaxHP());
                $("div.mana.offensive", portrait).toggleClass('full', p.mana.offensive === p.max_mana);
                $("div.mana.defensive", portrait).toggleClass('full', p.mana.defensive === p.max_mana);
                $("div.mana.support", portrait).toggleClass('full', p.mana.support === p.max_mana);
                

                // Next turn this amount is added: 
                
                portrait.toggleClass("turn", (Netcode.players[this.turn] === p));
                portrait.toggleClass("dead", (p.hp <= 0));


                let fx = '';
                if(p.grappled_by){
                    fx+= this.getFxIcon("Grappled", 'Grappled by :ATTACKER:', p.grappled_by.getImage(), '', '', true, p.grappled_by, p, false);
                }
                
                for(let targ of p.getGrappling()){
                    fx+= this.getFxIcon("Grapple", 'Grappling :TARGET:', targ.getImage(), '', '', false, p, targ, false);
                }

                for(let f of p.effects){
                    fx+= this.getFxIcon(f.name, f.description, f.icon, f._duration, f._stacks, f.detrimental, f.getAttacker(), f.getVictim(), false);
                }

                let abilities = p.getAbilities();
                for(let f of abilities){
                    if(!f._charged)
                        continue;
                    fx+= this.getFxIcon(f.name, f.description, f.icon, f._charged, 0, f.detrimental, p, f._charge_targs[0], true);
                }

                
                $("div.effects", portrait).html(fx);

            }

            // Remove any non-existing players
            $("div.character[data-uuid]", this.page).each(function(){
                let uuid = $(this).attr('data-uuid');
                if(!Netcode.getCharacterByUuid(uuid)){
                    $(this).remove();
                }
            });


            if(me.isDead() && !this.punishment_done){
                $("#abilities").toggleClass('dead', true);
            }
            else{
                $("#abilities").toggleClass('dead', false);
            }

            $("#abilities", this.page).toggleClass('disabled', !this.myTurn() || me.offeredGemsPicked < 3);
            


            // Update abilities
            if(this.myTurn() && !this.punishment_done && !this.intro){

                // We pick punishment
                if(this.ended){


                    var html = '';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_DOM__">Dominate</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SUB__">Submit</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SAD__">Sadistic</div>';
                        
                    $("#abilities").html(html);

                    $("#abilities div.ability[data-punishment]").on('click', function(){

                        GameAudio.playSound('shake');
                        var abil = Ability.get($(this).attr('data-punishment')).clone();
                        abil.parent = th.getMyCharacter();

                        th.selectTarget(abil);

                    });

                    return;
                }

                // Update ability buttons
                let successfulAbilities = 0, abilities = me.getAbilities();
                for(let a of abilities){
                    let active = a.usableOn(Netcode.players).length > 0;
                    let element = $("#abilities div.ability[data-uuid="+a.UUID+"]", this.page);
                    // Temp ability
                    if(!element.length){
                        $("#abilities", this.page).prepend(a.getButton());
                        element = $("#abilities div.ability[data-uuid="+a.UUID+"]", this.page);
                    }

                    element.toggleClass('active', active);

                    let cooldown = a._cooldown;
                    $('span.cooldown', element).html(cooldown ? ' ['+cooldown+']' : '');

                    successfulAbilities+= active;
                }

                $("#abilities > div.ability.button[data-uuid]").each(function(){
                    let uuid = $(this).attr('data-uuid');
                    if(!me.getAbilityByUuid(uuid)){
                        $(this).remove();
                    }
                });
                
                // Handle turn done checks
                if(!successfulAbilities && !this.turn_done_alert && this.getMyCharacter().offeredGemsPicked >= 3){
                    // turn_done
                    this.turn_done_alert = true;
                    this.turn_done_timer = setTimeout(function(){
                        GameAudio.playSound('accept');
                        $("#abilities div.ability.endTurn").toggleClass('glow', true);
                    }, 3000);
                }
                else if(successfulAbilities)
                    clearTimeout(this.turn_done_timer);
                
                // Toggle end turn active
                $("#abilities div.ability.endTurn").toggleClass('active', successfulAbilities === 0);

                // Rebind ability buttons
                $("#abilities div.ability[data-uuid]", this.page).off('click').on('click', function(){

                    if(!th.myTurn()){
                        console.error("Not your turn");
                        return;
                    }

                    var ability = th.getMyCharacter().getAbilityByUuid($(this).attr('data-uuid'));
                    if(ability === false){
                        console.error("Ability not found", $(this).attr('data-uuid'));
                        return;
                    }

                    if($(this).hasClass('active'))
                        GameAudio.playSound('shake');
                    th.selectTarget(ability);

                });


                // Handle gem picker
                if(me.offeredGemsPicked >= 3)
                    $("#gemPicker").toggleClass('hidden', true);
                else{

                    // Show gem picker
                    $("#gemPicker").toggleClass('hidden', false);

                    // Pick n gems text
                    $("#gemPicker span.n").html(3-me.offeredGemsPicked);

                    // Update the gems
                    for(i = 0; i<me.offeredGems.length; ++i){

                        var el = $("#gemPicker div.gemsOffered div.gem[data-index="+i+"]");

                        var type = me.offeredGems[i].type,
                            picked = me.offeredGems[i].picked,
                            full = me.mana[type] >= me.max_mana
                        ;
                        el
                            .toggleClass('offensive defensive support', false)
                            .toggleClass('picked', picked)
                            .toggleClass('full', full)
                            .toggleClass(type, true)
                        ;
                    }
                }

            }

            else if(this.ended && !isHost){

                var ht = '<div class="button disconnect">Disconnect</div>';
                if(this.punishment_done){
                    ht+= '<div class="button lobby">Return</div>';
                }

                $("#abilities").html(ht);
                $("#abilities div.disconnect").on('click', function(){
                    Netcode.disconnect();
                    Jasmop.Page.set('home');
                });

                $("#abilities div.lobby").on('click', function(){
                    Jasmop.Page.set('home', [(this.stage ? 'campaignRoot' : 'lobby')]);
                });
            }



            this.updateGems();


        }
    
        // Updates the gems at the bottom of my screen
        updateGems(event){

            let me = this.getMyCharacter(),
                mana = me.mana,
                manaCost = {
                    offensive : 0,
                    defensive : 0,
                    support : 0
                }
            ;

            

            if(event && event.type === 'mouseover'){

                let ability = me.getAbilityByUuid($(event.target).attr('data-uuid'));


                if(ability._cooldown){
                    return;
                }

                if(ability === false)
                    return;
                
                manaCost = ability.getManaCost();

                
                if(!me.hasEnoughMana(manaCost)){
                    return;
                }

            }
            
            $("#manaGems div.manatype").each(function(){
                
                var type = $(this).attr('data-manatype');

                $("div.gem", this).each(function(index){

                    $(this).toggleClass('disabled semi highlighted', false);

                    if(index < manaCost[type])
                        $(this).toggleClass('highlighted', true);

                    if(index >= mana[type])
                        $(this).toggleClass('disabled', true);


                });
                
            });

        }
        

        advanceTalkingHead(){
            
            if(this.talkingHeadQueue)
                return;

            $("#talkingHead").toggleClass('hidden', true);
			
			let th = this;

            // Start the battle
            if(!this.talkingHeads.length){
                // This talking head was not a part of an intro
                if(!this.intro) 
                    return;

                // This talking head was the final of the intro. Start the game  here
                this.advanceTurn();
                this.intro = false;
                this.raiseEventOnPlayers(EffectData.Triggers.gameStarted, []);
                Netcode.hostRefreshBattle();
                this.updateUI();
            }
            // Output talking head
            else{
                let head = this.talkingHeads.shift(),
                    text = head.text,
                    icon = head.icon,
                    sound = head.sound
                ;
                if(!sound)
                    sound = 'shake';
                
                this.talkingHeadQueue = true;

                this.talkingHeadTimer = setTimeout(function(){
                    $("#talkingHead").toggleClass('hidden', false);
                    $("#talkingHead div.text").html(hsc(text));
                    $("#talkingHead div.head").attr('style', 'background-image:url('+hsc(icon)+')');
                    GameAudio.playSound(sound);

                    th.talkingHeadTimer = setTimeout(function(){
                        th.talkingHeadQueue = false;
                        th.advanceTalkingHead();

                    }, 4000);

                }, 250);
                
            }
        }

        // Adds a player portrait thingy
        addPlayerPortrait(p){

            let th = this,
                me = this.getMyCharacter(),
                html = ''
            ;

            // Find a free color
            for(let color of Battle.COLORS){
                let found = false;
                for(let player of Netcode.players){
                    if(player.color === color){
                        found = true;
                        break;
                    }
                }
                if(!found){
                    p.color = color; 
                    break;
                }
            }

            html = '<div class="character'+(p === me ? ' PC ME' : '')+'" data-uuid="'+p.UUID+'" style="background-image:url('+p.getImage()+')">';
                html+= '<div class="center">';
                    html+= '<h3 class="name" style="color:'+p.color+'";>'+p.name+'</h3>';
                html+= '</div>';

                html+= '<div class="resources">';
                    html+= '<div class="armor full"><div class="bg"></div><span></span></div>';
                    html+= '<div class="hp full"><div class="bg"></div><span></span></div>';
                    html+= '<div class="mana offensive full"><div class="bg"></div><span></span></div>';
                    html+= '<div class="mana defensive full"><div class="bg"></div><span></span></div>';
                    html+= '<div class="mana support full"><div class="bg"></div><span></span></div>';
                    
                html+= '</div>';

                html+= '<div class="effects"></div>';

            html+= '</div>';

            var targ = "friends";
            if(p.team !== me.team){targ = "enemies";}
            $("#"+targ+' > div.bottom', this.page).prepend(html);

            // Bind
            // Select a target or get info
            $("div.character[data-uuid]").off('click').on('click', function(){
                if($(this).hasClass('selectable') && th.myTurn()){
                    th.useAbility(
                        th.queued_ability,
                        th.getCharacterByUuid($(this).attr('data-uuid'))
                    );
                    return;
                }

                var char = th.getCharacterByUuid($(this).attr('data-uuid'));

                char.inspect();
            });

            

        }

        // Updates mana and offered gems for the active player. Greatly reduces the amount of data needed to be sent for gem picking
        sendPlayerGems(){
            let p = this.getTurnCharacter();
            Netcode.refreshData({
                UUID:p.UUID,
                mana : p.mana,
                offeredGems : p.offeredGems,
                offeredGemsPicked : p.offeredGemsPicked,
            });
        }

    //



        




}

// Colors to be assigned to the players
Battle.COLORS = [
    "#DFD",
    "#FDD",
    "#DDF",
    "#FDF",
    "#DFF",
    "#FFD",
    "#FFF",
    "#DDD",
    "#EFD",
    "#DFE",
    "#DEF",
    "#FED",
];



class StatusTexts{

    constructor(parent){

        this.parent = parent;

        this.texts = [];           // Texts yet to be output
        this.capture = false;      // Capture status texts, don't output directly

    }

    // Schedules a "x took n damage" etc text to be output
    add(attacker, victim, text, detrimental, isChat, forceSelf, sound, raiser){
    
        this.texts.push({
            attacker:attacker, 
            victim:victim, 
            text:text,
            detrimental:detrimental,
            isChat : isChat,
            forceSelf : forceSelf,
            sound : sound,
            raiser : raiser
        });

        if(this.capture){return;}
        this.output();
    }

    // Flushes scheduled status texts
    output(){

        for(let obj of this.texts){

            let attacker = obj.attacker,
                victim = obj.victim,
                text = obj.text,
                detrimental = obj.detrimental,
                me = this.parent.getMyCharacter(),
                isChat  = obj.isChat,
                classes = ['statusText'],
                force = obj.forceSelf,
                sound = obj.sound,
                raiser = obj.raiser
            ;

            if(detrimental)
                classes.push('bad');
            if(isChat)
                classes.push('chat');

            if(isChat){
                text = '%a says: '+text;
            }

            this.parent.addToBattleLog(attacker, victim, text, classes.join(' '), force, sound, raiser);
            if(sound){
                GameAudio.playSound(sound);
            }
        }
        
        this.texts = [];
        this.capture = false;
    }



}

