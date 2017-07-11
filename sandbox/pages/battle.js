

(function(){
    "use strict";
    var page = new Jasmop.Page();
    Jasmop.Page.add(page);
    page.id = 'battle';

    page.need_ajax_data = false;                    // If true, will attempt an ajax fetch first
    // All except onLoaded can return promises
    page.onPreload = function(){};
   
    // VISUALS

        // Builds the DOM and binds events
        page.onLoaded = function(){

            let challengeobj = page.getArg(0),
                stageobj = page.getArg(1),
                i
            ;


            // Build the skeleton
            let html = '<div class="top">'+
                '<div id="friends"><div class="bottom"></div></div>'+
                '<div id="battlescreen" class="border">'+
                    '<div id="text"'+(!Netcode.Socket ? ' class="singleplayer" ' : '')+'></div>'+
                    (Netcode.Socket ? '<div id="chatMarker">&gt;</div><div id="chat" contenteditable></div>' : '')+
                '</div>'+
                '<div id="enemies"><div class="bottom"></div></div>'+
                '</div>'+
                '<div id="manaGems" class="border">';
                

                for(var x = 0; x<Character.MANA_TYPES.length; ++x){
                    html+= '<div class="manatype '+Character.MANA_TYPES[x]+'" data-manatype="'+Character.MANA_TYPES[x]+'">';
                    for(i =0; i<6; ++i){
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



            // Build the battle
            B = new Battle(page, challengeobj, stageobj);
            B.ini();

            


        };


    
    // NETCODE
        page.onSocket = function(task, args, byHost, byMe, isHost, byPlayer){

            let data = args, player;
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
