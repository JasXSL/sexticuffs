/*

    This page is a character basecamp where you decide what to do

*/
(function(){
    "use strict";
    var page = new Jasmop.Page();
    Jasmop.Page.add(page);
    page.id = 'home';
    var hsc = Jasmop.Tools.htmlspecialchars;

    page.need_ajax_data = false;                    // If true, will attempt an ajax fetch first
    // All except onLoaded can return promises


    // Since this is the first page after selecting character, you can initialize stuff here
    page.onPreload = function(){
        if(!Netcode.players.length){
            Netcode.players = [Game.player];
        }
    };
    


    page.onLoaded = function(){
        if(this.getArg(0) === 'lobby')
            page.drawSkirmish();
        else if(this.getArg(0) === 'campaignRoot')
            page.drawCampaignRoot();
        
        else
            page.drawMap();        
    };

    // Lets you set subpage specific socket handlers
    page.onSocketSub = function(task, args, byHost, byMe, isHost){};

    
    page.getCharacterIcon = function(character){

        var out = '<div class="player" data-uuid="'+character.UUID+'" style="background-image:url('+character.getImage()+')">';
            out+= '<div class="bg">'+hsc(character.name)+'</div>';
        out+= '</div>';

        return out;
    };

    // Resets lobby settings
    page.resetLobby = function(){
        Netcode.disconnect();
    };





    // Home, party management etc
    page.drawRoot = function(ignoreStart){
        var char = Game.player;

        // Refresh on character data or disconnect
        page.onSocketSub = function(task, args, byHost, byMe, isHost){
            if((byHost && task === 'UpdateCharacters') || task === "disconnect" || task === "JoinParty"){
                page.drawRoot();
            }
        };

        Game.Music.set('home');
        // World map
        $("#wrap").attr('class', '');

        var host = Netcode.getHost();

        var html = '<div class="flex">';
        

            html+= '<div class="left">';

                html+= '<div class="border">'+hsc(host.name)+'\'s Home</div>';

                for(var i = 0; i<Netcode.players.length; ++i){
                    if(Netcode.players[i].is_pc)
                        html+= page.getCharacterIcon(Netcode.players[i]);
                }
                

                

            html+= '</div>';

            html+= '<div class="right">';

                html+= '<div class="button back">To Town</div>';

                html+= '<div class="netgame border">';

                    if(Netcode.Socket && Netcode.players.length){
                        html+= '<p class="invitecode">Party Token: <strong>'+Netcode.party_id+'</strong></p>';
                        html+= '<div class="button disconnect">Disconnect</div>';
                    }
                    else{
                        
                        html+= '<form id="joinGame">';
                            html+= '<input type="text" placeholder="Type an invite ID" name="lobbyID" />';
                            html+= '<input type="submit" value="Create/Join Party" />';
                        html+= '</form>';
                    }

                html+= '</div>';

            html+= '</div>';
        html+= '</div>';
   
        page.setContent(html);


        $("div.right > div.back").on('click', function(){
            Game.clickSound();
            page.drawMap();
        });

        $("div.player[data-uuid]").on('click', function(){
            var p = $(this).attr('data-uuid');
            var ch = Netcode.getCharacterByUuid(p);
            if(!ch)
                return;
                
            ch.inspect();
        });

        $("#joinGame").on('submit', function(){
            // Set up socket queries here
            Netcode.ini().then(function(){
                Netcode.partyJoin($('[name=lobbyID]', this).val()); 
            });
            return false;
        });
        
        $("div.button.disconnect").on('click', function(){
            page.resetLobby();
        });

        $("input.newGame").on('click', function(){
            console.log("Creating a party");
            Netcode.ini().then(function(){
                Netcode.partyJoin(false);
            });
        });
        
        Game.rebindSounds();
    };

    




    // World map
    page.drawMap = function(){
        page.onSocketSub = function(task, args, byHost, byMe, isHost){};
        
        var host = Netcode.getHost();

        Game.Music.set('town');
        // World map
        $("#wrap").attr('class', 'map');

        var free = Game.player.getFreePoints();

        var html = '<div class="buttons">';
        
            html+= '<div class="mapicon button home"><img src="media/effects/house.svg" /><span class="tooltip">'+hsc(host.name)+'\'s Home</span></div>';
            html+= '<div class="mapicon button arena"><img src="media/effects/coliseum.svg" /><span class="tooltip">Sexticuffs Arena</span></div>';
            html+= '<div class="mapicon button gym'+(free ? ' highlighted' : '')+'"><img src="media/effects/gym.svg" /><span class="tooltip">Gym</span></div>';
            html+= '<div class="mapicon button shop"><img src="media/effects/shop.svg" /><span class="tooltip">Clothes Shop</span></div>';
            html+= '<div class="mapicon button surgery"><img src="media/effects/anatomy.svg" /><span class="tooltip">Cyberbody</span></div>';
            

        html+= '</div>';
   
        page.setContent(html);

        $("div.mapicon.home").on('click', function(){
            page.drawRoot();
        });
        $("div.mapicon.arena").on('click', function(){
            page.drawSexticuffs();
        });
        $("div.mapicon.shop").on('click', function(){
            page.drawShop();
        });

        $("div.mapicon.gym").on('click', function(){
            page.drawTalents();
        });


        $("div.buttons > div.button").on('click', function(){
            Game.clickSound();
        });
        
        
        
        Game.rebindSounds();
    };











    // Draw the sexticuffs arena where you can select to do skirmish or a quest
    page.drawSexticuffs = function(){
        
        // Refresh on character data or disconnect
        page.onSocketSub = function(task, args, byHost, byMe, isHost){
            /*
            if((byHost && task === 'UpdateCharacters') || task === "disconnect"){
                page.drawRoot();
            }
            */
        };

        Game.Music.set('skirmish');
        // World map
        $("#wrap").attr('class', 'lobby'); 

        var host = Netcode.getHost();



        var html = '';

                html+= '<div class="border">Sexticuffs Lobby</div>';

                html+= '<div class="button campaigns">Campaigns<span class="tooltip">Complete challenging campaigns for bonus rewards!</span></div>';
                html+= '<div class="button skirmish">Skirmish<span class="tooltip">Set up a custom battle. Rewards for this mode are flat.</span></div>';
                
                html+= '<div class="button back">Back To Town</div>';

        html+= '';
   
        page.setContent(html);

        $("#content div.button").on('click', function(){
            Game.clickSound();
        });

        $("div.button.back").on('click', function(){
            page.drawMap();
        });
        $("div.button.skirmish").on('click', function(){
            page.drawSkirmish();
        });

        $("div.button.campaigns").on('click', function(){
            page.drawCampaignRoot();
        });
        

        Game.rebindSounds();
    };



    page.selectedCampaign = 0;

    page.drawCampaignRoot = function(){
        // Refresh on change
        page.onSocketSub = function(task, args, byHost, byMe, isHost){};
        Game.setMusic('skirmish');
        $("#wrap").attr('class', 'campaignRoot'); 
        var html = '<div class="flex">';
        
            html+= '<div class="left root">';
                html+= 'Campaign listing';
                for(var i =0; i<DB.Challenge.length; ++i){
                    var c = DB.Challenge[i];
                    html+= '<div class="challenge button'+(i === page.selectedCampaign ? ' selected':'')+'" data-id="'+hsc(c.id)+'" data-index="'+i+'" style="background-size:cover; background-image:url('+hsc(c.buttonbg)+')">';
                        html+= hsc(c.name);
                    html+= '</div>';
                }

                html+= '<div class="button back">Back</div>';

            html+= '</div>';

            html+= '<div class="right info">';
                
                var camp = DB.Challenge[page.selectedCampaign];
                html+= '<div class="bar header" style="background-size:cover; background-image:url('+hsc(camp.buttonbg)+')">';
                    html+= '<h1>'+hsc(camp.name)+'</h1>';
                    html+= '<p class="subtitle">'+hsc(camp.description)+'</p>';
                html+= '</div>';
                
                for(i=0; i<camp.wings.length; ++i){

                    var wing = camp.wings[i];
                    html+= '<div class="bar wing">';
                        html+= '<h3>'+hsc(wing.name)+'</h3>';
                        html+= '<p class="subtitle">'+hsc(wing.description)+'</p>';
                        html+= '<div class="bosses">';

                        for(var x =0; x<wing.stages.length; ++x){

                            var unlocked = Game.player.challengeStepUnlocked(camp.id, wing.stages[x].id),
                                completed = Game.player.challengeStepCompleted(camp.id, wing.id, wing.stages[x].id)
                            ;
                            html+= '<div data-id="'+hsc(wing.stages[x].id)+'" class="boss '+(completed ? ' completed' : '')+(unlocked ? ' unlocked' : '')+'" '+(unlocked ? 'style="background-image:url('+hsc(wing.stages[x].icon)+')"' : '')+'><span class="tooltip">'+(unlocked ? hsc(wing.stages[x].name) : 'Complete the previous stage to unlock this.' )+'</span></div>';

                        }

                            html+= '<div data-challenge="'+hsc(camp.id)+'" data-wing="'+hsc(wing.id)+'" class="boss reward '+(Game.player.challengeWingCompleted(camp.id, wing.id) ? ' completed' : '')+(Game.player.challengeRewardCollected(camp.id, wing.id) ? ' collected' : '')+'"></div>';

                        html+= '</div>';
                    html+= '</div>';

                }

            html+= '</div>';
        
        html+= '</div>';

        



        page.setContent(html);

        $("div.button.back").on('click', function(){
            page.drawSexticuffs();
        });

        $("#content div.button").on('click', function(){
            Game.clickSound();
        });

        $("#content div.left div.challenge.button").on('click', function(){
            page.selectedCampaign = +$(this).attr('data-index');
            page.drawCampaignRoot();
        });

        $("div.bosses div.boss.reward.completed:not(.collected)").on('click', function(){

            var th = $(this);
            th.toggleClass('anim', true);
            Game.playSound('chest_open');
            setTimeout(function(){
                th.toggleClass('collected', true);
                Game.playSound('treasure_open');
                setTimeout(function(){
                    Game.player.challengeCollectReward(th.attr('data-challenge'), th.attr('data-wing'));
                }, 500);
            }, 1000);

            $(this).off('click');

        });

        $("div.bosses div.boss.unlocked[data-id]").on('click', function(){
            var stage = $(this).attr('data-id');
            var st = camp.getStage(stage);
            if(!st)
                return;

            Game.clickSound();
            var html = '<div id="challengeOffer">';
                    html+= '<h1>'+hsc(st.name)+'</h1>';
                    html+= '<p class="subtitle">'+hsc(st.description)+'</p>';
                    if(Netcode.isHost())
                        html+= '<input type="button" id="startChallenge" value="Start Battle" />';
                html+= '</div>';

            Jasmop.Overlay.set(html);

            $("#startChallenge").on('click', function(){
                // Start a challenge
                Game.clickSound();
                Netcode.hostStartChallenge(camp, st);
            });
        });
        

        Game.rebindSounds();

    };










    // Skirmish editor
    page.drawSkirmish = function(){

        // Refresh on change
        page.onSocketSub = function(task, args, byHost, byMe, isHost){
            if((byHost && task === 'UpdateCharacters') || task === "disconnect"){
                page.drawSkirmish();
            }
        };


        Game.setMusic('skirmish');
        $("#wrap").attr('class', 'skirmish'); 

        var isHost = Netcode.isHosting();

        if(Netcode.players.length<2){
            Netcode.players = [];
            Netcode.players.push(Game.player);
            Game.player.team = Character.TEAM_PC;
            Netcode.players.push(Character.get('imp').clone());
        }

        var i ;

        var html = '<div class="flex">';
        
            html+= '<div class="left battle flex">';

                html+= '<div class="team border A droppable">';
                    html+= '<h3>Team A</h3>';
                    html+= '<div class="players">';
                    for(i=0; i<Netcode.players.length; ++i){
                        if(Netcode.players[i].team === Character.TEAM_PC)
                            html+= page.getCharacterIcon(Netcode.players[i]);
                    }
                    html+= '</div>';
                html+= '</div>';

                html+= '<div class="team border B droppable">';
                    html+= '<h3>Team B</h3>';
                    html+= '<div class="players">';
                    for(i=0; i<Netcode.players.length; ++i){
                        if(Netcode.players[i].team === Character.TEAM_NPC)
                            html+= page.getCharacterIcon(Netcode.players[i]);
                    }
                    html+= '</div>';

                    if(isHost){
                        
                        html+= '<div><select id="addCharacter">';
                        html+= '<option value="">-- Add Character --</option>';
                        for(i=0; i<DB.Character.length; ++i){
                            html+= '<option value="'+hsc(DB.Character[i].id)+'">'+hsc(DB.Character[i].name)+'</option>';
                        }
                        
                        html+= '</select></div>';
                    }
                html+= '</div>';

                html+= '<div class="border droppable delete hidden">';
                    html+= 'Delete';
                html+= '</div>';

                
                
            html+= '</div>';

            html+= '<div class="right">';

                if(isHost){
                    // Draw start battle button
                    var a = false, b = false;
                    for(i=0; i<Netcode.players.length; ++i){
                        if(Netcode.players[i].team === Character.TEAM_PC)
                            a = true;
                        if(Netcode.players[i].team === Character.TEAM_NPC)
                            b = true;
                        
                        if(a && b){
                            html+= '<div class="button startBattle highlighted">Start Battle</div>';
                            break;
                        }
                    }
                }

                html+= '<div class="button back">Back to Lobby</div>';
            html+= '</div>';

        html+= '</div>';

        page.setContent(html);


        $("div.right > div.startBattle").on('click', function(){
            var b = Game.Battle;
            // Wipe any previous campaign
            b.campaign = null;
            b.stage = null;

            Jasmop.Page.set('battle', []);
            Game.clickSound();
        });

        $("#addCharacter").on('change', function(){

            var id = $(this).val();
            var char = Character.get(id);

            $(this).val("");

            if(Netcode.players.length > 7){
                Jasmop.Errors.addErrors("Too many players");
                return;
            }
            
            if(!char)
                return;
            
            char = char.clone();
            char.team = Character.TEAM_NPC;
            Netcode.players.push(char);

            Netcode.refreshParty();
            page.drawSkirmish();

        });

        if(isHost){

            $("div.players > div.player").draggable({
                helper : 'original',
                appendTo: 'body',
                revert : 'invalid',
                start :function(){
                    $("div.droppable.delete").toggleClass('hidden', false);
                },
                stop:function(){
                    $("div.droppable.delete").toggleClass('hidden', true);
                }
            });

            $("div.droppable").droppable({
                activeClass : 'dragging',
                hoverClass : 'dragHoverOver',
                
                drop:function(event, ui){


                    var uuid = $(ui.helper).attr('data-uuid');
                    var team = Character.TEAM_PC;
                    if($(this).hasClass('B')){
                        team = Character.TEAM_NPC;
                    }
                    
                    for(var i =0; i<Netcode.players.length; ++i){
                        if(Netcode.players[i].UUID === uuid){

                            var p = Netcode.players[i];
                            
                            // Delete
                            if($(this).hasClass('delete')){
                                if(p.id === Game.player.id){
                                    Jasmop.Errors.addErrors('Can\'t delete yourself!');
                                    page.drawSkirmish();
                                    return;
                                }                          

                                // Handle websocket kick here
                                
                                Netcode.kick(p.socket_id);
                                Netcode.players.splice(i, 1);
                                Netcode.refreshParty();
                                page.drawSkirmish();
                                return;
                            }

                            p.team = team;
                            Netcode.refreshParty();
                            page.drawSkirmish();
                            return;
                        }
                    }

                }
            });

        }


        


        $("div.button.back").on('click', function(){
            page.drawSexticuffs();
            Game.clickSound();
        });
    };













    // Draws ability selector
    page.drawTalents = function(){

        Game.setMusic('town');
        $("#wrap").attr('class', 'gym'); 
        page.onSocketSub = function(task, args, byHost, byMe, isHost){};

        var char = Game.player, freePoints = char.getFreePoints();

        var i, abil;

        var html = '<div class="flex">';
        
            html+= '<div class="left">';

                html+= '<div class="border header">';
                    html+= '<h1>Abilities</h1>';
                    html+= '<p>You can have '+Character.MAX_ABILITIES+' abilities active at a time (not counting attack).</p>';

                    if(freePoints){
                        html+= '<input type="button" class="highlighted" id="unlockNewAbility" value="Unlock a new ability!" />';
                    }
                    html+= '';

                html+= '</div>';

                // Active abilities
                html+= '<div class="border active droppable">';
                for(i =0; i<char.abilities.length; ++i){
                    abil = char.abilities[i];
                    if(~Ability.DEFAULTS.indexOf(abil.id)){
                        continue;
                    }
                    html+= char.abilities[i].getButton(true);
                }
                html+= '</div>';


                // Your collection
                html+= '<div class="border collection droppable">';

                for(i =0; i<char.abilities_unlocked.length; ++i){
                    abil = char.abilities_unlocked[i];
                    if(char.hasAbility(abil, true))
                        continue;
                    
                    var ab = Ability.get(abil);
                    // Ability has been removed
                    if(!ab)
                        continue;
                    html+= ab.getButton(false);
                }
                    
                html+= '</div>';

            html+= '</div>';
            

            html+= '<div class="right">';
                html+= '<div class="button back">Back</div>';
            html+= '</div>';


        html+= '</div>';

        page.setContent(html);



        $("div.right > div.back").on('click', function(){
            page.drawMap();
            Game.clickSound();
        });
        $("#unlockNewAbility").on('click', function(){
            
            var available = char.getUnlockableAbilities();
            if(!available.length)
                return;

            var ability = available[Math.floor(Math.random()*available.length)];
            --char.unspent_points;
            Game.playSound("ability_unlock");
            char.addAbility(ability.id);
            page.drawTalents();

            var ol = '<div style="text-align:center" class="abilityUnlock">';
                ol+= '<h3>Ability Unlocked</h3>';
                ol+= ability.getButton();
                
            ol+= '</div>';
            Jasmop.Overlay.set(ol);
            if(!Netcode.isHosting())
				Netcode.setCharacter();
        });

        $("div.left > div.droppable > div.ability").draggable({
            helper : 'original',
            appendTo: 'body',
            revert : 'invalid'
        });

        $("div.left > div.droppable").droppable({
            activeClass : 'dragging',
            hoverClass : 'dragHoverOver',
            
            drop:function(event, ui){

                var abil = $(ui.helper).attr('data-id');
                var activate = $(this).hasClass('active');
                

                var success = false;
                if(activate){
                    success = char.addAbility(abil, true);
                }else{
                    success = char.removeAbility(abil);
                }

                if(success){
                    page.drawTalents();
    			    Netcode.setCharacter();
                }

            }
        });

        Game.rebindSounds();

    };









    // Draws clothes shop
    page.drawShop = function(){
        
        Game.setMusic('store');
        $("#wrap").attr('class', 'mall'); 
        page.onSocketSub = function(task, args, byHost, byMe, isHost){};


        var char = Game.player, i;

        var html = '<div class="flex">';
            html+= '<div class="left">';

                html+= '<div class="border header">';
                    html+= '<h1>Gear</h1>';
                    html+= '<p>Here you can purchase and select outfits. Outfits will not affect your stats, but will influence which RP texts you will see.</p>';
                html+= '</div>';

                // Active abilities
                html+= '<div class="border shop">';

                var all = Armor.search().filter(function(val){
                    if(!val.in_store && !char.ownsArmor(val.id))
                        return false;
                    return true;
                });

                all.sort(function(a, b){
                    if(a.id === char.armorSet.id)
                        return -1;
                    if(b.id === char.armorSet.id)
                        return 1;

                    var aowned = char.ownsArmor(a.id), bowned = char.ownsArmor(b.id);

                    if(aowned && !bowned)
                        return -1;
                    if(bowned && !aowned)
                        return 1;
                    
                    if(a.name === b.name)
                        return 0;
                    
                    return a.name < b.name ? -1 : 1;

                });

                for(i =0; i<all.length; ++i){
                    var piece = all[i]; 
                    var owned = char.ownsArmor(piece.id);
                    html+= '<div class="shopitem button armor'+(owned ? ' owned' : '')+(piece.id === char.armorSet.id ? ' worn' : '')+'" data-id="'+hsc(piece.id)+'">'+hsc(piece.name)+(!owned ? ' ['+(+piece.cost)+' &ETH;]' : '')+(piece.id === char.armorSet.id ? ' [Equipped]' : '')+'</div>';
                }
                html+= '</div>';

            html+= '</div>';
            

            html+= '<div class="right">';
                html+= '<div class="border wallet">You have '+char.cash+' &ETH;</div>';
                html+= '<div class="button back">Back</div>';
            html+= '</div>';


        html+= '</div>';

        page.setContent(html);



        $("div.right > div.back").on('click', function(){
            Game.clickSound();
            page.drawMap();
        });
        
        $("div.left div.shop div.shopitem[data-id]").on('click', function(){

            var id = $(this).attr('data-id');
            var owned = char.ownsArmor(id);
            var piece = Armor.get(id);
            Game.clickSound();

            if(!piece)
                return;

            var html = '<div class="shop">';
            
                    html+= '<h1>'+hsc(piece.name)+'</h1>';
                    html+= '<p class="description">'+hsc(piece.description)+'</p>';
                    html+= '<hr />';
                    if(!owned)
                        html+= '<input type="button" value="Purchase ('+(piece.cost)+' &ETH;)" class="purchaseItem" />';
                    else if(piece.id !== char.armorSet.id)
                        html+= '<input type="button" value="Equip" class="equipItem" />';
                
                html+= '</div>';
            
            Jasmop.Overlay.set(html);


            $("#overlay div.shop input.equipItem").on('click', function(){
                char.equipArmor(id);
                page.drawShop();
                Game.playSound('redress');
                if(!Netcode.isHosting())
				    Netcode.setCharacter();
                Jasmop.Overlay.close();
            });

            $("#overlay div.shop input.purchaseItem").on('click', function(){
                 // Buy the armor
                if(!char.addMoney(-piece.cost, false)){
                    Jasmop.Errors.addErrors('Insufficient funds');
                    return;
                }

                Game.playSound('purchase');
                char.unlockArmor(id);
                char.equipArmor(id);
                page.drawShop();
                if(!Netcode.isHosting())
					Netcode.setCharacter();
                Jasmop.Overlay.close();
            });
            

           

        });
        
        Game.rebindSounds();
        
    };







    // Lets you tweak your character
    page.drawSurgery = function(){
        page.onSocketSub = function(task, args, byHost, byMe, isHost){};
    };






    page.onUnload = function(){};
    page.onUserData = function(){};

    page.onSocket = function(task, args, byHost, byMe, isHost){

        var root = $("#netgame");
        var isHosting = Netcode.hosting;

        page.onSocketSub(task, args, byHost, byMe, isHost);

    };

})();
