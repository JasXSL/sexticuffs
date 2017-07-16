/*

	Todo:
	Add periodicsync whenever it becomes available to the interwebs

*/

// Import libs
	// Give the service worker access to Firebase Messaging.
	// Note that you can only use Firebase Messaging here, other Firebase libraries
	// are not available in the service worker.
	//importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-app.js');
	//importScripts('https://www.gstatic.com/firebasejs/3.5.2/firebase-messaging.js');
//

// Root
	var SW = {};
		SW.config = {
			cache_version : '2017-07-16', 
			always_cache : [ 
			'png',
			'jpeg',
			'jpg',
			'gif',
			'webm',
			'woff',
			'svg',
			'woff2',
			'ogg'
			],
		};
	SW.cache = [
                       '/',
      'index.php',
      'manifest.json',
      'favicon.ico',
      'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/themes/smoothness/jquery-ui.css',
      'https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js',
      'https://ajax.googleapis.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min.js',
      'css/style.css',
      'js/AI.js',
      'js/AIChat.js',
      'js/Audio.js',
      'js/Battle.js',
      'js/Datatypes.js',
      'js/Game.js',
      'js/IDB.js',
      'js/Jasmop.js',
      'js/Library.js',
      'js/Mod.js',
      'js/Netcode.js',
      'js/libraries/createjs-2015.11.26.min.js',
      'js/libraries/jquery.ui.touch-punch.min.js',
      'js/libraries/socket.io.js',
      'pages/battle.js',
      'pages/home.js',
      'pages/index.js',
      'media/Discord-Logo-White.svg',
      'media/Patreon_logo.svg',
      'media/audio/ability_unlock.ogg',
      'media/audio/accept.ogg',
      'media/audio/bell.ogg',
      'media/audio/bite.ogg',
      'media/audio/brush_wiggle_goo.ogg',
      'media/audio/burst.ogg',
      'media/audio/button_hover.ogg',
      'media/audio/chain.ogg',
      'media/audio/charge.ogg',
      'media/audio/chat.ogg',
      'media/audio/chest_open.ogg',
      'media/audio/cloth_rip.ogg',
      'media/audio/connectionlost.ogg',
      'media/audio/dark_aura.ogg',
      'media/audio/dark_cast.ogg',
      'media/audio/darkstrike.ogg',
      'media/audio/defense_break.ogg',
      'media/audio/dishes.ogg',
      'media/audio/dishes_die.ogg',
      'media/audio/dispel_good.ogg',
      'media/audio/drain.ogg',
      'media/audio/electric_zap.ogg',
      'media/audio/fail.ogg',
      'media/audio/freeze.ogg',
      'media/audio/game_intro.ogg',
      'media/audio/gem_pick.ogg',
      'media/audio/generic.ogg',
      'media/audio/heal.ogg',
      'media/audio/kiss.ogg',
      'media/audio/knockout.ogg',
      'media/audio/laser_close.ogg',
      'media/audio/levelup.ogg',
      'media/audio/masochism.ogg',
      'media/audio/mez.ogg',
      'media/audio/pinch.ogg',
      'media/audio/plate_break.ogg',
      'media/audio/playerdisconnected.ogg',
      'media/audio/playerjoined.ogg',
      'media/audio/power_chord.ogg',
      'media/audio/prismbeam.ogg',
      'media/audio/punch.ogg',
      'media/audio/punch_heavy.ogg',
      'media/audio/purchase.ogg',
      'media/audio/redress.ogg',
      'media/audio/scratch.ogg',
      'media/audio/slap.ogg',
      'media/audio/slap_wet_small.ogg',
      'media/audio/slime_hit.ogg',
      'media/audio/slime_squish.ogg',
      'media/audio/slime_squish_bright.ogg',
      'media/audio/small_scratch.ogg',
      'media/audio/smoke_puff.ogg',
      'media/audio/smooth_lick.ogg',
      'media/audio/soundtracks/battle.ogg',
      'media/audio/soundtracks/chill.ogg',
      'media/audio/soundtracks/home.ogg',
      'media/audio/soundtracks/maintheme.ogg',
      'media/audio/soundtracks/organic_grunge.ogg',
      'media/audio/soundtracks/rocket_power.ogg',
      'media/audio/soundtracks/skirmish.ogg',
      'media/audio/soundtracks/store.ogg',
      'media/audio/soundtracks/town.ogg',
      'media/audio/squish.ogg',
      'media/audio/stretch.ogg',
      'media/audio/stretch_snap.ogg',
      'media/audio/sweet_shred.ogg',
      'media/audio/taunt.ogg',
      'media/audio/tentacle_summoned.ogg',
      'media/audio/tickle.ogg',
      'media/audio/treasure_open.ogg',
      'media/audio/turndone.ogg',
      'media/audio/vib.ogg',
      'media/audio/water_splash.ogg',
      'media/audio/wet_squeeze.ogg',
      'media/audio/whip.ogg',
      'media/audio/yourturn.ogg',
      'media/backgrounds/city.jpg',
      'media/backgrounds/city_fx.jpg',
      'media/backgrounds/dungeon.jpg',
      'media/backgrounds/gym.jpg',
      'media/backgrounds/hell.jpg',
      'media/backgrounds/hell_cathedral.jpg',
      'media/backgrounds/home_a.jpg',
      'media/backgrounds/lobby.jpg',
      'media/backgrounds/lockers.jpg',
      'media/backgrounds/mall.jpg',
      'media/backgrounds/skirmish.jpg',
      'media/backgrounds/tentacle_pit.jpg',
      'media/challenge_locked.jpg',
      'media/cursors/default.svg',
      'media/cursors/inspect.svg',
      'media/cursors/move.svg',
      'media/cursors/pointer.svg',
      'media/effects/anatomy.svg',
      'media/effects/anthem.svg',
      'media/effects/axe-swing.svg',
      'media/effects/boxing-glove.svg',
      'media/effects/cog.svg',
      'media/effects/coliseum.svg',
      'media/effects/corrupt.svg',
      'media/effects/crystal-bars.svg',
      'media/effects/dodge.svg',
      'media/effects/eye-shield.svg',
      'media/effects/gavel.svg',
      'media/effects/glass-heart.svg',
      'media/effects/gooey-impact.svg',
      'media/effects/grab.svg',
      'media/effects/gym.svg',
      'media/effects/handcuffs.svg',
      'media/effects/heal.svg',
      'media/effects/house.svg',
      'media/effects/hydromance.svg',
      'media/effects/knot.svg',
      'media/effects/lips.svg',
      'media/effects/love-song.svg',
      'media/effects/masochism.svg',
      'media/effects/meal.svg',
      'media/effects/pretty-fangs.svg',
      'media/effects/punch.svg',
      'media/effects/purify.svg',
      'media/effects/recover.svg',
      'media/effects/rest.svg',
      'media/effects/sap.svg',
      'media/effects/shield-reflect.svg',
      'media/effects/shining-sword.svg',
      'media/effects/shop.svg',
      'media/effects/silenced.svg',
      'media/effects/snake-bite.svg',
      'media/effects/spill.svg',
      'media/effects/stun.svg',
      'media/effects/swallow.svg',
      'media/effects/taunt.svg',
      'media/effects/tentacle-heart.svg',
      'media/effects/ultrasound.svg',
      'media/effects/voodoo-doll.svg',
      'media/effects/weaken.svg',
      'media/emerald.svg',
      'media/emerald_colorized.svg',
      'media/emerald_white.svg',
      'media/free_characters/dps.jpg',
      'media/free_characters/otter.jpg',
      'media/github-logo.svg',
      'media/hearts.svg',
      'media/logo-128.png',
      'media/logo-144.png',
      'media/logo-256.png',
      'media/logo-32.png',
      'media/logo-512.png',
      'media/logo-64.png',
      'media/npc/barrel.svg',
      'media/npc/bunny.jpg',
      'media/npc/butler.jpg',
      'media/npc/dogbot.jpg',
      'media/npc/imp.svg',
      'media/npc/muscle-up.svg',
      'media/npc/queen.jpg',
      'media/npc/satinan.jpg',
      'media/npc/shivv.jpg',
      'media/npc/succubus.jpg',
      'media/npc/tentacle.svg',
      'media/npc/tentaclepit.jpg',
      'media/shield.svg',
      'media/sxbg.jpg',
      'media/sxtitle.png',
      'media/treasure.png',
	];


	SW.ini = function(event){
		
		// Load up the cache
		event.waitUntil(
			caches.open(SW.config.cache_version).then(function(cache) {
				// Add to cache
				console.log("Adding files: ", SW.cache);
				return cache.addAll(SW.cache);
			})
		);

		//event.waitUntil(self.skipWaiting());
	};






	// Handles HTTP requests
	SW.onRequest = function(event) {
		
		var config = SW.config;
		var filetype = event.request.url.split('.').pop().toLowerCase();
		var req = event.request;
		var cp = req.clone();


		// Formats that are always cached
		if(~config.always_cache.indexOf(filetype)){
			SW.respondFromCache(event);
		}
		else{

			// Unroll this a bit
			event.respondWith(new Promise(function(res, rej){
				
				// Starts by trying to fetch from the interwebs
				fetch(req).then(res).catch(function(error){

					// Didn't work, try cache
					caches.match(req).then(function(response){

						// Success! Resolve
						if (response) {
							res(response);
							return;
						}

						// You have requested a non-cached resource
						// Fail
						res(new Response("Site unreachable", {
							status:503,
							statusText:"File fetch failed: "+file
						}));
					


					});


				});


			}));

		}
		

	};


  // Handles requests from the browser
  	SW.onMessage = function(event){

		var response = {};
		var task = '', args = [];
		if(event.data.hasOwnProperty('task')){
			task = event.data.task;
		}
		if(event.data.hasOwnProperty('args')){
			args = event.data.args;
			if(args === undefined){args = [];}
			else if(args.constructor !== Array){
				args = [args];
			}
		}

		// User ID has been sent from the website
		if(task === 'UserID' && +args[0]){
			// Somebody is logged in. Are they our cached user?

			SW.DB.get('config', 'user_id').then(function(data){

				// Update the cookie
				var cookieUpdate = SW.DB.put('config', {'type':'user_cookie', 'val':args[1]});

				if(data.val !== +args[0]){
					Promise.all([
						// Stores the current user
						SW.DB.put('config', {'type':'user_id', 'val':+args[0]}),
						cookieUpdate,
						// Forces an auto update next tick
						SW.DB.put('config', {'type':'last_recache', 'val':0}),
						
					]).then(SW.autoUpdate);
				}else{
					// Check if the time is nigh even if the user hasn't changed
					SW.autoUpdate();
				}
			});

		}

		event.ports[0].postMessage(response);
	};

    // Sends message to all pages
	SW.sendMessage = function(task, data){

		return new Promise(function(res){

			var responses = [];

			clients.matchAll().then(clients => {

				var promises = [];
				clients.forEach(client => {

					promises.push(new Promise(function(resolve, reject){

						var msg_chan = new MessageChannel();
						msg_chan.port1.onmessage = function(event){
							if(event.data.error){
								reject(event.data.error);
							}else{
								resolve(event.data);
							}
						};
						
						client.postMessage({task:task, data:data}, [msg_chan.port2]);

					}));


				});

				Promise.all(promises).then(function(){
					res(responses);
				});

			});

		});
		
	};


	SW.respondFromCache = function(event){
		event.respondWith(
		caches.match(event.request)
			.then(function(response) {
				// Cache hit - return response
				if (response) {
					return response;
				}

				var freq = event.request.clone();
				return fetch(freq).then(function(response){
					var type = response.url.split('.').pop();
					// Always auto cache audio
					if(!response || response.status !== 200 || response.type !== 'basic' || type !== 'ogg') {
						return response;
					}

					var responseToCache = response.clone();

					caches.open(SW.config.cache_version)
					.then(function(cache) {
						cache.put(event.request, responseToCache);
					});

					return response;
				});
			}
		)
		);
	};

//















// Firebase
    SW.firebase = {};

    /*
        Notification data should include:
        {
            title : (str)text, 	// Title of the notification
            body : (str)text, 	// Text that should show up in the notice
            icon : (str)url, 	// Full URL to the notification thumbnail
            page : (str)url, 	// Page the user should go to when clicking the notice
        }
    */
    SW.firebase.onMessage = function(payload){

        //console.log('[firebase] Received background message ', payload);
            
        var data = payload.data;
        var notificationTitle = data.title;
        var notificationOptions = {
            body: data.body,
            icon: 'https://such-nom.com/media/favicons/favicon-144.png',
            image: data.icon, 
            badge:'https://such-nom.com/media/img/badge.png',
            data: {
                url:data.page
            }
        };

        

        return self.registration.showNotification(notificationTitle, notificationOptions);

    };

    SW.firebase.onNotificationClick = function(event) {
            
        // close the notification
        event.notification.close();
        //console.log("notification clicked", event.notification);
        clients.openWindow(event.notification.data.url); // Probably best to just open a window
        /*
            //To open the app after click notification
            event.waitUntil(
                clients.matchAll({
                    type: "window"
                })
                .then(function(clientList) {

                    

                    for (var i = 0; i < clientList.length; i++) {
                        var client = clientList[i];
                        if ("focus" in client) {
                            return client.focus();
                        }
                    }

                    if (clientList.length === 0) {
                        if (clients.openWindow) {
                            return 
                        }
                    }
                })
            );
        */
    };

    SW.firebase.ini = function(){

        // Initialize the Firebase app in the service worker by passing in the
        // messagingSenderId.
        firebase.initializeApp({
            'messagingSenderId': '668826582744'
        });

        // Retrieve an instance of Firebase Messaging so that it can handle background
        // messages.
        const messaging = firebase.messaging();

        console.log("Registering background handler");
        messaging.setBackgroundMessageHandler(SW.firebase.onMessage);

        // push notification clicked
        self.addEventListener("notificationclick", SW.firebase.onNotificationClick);

    };


//






// Initialize here


	// Binding has to happen directly under the global scope
	self.addEventListener('install', SW.ini);

	// This is the proper INI
	self.onactivate = function(event) {
		self.clients.claim(); // Become available to all pages
	};
	// Handle HTTP Request
	self.addEventListener('fetch', SW.onRequest);
	// Handle messages from JS
	self.addEventListener('message', SW.onMessage);

	//SW.firebase.ini();


