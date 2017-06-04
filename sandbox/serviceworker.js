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
			cache_version : '2017-06-04 17:10',
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
		'/index.php',
        '/media/emerald.svg',
        '/media/emerald_colorized.svg',
        '/media/emerald_white.svg',
        '/media/hearts.svg',
        '/media/shield.svg',        
	];


	SW.ini = function(event){
		
		console.log("Opening cache");
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
			return fetch(event.request);
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


