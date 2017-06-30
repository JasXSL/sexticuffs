var AI = {};
(function(){
    "use strict";

    AI.numPlays = 0;
    AI.player = null;
    AI.all = [];
    AI.nextAction = null;   // Function
    AI.blocked = false;

})();

AI.ini = function(){
    "use strict";

    var B = Game.Battle; 

    // Adds an intermission to talk
    AI.talk = function(attacker, victim, text, resume){


        if(resume)
            AI.blocked = true;

        
        new Promise(function(res){

            let t = 1000;
            if(!resume)
                t = 500;
            setTimeout(res, t);

        }).then(function(){

            return new Promise(function(res, rej){

                let a = attacker, v = victim;
                // JS code for swapping variables
                if(!resume)
                    [a,v] = [v,a]; // Swaps attacker and victim, otherwise the chat would come from the PC.

                Game.Battle.statusTexts.add(a, v, text, false, true);
                Game.playSound("shake");

                if(!resume){
                    rej();
                    return;
                }
                setTimeout(res, 1000);

            });
            

        }).then(function(){
            
            AI.blocked = false;
            AI.nextActionTimer = setTimeout(AI.nextAction, 500);

        }).catch(function(){
            // No need to continue here since we're the victim and it's not our turn
        });
        

    };

    AI.makePlay = function(player, all){

        
        AI.player = player;
        AI.all = all;

        if(player.is_pc){
            console.error("Attempted to play AI for a PC.");
            return;
        }
        
        // Max nr of random spells to pick
        AI.numPlays = Math.ceil(Math.random()*3);

        // 1/5 to skip when no mana is full
        let skip = 1/5;
        for(let i in player.mana){
            if(player.mana[i] >= player.max_mana){
                skip = 0;
                break;
            }
        }

        let frst = AI.getViable(player.abilities, player, all);
        if(frst && ~frst.ai_tags.indexOf("important"))
            skip = 0;

        if(Math.random()<skip){
            AI.numPlays = 0;
        }

        AI.performAction();

    };

    AI.pickPunishment = function(player, all){

        // Get viable players
        var losers = [];
        for(var i =0; i<all.length; ++i){
            var p = all[i];
            if(p.team === player.team)
                continue;
            losers.push(p);
        }

        var victim = losers[Math.floor(Math.random()*losers.length)];
        var types = Ability.PUNISHMENTS;
        var type = types[Math.floor(Math.random()*types.length)];
        
        setTimeout(function(){
            B.drawPunishment(player, victim, type);
        }, 2000);
        
        
    };


    AI.performAction = function(){

        var run = function(){

            // Pick an ability if abilities are proper
            if(AI.numPlays > 0 && !Game.Battle.ended){

                var player = AI.player, abilities = player.abilities, all = AI.all;

                --AI.numPlays;

                var ability = AI.getViable(abilities, player, all);

                

                if(ability !== false){

                    // Pick a random target
                    var players = AI.getViablePlayers(player, ability, all);

                    // Use an ability

                    // If an RP text exists, if an RP text exists, this function might cause AI to become blocked
                    let targ = players[Math.floor(Math.random()*players.length)];
                    if(ability.aoe)
                        targ = players;
                    B.useAbility(ability, targ);

                    // Then continue
                    AI.performAction();
                    
                    
                    return;

                }

            }

            // No ability was viable, advance turn
            B.advanceTurn();
        };

        AI.nextAction = run;

        // Timer has been intercepted by RP text
        if(!AI.blocked)
            AI.nextActionTimer = setTimeout(AI.nextAction, 500);

    };

    // Gets viable players for an ability
    AI.getViablePlayers = function(player, ability, all){

        var viable = ability.usableOn(all);
        if(!viable)
            return false;

        var out = [];
        // Check if players are viable
        for(var i =0; i<viable.length; ++i){
            
            var p = viable[i];
            
            if(
                (ability.detrimental && p.team === player.team) ||          // Don't use detrimental on team mates
                (!ability.detrimental && p.team !== player.team)            // Don't use beneficial on enemies
            ){
                continue;
            }

            // This target doesn't need healing
            if(~ability.ai_tags.indexOf("heal") && p.hp > p.getMaxHP()*0.75)
                continue;

            // All done
            out.push(p);
        }

        if(!out.length)
            return false;
        
        return out;

    };

    // Gets a random viable ability
    AI.getViable = function(abilities, player, all){
        let viable = [], important = [];
        for(let ability of abilities){

            if(AI.getViablePlayers(player, ability, all)){
                viable.push(ability);
                if(~ability.ai_tags.indexOf('important'))
                    important.push(ability);
            }
            
        }


        if(!viable.length){
            return false;
        }

        // Important gets priority
        if(important.length)
            return important[Math.floor(Math.random()*important.length)];

        return viable[Math.floor(Math.random()*viable.length)];
        
    };


};
