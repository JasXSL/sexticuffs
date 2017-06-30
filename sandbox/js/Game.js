var Game = {};

(function(){
    "use strict";


    Game.player = null;
    Game.Battle = null;
    Game.soundVolume = 0.5;
    Game.musicVolume = 0.5;
    Game.mute = false;
    Game.version = 2; 


    Game.ini = function(){

        Game.Battle = Jasmop.Page.get('battle');
        var i;
        // Build the library
        DB.ini();
        AI.ini();

        createjs.Ticker.setFPS(60);
        Game.Music.preload();
        
        createjs.AbstractSoundInstance.prototype.localVolume = 1;
        createjs.AbstractSoundInstance.prototype.updateLocal = function(){
            var base = Game.soundVolume;
            if(this.channel === 'music')
                base = Game.musicVolume;

            this.volume = base*this.localVolume;
        };
        // Refreshes all volumes
        createjs.Sound.refresh = function(){
            for(var i =0; i<createjs.Sound._instances.length; ++i){
                var inst = createjs.Sound._instances[i];
                inst.updateLocal();
            }
        };

        if(Game.isSandbox()){
            console.log("sandbox mode");
            $("body").append('<div id="sandbox" style="position:fixed; bottom:1vw; right:1vw; color:#FFF; font-weight:bold; font-size:2vmax;">Sandbox!</div>');

        }
        

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
            {id:'dispel_good', src:'dispel_good.ogg'},
            {id:'masochism', src:'masochism.ogg'},
            {id:'drain', src:'drain.ogg'},
            {id:'knockout', src:'knockout.ogg'},
            {id:'game_intro', src:'game_intro.ogg'},
            {id:'accept', src:'accept.ogg'},
            {id:'hover', src:'button_hover.ogg'},
            {id:'purchase', src:'purchase.ogg'},
            {id:'redress', src:'redress.ogg'},
            {id:'ability_unlock', src:'ability_unlock.ogg'},
            {id:'laser_close', src:'laser_close.ogg'},
            {id:'gem_pick', src:'gem_pick.ogg'},
            {id:'charge', src:'charge.ogg'},
            {id:'kiss', src:'kiss.ogg'},
            {id:'mez', src:'mez.ogg'},
            {id:'dark_aura', src:'dark_aura.ogg'},
            {id:'whip', src:'whip.ogg'},
            {id:'dark_cast', src:'dark_cast.ogg'},
            {id:'tentacle_summoned', src:'tentacle_summoned.ogg'},
            {id:'chain', src:'chain.ogg'},
            {id:'electric_zap', src:'electric_zap.ogg'},
            {id:'vib', src:'vib.ogg'},
            {id:'darkstrike', src:'darkstrike.ogg'},
            

            // Start opening
            {id:'chest_open', src:'chest_open.ogg'},
            // Finish opening
            {id:'treasure_open', src:'treasure_open.ogg'},
            
            
            
            
            {id:'disconnect', src:'connectionlost.ogg'},
            {id:'playerjoined', src:'playerjoined.ogg'},
            {id:'playerleft', src:'playerdisconnected.ogg'},
                        
            
        ], 'media/audio/');

        createjs.Sound.volume = 0.5;           // Global volume


        // Download all my characters
        

        // Load Preferences
        new Promise(function(res){
            IDB.getAll('config').then(function(entries){
                for(i=0; i<entries.length; ++i){
                    var type = entries[i].type;
                    var val = entries[i].value;
                    if(type === 'soundVolume')
                        Game.soundVolume = +val;
                    else if(type === 'musicVolume')
                        Game.musicVolume = +val;
                    else if(type === 'mute'){
                        Game.mute = val > 0;
                        createjs.Sound.muted = Game.mute;
                    }
                        
                }
                res();
            });
        })


        // Load characters
        .then(Game.fetchActiveChar)

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
            Game.updateMenu();
            Jasmop.Menu.onToggle = function(){
                Game.clickSound();
            };

            Jasmop.Menu.setButton('<img src="media/effects/cog.svg" />');
            $("#overlay").appendTo('#wrap');
            $("#menu").appendTo('#wrap');
            $("#wrap").append('<div id="netgamePlayers"></div>');

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

            Jasmop.Page.on('pagechange', function(){
                Game.rebuildMultiplayerIcons();
                Game.rebindSounds();
            });

            Game.rebuildMultiplayerIcons();

        });


    };

    // returns a promise
    Game.setActiveChar = function(char){

        Game.player = char;
        char.is_pc = true;
        Netcode.setCharacter();
        return IDB.put('config', {'type':'activeChar', value:char.id});

    };


    Game.startBattle = function(players){
        Jasmop.Page.set("battle", [
            players
        ]);
    };

    Game.isSandbox = function(){
        return window.location.pathname === '/sandbox/';
    };


    // Constants
    Game.Consts = {

        // Used for conditions
        TARG_VICTIM : 'VICTIM',
        TARG_ATTACKER : 'ATTACKER',
        TARG_RAISER : 'RAISER',                             // Used only in applyEffect effects, person who raised the event
        TARG_VICTIM_PARENT : 'VICTIM_PARENT',               // Used only in applyEffect effects on summoned character. Ex: Summoned character takes damage.
        TARG_ATTACKER_PARENT : 'ATTACKER_PARENT',           // == || ==. Ex: Summoned character deals damage
        TARG_AOE : 'AOE',                                   // Run against everyone. Currently only supported in Effect


    };





    // Redraws the icons at the bottom
    Game.rebuildMultiplayerIcons = function(){

        var hsc = Jasmop.Tools.htmlspecialchars;
        var out = '';
        for(var i =0; i<Netcode.players.length; ++i){
            var character = Netcode.players[i];
            if(!character.is_pc)
                continue;
            out += '<div class="player" data-uuid="'+character.UUID+'" style="background-image:url('+character.getImage()+')">';
                out+= '<div class="bg">'+hsc(character.name)+'</div>';
            out+= '</div>';
        }

        if(Jasmop.active_page){
            $("#netgamePlayers").toggleClass('hidden', ['battle', 'index'].indexOf(Jasmop.active_page.id) > -1).html(out);
            $("#netgamePlayers div.player").on('click', function(){
                var pl = Netcode.getCharacterByUuid($(this).attr('data-uuid'));
                pl.inspect();
            });
        }
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

    Game.playSound = function(id, settings){
        if(!settings)
            settings = {};
        settings.volume = Game.soundVolume;
        
        createjs.Sound.play(id, settings);
    };

    Game.clickSound = function(){
        Game.playSound('shake');
    };

    Game.rebindSounds = function(){
        $(".button, input[type=button], input[type=submit]").off('mouseenter').on('mouseenter', function(){
            Game.playSound('hover');
        });
    };
    

    Game.Music = {};
    Game.Music.files = [
        {"id":'chill', src:'media/audio/soundtracks/chill.ogg'},
        {"id":'maintheme', src:'media/audio/soundtracks/maintheme.ogg'},
        {"id":'battle', src:'media/audio/soundtracks/battle.ogg'},
        {"id":'skirmish', src:'media/audio/soundtracks/skirmish.ogg'},
        {"id":'town', src:'media/audio/soundtracks/town.ogg'},
        {"id":'home', src:'media/audio/soundtracks/home.ogg'},
        {"id":'store', src:'media/audio/soundtracks/store.ogg'},
        {"id":'rocket_power', src:'media/audio/soundtracks/rocket_power.ogg'},
    ];
    Game.Music.song = '';
    Game.Music.obj = null;  // Play object
    Game.Music.loaded = false;

    Game.Music.preload = function(){
        var queue = new createjs.LoadQueue();
        queue.installPlugin(createjs.Sound);

        queue.addEventListener("complete", function(){
            console.log("queue completed");
            /*
            if(Game.Music.song){
                Game.Music.loaded = true;
                Game.Music.set(Game.Music.song, true);
            }
            */
        });
        queue.addEventListener("fileload", function(event){
            if(Game.Music.song === event.item.id){
                Game.Music.set(Game.Music.song, true);
            }
        });
        queue.addEventListener("error", function(event){
            console.error(event);
        });
        queue.loadManifest(Game.Music.files);
    };

    Game.Music.set = function(url, force){

        /*
        if(!Game.Music.loaded){
            Game.Music.song = url;
            return;
        }
        */

        if(Game.Music.song === url && !force)
            return;
        
        // Fade out
        if(Game.Music.obj){
            var obj = Game.Music.obj;
            createjs.Tween.get(obj).to({localVolume:0}, 2000, createjs.Ease.sineInOut)
            .call(function(){
                obj.stop();
            })
            .addEventListener("change", function(){
                obj.updateLocal();
            });
        }

        Game.Music.song = url;
        
        Game.Music.obj = createjs.Sound.play(url, {volume:0.001, loop:-1});
        Game.Music.obj.localVolume = 0.001;
        Game.Music.obj.channel = 'music';

        createjs.Tween.get(Game.Music.obj).to({localVolume:1}, 2000, createjs.Ease.sineInOut).addEventListener("change", function(){
            Game.Music.obj.updateLocal();
        });

    };

    Game.setMusic = Game.Music.set;





    Game.updateMenu = function(){
        var html = '<div class="entry button noclick effectVolume">Effect Volume<br/><input type="range" min=0 max=100 value='+Math.floor(Game.soundVolume*100)+' step=1 /></div>';
            html+= '<div class="entry button noclick musicVolume">Music<br /><input type="range" min=0 max=100 value='+Math.floor(Game.musicVolume*100)+' step=1 /></div>';
            html+= '<div class="entry button noclick mute"><input type="checkbox" '+(Game.mute ? 'checked':'')+' /> Mute</div>';
            
            html+= '<div class="entry button mainMenu">Main Menu</div>';
            
        Jasmop.Menu.set(html);

        // Music
        $("#menu div.musicVolume input").off('change').on('change', function(){
            // Store current volume
            IDB.put('config', {'type':'musicVolume', value:Game.musicVolume});
        });
        $("#menu div.musicVolume input").off('input').on('input', function(){
            var vol = $(this).val()/100;
            Game.musicVolume = vol;
            createjs.Sound.refresh();
        });

        // SFX
        $("#menu div.effectVolume input").off('change').on('change', function(){
            // Store current volume
            IDB.put('config', {'type':'soundVolume', value:Game.soundVolume});
        });

        $("#menu div.effectVolume input").off('input').on('input', function(){
            Game.soundVolume = $(this).val()/100;
            createjs.Sound.refresh();
        });

        $("#menu div.mainMenu").off('click').on('click', function(){
            Netcode.disconnect();
            Jasmop.Page.set('index');
            Game.clickSound();
            Jasmop.Menu.close();
        });

        $("#menu div.mute").off('click').on('click', function(){
            Game.mute = !Game.mute;
            createjs.Sound.muted = Game.mute;
            Game.clickSound();
            $("input", this).prop('checked', Game.mute);
            IDB.put('config', {'type':'mute', value:Game.mute});
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