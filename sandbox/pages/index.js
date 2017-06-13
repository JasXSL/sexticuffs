(function(){
    "use strict";
    var page = new Jasmop.Page();
    Jasmop.Page.add(page);
    page.id = 'index';
    var hsc = Jasmop.Tools.htmlspecialchars;

    page.need_ajax_data = false;                    // If true, will attempt an ajax fetch first
    // All except onLoaded can return promises
    page.onPreload = function(){};

    page.free_characters = [
        'media/free_characters/dps.jpg'
    ];
    
    page.onLoaded = function(){

        page.drawSplashscreen();

    };


    page.drawSplashscreen = function(){

        Game.setMusic('maintheme');
        


        var html = '<svg class="searchlight" height="600" width="200" viewbox="0 0 200 600"><polygon points="100,400 150,50 50,50" style="fill:white;" /></svg>'+
                '<svg class="searchlight two" height="600" width="200" viewbox="0 0 200 600"><polygon points="100,400 150,50 50,50" style="fill:white;" /></svg>'+
            '<div class="splashscreen">';

            html+= '<img src="media/sxtitle.png" class="logo" />';

            html+= '<div class="border disclaimer">';
            html+= '<p>This is a completely immoral <strong>adult game</strong>. Minors and puritans beware! It\'s currently just a concept.<br /><a href="https://www.patreon.com/jasx_games">Please feed my back at patreon</a>.<br /><a href="https://github.com/JasXSL/sexticuffs">Please help develop this on github</a>.</p>';
            html+= '</div>';

            if(Game.player){
                html+= '<div class="button continue highlighted">Continue ('+hsc(Game.player.name)+')</div>';  
            }
            html+= '<div class="button newGame">New Character</div>';    
            
            if(Game.player){
                html+= '<div class="button load">Load</div>';  
            }

        html+= '</div>';


        page.setContent(html);

        $("div.splashscreen div.button.newGame").on('click', function(){
            page.drawCharacterCreator();
            Game.clickSound();
        });
        $("div.splashscreen div.button.load").on('click', function(){
            page.drawCharacterSelector();
            Game.clickSound();
        });
        $("div.splashscreen div.button.continue").on('click', function(){
            Jasmop.Page.set('home');
            Netcode.players = [Game.player];
            Game.clickSound();
        });

        Game.rebindSounds();

    };

    // Character creator subpage
    page.drawCharacterCreator = function(){
        
        Game.setMusic('chill');
        var html = '<form id="newCharacter"><div class="flex">';

                html += '<div class="charcreator border white left">';

                
                    html+= '<input type="text" name="name" placeholder="Character Name" />';
                    
                    html+= '<select name="race">';
                    for(var i =0; i<DB.Race.length; ++i){
                        if(!DB.Race[i].playable)
                            continue;
                        html+= '<option value="'+DB.Race[i].id+'">'+DB.Race[i].name_male+(DB.Race[i].name_female ? ' / '+DB.Race[i].name_female : '')+'</option>';
                    }
                    html+= '</select><br />';

                    html+= 'Affinity<br />';
                    html+= '<label><input type="radio" name="affinity" checked value="'+Ability.AffinityOffensive+'" /> Offensive</label>';
                    html+= '<label><input type="radio" name="affinity" value="'+Ability.AffinityDefensive+'" /> Defensive</label>';
                    html+= '<label><input type="radio" name="affinity" value="'+Ability.AffinitySupport+'" /> Support</label><br />';
                    
                    
                    html+= 'Description (optional):<br /><textarea name="description"></textarea><br />';

                    html+= 'Sex<br />';
                    html+= '<label><input type="checkbox" name="tags" value="c_penis" checked> Penis</label>';
                    html+= '<label><input type="checkbox" name="tags" value="c_vagina"> Vagina</label>';
                    html+= '<label><input type="checkbox" name="tags" value="c_breasts"> Breasts</label>';
                    html+= '<br />';

                    html+= 'Tags<br />';
                    html+= '<label><input type="checkbox" name="tags" value="c_uncut"> Penis Uncut</label>';


                    html+= '<br />';
                    html+= 'Pronouns (Optional):<br />';

                    html+= '<div class="pronouns">';
                        html+= '<input type="text" class="pronoun" name="pronoun0" placeholder="he" />';
                        html+= '<input type="text" class="pronoun" name="pronoun1" placeholder="him" />';
                        html+= '<input type="text" class="pronoun" name="pronoun2" placeholder="his" />';
                    html+= '</div>';

                    html+= '<br /><label>Slender <input type="range" name="strength" step=1 min=0 max=10 value=5 /> Muscular</label>';
                    html+= '<br /><label>Tiny <input type="range" name="size" step=1 min=0 max=10 value=5 /> Huge</label>';
                    
                    html+= '<br /><br />';
                    html+= 'Comma Ceparated Body Tags (fuzzy, brown, spotty...) <br /><textarea name="body_tags"></textarea><br />';

                    html+= '<input type="submit" value="Create!" />';
                    html+= '<input type="button" value="Cancel" id="cancel" />';
                html+= '</div>';

                html += '<div class="img border white right">';

                    html+= '<img class="preview" /><br /><input type="text" name="image" placeholder="Image URL" /><br />You can use a custom URL. Supports PNG/JPG and has to be HTTPS.<hr />Free character library:<br />';
                    
                    html+= '<div class="flex free">';
                    for(i = 0; i<page.free_characters.length; ++i){
                        var url = 'https://'+window.location.hostname+window.location.pathname+page.free_characters[i];
                        html+= '<div class="icon free_character button" style="background-image:url(\''+url+'\')" data-src="'+url+'" />';
                    }
                    html+= '</div>';

                html+= '</div>';

            html+= '</div></form>';
        

        page.setContent(html);

        $("#cancel").on('click', function(){
            page.drawSplashscreen();
            Game.clickSound();
        });

        console.log($("input[name=image]"));

        $("input[name=image]").on('change', function(){
            console.log("Image changed");
            var img = $(this).val().trim();
            if(!img)
                return;
            
            if(img.substr(0, 8).toLowerCase() !== 'https://'){
                Jasmop.Errors.addErrors('URL Has to be HTTPS');
                return false;
            }
            var a = document.createElement('a');
            a.href = img;
            var filetype = a.pathname.split('/').pop().split('.').pop();
            if(['jpg','jpeg','png','webp'].indexOf(filetype) === -1){
                Jasmop.Errors.addErrors('URL is not a supported image format');
                return false;
            }
            $("img.preview").attr('src', img);

        });

        $("#newCharacter").on('submit', function(){

            Game.clickSound();
            var char = new Character(),
                i;
            var name = $("[name=name]", this).val().trim();
            if(!name.length)
                name = 'Player';
            

            char.id = Math.random().toString(36).substring(2);
            char.name = name.trim();
            if(!char.name.length){
                alert('Character name cannot be empty');
                return false;
            }


            char.description = $("[name=description]", this).val().trim();
            char.image = $("[name=image]", this).val().trim();

            if(char.image.substr(0, 8).toLowerCase() !== 'https://'){
                alert("URL has to be HTTPS");
                return false;
            }
            var a = document.createElement('a');
            a.href = char.image;
            var filetype = a.pathname.split('/').pop().split('.').pop();
            if(['jpg','jpeg','png','webp'].indexOf(filetype) === -1){
                alert("URL has to end in .jpg/.png/.jpeg/webp");
                return false;
            }

            char.size = +$("[name=size]", this).val();
            char.strength = +$("[name=strength]", this).val();
            

            char.is_pc = true;
            char.tags = [];
            $("[name=tags]", this).each(function(){
                if($(this).is(':checked'))
                    char.tags.push($(this).val());
            });

            if(!char.hasAnyTag(['c_penis', 'c_vagina'])){
                char.tags.push('c_penis');
            }

            var pronouns = [];
            $("input.pronoun", this).each(function(){
                if(!$(this).val().trim().length){
                    pronouns = [];
                    return false;
                }
                pronouns.push($(this).val().trim());
            });
            char.pronouns = pronouns;
            char.race = Race.get($("[name=race]", this).val());

            $("[name=affinity]", this).each(function(){
                if($(this).is(':checked')){
                    char.affinity = $(this).val();
                    char.addAbilities(Ability.BASELINE[char.affinity]);
                    return false; // break
                }
            });
            

            var tags = $('[name=body_tags]', this).val().split(',');
            for(i =0; i<tags.length; ++i){
                var tag = tags[i].trim().toLowerCase();
                if(tags.length){
                    char.body_tags.push(tag);
                }
            }
            char.team = Character.TEAM_PC;
            
            // Default armor
            char.armorSet = Armor.get('goldenThong');
            if(char.hasAnyTag('c_breasts'))
                char.armorSet = Armor.get('goldenBikini');
            
            // Needed in order to save
            Game.player = char;
            char.save().then(function(){
                return Game.setActiveChar(char);
            }).then(function(){
                Jasmop.Page.set("home");
            });

            return false;
        });

        $("div.icon.free_character").on('mouseover', function(){
            Game.playSound('hover');
        });

        $("div.icon.free_character").on('click', function(){
            var src = $(this).attr('data-src');
            $("img.preview").attr('src', src);
            $("input[name=image]").val(src);
        });

        var all = $("div.icon.free_character");
        var elem = all[Math.floor(Math.random()*all.length)];
        $(elem).click();

        // Binds after to prevent double click sound
        $("div.icon.free_character").on('click', function(){
            Game.clickSound();
        });

        $("input[name=tags]").on('change', function(){

            var sextags = [];
            $("input[name=tags]").each(function(){
                if($(this).is(':checked')){
                    sextags.push($(this).val());
                }
            });

            var ch = new Character({tags:sextags});
            ch = ch.getPronouns();

            $("input.pronoun").eq(0).attr('placeholder', ch[0]);
            $("input.pronoun").eq(1).attr('placeholder', ch[1]);
            $("input.pronoun").eq(2).attr('placeholder', ch[2]);
            

        });

        Game.rebindSounds();

    };

    page.drawCharacterSelector = function(active){

        Game.setMusic('maintheme');

        IDB.search('characters', 'modified', true).then(function(chars){


            var all = Character.convertArray(chars);
            
            if(isNaN(active))
                active = 0;
            var activeChar = all[active];

            var html = '<div class="charselect flex">';

                html+= '<div class="left border">';
                for(var i =0; i<all.length; ++i){
                    var c = all[i];
                    html+= '<div class="character '+(i === active ? 'selected' : '')+'" data-index="'+i+'" style="background-image:url('+c.getImage()+')">';
                        html+= '<div class="black"><h3 class="name">'+hsc(c.name)+'</div></h3>';
                    html+= '</div>';
                }
                html+= '</div>';

                html+= '<div class="right border">';

                    html+= '<img class="icon" src="'+activeChar.getImage()+'" />';
                    html+= '<h2>'+hsc(activeChar.name)+'</h2>';
                    html+= '<p class="description">'+hsc(activeChar.description)+'</p>';

                    html+= '<table class="stats">';
                        html+= '<tr><td>Level:</td><td>'+activeChar.getLevel()+'</td></tr>';
                        html+= '<tr><td>Sex:</td><td>'+activeChar.getGender().toUpperCase()+'</td></tr>';
                        html+= '<tr><td>Species:</td><td>'+activeChar.race.name_male.toUpperCase()+'</td></tr>';
                        html+= '<tr><td>Affinity:</td><td>'+activeChar.affinity.toUpperCase()+'</td></tr>';
                        
                    html+= '</table>';

                    html+= '<input type="button" value="Select" id="selectCharacter" />';
                    html+= '<input type="button" value="Delete" data-id="'+activeChar.UUID+'" id="delete" />';
                    
                    html+= '<input type="button" value="Back" id="back" />';
                    
                    
                html+= '</div>';

            html+= '</div>';


            page.setContent(html);
            
            $("#selectCharacter").on('click', function(){
                Game.clickSound();
                Game.setActiveChar(activeChar).then(function(){
                    Netcode.players = [];
                    Jasmop.Page.set('home');
                });
            });

            $("#delete").on('click', function(){

                Game.clickSound();
                
                if(confirm("Really delete?")){

                    IDB.delete("characters", $(this).attr('data-id')).then(function(){
                        return IDB.search('characters', 'modified', true);
                    })
                    .then(function(chars){
                        return Game.fetchActiveChar();
                    })
                    .then(function(){

                        if(Game.player){
                            page.drawCharacterSelector();
                        }
                        else{
                            Jasmop.Page.set("index");
                        }

                    });

                }
                
            });

            $("#back").on('click', function(){
                Game.clickSound();
                page.drawSplashscreen();
            });

            $("div.character[data-index]").on('click', function(){
                Game.clickSound();
                var id = +$(this).attr('data-index');
                page.drawCharacterSelector(id);
            });
            $("div.character[data-index]").on('mouseenter', function(){
                Game.playSound('hover');
            });

            Game.rebindSounds();

        });

    };

    page.onUnload = function(){};
    page.onUserData = function(){};

})();
