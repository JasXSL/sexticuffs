(function(){
    "use strict";
    var page = new Jasmop.Page();
    Jasmop.Page.add(page);
    page.id = 'battle';

    var hsc = Jasmop.Tools.htmlspecialchars;

    page.need_ajax_data = false;                    // If true, will attempt an ajax fetch first
    // All except onLoaded can return promises
    page.onPreload = function(){};
    

    // Synonym for page
    var B = page;

    // Colors to be assigned to the players
    B.COLORS = [
        "#DFD",
        "#FDD",
        "#DDF",
        "#FDF",
        "#DFF",
        "#FFD",
        "#FFF",
        "#DDD"
    ];

    B.turn = 0;                         // Turn from netcode
    B.page = null;                      // Jquery DOM object of this page
    
    B.statusTexts = {};                 // Status text info
        B.statusTexts.texts = [];           // Texts yet to be output
        B.statusTexts.capture = false;      // Capture status texts, don't output directly

    B.ended = false;                    // Game has ended, but nobody has been punished.
    B.punishment_done = false;          // Punishment has ended and it's all done.
    
    
    B.queued_ability = null;            // Ability selected for the target picker
    B.winning_team = 0;                 // Cache of winning team after battle ends
    



    // SUPPORT

        B.isHost = function(){
            return Netcode.Socket === null || Netcode.hosting;
        };

        // Returns your character object from Netcode.players
        B.getMyCharacter = function(){
            for(var i =0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].UUID === Game.player.UUID){
                    return Netcode.players[i];
                }
            }
        };

        // Returns the character object whose turn it is
        B.getTurnCharacter = function(){
            return Netcode.players[B.turn];
        };

        // Returns a character by UUID
        B.getCharacterByUuid = function(uuid){
            return Netcode.getCharacterByUuid(uuid);
        };

        // Returns TRUE if it's my turn
        B.myTurn = function(){
            return (B.getTurnCharacter() === B.getMyCharacter());
        };



    // Battle events

        // Turn has changed
        B.onTurnChange = function(){
            
            Netcode.hostRefreshBattle();
            Netcode.refreshParty();

            B.updateUI();

            if(B.myTurn()){
                createjs.Sound.play('yourturn');
            }

            if(!Netcode.players[B.turn].is_pc && B.isHost()){
                B.playAI();
            }
        };

        // Battle has ended
        B.onVictory = function(winningTeam){

            var me = B.getMyCharacter();

            if(+winningTeam === +me.team){
                // Add to my base character
                Game.player.onVictory(B.winning_team);
                // Player base stats might have changed, so best send it again to host
                Netcode.setCharacter();
            }

        };


    // BATTLE



        // Advances to the next player
        B.advanceTurn = function(){
            if(B.ended){return;}
            // If battle has ended, deal with it and don't continue
            if(B.checkBattleEnded())
                return;

            Netcode.players[B.turn].onTurnEnd();

            for(var i=0; i<Netcode.players.length; ++i){
                ++B.turn;
                if(B.turn >= Netcode.players.length){ B.turn = 0; }
                if(Netcode.players[B.turn].hp > 0){

                    B.addToBattleLog(Netcode.players[B.turn], null, 'Turn changed to %a', 'turn');
                    Netcode.players[B.turn].onTurnStart();

                    // Player might have died
                    if(Netcode.players[B.turn].isDead()){
                        B.advanceTurn();
                    }
                    else{
                        B.onTurnChange();
                    }
                    return;
                }
            }
        };

        

        // Draws the target selector, or uses an ability if only 1 target is viable
        B.selectTarget = function(ability){
            
            var viable = ability.usableOn(Netcode.players, false, true);
            if(!viable){console.error("no viable targets for ability", ability, ability.usableOn(Netcode.players, true)); return;}
            if(viable.length === 1){
                B.useAbility(ability, viable[0]);
                return;
            }

            var findCharInArr = function(arr, uuid){
                for(var i =0; i<arr.length; ++i){
                    if(arr[i].UUID === uuid)
                        return true;
                }
                return false;
            };

            B.queued_ability = ability;
            // Draw target picker
            $("div.character[data-uuid]").each(function(){
                if(findCharInArr(viable, $(this).attr('data-uuid'))){
                    $(this).toggleClass('selectable', true);
                }
            });
            $("#abilities").toggleClass('hidden', true);
            $("#cancelAbility").toggleClass('hidden', false);

        };

        // Closes the target selector on ability used or cancel
        B.closeTargetSelector = function(){
            $("div.character[data-uuid]").toggleClass('selectable', false);
            $("#abilities").toggleClass('hidden', false);
            $("#cancelAbility").toggleClass('hidden', true);
        };

        // Do heuristics for AI play
        B.playAI = function(){
            if(B.ended){return;}
            var player = this.getTurnCharacter();
            AI.makePlay(player, Netcode.players);
        };

        // Current player using an ability on a target
        B.useAbility = function(ability, victim){
        
            var attacker = B.getTurnCharacter(), me = B.getMyCharacter();
            var hosting = B.isHost();


            // This was a punishment, let the punishment handler deal with it
            if(~Ability.PUNISHMENTS.indexOf(ability.id)){
                if(!hosting)
                    return Netcode.selectPunishment(victim.UUID, ability.id);
                return B.drawPunishment(me, victim, ability.id);
            }
            

            if(!hosting){
                Netcode.useAbility(victim.UUID, ability.UUID);
                B.closeTargetSelector();
                return;
            }

            B.statusTexts.capture = true;

            // hit text
            var text = Text.generate(attacker, victim, ability, true);

            var attempt = ability.useAgainst(victim);
            if(!attempt)
                text = Text.generate(attacker, victim, ability, false);

            var out = text.convert(attacker, victim, ability);
            var sound = text.sound;
            if(!sound)
                sound = 'shake';
            createjs.Sound.play(text.sound);

            var textblock = out;

            B.addToBattleLog(attacker, victim, textblock, "rptext ability");
            B.statusTexts.output();

            if(!attacker.is_pc && attempt){
                attacker.aiChat.get(AIChat.Events.ability, text, attacker, victim, ability);
            }

            B.closeTargetSelector();
            
            
            Netcode.refreshParty(); // output player status to socket
            B.checkBattleEnded();
            B.updateUI();
            
            return true;
        };

        




    // GAME END

        // Checks if battle has ended, and if so, selects the punishment picker
        B.checkBattleEnded = function(){
            var teams = {}, p;
            for(var i =0; i<Netcode.players.length; ++i){
                p = Netcode.players[i];
                if(!teams.hasOwnProperty("t_"+p.team)){
                    teams["t_"+p.team] = 0;
                }
                if(Netcode.players[i].hp > 0){
                    ++teams["t_"+p.team];
                }
            }
            var standing = 0;
            for(i in teams){
                if(teams[i]){
                    if(++standing >= 2){
                        return false;
                    }
                }
            }
            B.ended = true;
            B.addToBattleLog(null, null, 'The battle has ended!', 'important');
            
            // Get punishment
            var victors = [];
            for(i in teams){
                if(teams[i]){
                    B.winning_team = +i.substr(2);
                    // This is the winning team
                    for(var x =0; x<Netcode.players.length; ++x){
                        p = Netcode.players[x];
                        if(!p.isDead()){
                            victors.push(p);
                        }
                    }

                    break;
                }
            }



            var punishmentPicker = victors[Math.floor(Math.random()*victors.length)];
            B.addToBattleLog(punishmentPicker, null, '%a picks a punishment', 'important');

            // Set turn to the player who picks punishment
            for(i=0; i<Netcode.players.length; ++i){
                if(Netcode.players[i].UUID === punishmentPicker.UUID){
                    B.turn = i;
                }
            }

            B.onTurnChange();
            
            if(!punishmentPicker.is_pc)
                AI.pickPunishment(punishmentPicker, Netcode.players);

            return true;
        };

        // Draws the punishment out and adds buttons
        B.drawPunishment = function(attacker, victim, type){

            var me = B.getMyCharacter();
            var abil = Ability.get(type);
            var text = Text.generate(attacker, victim, abil, true);
            var out = text.convert(attacker, victim, abil);
            var sound = text.sound;
            if(!sound)
                sound = 'shake';
            createjs.Sound.play(text.sound);

            B.addToBattleLog(attacker, victim, out, 'rptext ability');
            B.statusTexts.output();

            $("#abilities").html(
                '<div class="button ability active rematch">Rematch!</div>'+
                '<div class="button ability active done">Done</div>'
            ).toggleClass('dead', false);


            B.onVictory(B.winning_team);

            Netcode.hostGameOver(B.winning_team);
            
            $("#abilities div.ability").on('click', function(){
                createjs.Sound.play('shake');
                if($(this).hasClass('rematch')){
                    Jasmop.Page.set('battle');
                }
                else{
                    Jasmop.Page.set('home');
                }
            });

            B.closeTargetSelector();
            B.punishment_done = true;
            B.updateUI();

            Netcode.hostRefreshBattle();
        };

    
    // LOGGING

        // Appends a chat element to the DOM
        B.addToBattleLog = function(attacker, victim, text, classes, overrideNetwork){
            
            var me = B.getMyCharacter();

            var txt = hsc(text), c = classes;
            if(victim)
                txt = txt.split('%t').join(victim.getName());
            if(attacker)
                txt = txt.split('%a').join(attacker.getName());
            
            if(attacker === me || victim === me)
                c+= ' me';
            if(attacker && attacker.team !== me.team)
                c+= ' opponent';


            var log = $("#battlescreen", B.page);
            log.append('<div class="'+hsc(c)+'"><p>'+txt+'</p></div>');
            log[0].scrollTop = log[0].scrollHeight;

            // In an online game and hosting
            if(B.isHost() && !overrideNetwork){
                Netcode.hostAddToBattleLog((attacker ? attacker.UUID : null), (victim ? victim.UUID : null), text, classes);
            }
        };

        // Schedules a "x took n damage" etc text to be output
        B.statusTexts.add = function(attacker, victim, text, detrimental, isChat, forceSelf){
        
            B.statusTexts.texts.push({
                attacker:attacker, 
                victim:victim, 
                text:text,
                detrimental:detrimental,
                isChat : isChat,
                forceSelf : forceSelf
            });

            if(B.statusTexts.capture){return;}
            B.statusTexts.output();
        };

        // Flushes scheduled status texts
        B.statusTexts.output = function(){

            for(var i=0; i<B.statusTexts.texts.length; ++i){
                var obj = B.statusTexts.texts[i],
                    attacker = obj.attacker,
                    victim = obj.victim,
                    text = obj.text,
                    detrimental = obj.detrimental,
                    me = B.getMyCharacter(),
                    isChat  = obj.isChat,
                    classes = ['statusText'],
                    force = obj.forceSelf
                ;

                if(detrimental)
                    classes.push('bad');
                if(isChat)
                    classes.push('chat');

                if(isChat){
                    text = '%a says: '+text;
                }
                B.addToBattleLog(attacker, victim, text, classes.join(' '), force);
            }
            
            B.statusTexts.texts = [];
            B.statusTexts.capture = false;
        };



        

    
    // VISUALS

        // Updates the UI with the latest stats
        B.updateUI = function(){

            var me = B.getMyCharacter(), i;
            var isHost = B.isHost();

            // Update all players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];

                var portrait = $("div.character[data-uuid='"+p.UUID+"']", B.page);
                $("div.armor > span", portrait).html(p.armor);
                $("div.hp > span", portrait).html(p.hp);
                $("div.mana > span", portrait).html(p.mana);

                $("div.armor", portrait).toggleClass('full', p.armor === p.max_armor);
                $("div.hp", portrait).toggleClass('full', p.armor === p.max_armor);
                $("div.mana", portrait).toggleClass('full', p.armor === p.max_armor);

                // Next turn this amount is added: 
                
                portrait.toggleClass("turn", (Netcode.players[B.turn] === p));
                portrait.toggleClass("dead", (p.hp <= 0));


                var fx = '';
                for(var f = 0; f < p.effects.length; ++f){
                    fx+= p.effects[f].getIcon();
                }
                $("div.effects", portrait).html(fx);

            }

            if(me.isDead() && !B.punishment_done){
                $("#abilities").toggleClass('dead', true);
            }
            else{
                $("#abilities").toggleClass('dead', false);
            }

            $("#abilities", B.page).toggleClass('disabled', !B.myTurn());



            if(B.myTurn()){

                // We pick punishment
                if(B.ended && !B.punishment_done){


                    var html = '';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_DOM__">Dominate</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SUB__">Submit</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SAD__">Sadistic</div>';
                        
                    $("#abilities").html(html);

                    $("#abilities div.ability[data-punishment]").on('click', function(){
                        createjs.Sound.play('shake');
                        var abil = Ability.get($(this).attr('data-punishment'));
                        abil.parent = B.getMyCharacter();

                        B.selectTarget(abil);
                    });

                    return;
                }

                // Update ability buttons
                var successfulAbilities = 0;
                for(i=0; i<me.abilities.length; ++i){
                    var a = me.abilities[i];
                    var active = a.usableOn(Netcode.players).length > 0;
                    var element = $("#abilities div.ability[data-uuid="+a.UUID+"]", B.page);
                    element.toggleClass('active', active);

                    var cooldown = a._cooldown;
                    $('span.cooldown', element).html(cooldown ? ' ['+cooldown+']' : '');

                    successfulAbilities+= active;
                }
                
                $("#abilities div.ability.endTurn").toggleClass('active', successfulAbilities === 0);

            }
            else if(B.ended && !isHost){
                $("#abilities").html('<div class="button disconnect">Disconnect</div>');
                $("#abilities div.disconnect").on('click', function(){
                    Netcode.disconnect();
                    Jasmop.Page.set('home');
                });
            }


            B.updateGems();


        };
    
        // Updates the gems at the bottom of my screen
        B.updateGems = function(event){

            var me = B.getMyCharacter();

            // this might be an event you can parse with jquery
            // Update mana crystals
            var mana = me.mana;
            var manaNextTurn = Math.floor(me.mana_ticks+me.TICKRATE)+mana;
            var manaCost = 0;

            

            if(event && event.type === 'mouseover'){

                var ability = me.getAbilityByUuid($(this).attr('data-uuid'));

                if(ability._cooldown){
                    return;
                }

                if(ability === false)
                    return;
                
                manaCost = ability.getManaCost();
                if(manaCost > mana){
                    return;
                }

            }
            
            

            $("#manaGems div.gem").each(function(index){
                
                $(this).toggleClass('disabled semi highlighted', false);
                if(index < manaCost)
                    $(this).toggleClass('highlighted', true);

                if(index >= mana)
                    $(this).toggleClass('disabled', true);
                if(index < manaNextTurn)
                    $(this).toggleClass('semi', true);
            });

        };
        

        // Builds the DOM and binds events
        page.onLoaded = function(){

            Netcode.startBattle();

            var i,
                players = Netcode.players,
                me = B.getMyCharacter()
            ;


            // Reset defaults
            B.turn = 0;                                 // Set turn to the first player (usually host)
            B.ended = false;                            // Battle has not ended
            B.punishment_done = false;                  // Punishment is not drawn
            AIChat.ini();                               // Initialize AI chats

            // Reset the players
            for(i=0; i<players.length; ++i){
                
                var c = players[i];

                // Grant a color
                c.color = B.COLORS[i];

                Netcode.players[i] = c;

                // This resets their status
                c.onBattleStart();
            }

            // Build the skeleton
            B.page = $("#wrap[data-page=battle] #content");

            var html = `

                <div class="top">
                    <div id="friends"><div class="bottom"></div></div>
                    <div id="battlescreen" class="border"></div>
                    <div id="enemies"><div class="bottom"></div></div>
                </div>
                <div id="manaGems" class="border">`;
                
                for(i =0; i<me.max_mana; ++i){
                    html+= '<div class="gem disabled"></div>';
                }


            html+=`</div>
                <div id="abilities"></div>
                <div id="cancelAbility" class="hidden"><div class="button">Cancel</div></div>
            `;




            
            // Flush the skeleton
            this.setContent(html);
            html = '';




            // Add the players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];
                
                html = '<div class="character'+(p === me ? ' PC ME' : '')+'" data-uuid="'+p.UUID+'" style="background-image:url('+p.getImage()+')">';
                    html+= '<div class="center">';
                        html+= '<h3 class="name" style="color:'+p.color+'";>'+p.name+'</h3>';
                    html+= '</div>';

                    html+= '<div class="resources">';
                        html+= '<div class="armor full"><div class="bg"></div><span></span></div>';
                        html+= '<div class="hp full"><div class="bg"></div><span></span></div>';
                        html+= '<div class="mana full"><div class="bg"></div><span></span></div>';
                    html+= '</div>';

                    html+= '<div class="effects"></div>';

                html+= '</div>';

                var targ = "friends";
                if(p.team !== me.team){targ = "enemies";}
                $("#"+targ+' > div.bottom', B.page).append(html);
            }
            // move yourself to the bottom left
            $("#friends > div.bottom div.character.ME", B.page).appendTo($("#friends > div.bottom"));




            // Draw abilities
            var abilities = me.abilities;

            for(i=0; i<abilities.length; ++i){
                html = abilities[i].getButton();
                $("#abilities", B.page).append(html);
            }


            // Add the end turn button
            $("#abilities", B.page).append('<div class="ability button endTurn">End Turn</div>');



            // Bind ability buttons
            $("#abilities div.ability[data-uuid]", B.page).on('click', function(){

                if(!B.myTurn()){return;}

                var ability = B.getMyCharacter().getAbilityByUuid($(this).attr('data-uuid'));
                if(ability === false){
                    return;
                }

                if($(this).hasClass('active'))
                    createjs.Sound.play('shake');
                B.selectTarget(ability);

            });

            // Cancel ability
            $("#cancelAbility div.button").on('click', function(){
                if(!B.myTurn())
                    return;
                if($(this).parent().hasClass('hidden'))
                    return;
                B.closeTargetSelector();
            });

            // End turn button
            $("#abilities div.ability.endTurn").on('click', function(){
                if(!B.myTurn()){return;}
                createjs.Sound.play('shake');

                if(!B.isHost())
                    Netcode.endTurn();
                else
                    B.advanceTurn();
            });

            // Ability button
            $("#abilities div.ability[data-uuid]", B.page).on('mouseover mouseout', B.updateGems);


            // Select a target or get info
            $("div.character[data-uuid]").on('click', function(){
                if($(this).hasClass('selectable') && B.myTurn()){
                    B.useAbility(
                        B.queued_ability,
                        B.getCharacterByUuid($(this).attr('data-uuid'))
                    );
                    return;
                }

                var char = B.getCharacterByUuid($(this).attr('data-uuid'));

                var html = '<div id="characterInspect">';

                    html+= '<img class="icon" src="'+char.getImage()+'" />';
                    html+= '<h1>'+hsc(char.name)+'</h1>';
                    html+= '<p class="race">Level '+char.level+' '+hsc(char.getGender())+' '+hsc(char.race.getName())+'</p>';
                    html+= '<p class="description">'+hsc(char.description)+'</p>';
                    html+= '<p class="armor">'+(char.armor ? 'Wearing '+hsc(char.armorSet.name) : 'Nude')+'</p>';
                    html+= '<div class="clear"></div>';
                html+= '</div>';

                Jasmop.Overlay.set(html);

            });


            var turn = Math.floor(Math.random()*Netcode.players.length);

            if(B.isHost())
                B.advanceTurn();

        };


    
    // NETCODE
        page.onSocket = function(task, args, byHost, byMe, isHost, byPlayer){

            var data = args;
            if(args)
                data = args[0];
            
            // Open
            if(task === 'disconnect'){
                Jasmop.Page.set('home');
            }


            // Generic chat handler - [(str)message]
            if(task === 'Chat'){

                B.statusTexts.add(byPlayer, byPlayer, hsc(args[0].substr(128)), false, true);

            }

            // Player receiving a message from the host
            if(byHost && !isHost){

                // updates turn and generic properties
                if(task === 'RefreshBattle'){
                    var preturn = B.turn;
                    B.turn = data.turn;
                    B.ended = data.ended;
                    B.punishment_done = data.punishment_done;
                    B.updateUI();

                    if(B.turn !== preturn)
                        B.onTurnChange();
                }

                // The characters have been updated
                if(task === 'UpdateCharacters'){
                    B.updateUI();
                }

                // A text has been added
                if(task === 'AddToBattleLog'){

                    var a = B.getCharacterByUuid(args[0]);
                    var b = B.getCharacterByUuid(args[1]);

                    B.addToBattleLog(a, b, args[2], args[3]);


                }

                if(task === 'GameOver'){
                    B.onVictory(+args[0]);
                }

            }



            // Host receiving a message from a player
            else if(!byHost && isHost){

                // By current turn
                if(byPlayer === B.getTurnCharacter()){
                    
                    if(task === 'UseAbility' && !B.ended){
                        var ability = byPlayer.getAbilityByUuid(args[1]),
                            targ = B.getCharacterByUuid(args[0])
                        ;

                        if(ability === false || targ === false){
                            return Jasmop.Errors.addErrors('Invalid ability use received');
                        }

                        if(!ability.usableOn(targ, false, true)){
                            return Jasmop.Errors.addErrors('Invalid ability target received');
                        }

                        B.useAbility(ability, targ);

                    }

                    else if(task === 'SelectPunishment'){

                        // Now is not the time to punish
                        if(!B.ended || B.punishment_done)
                            return;

                        var victim = B.getCharacterByUuid(args[0]);
                        var punishment = Ability.get(args[1]);

                        if(!punishment || !victim){
                            return Jasmop.Errors.addErrors('Invalid punishment or victim received');
                        }

                        B.drawPunishment(byPlayer, victim, punishment.id);

                    }

                    else if(task === 'EndTurn'){
                        B.advanceTurn();
                    }

                }

            }

        };

        

    page.onUnload = function(){};
    page.onUserData = function(){};

})();
