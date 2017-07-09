/*

    This script controls:
        - Libraries
        - Audio
        - Administration

*/
class Game{
    
    // Initializes all libraries
    static ini(){


		
		// TODO: Replace these
		Game.Consts = {

			// Used for conditions
			TARG_VICTIM : 'VICTIM',
			TARG_ATTACKER : 'ATTACKER',
			TARG_RAISER : 'RAISER',                             // Used only in applyEffect effects, person who raised the event
			TARG_VICTIM_PARENT : 'VICTIM_PARENT',               // Used only in applyEffect effects on summoned character. Ex: Summoned character takes damage.
			TARG_ATTACKER_PARENT : 'ATTACKER_PARENT',           // == || ==. Ex: Summoned character deals damage
			TARG_AOE : 'AOE',                                   // Run against everyone. Currently only supported in Effect

		};
		
        
        // Consts
        Game.version = 2; 


        // SET UP STATIC VARS //
        Game.Battle = Jasmop.Page.get('battle');
        Game.player = null;
    
		// Puts a sandbox div if this script was hosted under sandbox
		if(Game.isSandbox()){
            console.log("sandbox mode");
            $("body").append('<div id="sandbox" style="position:fixed; bottom:1vw; right:1vw; color:#FFF; font-weight:bold; font-size:2vmax;">Sandbox!</div>');
        }

        
        // INITIALIZE LIBRARIES
        
        // Create the base library
		Game.loadPrefs()
        	.then(DB.ini())						// Rebuild the base assets
            .then(Mod.ini)          			// Load custom stuff from mods
            .then(AI.ini)           			// Prepare AI
			.then(AIChat.ini)           		// Prepare AI chat
            .then(GameAudio.ini)    			// Prepare game audio
            .then(Game.fetchActiveChar)			// Fetch the "continue" playing
			.then(Game.loadJasmop)				// Configure JASMOP
			.then(function(){

				// Update the bottom right menu
				Game.updateMenu();
				// Update multiplayer icons
				Game.rebuildMultiplayerIcons();

			});

    }


	// Takes an input array of target consts or conditions and returns an array of viable targets
	static convertTargets(input, attacker, victim, raiser){
		if(!input)
			return [];
		if(input.constructor !== Array)
			input = [input];
		
		let success = [];
		for(let targ of input){
			if(!targ)
				continue;

			if(targ === Game.Consts.TARG_ATTACKER)				
				success.push(attacker);
			if(targ === Game.Consts.TARG_VICTIM)				
				success.push(victim);
			if(targ === Game.Consts.TARG_ATTACKER_PARENT){
				if(!attacker.parent)
					continue;
				success.push(attacker.parent);
			}
			if(targ === Game.Consts.TARG_VICTIM_PARENT){				
				if(!victim.parent)
					continue;
				success.push(victim.parent);
			}
			if(targ === Game.Consts.TARG_AOE)
				success = Netcode.players;
			
			if(targ.constructor === Character)
				success.push(targ);
			
			if(targ === Game.Consts.TARG_RAISER)
				success.push(raiser);
			
			// Add by filters
			if(targ.constructor === Array){
				let all = Netcode.players;
				for(let t of all){

					if(Condition.validateMultiple(targ, false, attacker, t, null, true, false))
						success.push(t);

				}

			}

		}


		return success.filter(function(el, index, arr) {
			return index == arr.indexOf(el);
		});

	}


	// Load preferences from IDB
	static loadPrefs(){
		return new Promise(function(res){

			IDB.getAll('config').then(function(entries){

                for(let entry of entries){
                    let type = entry.type,
                    	val = entry.value
					;
                    if(type === 'soundVolume')
                        GameAudio.soundVolume = +val;
                    else if(type === 'musicVolume')
                        GameAudio.musicVolume = +val;
                    else if(type === 'mute'){
                        GameAudio.mute = val > 0;
                        createjs.Sound.muted = GameAudio.mute;
                    }
                }
                res();
            });

		});
	}

	// Prepare jasmop
	static loadJasmop(){

		return new Promise(function(res){

			// BASE SETTINGS //
				Jasmop.dontUseHash = true;			// No need for the top hashes. This is a game, not a website.
				Jasmop.ini();						// Run ini
				Jasmop.Serviceworker.ini();			// We need serviceworker
				// Set the Jasmop menu button
				Jasmop.Menu.setButton('<img src="media/effects/cog.svg" />');


				
			// DOM MODIFIERS //

				// Move JASMOP assets into the game window
				$("#overlay").appendTo('#wrap');
				$("#menu").appendTo('#wrap');

				// Inserts netgame players into the jasmop elements
				$("#wrap").append('<div id="netgamePlayers"></div>');



			// BINDINGS // 

				// Creates 
				Jasmop.Menu.onToggle = function(){
					GameAudio.clickSound();
				};

				// Sets up error handler
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

				// Handle page change
				Jasmop.Page.on('pagechange', function(){
					Game.rebuildMultiplayerIcons();
					GameAudio.rebindSounds();
				});

			res();
		});
		
	}



    // Character managment. 
		// This character is your root character that all UI, leveling etc is ran upon. Netcode.players has a clone of this player.
		// This method of sandboxing prevents a netgame host from fucking with your save file.

		// This function sets your active char. Char expects a Character object.
		// returns a DB save promise
		static setActiveChar(char){

			Game.player = char;
			char.is_pc = true;
			Netcode.setCharacter();	// Sets the sandbox clone of your character
			return IDB.put('config', {'type':'activeChar', value:char.id}); // Promise

		}

		// Tries to get active char. Useful on init and after deleting a character
		// returns a promise which resolves with a character
		static fetchActiveChar(){

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

						// Char exists
						if(char !== false){
							res(new Character(char));
							return;
						}

						// No active char exists. Get the last modified one
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
		}



	// Battle & Nav

		// Starts a battle with the current netcode players
		static startBattle(){
			
			Jasmop.Page.set("battle");

		}



	// Helpful

		// Returns true if this isn't stable
		static isSandbox(){
			return window.location.pathname === '/sandbox/';
		}

	

	// Multiplayer Icons

		// Rebuilds the multiplayer icons at the bottom of your screen
		static rebuildMultiplayerIcons(){

			// The game hasn't loaded yet
			if(!Jasmop.active_page)
				return;

			let hsc = Jasmop.Tools.htmlspecialchars,
				out = '';
			for(let character of Netcode.players){
				
				if(!character.is_pc)
					continue;

				out += '<div class="player" data-uuid="'+character.UUID+'" style="background-image:url('+character.getImage()+')">';
					out+= '<div class="bg">'+hsc(character.name)+'</div>';
				out+= '</div>';

			}

			
			$("#netgamePlayers").toggleClass('hidden', ['battle', 'index'].indexOf(Jasmop.active_page.id) > -1).html(out);
			$("#netgamePlayers div.player").on('click', function(){
				var pl = Netcode.getCharacterByUuid($(this).attr('data-uuid'));
				pl.inspect();
			});
			

		}



	// Main Menu (Bottom right)

		// Refreshes the menu
		static updateMenu(){

			let html = '<div class="entry button noclick effectVolume">Effect Volume<br/><input type="range" min=0 max=100 value='+Math.floor(GameAudio.soundVolume*100)+' step=1 /></div>';
				html+= '<div class="entry button noclick musicVolume">Music<br /><input type="range" min=0 max=100 value='+Math.floor(GameAudio.musicVolume*100)+' step=1 /></div>';
				html+= '<div class="entry button noclick mute"><input type="checkbox" '+(GameAudio.mute ? 'checked':'')+' /> Mute</div>';
				html+= '<div class="entry button mainMenu">Main Menu</div>';
				
			// Flush
			Jasmop.Menu.set(html);


			// Music
			$("#menu div.musicVolume input").off('change').on('change', function(){
				// Store current volume
				IDB.put('config', {'type':'musicVolume', value:GameAudio.musicVolume});
			});
			$("#menu div.musicVolume input").off('input').on('input', function(){
				let vol = $(this).val()/100;
				GameAudio.musicVolume = vol;
				createjs.Sound.refresh();
			});

			// SFX
			$("#menu div.effectVolume input").off('change').on('change', function(){
				// Store current volume
				IDB.put('config', {'type':'soundVolume', value:GameAudio.soundVolume});
			});

			$("#menu div.effectVolume input").off('input').on('input', function(){
				GameAudio.soundVolume = $(this).val()/100;
				createjs.Sound.refresh();
			});

			$("#menu div.mainMenu").off('click').on('click', function(){
				Netcode.disconnect();
				Jasmop.Page.set('index');
				GameAudio.clickSound();
				Jasmop.Menu.close();
			});

			$("#menu div.mute").off('click').on('click', function(){
				GameAudio.mute = !GameAudio.mute;
				createjs.Sound.muted = GameAudio.mute;
				GameAudio.clickSound();
				$("input", this).prop('checked', GameAudio.mute);
				IDB.put('config', {'type':'mute', value:GameAudio.mute});
			});

		}


}



// Handles game audio
class GameAudio{


    static ini(){

        // Set defaults
        

        GameAudio.song = '';                // ID of currently playing song
        GameAudio.musicObj = null;          // CJS audio instance
        


        return new Promise(function(res){

			// Initialize createjs

			createjs.Sound.volume = 0.5;           // Global volume
			createjs.AbstractSoundInstance.prototype.localVolume = 1;
			createjs.AbstractSoundInstance.prototype.updateLocal = function(){
				var base = GameAudio.soundVolume;
				if(this.channel === 'music')
					base = GameAudio.musicVolume;

				this.volume = base*this.localVolume;
			};
			// Refreshes all volumes
			createjs.Sound.refresh = function(){
				for(var i =0; i<createjs.Sound._instances.length; ++i){
					var inst = createjs.Sound._instances[i];
					inst.updateLocal();
				}
			};

			// Initializes cJS ticker
            createjs.Ticker.setFPS(60);
            
            
            Promise.all([
                GameAudio.preloadMusic(),
                GameAudio.preloadFx()
            ]).then(res);
            
        });
    }

    static preloadMusic(){

        // Here you can load from mods later before registering sounds

        return new Promise(function(res){

            var queue = new createjs.LoadQueue();
            queue.installPlugin(createjs.Sound);

            queue.addEventListener("complete", function(){
                console.log("queue completed");
            });
            queue.addEventListener("fileload", function(event){
                // The currently selected song just finished loading, so we should play it
                if(GameAudio.song === event.item.id){
                    GameAudio.setMusic(GameAudio.song, true);
                }
            });
            queue.addEventListener("error", function(event){
                console.error(event);
            });


            queue.loadManifest([
                {"id":'maintheme', src:'media/audio/soundtracks/maintheme.ogg'},
                {"id":'town', src:'media/audio/soundtracks/town.ogg'},
                {"id":'chill', src:'media/audio/soundtracks/chill.ogg'},
                {"id":'battle', src:'media/audio/soundtracks/battle.ogg'},
                {"id":'skirmish', src:'media/audio/soundtracks/skirmish.ogg'},
                {"id":'home', src:'media/audio/soundtracks/home.ogg'},
                {"id":'store', src:'media/audio/soundtracks/store.ogg'},
                {"id":'rocket_power', src:'media/audio/soundtracks/rocket_power.ogg'},
            ]);

            res();

        });
        
    }

    // Preloads all music
    static preloadFx(){

        return new Promise(function(res){

            // Here you can load from mods later before registering sounds
        
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
                {id:'prismbeam', src:'prismbeam.ogg'},
                {id:'dishes', src:'dishes.ogg'},
                {id:'dishes_die', src:'dishes_die.ogg'},
                {id:'plate_break', src:'plate_break.ogg'},
                {id:'bell', src:'bell.ogg'},
                

                // Start opening
                {id:'chest_open', src:'chest_open.ogg'},
                // Finish opening
                {id:'treasure_open', src:'treasure_open.ogg'},
                
                
                
                
                {id:'disconnect', src:'connectionlost.ogg'},
                {id:'playerjoined', src:'playerjoined.ogg'},
                {id:'playerleft', src:'playerdisconnected.ogg'},
                            
                
            ], 'media/audio/');

            res();
        });

    }


    // Plays a sound
    static playSound(id, settings){
        if(!settings)
            settings = {};
        settings.volume = GameAudio.soundVolume;
        createjs.Sound.play(id, settings);
    }

    // Plays a click sound
    static clickSound(){
        GameAudio.playSound('shake');
    }

    // Rebinds auto button click sounds
    static rebindSounds(){
        $(".button, input[type=button], input[type=submit]").off('mouseenter').on('mouseenter', function(){
            GameAudio.playSound('hover');
        });
    }
    

    static setMusic(url, force){

        if(GameAudio.song === url && !force)
            return;
        
        // Fade out
        if(GameAudio.musicObj){

            let obj = GameAudio.musicObj;
            createjs.Tween.get(obj).to({localVolume:0}, 2000, createjs.Ease.sineInOut)
            .call(function(){
                obj.stop();
            })
            .addEventListener("change", function(){
                obj.updateLocal();
            });
        }

        GameAudio.song = url;
        GameAudio.musicObj = createjs.Sound.play(url, {volume:0.001, loop:-1});
        GameAudio.musicObj.localVolume = 0.001;
        GameAudio.musicObj.channel = 'music';

        createjs.Tween.get(GameAudio.musicObj).to({localVolume:1}, 2000, createjs.Ease.sineInOut).addEventListener("change", function(){
            GameAudio.musicObj.updateLocal();
        });

    }


}

GameAudio.soundVolume = 0.5;
GameAudio.musicVolume = 0.5;
GameAudio.mute = false;

