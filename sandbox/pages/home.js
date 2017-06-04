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
    page.onPreload = function(){

    };
    
    page.onLoaded = function(){
        if(this.getArg(0) === 'lobby')
            page.drawBattleSelect();
        else
            page.drawRoot();        
    };



    // Base page
    page.drawRoot = function(ignoreStart){
        var char = Game.player;
        console.log(char);

        if(char.level === 1 && char.getFreePoints() && !ignoreStart){
            page.drawTalents();
            return;
        }

        var html = '<div class="flex">';
        
            html+= '<div class="border left">';
                html+= '<img class="icon" src="'+char.getImage()+'" />';
                html+= '<h1>'+hsc(char.name)+'</h1>';
                html+= '<p class="race">Level '+char.level+' '+hsc(char.getGender())+' '+hsc(char.getRaceName())+'</p>';
                html+= '<p class="description">'+hsc(char.description)+'</p>';
                html+= '<p class="armor">Wearing '+hsc(char.armorSet.name)+'</p>';
                
                html+= '<div class="clear"></div>';
            html+= '</div>';

            html+= '<div class="right">';
                html+= '<div class="button battle highlighted">Test battle</div>';
                html+= '<div class="button abilities '+(char.getFreePoints() ? ' highlighted' : '')+'">Abilities</div>';
                
                html+= '<div class="button equipment">Equipment</div>';
                html+= '<div class="button back">Main Menu</div>';
            html+= '</div>';
        html+= '</div>';
   
        page.setContent(html);

        $("div.right > div.abilities").on('click', page.drawTalents);
        $("div.right > div.back").on('click', function(){
            Jasmop.Page.set('index');
        });

        $("div.right > div.equipment").on('click', function(){
            page.drawShop();
        });
        

        $("div.right > div.battle").on('click', function(){

            page.drawBattleSelect();

        });
        

    };

    page.getCharacterIcon = function(character){

        var out = '<div class="player" data-uuid="'+character.UUID+'" style="background-image:url('+character.getImage()+')">';
            out+= '<div class="bg">'+hsc(character.name)+'</div>';
        out+= '</div>';

        return out;
    };

    // Resets lobby settings
    page.resetLobby = function(){
        Netcode.disconnect();
        page.drawBattleSelect();
    };

    page.drawBattleSelect = function(){

        var isHost = Netcode.hosting || !Netcode.Socket;

        if(!Netcode.players.length){
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

                    html+= '<select id="addCharacter">';
                    html+= '<option value="">-- Add Character --</option>';
                    for(i=0; i<DB.Character.length; ++i){
                        html+= '<option value="'+hsc(DB.Character[i].id)+'">'+hsc(DB.Character[i].name)+'</option>';
                    }
                    
                    html+= '</select>';
                html+= '</div>';

                html+= '<div class="border droppable delete hidden">';
                    html+= 'Delete';
                html+= '</div>';

                html+= '<div class="netgame border">';

                    if(Netcode.Socket && Netcode.players.length){
                        html+= '<p class="invitecode">Party Token: <strong>'+Netcode.party_id+'</strong></p>';
                        html+= '<div class="button disconnect">Disconnect</div>';
                    }
                    else{
                        html+= '<form id="joinGame">';
                            html+= '<input type="text" placeholder="Lobby ID" name="lobbyID" style="width:auto; display:inline-block;" />';
                            html+= '<input type="submit" value="Join Party" />';
                        html+= '</form>';
                        html+= '<div class="button newGame">DM a Party</div>';
                    }

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

                html+= '<div class="button back">Back</div>';
            html+= '</div>';

        html+= '</div>';

        page.setContent(html);


        $("div.right > div.startBattle").on('click', function(){
            Jasmop.Page.set('battle', []);
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
            page.drawBattleSelect();

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
                                    page.drawBattleSelect();
                                    return;
                                }                          

                                // Handle websocket kick here
                                
                                Netcode.kick(p.socket_id);
                                Netcode.players.splice(i, 1);
                                Netcode.refreshParty();
                                page.drawBattleSelect();
                                return;
                            }

                            p.team = team;
                            Netcode.refreshParty();
                            page.drawBattleSelect();
                            return;
                        }
                    }

                }
            });

        }


        $("#joinGame").on('submit', function(){
            // Set up socket queries here
            Netcode.ini().then(function(){
                Netcode.partyJoin($('[name=lobbyID]', this).val()); 
            });
            return false;
        });
        
        $("div.button.disconnect").on('click', function(){
            page.resetLobby();
            page.drawBattleSelect();
        });

        $("div.button.newGame").on('click', function(){
            Netcode.ini().then(function(){
                Netcode.partyJoin(false);
            });
        });


        $("div.button.back").on('click', function(){
            page.drawRoot();
        });
    };


    page.drawTalents = function(){
        var char = Game.player, freePoints = char.getFreePoints();

        var i, abil;

        var html = '<div class="flex">';
        
            html+= '<div class="left">';

                html+= '<div class="border header">';
                    html+= '<h1>Abilities</h1>';
                    html+= '<p>Each level you gain lets you unlock a new ability. You can have 8 abilities active at a time.</p>';

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
                    if(char.hasAbility(abil))
                        continue;

                    html+= Ability.get(abil).getButton(false);
                }
                    
                html+= '</div>';

            html+= '</div>';
            

            html+= '<div class="right">';
                html+= '<div class="button back">Back</div>';
            html+= '</div>';


        html+= '</div>';

        page.setContent(html);



        $("div.right > div.back").on('click', page.drawRoot);
        $("#unlockNewAbility").on('click', function(){
            
            var available = char.getUnlockableAbilities();
            if(!available.length)
                return;

            var ability = available[Math.floor(Math.random()*available.length)];
            --char.unspent_points;
            char.addAbility(ability.id);
            page.drawTalents();

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
                }

            }
        });

    };

    page.drawShop = function(){
        
        var char = Game.player, i;

        var html = '<div class="flex">';
            html+= '<div class="left">';

                html+= '<div class="border header">';
                    html+= '<h1>Gear</h1>';
                    html+= '<p>Here you can purchase and select outfits. Outfits will not affect your stats, but will influence which RP texts you will see.</p>';

                    html+= '<p>You are currently wearing:</p>';

                    html+= '<div class="worn border">';
                        html+= '<h3>'+hsc(char.armorSet.name)+'</h3>';
                        html+= '<p><em>'+hsc(char.armorSet.description)+'</em></p>';
                    html+= '</div>';

                html+= '</div>';

                // Active abilities
                html+= '<div class="border shop">';

                var all = Armor.search({in_store:true});

                for(i =0; i<all.length; ++i){
                    var piece = all[i]; 
                    var owned = char.ownsArmor(piece.id);
                    html+= '<div class="shopitem button armor'+(owned ? ' owned' : '')+(piece.id === char.armorSet.id ? ' worn' : '')+'" data-id="'+hsc(piece.id)+'">'+hsc(piece.name)+(!owned ? ' [15 &ETH;]' : '')+'<span class="tooltip">'+hsc(piece.description)+'</span></div>';
                }
                html+= '</div>';

            html+= '</div>';
            

            html+= '<div class="right">';
                html+= '<div class="border wallet">You have '+char.cash+' &ETH;</div>';
                html+= '<div class="button back">Back</div>';
            html+= '</div>';


        html+= '</div>';

        page.setContent(html);



        $("div.right > div.back").on('click', page.drawRoot);
        
        $("div.left div.shop div.shopitem[data-id]").on('click', function(){

            var id = $(this).attr('data-id');
            if(char.ownsArmor(id)){
                char.equipArmor(id);
                page.drawShop();
                return;
            }
            
            // Buy the armor
            if(!char.addMoney(-15, false)){
                Jasmop.Errors.addErrors('Insufficient funds');
                return;
            }

            char.unlockArmor(id);
            page.drawShop();

        });
        

        
    };

    page.onUnload = function(){};
    page.onUserData = function(){};

    page.onSocket = function(task, args, byHost, byMe, isHost){

        var root = $("#netgame");
        var isHosting = Netcode.hosting;

        if(task === "disconnect"){
            return page.drawBattleSelect();
        }

        if(!byHost)
            return;

        // Characters refreshed. Update the lobby
        if(task === 'UpdateCharacters'){

            page.drawBattleSelect();

        }


    };

})();
