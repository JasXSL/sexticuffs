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
    AI.talk = function(attacker, victim, text){


        AI.blocked = true;

        
        new Promise(function(res){

            setTimeout(res, 1000);

        }).then(function(){

            return new Promise(function(res){

                Game.Battle.statusTexts.add(attacker, victim, text, false, true);
                createjs.Sound.play("shake");
                setTimeout(res, 1000);

            });
            

        }).then(function(){
            
            AI.blocked = false;
            AI.nextActionTimer = setTimeout(AI.nextAction, 500);

        });
        

    };

    AI.makePlay = function(player, all){

        
        AI.player = player;
        AI.all = all;
        
        // What can we actually use?

        // Max nr of random spells to pick
        AI.numPlays = Math.round(player.mana/10*3+Math.random());
        // 1/4 to skip when below 5 mana
        if(player.mana <= 5 && Math.random()<0.25){
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
            if(AI.numPlays > 0){

                var player = AI.player, abilities = player.abilities, all = AI.all;

                --AI.numPlays;

                var ability = AI.getViable(abilities, player, all);
                if(ability !== false){

                    // Pick a random target
                    var players = AI.getViablePlayers(player, ability, all);

                    // Use an ability

                    // If an RP text exists, if an RP text exists, this function might cause AI to become blocked
                    B.useAbility(ability, players[Math.floor(Math.random()*players.length)]);

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
            if(~ability.ai_tags.indexOf("heal") && p.hp > p.max_hp*0.75)
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
        var viable = [];
        for(var i=0; i<abilities.length; ++i){

            if(AI.getViablePlayers(player, abilities[i], all)){
                viable.push(abilities[i]);
            }
            
        }

        if(!viable.length){
            return false;
        }

        return viable[Math.floor(Math.random()*viable.length)];
        
    };


};
