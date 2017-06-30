/*
    javascript
    ajax
    sockets
    mysql
    open-source
    php

*/
var Jasmop = {};
(function(){
    "use strict";

    // Params
    Jasmop.active_page = null;
    Jasmop.socket = null;
    Jasmop.hashcache = null;      // Cache of current hash
    Jasmop.ignoreHashchange = false;    // When set, hashchange event is ignored
    Jasmop.dontUseHash = false;         // Don't use hash. Useful for apps that should have one frame of entry. like a game
    Jasmop.LS = {                       // Localstorage
        pages : {}                          // pageName:(obj)pageData
    };                     

    // Functions
    Jasmop.ini = function(noPageLoad){

        // Extend jQuery
        (function($){
            $.fn.serializeObject = function(){

                var self = this,
                    json = {},
                    push_counters = {},
                    patterns = {
                        "validate": /^[a-zA-Z][a-zA-Z0-9_]*(?:\[(?:\d*|[a-zA-Z0-9_]+)\])*$/,
                        "key":      /[a-zA-Z0-9_]+|(?=\[\])/g,
                        "push":     /^$/,
                        "fixed":    /^\d+$/,
                        "named":    /^[a-zA-Z0-9_]+$/
                    };


                this.build = function(base, key, value){
                    base[key] = value;
                    return base;
                };

                this.push_counter = function(key){
                    if(push_counters[key] === undefined){
                        push_counters[key] = 0;
                    }
                    return push_counters[key]++;
                };

                $.each($(this).serializeArray(), function(){

                    // skip invalid keys
                    if(!patterns.validate.test(this.name)){
                        return;
                    }

                    var k,
                        keys = this.name.match(patterns.key),
                        merge = this.value,
                        reverse_key = this.name;

                    while((k = keys.pop()) !== undefined){

                        // adjust reverse_key
                        reverse_key = reverse_key.replace(new RegExp("\\[" + k + "\\]$"), '');

                        // push
                        if(k.match(patterns.push)){
                            merge = self.build([], self.push_counter(reverse_key), merge);
                        }

                        // fixed
                        else if(k.match(patterns.fixed)){
                            merge = self.build([], k, merge);
                        }

                        // named
                        else if(k.match(patterns.named)){
                            merge = self.build({}, k, merge);
                        }
                    }

                    json = $.extend(true, json, merge);
                });

                return json;
            };
        })(jQuery);


        // First check if certain features are enabled
        Jasmop.Opengraph.ini(); // Initialize opengraph

        // Initialize localstorage
        if(localStorage.JASMOP){
            var ls = JSON.parse(localStorage.JASMOP);
            // Make sure all required LS vars are there
            for(var i in Jasmop.LS){
                if(!ls.hasOwnProperty(i)){
                    ls[i] = Jasmop.LS[i];
                }
            }
            Jasmop.LS = ls;
        }
        
        // Build the html
        var html = `<div id="wrap">
            <div id="content"></div>
        </div>
        <div id="menu">
            <div class="button"></div>
            <div class="rollout hidden"></div>
        </div>
        <div id="overlay" class="hidden">
            <div class="content">
                <div class="text"></div>
                <div class="buttons">
                    <div class="select">
                        <input type="button" class="accept" value="Accept" />
                        <input type="button" class="cancel" value="Cancel" />
                    </div>
                    <div class="cancel">
                        <input type="button" class="cancel" value="Close" />
                    </div>
                </div>
            </div>
        </div>
        <div id="gallery" class="hidden">
            <div class="content">
                <div class="image"></div>
                <div class="subs"></div>
            </div>
        </div>
        <div id="errors"></div>
        <div id="push"></div>
        `;
        $("body").append(html);

        // Bind standard events



        // Overlay
        $("#overlay div.content div.buttons input").on('click', function(){
            var suc = $(this).val() === 'Accept';
            Jasmop.Overlay.close(suc);
        });
        $("#overlay").on('click', function(){
            Jasmop.Overlay.close(false);
        });
        $("#overlay > *").on('click', function(event){
            event.stopImmediatePropagation();
        });

        // Gallery
        $("#gallery").on('click', function(){
            Jasmop.Gallery.close();
        });
        $("#gallery div.image").on('click', function(event){
            event.stopImmediatePropagation();
            Jasmop.Gallery.advance();
        });
        


        // Menu
        $("#menu > div.button").on('click', function(){
            $("#menu > div.rollout").toggleClass('hidden');
            Jasmop.Menu.onToggle(!$("#menu > div.rollout").hasClass('hidden'));
        });
        
        if(!noPageLoad){

            // https://such-nom.com/?p=recipe%2F9
            if(Jasmop.dontUseHash){
                Jasmop.Page.set('index');
            }
            else if(Jasmop.Tools.getQueryString('p')){
                window.location = '/#!/'+Jasmop.Tools.getQueryString('p');
            }
            else if(!Jasmop.Page.loadByHash()){
                Jasmop.Page.set('index');
            }
        }

        if(!Jasmop.dontUseHash){
            $(window).on('hashchange', function(){
                if(!Jasmop.ignoreHashchange){
                    Jasmop.Page.loadByHash();
                }else{
                    Jasmop.ignoreHashchange = false;
                }
            });
        }

    };

    Jasmop.saveLS = function(){
        localStorage.JASMOP = JSON.stringify(Jasmop.LS);
    };

})();







// Jasmop.Menu
(function(){

    Jasmop.Menu = {
        onToggle : function(visible){}, 
        set : function(html){
            $("#menu > div.rollout").html(html);
        },
        setButton : function(html){
            $("#menu > div.button").html(html);
        },
        close : function(){
            $("#menu > div.rollout").toggleClass('hidden', true);
        }
    };
})();






// Errors
(function(){
    "use strict";
    

    Jasmop.Errors = {
        config:{
            // Lets you set a custom class before removing.
            classOnRemove : '',
            delayRemove : 0
        }
    };

    Jasmop.Errors.onClick = function(){};           // this = element clicked
    Jasmop.Errors.onAdd = function(errors, isNotice){};

    Jasmop.Errors.addErrors = function(errors){
        Jasmop.Errors.handle(errors);
    };
    Jasmop.Errors.addNotices = function(notices){
        Jasmop.Errors.handle(notices, true);
    };

    Jasmop.Errors.handle = function(input, isNotice){
        if(!input){return;}
        if(input.constructor !== Array){
            input = [input];
        }

        var cname = 'error';
        if(isNotice){cname = 'notice';}
        for(var i=0; i<input.length; ++i){
            $("#errors").append('<div class="'+cname+'">'+input[i]+'</div>');
        }

        Jasmop.Errors.onAdd(input, isNotice);

        $("#errors div").off('click').on('click', function(){

            Jasmop.Errors.onClick.call(this);
            if(Jasmop.Errors.config.classOnRemove && Jasmop.Errors.config.delayRemove){
                $(this).toggleClass(Jasmop.Errors.config.classOnRemove, true).off('click');
                var el = $(this);
                setTimeout(function(){
                    el.remove();
                }, Jasmop.Errors.config.delayRemove);
                return;
            }

            $(this).remove();

        });
    };



})();




// Opengraph
(function(){
    Jasmop.Opengraph = {};
    Jasmop.Opengraph.defaults = {};
    Jasmop.Opengraph.current = {};

    Jasmop.Opengraph.ini = function(){

        // Required by opengraph standards
        Jasmop.Opengraph.defaults = {
            title : $('head title').text(),
            type : "website",
            url : window.location.href,
            image : ''
        };
        
        // Load from existing opengraph
        $("head meta[property][content]").each(function(){
            var prop = $(this).attr('property'), content = $(this).attr('content');
            if(prop.substr(0,3).toLowerCase() !== 'og:'){
                return;
            }          

            var type = prop.substr(3).toLowerCase();
            Jasmop.Opengraph.defaults[type] = content;
        });

        Jasmop.Opengraph.reset();
    };

    Jasmop.Opengraph.refresh = function(){
        // Remove current
        $("head meta[property][content]").each(function(){
            var prop = $(this).attr('property'), content = $(this).attr('content');
            if(prop.substr(0,3).toLowerCase() !== 'og:'){
                return;
            }
            var type = prop.substr(3).toLowerCase();
            $(this).remove();
        });
        // Insert new
        for(var i in Jasmop.Opengraph.defaults){
            var val = Jasmop.Opengraph.defaults[i];
            if(Jasmop.Opengraph.current.hasOwnProperty(i)){
                val = Jasmop.Opengraph.current[i];
            }
            $("head").append('<meta property="og:'+i+'" content="'+Jasmop.Tools.htmlspecialchars(val)+'" />');
        }
    };

    Jasmop.Opengraph.setDefaults = function(params){
        Jasmop.Opengraph.defaults = params;
        Jasmop.Opengraph.refresh();
    };

    Jasmop.Opengraph.override = function(params){
        Jasmop.Opengraph.current = params;
        Jasmop.Opengraph.refresh();
    };

    Jasmop.Opengraph.reset = function(){
        if(Jasmop.Opengraph.current === Jasmop.Opengraph.defaults){return;}
        Jasmop.Opengraph.current = Jasmop.Opengraph.defaults;
        Jasmop.Opengraph.refresh();
    };

})();




// Jasmop.Page / nav
(function(){
    

    // Root definition
    Jasmop.Page = function(){

        
        this.id = '';
        this.need_ajax_data = false;                    // If true, will attempt an ajax fetch first

        // Received from header vars
        this.args = [];
        // Data received from AJAX
        this.ajaxData = [];
        // Stored within localstorage
        this.ls = {};


        // All except onLoaded can return promises
        this.onPreload = function(){};
        this.onLoaded = function(){};
        this.onUnload = function(){};
        this.onLeave = false;               // Replace with a function to be ran before the page is left (either via JASMOP or closing the tab/browser). Return TRUE to allow leave.

        this.getPermaLink = function(){
            var arr = [this.id].concat(this.args);
            return window.location.protocol + '//' + window.location.host + '/?p='+encodeURIComponent(arr.join('/'));
        };

        // Get argument page was loaded from by index
        this.getArg = function(index){
            if(this.args.length > index){
                return this.args[index];
            }
            return false;
        };

        // Sets a localstorage value
        this.setLS = function(index, value){
            this.ls[index] = value;
            Jasmop.LS.pages[this.id] = this.ls;
            Jasmop.saveLS();
        };

        // Saves the current ls value
        this.saveLS = function(){
            Jasmop.LS.pages[this.id] = this.ls;
            Jasmop.saveLS();
        };

        // Sets the content of the page
        this.setContent = function(html){
            $("#content").html(html);
        };

    };

    

    // Static vars
    Jasmop.Page.lib = [];

    // Events
    Jasmop.Page.events = {
        pagechange : []          // Raised after a page has changed
    };     
    


    // Bind an event
    // Supported:
    /*
        pagechange
    */
    Jasmop.Page.on = function(evt, fn){
        evt = evt.toLowerCase();
        if(Jasmop.Page.events.hasOwnProperty(evt)){
            Jasmop.Page.events[evt].push(fn);
            return true;
        }
        console.error("Event not supported", evt);
        return false;
    }; 

    // Unbinds all events of a type
    Jasmop.Page.off = function(evt){
        if(Jasmop.Page.events.hasOwnProperty(evt)){
            Jasmop.Page.events[evt] = [];
            return true;
        }
        console.error("Event not supported", evt);
        return false;
    };

    Jasmop.Page.fireEvent = function(evt){
        if(Jasmop.Page.events.hasOwnProperty(evt)){
            for(var i =0; i<Jasmop.Page.events[evt].length; ++i){
                Jasmop.Page.events[evt][i].call();
            }
        }
    };
    
    
    // Static methods
    // Sets a hash without changing the page
    Jasmop.Page.setHash = function(hash){
        if(Jasmop.dontUseHash){return;}
        Jasmop.ignoreHashchange = true;
        window.location.hash = hash;
    };
    
    Jasmop.Page.loadByHash = function(hash){

        if(!hash){
            hash = window.location.hash;
        }
        
        if(hash === Jasmop.hashcache || Jasmop.dontUseHash){
            return false;
        }

        if(hash.charAt(0) === '#'){
            hash = hash.substr(1);
        }

        var data = hash.split('/');
        
        // Trim off hashbang
        if(data.length && data[0] === '!'){
            data.shift();
        }
        
        var page = data.shift();
        var args = [];
        for(var i=0; i<data.length; ++i){
            args.push(decodeURIComponent(data[i]));
        }
        if(!page){
            page = 'index';
        }
        return Jasmop.Page.set(page, args);
    };

    // Returns a hash
    Jasmop.Page.buildHash = function(page, args){
        if(args === undefined){args = [];}
        if(args.constructor !== Array){args = [args];}

        var hash = [encodeURIComponent(page)];
        for(i = 0; i<args.length; ++i){
            hash.push(encodeURIComponent(args[i]));
        }
        return "#!/"+hash.join('/');
    };

    Jasmop.Page.refresh = function(){
        Jasmop.Page.set(Jasmop.active_page.id, Jasmop.active_page.args);
    };


    // Sets the active page
    Jasmop.Page.set = function(id, args){
        var i,
            hash = '',
            p = Jasmop.Page.get(id)
        ;

        // Page missing from DB
        if(p === false){
            Jasmop.Errors.addErrors("Page not found");
            return false;
        }

        // Check if we can leave
        if(Jasmop.active_page !== null && Jasmop.active_page.onLeave){
            if(!Jasmop.active_page.onLeave()){
                if(!confirm('Are you sure you want to leave? Changes will not be saved')){
                    return false;
                }
            }
        }

        if(args === undefined){args = [];}

        if(!Jasmop.dontUseHash){
            hash = Jasmop.Page.buildHash(id, args);
            Jasmop.hashcache = hash;
            window.location.hash = Jasmop.hashcache;
        }

        p.args = args;

        // Close overlay except on refresh
        if(Jasmop.active_page !== null && Jasmop.active_page.id !== p.id){
            Jasmop.Overlay.close();
        }

        // Unload active page
        new Promise(function(res){
            if(Jasmop.active_page !== null){
                var call = Jasmop.active_page.onUnload();
                if(typeof call === "object" && call.constructor === Promise){
                    call.then(function(){
                        res();
                    });
                }
                else{
                    res();
                } 
            }
            else{
                res();
            }
        })

        // Reset opengraph. Load new page
        .then(function(){
            // Fetch from ajax
            return new Promise(function(res){

                Jasmop.Opengraph.reset();
                if(!p.need_ajax_data){
                    res();
                    return;
                }
                var call = new Jasmop.Ajax('GetPageData', [p.id, p.args]).then(function(th){
                    if(th.success){
                        p.ajaxData = th.response.vars;
                    }
                    res();
                });
            });
        })

        // Activate page
        .then(function(){

            return new Promise(function(res){

                // Load LS
                p.ls = Jasmop.LS.pages[p.id] || {};

                var call = p.onPreload();
                if(typeof call === "object" && call.constructor === Promise){
                    call.then(function(){
                        res();
                    });
                }
                else{
                    res();
                } 
            });

        })

        // Finish up
        .then(function(){
            $("#wrap").attr('data-page', p.id);
            Jasmop.active_page = p;
            $(window).off('beforeunload');
            if(p.onLeave){
                $(window).on('beforeunload', function(e){
                    if(p.onLeave()){e = null;}
                    else{ return true; }
                });
            }
            p.onLoaded();
            Jasmop.Page.fireEvent('pagechange');
        });

        return true;
    };


    // Gets a page by id
    Jasmop.Page.get = function(id){
        for(var i =0; i<Jasmop.Page.lib.length; ++i){
            if(Jasmop.Page.lib[i].id === id){
                return Jasmop.Page.lib[i];
            }
        }
        return false;
    };

    // Adds a new page
    Jasmop.Page.add = function(page){
        Jasmop.Page.lib.push(page);
    };

})();



// Jasmop.Overlay
(function(){
    "use strict";

    Jasmop.Overlay = {

        // These can be overriden by your app. They are raised every time an overlay is opened or closed
        onGenericOpen : function(){},
        onGenericClose : function(){},

        set : function(html, isConfirm, onClose){
            Jasmop.Overlay.onClose = onClose;
            $("#overlay div.content div.text").html(html);
            $("#overlay div.content div.buttons div.select").toggleClass('hidden', !isConfirm);
            $("#overlay div.content div.buttons div.cancel").toggleClass('hidden', Boolean(isConfirm)); 
            
            $("#overlay").toggleClass('hidden', false);
            Jasmop.Overlay.onGenericOpen();
        },
        
        // Closes the overlay. Success is true only if last set was a confirm and it confirmed properly 
        close : function(success){
            // not open
            if($("#overlay").hasClass('hidden')){
                return;
            }

            if(typeof Jasmop.Overlay.onClose === "function"){
                Jasmop.Overlay.onClose();
                Jasmop.Overlay.onClose = null;
            }
            $("#overlay").toggleClass('hidden', true);
            Jasmop.Overlay.onGenericClose();
        },

        // Success is only set if isConfirm
        onClose : function(success){}
    };

})();




// Jasmop.Gallery
(function(){
    "use strict";

    

    Jasmop.Gallery = {

        pointer : -1,
        images : [],
        Image : function(url, thumb, alt, isHTML){
            this.url = url;
            this.thumb = thumb;
            this.altText = alt || '';
            this.isHTML = isHTML;
        },
        onOpen : function(){},
        onClose : function(){},
        onAdvance : function(){},

        set : function(images, startFrom){
            Jasmop.Gallery.images = images;
            if(!Jasmop.Gallery.images.length){return;}
            Jasmop.Gallery.pointer = startFrom === undefined ? -1 : startFrom-1;

            var subs = '';
            for(var i=0; i<Jasmop.Gallery.images.length; ++i){
                subs += '<div class="sub" style="background-image:url('+Jasmop.Gallery.images[i].thumb+')" />';
            }

            $("#gallery div.content div.subs").html(subs);

            Jasmop.Gallery.onOpen();

            Jasmop.Gallery.advance(false, false);
            

            // Bind subs
            $("#gallery div.sub").on('click', function(event){
                event.stopImmediatePropagation();
                var index = $(this).index();
                Jasmop.Gallery.pointer = index-1;
                Jasmop.Gallery.advance();
            });

        },

        advance : function(backwards, ignoreEvent){
            // Advance pointer
            if(backwards){--Jasmop.Gallery.pointer;}
            else{++Jasmop.Gallery.pointer;}

            if(!ignoreEvent){
                Jasmop.Gallery.onAdvance();
            }

            // Get the image
            if(Jasmop.Gallery.pointer >= Jasmop.Gallery.images.length){Jasmop.Gallery.pointer = 0;}
            else if(Jasmop.Gallery.pointer < 0){Jasmop.Gallery.pointer = Jasmop.Gallery.images.length-1;}
            
            var image = Jasmop.Gallery.images[Jasmop.Gallery.pointer];

            $("#gallery div.sub").toggleClass('selected', false);
            $("#gallery div.sub:nth-child("+(Jasmop.Gallery.pointer+1)+")").toggleClass('selected', true);
            
            var html = '<img src="'+image.url+'" alt="'+image.altText+'" />';
            if(image.isHTML){
                html = image.url;
            }

            $("#gallery div.content div.image").html(html);
            $("#gallery").toggleClass('hidden', false);
        },
        
        // Closes the overlay. Success is true only if last set was a confirm and it confirmed properly 
        close : function(){
            if($("#gallery").hasClass('hidden')){
                return;
            }
            
            $("#gallery").toggleClass('hidden', true);
            $("#gallery div.content div.image").html('');
            Jasmop.Gallery.onClose();
        },
    };

})();



// Jasmop.Pajax / Jasmop.Ajax
(function(){
    "use strict";

    // Usage
    // new Jasmop.Ajax(task, args, form, response);
    // returns a promise
    Jasmop.Pajax = {
        csrf : '',
        url : 'ajax.php',
        onError : function(err, notices){ 
            if(err){Jasmop.Errors.addErrors(err);} 
            if(notices){Jasmop.Errors.addNotices(notices);}
        },
        onSuccesses : [],

        // Init function
        ini : function(url, csrf, onSuccesses){
            if(url){Jasmop.Pajax.url = url;}
            if(csrf){Jasmop.Pajax.csrf = csrf;}
            if(onSuccesses){
                if(onSuccesses.constructor !== Array){onSuccesses = [onSuccesses];}
                Jasmop.Pajax.onSuccesses = onSuccesses;
            }
        },

        // Call subobject
        Call : function(task, data, form, callback){
            var me = this;
                
            // Conf
            this.task = task;
            this.data = data || [];
            this.form = form || false;
            this.callback = callback;
                
            // If this is not a form data object, convert it to one by using jquery
            if(this.form){
                this.form = $(form).serializeObject();
            }
            else{
                this.form = {};
            }

            if(this.data.constructor !== Array){
                this.data = [this.data];
            }
            
            // Auto
            this.response = {};
            this.time = Date.now();		// Timestamp 
            this.success = false;
            this.promise = null;
            
            this.form._AJAX_DATA = this.data;
            this.form._AJAX_TASK = this.task;
            
            this.promise = new Promise(function(suc, fail){
                $.ajax({
                    url:Jasmop.Pajax.url+"?csrf="+Jasmop.Pajax.csrf,
                    data:JSON.stringify(me.form),
                    processData: false,
                    contentType: 'application/json',
                    type:'POST'
                })
                .done(function(d){
                    me.response = d;
                    // Failed response
                    if(!d.hasOwnProperty("succ")){
                        console.error("Ajax SYNTAX ERROR", d); 
                        return;
                    }
                        
                    // Successful response
                    if(d.succ){me.success = true;}
                    else{console.error("Ajax unsuccessful", me);}
                            
                    // Handle errors and notices
                    if(d.err.length){
                        Jasmop.Errors.addErrors(d.err);
                    }
                    if(d.note.length){
                        Jasmop.Errors.addNotices(d.note);
                    }
                        
                    // Auto redirect
                    if(d.redir){
                            
                        var url = d.redir;
                            
                        if(typeof url !== "string" && url.length>1){
                            url = url[0];
                                
                            // Open in blank window
                            if(url[1]){
                                window.open(url, '_blank');
                                return;
                            }
                        }
                            
                        window.location = d.redir;
                        return;
                    }
                })
                .fail(function(data){console.error("AJAX connection error: ", data);})
                .always(function(data){
                    
                    var vars = {};
                    if(me.response.vars){
                        vars = me.response.vars;
                    }
                        
                    // Always callback
                    if(me.callback !== undefined){
                        callback.call(me, vars);
                    }
                        
                    // Run additional callbacks
                    for(var i = 0; i<Jasmop.Pajax.onSuccesses.length; i++){
                        Jasmop.Pajax.onSuccesses[i].call(me, vars);
                    }
                        
                    suc.call(me, me);
                });
            });
            return this.promise;
        }
    };

    // Macro for quick calls
    Jasmop.Ajax = Jasmop.Pajax.Call;



})();




// Jasmop.DB5 root class
(function(){
    "use strict";

    Jasmop.DB5 = class{
        constructor(data){
            this.id = 0;
        }

        load(data){
            if(!data){return this;}
            for(var i in data){
                if(this.hasOwnProperty(i)){
                    this[i] = data[i];
                }
            }
            this.onLoaded();
            return this;
        }

        // Overwritable methods
        onLoaded(){}

        static convertArray(input){
            var i, out = [];
            for(i=0; i<input.length; ++i){
                out.push(new this(input[i]));
            }
            return out;
        }

    };

    

})();



// Serviceworker handler
(function(){
    "use strict";

    Jasmop.Serviceworker = {};
    Jasmop.Serviceworker.worker = null;
    Jasmop.Serviceworker.conf = {
        onMessage : function(){},
        onLoad : [],
        loaded : false
    };
    

    Jasmop.Serviceworker.ini = function(url, conf){
        url = url || '/serviceworker.js';

        if(conf){
            Jasmop.Serviceworker.conf = conf;
        }

        

        
        return new Promise(function(res, rej){


            if('serviceWorker' in navigator && 'PushManager' in window){

                new Promise(function(done){

                    navigator.serviceWorker.register(url, {scope:'/'}).then(function(reg){
                        Jasmop.Serviceworker.worker = reg;
                        return navigator.serviceWorker.ready;
                    }).then(function(){
                        done();
                    });

                })
                .then(function(){
            
                    // Load finished
                    Jasmop.Serviceworker.conf.loaded = true;
                    navigator.serviceWorker.addEventListener('message', Jasmop.Serviceworker.onMessage);
                    
                    while(Jasmop.Serviceworker.conf.onLoad.length){
                        Jasmop.Serviceworker.conf.onLoad.shift().call();
                    }

                    res();

                });

            }
            else{
                console.error('Serviceworkers are not supported by this browser');
                rej();
            }

        });

    };


    Jasmop.Serviceworker.bindOnLoad = function(fn){
        if(Jasmop.Serviceworker.conf.loaded){
            return fn.call();
        }
        Jasmop.Serviceworker.conf.onLoad.push(fn);
    };


    // onMessage can retutrn exactly false to prevent default actions
    /*
        Default actions:
        nav : (str)url - Changes the URL
        hash : (str)hash - Updates hash & navigates
    */
    Jasmop.Serviceworker.onMessage = function(data){
        var d = data.data, response = {};

        if(!Jasmop.Serviceworker.conf.onMessage || Jasmop.Serviceworker.conf.onMessage(d) !== false){
            
            // Not blocked, do something with the data
            if('nav' in d){window.location = d.nav;}
            if('hash' in d){window.location.hash = d.hash;}

            if(d.hasOwnProperty('firebase-messaging-msg-data')){
                Jasmop.Firebase.handlePushReceived(d['firebase-messaging-msg-data'].data);
                return;
            }
            //console.log(d);

        }

        if(event.ports.length){
            event.ports[0].postMessage(response);
        }
    };

    Jasmop.Serviceworker.sendMessage = function(task, args){

        return new Promise(function(resolve, reject){
            // Create a Message Channel
            var msg_chan = new MessageChannel();

            // Handler for recieving message reply from service worker
            msg_chan.port1.onmessage = function(event){
                if(event.data.error){
                    reject(event.data.error);
                }else{
                    resolve(event.data);
                }
            };

            // Send message to service worker along with port for reply
            navigator.serviceWorker.controller.postMessage({task:task, args:args}, [msg_chan.port2]);

        });

    };

})();




// Google firebase (push)
(function(){

    Jasmop.Firebase = {
        messaging : null,               // Firebase messaging
        onKeyChange : function(){},      // Raised when a user's push key changes. Send to database.
        onPushReceived: function(data){ console.log("Push message received", data); },
        onPushClosed :  function(data){},
        onPushClicked : function(data){},       // 
    };



    Jasmop.Firebase.ini = function(onKeyChange){

        if(!window.firebase){
            console.error("You first need to add firebase to your index file. Just go to your firebase overview and click 'Add firebase to your web app'");
            return;
        }
        if(!Jasmop.Serviceworker.worker){
            console.error("Serviceworker not installed. Use Jasmop.Serviceworker.ini().then(initializeHere)");
            return;
        }

        // Initialize firebase
        var messaging = firebase.messaging();

        // Handle key change (send the key to server to be stored alongside the active user)
        Jasmop.Firebase.onKeyChange = onKeyChange;
        // Messaging object
        Jasmop.Firebase.messaging = messaging;


        // Use our active worker
        messaging.useServiceWorker(Jasmop.Serviceworker.worker);

        // Request permissions to send messages (shows a popup in the browser)
        messaging.requestPermission()
        // Hokay, user wants to receive push notifications
        .then(function() {
            // Now we need to get a token to send notifications to
            messaging.getToken()
            // Woot, we got the token
            .then(function(currentToken) {
                if (currentToken) {
                    // We got the token and now need to put it on the server! Handle this in your local install.
                    Jasmop.Firebase.onTokenRetrieved(currentToken);
                } else {
                    // Show permission request.
                    console.log('No Instance ID token available. This should not happen since we handle permissions BEFORE trying this');
                }
            })
            // Dammit google
            .catch(function(err) {
                console.log('An error occurred while retrieving token. ', err);
            });
        })
        // User didn't want to receive push notifications. Oh well. Not much we can do about it.
        .catch(function(err) {
            console.log('Unable to get permission to notify.', err);
        });

        // Token has changed, we should let the server know
        messaging.onTokenRefresh(function() {
            messaging.getToken()
            // Send to our server
            .then(function(refreshedToken) {
                Jasmop.Firebase.onTokenRetrieved(refreshedToken);
            })
            // Dammit google
            .catch(function(err) {
                console.log('Unable to retrieve refreshed token ', err);
            });
        });

        messaging.onMessage = function(payload){
            console.log("Foreground message received: ", payload);
        };
    };


    Jasmop.Firebase.handlePushReceived = function(data){
        if(Jasmop.Firebase.onPushReceived(data) === false){return;}       // Your app can return false to prevent the default action

        // Open
        var href = document.createElement('a');
        href.href = data.page;

        var body = data.body;
        if(body.length > 256){
            body = body.substr(0,253)+'...';
        }

        var html = '<div class="notification" style="background-image:url('+data.icon+')" data-href="'+href.hash+'">'+
            '<div class="close">X</div>'+
            '<div class="content">'+
                '<strong class="title">'+Jasmop.Tools.htmlspecialchars(data.title)+'</strong>'+
                '<em class="body">'+Jasmop.Tools.htmlspecialchars(body)+'</em>'+
            '</div>'+
        '</div>';
        $("#push").append(html);

        $("#push div[data-href] div.close").on('click', function(event){
            event.stopImmediatePropagation();
            $(this).parent().remove();
            Jasmop.Firebase.onPushClicked(data);
            Jasmop.Firebase.onPushClosed(data);
            Jasmop.Firebase.updateNumNotifications();
        });
        $("#push div[data-href]").off('click').on('click', function(){
            Jasmop.Page.loadByHash($(this).attr('data-href'));
            $(this).remove();
            Jasmop.Firebase.onPushClosed(data);
            Jasmop.Firebase.updateNumNotifications();
        });

        Jasmop.Firebase.updateNumNotifications();

    };

    Jasmop.Firebase.updateNumNotifications = function(){
        // Update title
        var title = $('head title').html();
        if(title.charAt(0) === '['){
            title = title.substr(title.indexOf('] ')+1);
        }
        var n = $("#push > div[data-href]").length;
        if(n){
            title = '['+$("#push > div[data-href]").length+'] '+title;
        }
        $("head title").html(title);
    };

    // Token has been fetched
    Jasmop.Firebase.onTokenRetrieved = function(token){
        Jasmop.Firebase.onKeyChange(token);
    };

})();




// Socket.io
(function(){

    Jasmop.Socket = {};
    Jasmop.Socket.IO = null;
    Jasmop.Socket.ini = function(){
        Jasmop.Socket.IO = io.apply(this, arguments);
    };
    Jasmop.Socket.on = function(evt, fn){
        Jasmop.Socket.IO.on(evt, fn);
    };
    Jasmop.Socket.emit = function(evt, data){
        Jasmop.Socket.IO.emit(evt, data);
    };

})();



// Tools
(function(){
    Jasmop.Tools = {};
    
    Jasmop.Tools.htmlspecialchars = function(input){
        var entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#x60;'
        };
        return String(input).replace(/[&<>"'`]/g, function (s) {
            return entityMap[s];
        });
    };


    Jasmop.Tools.getCookie = function(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for(var i = 0; i <ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    // Returns a hrefs of pages.
    // Args of "__SF__" will be replaced with the startfrom value
    Jasmop.Tools.paginate = function(page, args, currentPage, ppp, total){

        // Todo: Pagination
        var pages = [];
        var first = currentPage/ppp-Math.floor(Jasmop.Tools.paginate.MAX_BUTTONS/2);
        if(first < 0){
            first = 0;
        }
        for(var i=0; i<first+Jasmop.Tools.paginate.MAX_BUTTONS && i*ppp<total; ++i){
            pages.push('<a class="'+(currentPage >= i*ppp && currentPage < i*ppp+ppp ? 'cur': '')+'" href="'+Jasmop.Tools.paginate.generateHash(page, args, i*ppp)+'">'+(i+1)+'</a>');
        }
        
        var p = Math.floor(currentPage/ppp)*ppp;
        
        // Go back
        pages.unshift('<a href="'+Jasmop.Tools.paginate.generateHash(page, args, (p > 0 ? p-ppp : 0))+'">&lsaquo;</a>');
        

        // Not last page
        pages.push('<a href="'+
            Jasmop.Tools.paginate.generateHash(page, args, 
                (
                    p < Math.floor(total/ppp)*ppp ? // page is not the final page
                    p+ppp : 
                    Math.floor(total/ppp)*ppp
                )
            )+
        '">&rsaquo;</a>');
        

        return '<div class="jasmop_pagination">'+pages.join('')+'</div>';

    };
    // Complimentary function for above, replaces __SF__ with val 
    Jasmop.Tools.paginate.generateHash = function(page, arr, val){
        var a = arr.slice();
        for(var x =0; x<a.length; ++x){
            if(a[x] === '__SF__'){
                a[x] = val;
            }
        }
        return Jasmop.Page.buildHash(page, a);
    };
    Jasmop.Tools.paginate.MAX_BUTTONS = 9;



    // Fetches from window query string. From Andy E @ stackoverflow
    Jasmop.Tools.getQueryString = function(field, from){

        var urlParams;


        var match,
            pl     = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
            query  = from || window.location.search;
        
        if(query.substr(0,1) === '?'){
            query = query.substring(1);
        }

        urlParams = {};
        while((match = search.exec(query)) !== null){
            urlParams[decode(match[1])] = decode(match[2]);
        }

        if(urlParams.hasOwnProperty(field)){
            return urlParams[field];
        }
        return false;
    };

    Jasmop.Tools.array_replace = function(search, replace, subject){
        for(var i =0; i<subject.length; ++i){
            if(subject[i] === search)
                subject[i] = replace;
        }
    };

    // Generates a more readable time
    Jasmop.Tools.fuzzy_time = function(seconds){
        var formats = [
            {t:"year", n:3600*24*365},
            {t:"month", n:3600*24*30},
            {t:"week", n:3600*24*7},
            {t:"day", n:3600*24},
            {t:"hour", n:3600},
            {t:"minute", n:60},
            {t:"second", n:0}
        ];
        for(var i =0; i<formats.length; ++i){
            if(seconds >= formats[i].n){
                var d = Math.floor(seconds/formats[i].n);
                return d+' '+formats[i].t+(d > 1 ? 's':'');
            }
        }
        return '';
    };

    Jasmop.Tools.array_shuffle = function(a) {
        for(let i = a.length; i; i--) {
            let j = Math.floor(Math.random() * i);
            [a[i - 1], a[j]] = [a[j], a[i - 1]];
        }
    };

    Jasmop.Tools.copyTextToClipboard = function(text) {
        // By Dean Taylor @ Stackoverflow
        var textArea = document.createElement("textarea");
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = 0;
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();

        var success = false;
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            success = true;    
        } catch (err) {
            success = false;
        }
        document.body.removeChild(textArea);
        return success;
    };

})();
