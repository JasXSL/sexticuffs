class AIChat{
    
    constructor(character){

        this.character = character;
        this.lastMessage = 0;               // Last output message
        

    }

    get(event, text, attacker, victim, ability){

        // limit to every 10 seconds 
        if(this.lastMessage+10000 > Date.now())
            return;

        if(Math.random() > this.character.social/100)
            return;
        
        
        
        // fetch messages
        var messages = [];
        for(var i =0; i<AIChat.LIB.length; ++i){

            var asset = AIChat.LIB[i];
            
            if(~AIChat.sent_messages.indexOf(asset))
                continue;

            // Not this event
            if(asset.event !== event)
                continue;

            // Not the right event
            if(asset.charname && asset.charname !== this.character.name)
                continue;

            // Not the right race
            if(asset.race && asset.race !== this.character.race.id)
                continue;

            // Ait mismatch (AI-Tags)
            if(!this.validateAit(text, asset.ait))
                continue;

            // Here we have to validate the text itself
            var myText = asset.text;
            if(!asset.text.validate(attacker, victim, ability, true, false))
                continue;            
            
            messages.push(asset);
        }

        if(messages.length){
            
            this.lastMessage = Date.now();
            var txt = messages[Math.floor(Math.random()*messages.length)];

            AIChat.sent_messages.push(txt);
            var out = txt.text.convert(attacker, victim, ability);


            AI.talk(attacker, victim, out);

            return true;

        }

        return false;

    }

    validateAit(text, ait){
        // Equivalent to a * filter
        if(!ait.length){
            return true;
        }

        for(var i =0; i<ait.length; ++i){
            var arr = ait[i];
            if(arr.constructor !== Array)
                arr = [arr];
            
            var success = true;
            for(var x = 0; x<arr.length && success; ++x){
                if(text.ait.indexOf(arr[x]) === -1){
                    success = false;
                }
            }



            if(success){
                return true;
            }
        }
        return false;
    }

}

(function(){
    "use strict";

    AIChat.Events = {
        ability : 'ability',            // The AI character has used an ability

    };

    AIChat.sent_messages = [];


    AIChat.ini = function(){
        AIChat.sent_messages = [];
    };

    AIChat.asset = class extends Asset{

        constructor(data){
            super();

            this.race = false;      // Specific race name to tie it to
            this.charname = false;  // Specific character name to tie it to
            this.ait = [];          // AI tags. Each element is a single tag or an array of tags that are ANDED. [["a", "b"], "c"]  = (a && b) || c
            this.text = new Text(); // Text object - Basic restrictions work here too
            this.event = 'ability'; // Event

            this.load(data);
        }



    };

    AIChat.LIB = [];


    var add = function(race, charname, ait, text, event){
        AIChat.LIB.push(new AIChat.asset({
            race: race || false,
            charname: charname || false,
            ait: ait || [],
            event : event || 'ability',
            text: new Text(text)
        }));
    };

    // Add to AI chat

    var ait = Text.AIT;

    // Conditional macros
        // Shortcut for building conditions
        var C = function(type, data, target){
            if(data === undefined){data = [];}
            if(data.constructor !== Array){data = [data];}
            target = target || Game.Consts.TARG_VICTIM;
            return new Condition({type:type, data:data, target:target});
        };
        var CO = Condition;
        C.FEMALE = [C(CO.TAGS, "c_vagina"), C(CO.TAGS, "c_breasts")];
        C.BREASTS = C(CO.TAGS, 'c_breasts');
        C.VAG = C(CO.TAGS, 'c_vagina');
        C.VAGINA = C.VAG;
        C.PENIS = C(CO.TAGS, 'c_penis');
        C.CLOTHED = C(CO.NOT_TAGS, 'nude');
        C.NAKED = C(CO.TAGS, 'nude');

        C.A_NAKED = C(CO.TAGS, 'nude', Game.Consts.TARG_ATTACKER);
        C.A_PENIS = C(CO.TAGS, 'c_penis', Game.Consts.TARG_ATTACKER);

        C.ARMOR_TIGHT = C(CO.TAGS, 'a_tight');
        C.ARMOR_THONG = C(CO.TAGS, 'a_thong');
    // 

    // Imp
        var race = 'imp';
        var char = false;

        // Buttslap
            var aitl = [[ait.aButt, ait.tSlap]];
            add(race, char, aitl, {conditions:[], text: 'You have a nice :BUTT:! Smack smack, hah!'});
            add(race, char, aitl, {conditions:[], text: 'Gonna spank you until you give up!'});
            add(race, char, aitl, {conditions:[], text: 'Jiggle jiggle! Nice :BUTT: you got!'});
            add(race, char, aitl, {conditions:[], text: 'Can\'t keep my hands off your nice :BUTT:!'});
            add(race, char, aitl, {conditions:[], text: 'Gonna smack that :BUTT: all night!'});
            
        // 

        // Butt hump
            aitl = [[ait.aButt, ait.tPin]];
            add(race, char, aitl, {conditions:[], text: 'Nice and tight!'});
            add(race, char, aitl, {conditions:[], text: 'Gonna ride that nice :BUTT: all night!'});
            add(race, char, aitl, {conditions:[], text: 'Just relax, it will feel better!'});
            add(race, char, aitl, {conditions:[], text: 'It\'s just a little demonic seed, it should feel good!'});
            add(race, char, aitl, {conditions:[], text: 'Hah, I make :TRACE:-butt go squish!'});
            add(race, char, aitl, {conditions:[], text: 'I like the way your :BUTT: jiggles when I do that!'});
            add(race, char, aitl, {conditions:[], text: 'I love riding a good :TRACE:-:BUTT:!'});
            add(race, char, aitl, {conditions:[], text: 'Your :TBUTT: seems to be begging for another round of that!'});
            

        // Tits
            aitl = [[ait.aBreasts]];
            add(race, char, aitl, {conditions:[], text: 'I do love me a nice pair of tits!'});
            add(race, char, aitl, {conditions:[], text: 'Breasts are so fun to toy with!'});
            add(race, char, aitl, {conditions:[], text: 'Nice tits you got there!'});
            add(race, char, aitl, {conditions:[], text: 'I really enjoy playing with your fun-bags!'});
            

            aitl = [[ait.aBreasts, ait.tTwist]];
            add(race, char, aitl, {conditions:[], text: 'Consider these nipples crippled!'});
            add(race, char, aitl, {conditions:[], text: 'Am I playing too rough? Actually, I don\'t care!'});
            

        // Cum inside
            aitl = [[ait.tPin, ait.tCumInside]];
            add(race, char, aitl, {conditions:[], text: 'Splat!'});
            add(race, char, aitl, {conditions:[], text: 'My own special frosting, just for you!'});
            add(race, char, aitl, {conditions:[], text: 'Don\'t worry, it\'s just imp cum! You may feel a short burning sensation though...'});
            add(race, char, aitl, {conditions:[], text: 'I hope that was as good for you as it was for me!'});
            add(race, char, aitl, {conditions:[], text: 'Consider it a gift!'});
            add(race, char, aitl, {conditions:[], text: 'Let\'s do that again, I\'m sure we can fill you up!'});
            add(race, char, aitl, {conditions:[], text: 'There\'s plenty more where that came from!'});
            
            
            
            

        // Butt/vag hump
            aitl = [[ait.aButt, ait.tPin], [ait.aVag, ait.tPin]];
            add(race, char, aitl, {conditions:[], text: 'I bet you enjoyed that!'});
            add(race, char, aitl, {conditions:[], text: 'I could get used to that!'});
            add(race, char, aitl, {conditions:[], text: 'Oh, let\'s do that again!'});
            add(race, char, aitl, {conditions:[], text: 'I\'m sure that felt good, wanna go again?'});
            add(race, char, aitl, {conditions:[], text: 'Gotta get your daily dose of imp cum!'});
            add(race, char, aitl, {conditions:[], text: 'Nothing wrong with a little imp inside you!'});
        



        // Mouth hump
            aitl = [[ait.aMouth, ait.tPin]];
            add(race, char, aitl, {conditions:[], text: 'Enjoy that tasty treat!'});
            add(race, char, aitl, {conditions:[], text: 'Funny aftertaste no?'});
            add(race, char, aitl, {conditions:[], text: 'Drink it all down!'});
            add(race, char, aitl, {conditions:[], text: 'Don\'t worry, it is nutritious!'});
            add(race, char, aitl, {conditions:[], text: 'I got more if you\'re still thirsty!'});
            


        // Crotch lick
            aitl = [[ait.aGroin, ait.tLick]];
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'You have such a delicious looking bulge, I couldn\'t help myself!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'Gotta give that :TRACE:-package the occasional lick!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'Can\'t wait to taste what lies underneath!'});
            
            
        // Lick generic
            aitl = [[ait.tLick]];
            add(race, char, aitl, {conditions:[C.NAKED], text: 'You\'re so tasty, I can\'t keep my tongue off!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Oh so that\'s what you taste like!'});
            
        // Butt lick
            aitl = [[ait.tLick, ait.aButt]];
            add(race, char, aitl, {conditions:[], text: 'Just lubing you up for later!'});
            add(race, char, aitl, {conditions:[], text: 'I\'m sure that felt good!'});
        
        
        // Tickle groin
            aitl = [[ait.aGroin, ait.tTickle]];
            add(race, char, aitl, {conditions:[], text: 'Tickle tickle tickle, he he!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'I bet you enjoy a little pickle tickle!'});
            add(race, char, aitl, {conditions:[], text: 'If you\'re gonna tickle, might as well do it someplace where it counts!'});
            add(race, char, aitl, {conditions:[], text: 'Oh was that your sensitive spot? Good!'});
            
        // Tickle butt
            aitl = [[ait.aButt, ait.tTickle]];
            add(race, char, aitl, {conditions:[], text: 'What, you\'re ticklish there?'});
            add(race, char, aitl, {conditions:[], text: 'Just relax, it\'s just a little tickle!'});
            add(race, char, aitl, {conditions:[], text: 'The perfect spot for a little tickle!'});
            add(race, char, aitl, {conditions:[], text: 'Feels pleasant, doesn\'t it?'});
            

        // Twang
            aitl = [[ait.tTwang]];
            add(race, char, aitl, {conditions:[], text: 'Twang!'});
            add(race, char, aitl, {conditions:[], text: 'How nice of you to wear clothes that double as a slingshot!'});
            add(race, char, aitl, {conditions:[], text: 'Snap!'});
                        

        // Generic low blows
            aitl = [[ait.aGroin, ait.tPunch], [ait.aGroin, ait.tKick], [ait.aGroin, ait.tTwist], [ait.aBreasts, ait.tPunch], [ait.aBreasts, ait.tKick], [ait.aBreasts, ait.tTwist]];
            add(race, char, aitl, {conditions:[], text: 'That looked painful!'});
            add(race, char, aitl, {conditions:[], text: 'Why not give up? It will be less painful!'});
            add(race, char, aitl, {conditions:[], text: 'Ooh, even I flinched at that!'});
            add(race, char, aitl, {conditions:[], text: 'Just gotta soften you up a bit!'});
            add(race, char, aitl, {conditions:[], text: 'Pain is a good teacher!'});
            add(race, char, aitl, {conditions:[], text: 'That\'s one soft spot softened!'});
        

        // Cock slapping
            aitl = [[ait.aGroin, ait.tSlap]];
            add(race, char, aitl, {conditions:[C.PENIS, C.NAKED], text: 'If you\'re gonna leave your :TPENIS: out and about, you should expect it to be slapped!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.NAKED], text: 'I hope you enjoy getting your :TPENIS: smacked, because it\'s bound to happen again!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.NAKED], text: 'Smack, smack, smack! That jiggle is almost hypnotic!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'You think that smartens? Just wait until I tear your clothes off and do it again!'});
            
            
        // Cock punching
            aitl = [[ait.aGroin, ait.tPunch]];
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED, C.ARMOR_TIGHT], text: 'Better keep up before I make that bulge my permanent punching bag!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED, C.ARMOR_TIGHT], text: 'If you didn\'t want your bulge punched, you should probably not have worn such tight clothing!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED, C.ARMOR_TIGHT], text: 'The best thing about your outfit is how easy it is to jab at your bulge!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'I may fight without honor, but at least I\'m not the one whose :CROTCH: is writhing in pain!'});
        
        // Foreskin
            aitl = [[ait.aGroin, ait.aForeskin]];
            add(race, char, aitl, {conditions:[C.PENIS], text: 'I do like my toys intact! It is so much fun to play with!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'That\'s the kind of parts I like to play with!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'Extra sensitive! I will make sure to take full advantage of this!'});
        
        // Facial
            aitl = [[ait.tFacial]];
            add(race, char, aitl, {conditions:[C.PENIS], text: 'A special lotion just for you! Ha ha!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'You should leave it on, I\'m sure it\'s moisturizing!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'Splat!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'Next time open up!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'My token of appreciation for you!'});
            add(race, char, aitl, {conditions:[C.PENIS], text: 'If you don\'t like it on your face I\'m sure we can put it in you next time!'});
            

        // 

    //

    // Breaker
        race = 'breakerDemon';

        // Butt hump
            aitl = [[ait.aButt, ait.tPin]];
            add(race, char, aitl, {conditions:[], text: 'Must break you!'});
            add(race, char, aitl, {conditions:[], text: 'Submit!'});
            
        // Lick generic
            aitl = [[ait.tLick]];
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Taste...good!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Feed...on you!'});

        // Mouth hump
            aitl = [[ait.aMouth, ait.tPin]];
            add(race, char, aitl, {conditions:[], text: 'Good...toy!'});
            
        // Generic low blows
            aitl = [[ait.aGroin, ait.tPunch], [ait.aGroin, ait.tKick], [ait.aGroin, ait.tTwist], [ait.aBreasts, ait.tPunch], [ait.aBreasts, ait.tKick], [ait.aBreasts, ait.tTwist]];
            add(race, char, aitl, {conditions:[], text: 'Break...you!'});
            add(race, char, aitl, {conditions:[], text: 'You...surrender!'});
            
    //


    // Succubus
        race = 'succubus';

        // Lick generic
            aitl = [[ait.tLick]];
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Oooh what a lovely taste you have!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Delicious!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'What an exquisite flavor!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'I can\'t help myself when you look so delicious!'});
            add(race, char, aitl, {conditions:[C.NAKED], text: 'Can\'t blame a girl for wanting a taste!'});

        // Whipping
            aitl = [[ait.tWhip]];
            add(race, char, aitl, {conditions:[], text: 'Naughty!'});
            add(race, char, aitl, {conditions:[C.PENIS, C(CO.NOT_TAGS, ["c_vagina", "c_breasts"])], text: 'Naughty boys need to be punished!'});
            add(race, char, aitl, {conditions:[], text: 'Aw did that hurt? Should I kiss and make better?'});
            add(race, char, aitl, {conditions:C.FEMALE, text: 'Bad girls need to be put in their place!'});
                    
        // Crotch lick
            aitl = [[ait.aGroin, ait.tLick]];
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'Seems someone has a nice package for me!'});
            add(race, char, aitl, {conditions:[C.PENIS, C.CLOTHED], text: 'That seems constrained, you should let it all out!'});

        // Top Strip
            aitl = [[ait.aBreasts, ait.aCloth]];
            add(race, char, aitl, {conditions:[C.BREASTS], text: 'You should let them out for me to play with!'});
            add(race, char, aitl, {conditions:[C.BREASTS], text: 'I can\'t wait to play with those!'});

            aitl = [[ait.aBreasts, ait.tRub]]; 
            add(race, char, aitl, {conditions:[C.BREASTS], text: 'Mmm those feel lovely!'});
        
        // Pussy rub
            aitl = [[ait.aVag, ait.tRub]];
            add(race, char, aitl, {conditions:[], text: 'Feels good, doesn\'t it?'});
        

    //

})();
