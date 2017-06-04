var Game = {};

(function(){
    "use strict";


    Game.player = null;
    Game.Battle = null;
    // Build the library first
    

    Game.ini = function(){

        Game.Battle = Jasmop.Page.get('battle');

        // Build the library
        DB.ini();
        AI.ini();

        if(window.location.pathname === '/sandbox/'){
            console.log("sandbox mode");
            $("body").append('<div id="sandbox" style="position:fixed; bottom:1vw; right:1vw; color:#FFF; font-weight:bold; font-size:2vmax;">Sandbox!</div>');
        }
        

        console.log("Registering sounds");
        // Initialize the audio library
        createjs.Sound.registerSounds([
            {id:'shake', src:'generic.ogg'},
            {id:'heal', src:'heal.ogg'},
            {id:'pinch', src:'pinch.ogg'},
            {id:'punch', src:'punch.ogg'},
            {id:'punch_heavy', src:'punch_heavy.ogg'},
            {id:'slap', src:'slap.ogg'},
            {id:'squish', src:'squish.ogg'},
            {id:'stretch', src:'stretch.ogg'},
            {id:'stretch_snap', src:'stretch_snap.ogg'},
            {id:'taunt', src:'taunt.ogg'},
            {id:'yourturn', src:'yourturn.ogg'},
            {id:'bite', src:'bite.ogg'},
            {id:'fail', src:'fail.ogg'},
            {id:'tickle', src:'tickle.ogg'},
            {id:'cloth_rip', src:'cloth_rip.ogg'},
            {id:'levelup', src:'levelup.ogg'},
            {id:'slime_whip', src:'slime_hit.ogg'},
            {id:'slap_wet', src:'slap_wet_small.ogg'},
            {id:'slime_squish', src:'slime_squish.ogg'},
            {id:'slime_squish_bright', src:'slime_squish_bright.ogg'},
            {id:'wet_squeeze', src:'wet_squeeze.ogg'},
            {id:'small_scratch', src:'small_scratch.ogg'},
            {id:'chat', src:'chat.ogg'},
            {id:'scratch', src:'scratch.ogg'},
            {id:'brush_wiggle', src:'brush_wiggle_goo.ogg'},
            {id:'freeze', src:'freeze.ogg'},
            {id:'water_squish', src:'water_splash.ogg'},
        ], 'media/audio/');

        createjs.Sound.volume = 0.25;


        // Download all my characters
        
        Game.fetchActiveChar()

        // Make your other characters selectable
        .then(function(){
            return new Promise(function(res){ 

                IDB.search('characters', 'modified', true).then(function(data){

                    for(var i =0; i<data.length; ++i){
                        if(data[i].id === Game.player.id)
                            continue;
                        data[i].is_pc = false;
                        Character.insert(data[i]);
                    }
                    res();
                });

            });
        })

        // IT BEGINS
        .then(function(){

            // Start the app
            Jasmop.dontUseHash = true;
            Jasmop.ini();
            Jasmop.Serviceworker.ini();

            Jasmop.Errors.onAdd = function(){

                $("#errors > div:not(.timed)").each(function(){
                    
                    var th = $(this);
                    th.toggleClass('timed', true);
                    setTimeout(function(){
                        th.toggleClass('fade', true);
                        setTimeout(function(){
                            th.remove();
                        }, 2100);
                    }, 3000);


                });

            };

        });
        /*
        // Start a test battle
        Game.Battle.ini(
            [
                Game.player,
                Character.get('imp')
            ]
        ); 
        */

    };

    // returns a promise
    Game.setActiveChar = function(char){

        Game.player = char;
        char.is_pc = true;
        return IDB.put('config', {'type':'activeChar', value:char.id});

    };


    Game.startBattle = function(players){
        Jasmop.Page.set("battle", [
            players
        ]);
    };


    // Constants
    Game.Consts = {

        // Used for conditions
        TARG_VICTIM : 'VICTIM',
        TARG_ATTACKER : 'ATTACKER'

    };



    // Tries to get active char. Useful on init and after deleting a character
    Game.fetchActiveChar = function(){

        return new Promise(function(gotChar){

            // Get active char ID
            IDB.get('config', 'type', 'activeChar').then(function(entry){

                if(entry === false){
                    return Promise.resolve(false);
                }

                return IDB.get('characters', 'id', entry.value);

            })
            // Convert to ID, or if it fails, grab the latest insert
            .then(function(char){

                return new Promise(function(res){

                    if(char !== false){
                        res(new Character(char));
                        return;
                    }

                    IDB.search('characters', 'modified', true, 1).then(function(data){
                        if(data.length)
                            data = new Character(data[0]);
                        else
                            data = false;
                        res(data);
                    });

                });
                

            }).then(function(char){

                Game.player = char;
                if(char)
                    char.is_pc = true;
                gotChar(char);

            });

        });
    };

    


})();



// Tools
var escape = function(text) {
  var map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, function(m) { return map[m]; });
};