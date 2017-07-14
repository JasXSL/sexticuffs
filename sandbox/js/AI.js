class AI{

    static ini(){

        AI.numPlays = 0;        // Nr plays left to attempt this turn
        AI.player = null;       // Player making the AI play
        AI.all = [];            // Selected target(s)
        AI.blocked = false;     // Ability use paused

    }


    // Pauses the AI for a bit to output a chat message
    // Resume is true if this is raised by the active player. Otherwise it's usually something the AI said when being the victim of a text rather than the attacker.
    static talk(attacker, victim, text, resume){

        // This is our turn, we should pause a while
        if(resume)
            AI.blocked = true;
        
        // Wait 
        new Promise(function(res){

            let t = 1000;
            if(!resume)
                t = 500;
            setTimeout(res, t);

        })

        // Output text
        .then(function(){

            return new Promise(function(res, rej){

                let a = attacker, v = victim;
                // JS code for swapping variables
                if(!resume)
                    [a,v] = [v,a]; // Swaps attacker and victim, otherwise the chat would come from the PC.

                B.statusTexts.add(a, v, text, false, true);
                GameAudio.playSound("shake");

                // Not our turn, so let's not try to use an ability
                if(!resume){
                    rej();
                    return;
                }
                setTimeout(res, 1000);

            });
            

        })
        .then(function(){
            
            AI.blocked = false;
            AI.nextActionTimer = setTimeout(AI.execAction, 500);

        }).catch(function(){
            // No need to continue here since we're the victim and it's not our turn
        });
        

    }


    // Figure out how many plays we can make
    static makePlay(player, all){
        
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

        let frst = AI.getViable(player.getAbilities(), player, all);
        if(frst && ~frst.ai_tags.indexOf("important"))
            skip = 0;

        if(Math.random()<skip){
            AI.numPlays = 0;
        }

        AI.performAction();

    }

    // Picks a punishment
    static pickPunishment(player, all){

        // Get viable players
        let losers = [];
        for(let p of all){
            if(p.team === player.team)
                continue;
            losers.push(p);
        }

        let victim = losers[Math.floor(Math.random()*losers.length)],
            types = Ability.PUNISHMENTS,
            type = types[Math.floor(Math.random()*types.length)]
        ;
        
        setTimeout(function(){
            B.drawPunishment(player, victim, type);
        }, 2000);
        
        
    }

    // make the play
    static execAction(){
        if(B.paused)
            return;

        // Pick an ability if abilities are proper
        if(AI.numPlays > 0 && !B.ended){

            let player = AI.player, 
                abilities = player.getAbilities(), 
                all = AI.all,
                ability = AI.getViable(abilities, player, all)
            ;

            --AI.numPlays;

            // There is an ability available for use
            if(ability !== false){

                // Pick a random target
                let players = AI.getViablePlayers(player, ability, all);

                // If an RP text exists, this function might cause AI to become blocked
                let targ = players[Math.floor(Math.random()*players.length)];
                if(ability.aoe){
                    targ = Netcode.players;
                }
                B.useAbility(ability, targ);

                // Then continue
                AI.performAction();
                
                
                return;

            }

        }
        // No ability was viable, advance turn
        B.advanceTurn();
    }

    // Set a timer to make a play
    static performAction(){

        // Timer has been intercepted by RP text
        if(!AI.blocked){
            clearTimeout(AI.nextActionTimer);
            AI.nextActionTimer = setTimeout(AI.execAction, 500);
        }
    }

    // Gets viable players for an ability
    static getViablePlayers(player, ability, all){

        // Filter players by usable
        let viable = ability.usableOn(all);
        if(!viable)
            return false;

        let out = [];

        // AI "thinking" occurs here
        for(let p of viable){

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

    }

    // Gets a random viable ability
    static getViable(abilities, player, all){
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
        
    }




}
