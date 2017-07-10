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
        "#DDD",
        "#EFD",
        "#DFE",
        "#DEF",
        "#FED",
    ];

    B.MANA_TYPES = [
        "offensive",
        "defensive",
        "support"
    ];


    B.total_turns = 0;                  // Total turns played
    B.turn = 0;                         // Turn from netcode
    B.page = null;                      // Jquery DOM object of this page
    B.turn_done_alert = false;          // Alerted that turn is done
    B.turn_done_timer = null;           // Timer to trigger the turn done sound
    
    B.campaign = null;                  // If this fight is a part of a campaign, this is the campaign object
    B.stage = null;                     // If this fight is part of a campaign, this is the stage object
    B.intro = false;                    // Intro is ongoing
    B.talkingHeads = [];                // Talking head queue
    B.talkingHeadQueue = false;         // A talking head is active
    B.talkingHeadTimer = null;

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
            return false;
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

        // Raises an event on all players, with attacker and victim same as player
        B.raiseEventOnPlayers = function(type, data){
            for(var i =0; i<Netcode.players.length; ++i){
                var player = Netcode.players[i];
                player.applyEffectEvent(type, data, player, player);
            }
        };

        // Data should be an array or a single object. Generic objects and ChallengeTalkingHead class objects are allowed
        B.addTalkingHeads = function(data){
            if(data.constructor !== Array){
                data = [data];
            }
            for(var i =0; i<data.length; ++i){
                if(data[i].constructor !== ChallengeTalkingHead)
                    data[i] = new ChallengeTalkingHead(data);
            }
            B.talkingHeads = B.talkingHeads.concat(data);
            B.advanceTalkingHead();
            Netcode.hostTalkingHeads(data);
        };


    // Battle events

        // Turn has changed
        B.onTurnChange = function(){
            
            $("#abilities div.ability.endTurn").toggleClass('glow', false);
            clearTimeout(B.turn_done_timer);
            B.turn_done_alert = false;

            Netcode.hostRefreshBattle();
            Netcode.refreshParty();

            B.updateUI();

            if(B.myTurn()){
                // make sure the gem picker is toggled on by default
                $("#gemPicker div.gemsOffered").toggleClass('hidden', false);
                GameAudio.playSound('yourturn');
            }

            if(!Netcode.players[B.turn].is_pc && B.isHost()){
                B.playAI();
            }
        };

        // Battle has ended
        B.onVictory = function(winningTeam){
            Game.player.onBattleEnded(+winningTeam === B.getMyCharacter().team, B.campaign, B.stage);
            Netcode.refreshParty();
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
                    ++B.total_turns;
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

            var active = B.getTurnCharacter();

            if(active.offeredGemsPicked < 3){
                if(active === B.getMyCharacter()){
                    Jasmop.Errors.addErrors('Please select 3 gems first.');
                }
                return false;
            }
            
            var viable = ability.usableOn(Netcode.players, false, true);
            if(!viable){console.error("no viable targets for ability", ability, ability.usableOn(Netcode.players, true)); return;}

            if(viable.length === 1 || ability.aoe){
                if(viable.length === 1)
                    viable = viable[0];
                
                B.useAbility(ability, viable);
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

            // AI will grab the first best gems
            var player = this.getTurnCharacter();

            for(var i =0; i<player.offeredGems.length && player.offeredGemsPicked < 3; ++i){
                player.pickGem(i); // Will return false if invalid anyways
            }

            // Make sure we only loop through this at start
            player.offeredGemsPicked = 3;

            // Output will be handled by the NPC actually running an action immediately
            AI.makePlay(player, Netcode.players);
        };

        // Current player using an ability on a target
        B.useAbility = function(ability, victim){

            // Intro is ongoing
            if(B.intro)
                return;
        
            var attacker = B.getTurnCharacter(), me = B.getMyCharacter();
            var hosting = B.isHost();
            // This was a punishment, let the punishment handler deal with it
            if(~Ability.PUNISHMENTS.indexOf(ability.id)){
                B.closeTargetSelector();
                if(!hosting)
                    return Netcode.selectPunishment(victim.UUID, ability.id);
                return B.drawPunishment(me, victim, ability.id);
            }
            

            if(!hosting){
                Netcode.useAbility(victim.UUID, ability.id);
                B.closeTargetSelector();
                return;
            }
            var successes = ability.useAgainst(victim);

            B.closeTargetSelector();
            
            
            Netcode.refreshParty(); // output player status to socket
            B.checkBattleEnded();
            B.updateUI();
            
            return true;
        };

        




    // GAME END

        // Checks if battle has ended, and if so, selects the punishment picker
        B.checkBattleEnded = function(){
            if(!B.isHost())
                return;

            var teams = {}, p;
            for(var i =0; i<Netcode.players.length; ++i){
                p = Netcode.players[i];
                if(!teams.hasOwnProperty("t_"+p.team)){
                    teams["t_"+p.team] = 0;
                }
                if(p.hp > 0 && !p.summoned && !p.nonessential){
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
            for(let p of Netcode.players){
                p.onBattleEnd();
            }

            // Clear all summoned players
            Netcode.wipeSummonedPlayers();
            
            // Get punishment
            var victors = [];
            for(i in teams){
                if(teams[i]){
                    B.winning_team = +i.substr(2);
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

            // Game has ended. Waiting to pick punishment
            B.raiseEventOnPlayers(EffectData.Triggers.gameEnded, []);

            var punishmentPicker = victors[Math.floor(Math.random()*victors.length)];
            B.addToBattleLog(punishmentPicker, null, '%a picks a punishment', 'important');

            // Set turn to the player who picks punishment, also raise win/loss events
            for(i= 0; i< Netcode.players.length; ++i){ 
                var player = Netcode.players[i];
                if(player.UUID === punishmentPicker.UUID){
                    B.turn = i;
                }
                B.raiseEventOnPlayers(player.team === B.winning_team ? EffectData.Triggers.gameWon : EffectData.Triggers.gameLost, [], player, player);
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
            GameAudio.playSound(text.sound);

            B.addToBattleLog(attacker, victim, out, 'rptext ability');
            B.statusTexts.output();

            $("#abilities").html(
                '<div class="button ability active rematch">Rematch!</div>'+
                '<div class="button ability active done">Done</div>'
            ).toggleClass('dead', false);


            B.onVictory(B.winning_team);

            Netcode.hostGameOver(B.winning_team);
            
            $("#abilities div.ability").on('click', function(){
                GameAudio.playSound('shake');
                if($(this).hasClass('rematch')){
                    Jasmop.Page.set('battle');
                }
                else{
                    if(B.campaign){
                        // Wipe players so they don't show up in skirmish
                        Netcode.removeNPCs();
                    }
                    Jasmop.Page.set('home', [(B.campaign ? 'campaignRoot' : 'lobby')]);
                }
            });

            B.closeTargetSelector();
            B.punishment_done = true;
            B.updateUI();

            Netcode.hostRefreshBattle();
        };

    
    // LOGGING

        // Appends a chat element to the DOM
        B.addToBattleLog = function(attacker, victim, text, classes, overrideNetwork, sound, raiser){
            
            if(Jasmop.active_page !== B){
                return;
            }

            var me = B.getMyCharacter();

            var txt = hsc(text), c = classes;
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

            var log = $("#battlescreen > #text", B.page);
            log.append('<div class="'+hsc(c)+'"><p>'+txt+'</p></div>');
            log[0].scrollTop = log[0].scrollHeight;

            while($('#battlescreen > #text > *').length > 100){
                $('#battlescreen > #text > *:first').remove();
            }

            // In an online game and hosting
            if(B.isHost() && !overrideNetwork){
                Netcode.hostAddToBattleLog((attacker ? attacker.UUID : null), (victim ? victim.UUID : null), text, classes, sound, (raiser ? raiser.UUID : null));
            }
        };

        // Schedules a "x took n damage" etc text to be output
        B.statusTexts.add = function(attacker, victim, text, detrimental, isChat, forceSelf, sound, raiser){
        
            B.statusTexts.texts.push({
                attacker:attacker, 
                victim:victim, 
                text:text,
                detrimental:detrimental,
                isChat : isChat,
                forceSelf : forceSelf,
                sound : sound,
                raiser : raiser
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
                B.addToBattleLog(attacker, victim, text, classes.join(' '), force, sound, raiser);
                if(sound){
                    GameAudio.playSound(sound);
                }
            }
            
            B.statusTexts.texts = [];
            B.statusTexts.capture = false;
        };



        

    
    // VISUALS

        // Returns HTML with icon and info of an active effect on a player or a charge
        B.getFxIcon = function(name, description, icon, number, stacks, detrimental, attacker, victim, charged){
            
            let desc = new Text({text:Jasmop.Tools.htmlspecialchars(description)});

            if(!name.length && !description.length)
                return '';

            var out = '<div class="spellIcon '+(detrimental ? 'detrimental' : '')+(charged ? ' charged' : '')+'">';
                out+= '<div class="icon"><img src="'+hsc(icon)+'" /></div>';
                out+= '<div class="turns">'+(number === Infinity || number === null ? '' : number)+'</div>';
                out+= '<span class="tooltip">'+hsc(name)+(stacks > 1 ? ' x'+stacks : '')+'<br />'+
                    desc.convert(attacker, victim)
                        .split('%a').join(attacker ? attacker.getName() : 'Unknown')
                        .split('%t').join(victim ? victim.getName() : 'Unknown')+
                '</span>';
            out+= '</div>';

            return out;
	
        };

        // Updates the UI with the latest stats
        B.updateUI = function(){

            var me = B.getMyCharacter(), i;
            var isHost = B.isHost();

            // Update all players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];

                var portrait = $("div.character[data-uuid='"+p.UUID+"']", B.page);
                if(!portrait.length){
                    B.addPlayerPortrait(p);
                    portrait = $("div.character[data-uuid='"+p.UUID+"']", B.page);
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
                
                portrait.toggleClass("turn", (Netcode.players[B.turn] === p));
                portrait.toggleClass("dead", (p.hp <= 0));


                var fx = '';
                if(p.grappled_by){
                    fx+= B.getFxIcon("Grappled", 'Grappled by :ATTACKER:', p.grappled_by.getImage(), '', '', true, p.grappled_by, p, false);
                }
                
                for(let targ of p.getGrappling()){
                    fx+= B.getFxIcon("Grapple", 'Grappling :TARGET:', targ.getImage(), '', '', false, p, targ, false);
                }

                for(let f of p.effects){
                    fx+= B.getFxIcon(f.name, f.description, f.icon, f._duration, f._stacks, f.detrimental, f.getAttacker(), f.getVictim(), false);
                }

                let abilities = p.getAbilities();
                for(let f of abilities){
                    if(!f._charged)
                        continue;
                    fx+= B.getFxIcon(f.name, f.description, f.icon, f._charged, 0, f.detrimental, p, f._charge_targs[0], true);
                }

                
                $("div.effects", portrait).html(fx);

            }

            // Remove any non-existing players
            $("div.character[data-uuid]", B.page).each(function(){
                let uuid = $(this).attr('data-uuid');
                if(!Netcode.getCharacterByUuid(uuid)){
                    $(this).remove();
                }
            });


            if(me.isDead() && !B.punishment_done){
                $("#abilities").toggleClass('dead', true);
            }
            else{
                $("#abilities").toggleClass('dead', false);
            }

            $("#abilities", B.page).toggleClass('disabled', !B.myTurn() || me.offeredGemsPicked < 3);
            


            // Update abilities
            if(B.myTurn() && !B.punishment_done && !B.intro){

                // We pick punishment
                if(B.ended){


                    var html = '';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_DOM__">Dominate</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SUB__">Submit</div>';
                        html+= '<div class="button ability active" data-punishment="__PUNISHMENT_SAD__">Sadistic</div>';
                        
                    $("#abilities").html(html);

                    $("#abilities div.ability[data-punishment]").on('click', function(){
                        GameAudio.playSound('shake');
                        var abil = Ability.get($(this).attr('data-punishment')).clone();
                        abil.parent = B.getMyCharacter();

                        B.selectTarget(abil);
                    });

                    return;
                }

                // Update ability buttons
                let successfulAbilities = 0, abilities = me.getAbilities();
                for(let a of abilities){
                    let active = a.usableOn(Netcode.players).length > 0;
                    let element = $("#abilities div.ability[data-uuid="+a.UUID+"]", B.page);
                    // Temp ability
                    if(!element.length){
                        $("#abilities", B.page).prepend(a.getButton());
                        element = $("#abilities div.ability[data-uuid="+a.UUID+"]", B.page);
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
                if(!successfulAbilities && !B.turn_done_alert && B.getMyCharacter().offeredGemsPicked >= 3){
                    // turn_done
                    B.turn_done_alert = true;
                    B.turn_done_timer = setTimeout(function(){
                        GameAudio.playSound('accept');
                        $("#abilities div.ability.endTurn").toggleClass('glow', true);
                    }, 3000);
                }
                else if(successfulAbilities)
                    clearTimeout(B.turn_done_timer);
                
                // Toggle end turn active
                $("#abilities div.ability.endTurn").toggleClass('active', successfulAbilities === 0);

                // Rebind ability buttons
                $("#abilities div.ability[data-uuid]", B.page).off('click').on('click', function(){

                    if(!B.myTurn()){
                        console.error("Not your turn");
                        return;
                    }

                    var ability = B.getMyCharacter().getAbilityByUuid($(this).attr('data-uuid'));
                    if(ability === false){
                        console.error("Ability not found", $(this).attr('data-uuid'));
                        return;
                    }

                    if($(this).hasClass('active'))
                        GameAudio.playSound('shake');
                    B.selectTarget(ability);

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

            else if(B.ended && !isHost){

                var ht = '<div class="button disconnect">Disconnect</div>';
                if(B.punishment_done){
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



            B.updateGems();


        };
    
        // Updates the gems at the bottom of my screen
        B.updateGems = function(event){

            var me = B.getMyCharacter();
            

            // this might be an event you can parse with jquery
            // Update mana crystals
            var mana = me.mana;
            var manaCost = {
                offensive : 0,
                defensive : 0,
                support : 0
            };

            

            if(event && event.type === 'mouseover'){

                var ability = me.getAbilityByUuid($(this).attr('data-uuid'));

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

        };
        

        B.advanceTalkingHead = function(){
            
            if(B.talkingHeadQueue)
                return;

            $("#talkingHead").toggleClass('hidden', true);

            // Start the battle
            if(!B.stage || !B.talkingHeads.length){
                // This talking head was not a part of an intro
                if(!B.intro) 
                    return;

                // This talking head was the final of the intro. Start the game  here
                B.advanceTurn();
                B.intro = false;
                B.raiseEventOnPlayers(EffectData.Triggers.gameStarted, []);
                Netcode.hostRefreshBattle();
                B.updateUI();
            }
            // Output talking head
            else{
                var head = B.talkingHeads.shift(),
                    text = head.text,
                    icon = head.icon,
                    sound = head.sound
                ;
                if(!sound)
                    sound = 'shake';
                
                B.talkingHeadQueue = true;

                B.talkingHeadTimer = setTimeout(function(){
                    $("#talkingHead").toggleClass('hidden', false);
                    $("#talkingHead div.text").html(hsc(text));
                    $("#talkingHead div.head").attr('style', 'background-image:url('+hsc(icon)+')');
                    GameAudio.playSound(sound);

                    B.talkingHeadTimer = setTimeout(function(){
                        B.talkingHeadQueue = false;
                        B.advanceTalkingHead();

                    }, 4000);

                }, 250);
                
            }
        };

        // Adds a player portrait thingy
        B.addPlayerPortrait = function(p){

            // Find a free color
            for(let color of B.COLORS){
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


            let me = B.getMyCharacter();
            let html = '<div class="character'+(p === me ? ' PC ME' : '')+'" data-uuid="'+p.UUID+'" style="background-image:url('+p.getImage()+')">';
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
            $("#"+targ+' > div.bottom', B.page).prepend(html);

            // Bind
            // Select a target or get info
            $("div.character[data-uuid]").off('click').on('click', function(){
                if($(this).hasClass('selectable') && B.myTurn()){
                    B.useAbility(
                        B.queued_ability,
                        B.getCharacterByUuid($(this).attr('data-uuid'))
                    );
                    return;
                }

                var char = B.getCharacterByUuid($(this).attr('data-uuid'));

                char.inspect();
            });

            

        };

        // Updates mana and offered gems for the active player. Greatly reduces the amount of data needed to be sent for gem picking
        B.sendPlayerGems = function(){
            let p = B.getTurnCharacter();
            Netcode.refreshData({
                UUID:p.UUID,
                mana : p.mana,
                offeredGems : p.offeredGems,
                offeredGemsPicked : p.offeredGemsPicked,
            });
        };

        // Builds the DOM and binds events
        page.onLoaded = function(){

            Netcode.startBattle();
            GameAudio.setMusic('battle');

            // Clear custom background
            $("#wrap").attr('style', '');

            var i,
                players = Netcode.players,
                me = B.getMyCharacter()
            ;

            // Reset defaults
            B.total_turns = 0;                          // Total nr of turns played
            B.turn = 0;                                 // Set turn to the first player (usually host)
            B.ended = false;                            // Battle has not ended
            B.punishment_done = false;                  // Punishment is not drawn
            AIChat.reset();                             // Reset AI chats

            // Reset the players
            for(i=0; i<players.length; ++i){               
                var c = players[i];
                Netcode.players[i] = c;
                // This resets their status
                c.onBattleStart(B.stage);
            }

            // Build the skeleton
            B.page = $("#wrap[data-page=battle] #content");

            var html = '<div class="top">'+
                '<div id="friends"><div class="bottom"></div></div>'+
                '<div id="battlescreen" class="border">'+
                    '<div id="text"'+(!Netcode.Socket ? ' class="singleplayer" ' : '')+'></div>'+
                    (Netcode.Socket ? '<div id="chatMarker">&gt;</div><div id="chat" contenteditable></div>' : '')+
                '</div>'+
                '<div id="enemies"><div class="bottom"></div></div>'+
                '</div>'+
                '<div id="manaGems" class="border">';
                

                for(var x = 0; x<B.MANA_TYPES.length; ++x){
                    html+= '<div class="manatype '+B.MANA_TYPES[x]+'" data-manatype="'+B.MANA_TYPES[x]+'">';
                    for(i =0; i<me.max_mana; ++i){
                        html+= '<div class="gem disabled"></div>';
                    }
                    html+= '</div>';
                }


            html+=`</div>
                <div id="abilities"></div>
                <div id="cancelAbility" class="hidden"><div class="button">Cancel</div></div>
                <div id="gemPicker" class="hidden"><div class="gemsOffered">`;
                for(i = 0; i<5; ++i){
                    html+= '<div class="gem" data-index="'+i+'"><div class="bg"></div></div>';
                }
                html+=`</div><div class="text border">Pick <span class="n">n</span></div></div>
                <div id="talkingHead" class="hidden">
                    <div class="text"></div>
                    <div class="head"></div>
                </div>
            `;




            
            // Flush the skeleton
            this.setContent(html);
            html = '';



            // Add the players
            for(i=0; i<Netcode.players.length; ++i){
                var p = Netcode.players[i];
                B.addPlayerPortrait(p);
            }
            // move yourself to the bottom left
            $("#friends > div.bottom div.character.ME", B.page).appendTo($("#friends > div.bottom"));



            // Draw abilities
            let abilities = me.getAbilities();

            for(let ability of abilities){
                html = ability.getButton();
                $("#abilities", B.page).append(html);
            }


            // Add the end turn button
            $("#abilities", B.page).append('<div class="ability button endTurn">End Turn</div>');


            // Make gem picker toggleable
            $("#gemPicker div.text").on('click', function(){
                $("#gemPicker div.gemsOffered").toggleClass('hidden');
            });

            // Bind gem pickers
            $("#gemPicker div.gemsOffered div.gem").on('click', function(){

                var index = +$(this).attr('data-index');
                if(!B.isHost()){
                    Netcode.pickGem(index);
                }

                else if(me.pickGem(index)){
                    B.updateUI();
                    if(me.offeredGemsPicked >= 3)
                        GameAudio.playSound('laser_close');
                    
                    B.sendPlayerGems();
                }

                GameAudio.playSound('gem_pick');

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
                if(!B.myTurn() || B.getMyCharacter().offeredGemsPicked < 3){return;}

                GameAudio.playSound('shake');

                if(!B.isHost())
                    Netcode.endTurn();
                else
                    B.advanceTurn();
            });

            // Ability button
            $("#abilities div.ability[data-uuid]", B.page).on('mouseover mouseout', B.updateGems);

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
                B.talkingHeadQueue = false;
                clearTimeout(B.talkingHeadTimer);
                B.advanceTalkingHead();
            });

            // make sure players have full downloads of any custom character stuff
            Netcode.refreshParty(true);


            // Begin

            

            B.intro = true;
            B.talkingHeadQueue = false;
            B.talkingHeads = [];

            if(B.isHost()){
                // Randomize first player
                B.turn = Math.floor(Math.random()*Netcode.players.length);
                if(B.stage && B.stage.intro)
                    B.addTalkingHeads(B.stage.intro);
                else
                    B.advanceTalkingHead(); // Starts immediate
            }

            if(B.stage){
                $("#wrap").attr('style', 'background-image:url('+hsc(B.stage.background)+')');
                GameAudio.setMusic(B.stage.music);
            }
            

        };


    
    // NETCODE
        page.onSocket = function(task, args, byHost, byMe, isHost, byPlayer){

            var data = args, player;
            if(args)
                data = args[0];
            
            // Open
            if(task === 'disconnect'){
                Jasmop.Page.set('home');
            }


            // Generic chat handler - [(str)message]
            if(task === 'Chat'){

                GameAudio.playSound('chat');
                B.statusTexts.add(byPlayer, byPlayer, args[0].substr(0, 128), false, true, true); // StatusTexts escapes

            }

            // Player receiving a message from the host
            if(byHost && !isHost){

                // updates turn and generic properties
                if(task === 'RefreshBattle'){
                    var preturn = B.turn;
                    B.turn = data.turn;
                    B.ended = data.ended;
                    B.punishment_done = data.punishment_done;
                    B.intro = data.intro;
                    B.total_turns = data.total_turns;

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

                    B.addToBattleLog(a, b, args[2], args[3], false, args[4]);

                }

                if(task === 'GameOver'){
                    B.onVictory(+args[0]);
                }

                if(task === 'TalkingHeads'){
                    B.addTalkingHeads(args[0].map(function(val){
                        return new ChallengeTalkingHead(val);
                    }));
                }

                if(task === 'HitVisual'){
                    player = Netcode.getCharacterByUuid(args[0]);
                    if(player)
                        player.hitVisual(args[1]);
                }

                if(task === 'SBT'){
                    player = Netcode.getCharacterByUuid(args[0]);
                    if(player)
                        player.generateSBT(args[1], args[2]);
                }
                

            }



            // Host receiving a message from a player
            else if(!byHost && isHost){

                // By current turn
                if(byPlayer === B.getTurnCharacter()){
                    
                    if(task === 'UseAbility' && !B.ended){
                        var ability = byPlayer.getAbilityById(args[1]),
                            targ = B.getCharacterByUuid(args[0])
                        ;

                        if(byPlayer.offeredGemsPicked < 3){
                            return Jasmop.Errors.addErrors('Invalid ability use received: Player has not picked 3 gems');
                        }

                        if(ability === false || targ === false){
                            console.error('Invalid ability use received', ability, targ);
                            return Jasmop.Errors.addErrors('Invalid ability use received');
                        }

                        if(!ability.usableOn(targ, false, true)){
                            console.error('Invalid ability target received', targ);
                            return Jasmop.Errors.addErrors('Invalid ability target received');
                        }

                        B.useAbility(ability, targ);

                    }

                    else if(task === 'PickGem'){

                        var index = +args[0];
                        if(byPlayer.offeredGemsPicked >= 3){
                            return Jasmop.Errors.addErrors('Invalid gem pick received. Player has already picked their gems.');
                        }

                        if(byPlayer.pickGem(index)){
                            B.sendPlayerGems();
                            B.updateUI();
                        }


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
                        if(byPlayer.offeredGemsPicked < 3){
                            return Jasmop.Errors.addErrors('Can\'t advance turn, player needs to pick mana gems first.');
                        }
                        B.advanceTurn();
                    }

                    // Active player has left
                    else if(task === 'LeaveParty'){
                        B.playAI();
                    }

                }


            }

        };

        

    page.onUnload = function(){
        // Clear custom background
        $("#wrap").attr('style', '');
        clearTimeout(B.talkingHeadTimer);
    };
    page.onUserData = function(){};

})();
