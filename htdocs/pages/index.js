(function(){
    "use strict";
    var page = new Jasmop.Page();
    Jasmop.Page.add(page);
    page.id = 'index';
    var hsc = Jasmop.Tools.htmlspecialchars;

    page.need_ajax_data = false;                    // If true, will attempt an ajax fetch first
    // All except onLoaded can return promises
    page.onPreload = function(){};
    
    page.onLoaded = function(){

        page.drawSplashscreen();

    };

    page.drawSplashscreen = function(){



        var html = '<div class="splashscreen border white">';


            html+= '<h1>Super Sexticuffs!</h1>'; 
            html+= '<p>This is a completely immoral <strong>adult game</strong>. Minors and puritans beware! It\'s currently just a concept. <a href="https://patreon.com/jasx">Please feed my back at patreon</a>.</p>';

            if(Game.player){
                html+= '<div class="button continue highlighted">Continue ('+hsc(Game.player.name)+')</div>';  
            }
            html+= '<div class="button newGame">New Character</div>';    
            
            if(Game.player){
                html+= '<div class="button load">Load</div>';  
            }

        html+= '</div>';


        page.setContent(html);

        $("div.splashscreen div.button.newGame").on('click', page.drawCharacterCreator);
        $("div.splashscreen div.button.load").on('click', page.drawCharacterSelector);
        $("div.splashscreen div.button.continue").on('click', function(){
            Jasmop.Page.set('home');
        });

    };

    // Character creator subpage
    page.drawCharacterCreator = function(){
        
        var html = '<div class="charcreator border white">';

            html+= '<form id="newCharacter">';
                html+= '<input type="text" name="name" placeholder="Character Name" /><br />';
                html+= 'Image. You can copy an image URL from e621 or something. Has to be HTTPS.<br /><input type="text" name="image" placeholder="Image URL" /><br />';
                html+= 'Species: <select name="race">';
                for(var i =0; i<DB.Race.length; ++i){
                    if(!DB.Race[i].playable)
                        continue;
                    html+= '<option value="'+DB.Race[i].id+'">'+DB.Race[i].name_male+(DB.Race[i].name_female ? ' / '+DB.Race[i].name_female : '')+'</option>';
                }
                html+= '</select><br />';

                html+= 'Affinity: <br />';
                html+= '<label><input type="radio" name="affinity" checked value="'+Ability.Packages.offensive+'" /> Offensive</label>';
                html+= '<label><input type="radio" name="affinity" value="'+Ability.Packages.defensive+'" /> Defensive</label>';
                html+= '<label><input type="radio" name="affinity" value="'+Ability.Packages.support+'" /> Support</label><br />';
                
                
                html+= 'Description (optional):<br /><textarea name="description"></textarea>';

                html+= '<label><input type="checkbox" name="tags" value="c_penis" checked> Penis</label>';
                html+= '<label><input type="checkbox" name="tags" value="c_vagina"> Vagina</label>';
                html+= '<label><input type="checkbox" name="tags" value="c_breasts"> Breasts</label>';
                html+= '<br />';

                html+= 'Optional tags:';
                html+= '<label><input type="checkbox" name="tags" value="c_uncut"> Penis Uncut</label>';


                html+= '<br />';
                html+= 'Pronouns (Optional):<br /><input type="text" class="pronoun" name="pronoun0" placeholder="he/she" />';
                html+= '<input type="text" class="pronoun" name="pronoun1" placeholder="him/her" />';
                html+= '<input type="text" class="pronoun" name="pronoun2" placeholder="his/her" />';
                html+= '<br />Strength (used for RP texts): Slender <input type="range" name="strength" step=1 min=0 max=10 value=5 /> Muscular';
                html+= '<br />Size (used for RP texts): Tiny <input type="range" name="size" step=1 min=0 max=10 value=5 /> Huge';
                
                html+= '<br /><br />';
                html+= 'Body tags (color, fuzzy, shiny, scaly etc). Comma separated:<br /><textarea name="body_tags"></textarea><br />';

                html+= '<input type="submit" value="Create!" />';
                html+= '<input type="button" value="Cancel" id="cancel" />';
                

            html+= '</form>';


        html+= '</div>';

        

        page.setContent(html);

        $("#cancel").on('click', function(){
            page.drawSplashscreen();
        });

        $("#newCharacter").on('submit', function(){

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

    };

    page.drawCharacterSelector = function(active){

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
                        html+= '<tr><td>Sex:</td><td>'+activeChar.getGender().toUpperCase()+'</td></tr>';
                        html+= '<tr><td>Species:</td><td>'+activeChar.race.name_male.toUpperCase()+'</td></tr>';
                    html+= '</table>';

                    html+= '<input type="button" value="Select" id="selectCharacter" />';
                    html+= '<input type="button" value="Delete" data-id="'+activeChar.UUID+'" id="delete" /><br />';
                    
                    html+= '<input type="button" value="Back" id="back" />';
                    
                    
                html+= '</div>';

            html+= '</div>';


            page.setContent(html);

            $("#selectCharacter").on('click', function(){
                Game.setActiveChar(activeChar).then(function(){
                    Jasmop.Page.set('home');
                });
            });

            $("#delete").on('click', function(){

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
                page.drawSplashscreen();
            });

            $("div.character[data-index]").on('click', function(){
                var id = +$(this).attr('data-index');
                page.drawCharacterSelector(id);
            });

        });

        


    };

    page.onUnload = function(){};
    page.onUserData = function(){};

})();
