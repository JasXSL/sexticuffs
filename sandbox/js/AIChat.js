/*

    AIChat will tap into certain events (currently ability use) and output a chat for an AI player if available
    On battle start, AIChat is reset, and each NPC is assigned an AIChat object

*/
class AIChat{
    

    constructor(character){

        this.character = character;
        this.lastMessage = 0;               // Last output message

    }

    // Get a random text
    get(event, text, attacker, victim, ability){


        // limit to every 10 seconds 
        if(this.lastMessage+10000 > Date.now())
            return;

        if(Math.random() > this.character.social/100)
            return;
        
        
        
        // fetch messages
        let messages = [];
        for(let asset of AIChat.LIB){

            // This message is already sent
            if(~AIChat.sent_messages.indexOf(asset))
                continue;

            // Not this event
            if(asset.event !== event)
                continue;
            
            // Attacker or victim is wrong
            if(
                (asset.attacker && attacker !== this.character) ||
                (!asset.attacker && victim !== this.character)
            )
                continue;

            // Not the right character name
            if(asset.charname && asset.charname !== this.character.id)
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
            let txt = messages[Math.floor(Math.random()*messages.length)];

            AIChat.sent_messages.push(txt);
            let out = txt.text.convert(attacker, victim, ability);


            AI.talk(attacker, victim, out, txt.attacker);

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



    // Prepares
    static ini(){
        return new Promise(function(res){

            // Events AI Chat can listen to
            AIChat.Events = {
                ability : 'ability',                // The AI character has used an ability
                charged : 'charged',                // The AI character has charged an ability
            };

            // Messages sent
            AIChat.sent_messages = [];

            // Library data
            AIChat.LIB = [];

            AIChat.build();
            res();

        });
    }

    static reset(){
        AIChat.sent_messages = [];
    }

    // Builds the texts
    static build(){

        let add = function(race, charname, ait, text, event, victim){
            
            AIChat.LIB.push(new AIChat.asset({
                race: race || false,
                charname: charname || false,
                ait: ait || [],
                event : event || 'ability',
                text: new Text(text),
                attacker : victim ? false : true
            }));

        };

        // Add to AI chat

        let ait = Text.AIT;



        

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

        // TUTORIAL : challenger
            aitl = [[ait.aButt, ait.tSlap]];
            add(false, "challenger", aitl, {conditions:[], text: 'Smack!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Watch your back... hehehe!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Hey! You actually got a pretty nice :TBUTT: there!'});
            
            aitl = [[ait.aButt, ait.tPin], [ait.aGroin, ait.tPin]];
            add(false, "challenger", aitl, {conditions:[], text: 'Hey announcer! I better get bonus points for that!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Yeah how\'d you like that?!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Dominated!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Owned!'});
            
            aitl = [[ait.aGroin, ait.tPunch], [ait.aGroin, ait.tKick], [ait.aGroin, ait.tTwist], [ait.aBreasts, ait.tPunch], [ait.aBreasts, ait.tKick], [ait.aBreasts, ait.tTwist]];
            add(false, "challenger", aitl, {conditions:[], text: 'That\'s right, I went there!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Weak!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Gotta keep weak dudes like you out of the arena!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Hah, you suck!'});
            add(false, "challenger", aitl, {conditions:[], text: 'That all you got? Weak!'});
            add(false, "challenger", aitl, {conditions:[], text: 'Boom! Critical!'});
            
            aitl = [[ait.aBreasts]];
            add(false, "challenger", aitl, {conditions:[], text: 'Nice tits!'});
            add(false, "challenger", aitl, {conditions:[], text: "Don't expect me to go easy on you just 'cause you have those crowd pleasers!"});
            
            aitl = [[ait.aGroin]];
            add(false, "challenger", aitl, {conditions:[C.VAGINA], text: 'Don\'t worry, once I beat you I\'ll make your :TCROTCHEX: feel real good! Hehehe.'});
            add(false, "challenger", aitl, {conditions:[], text: "Pretty nice :TCROTCHEX: you got there, dude!"});
            add(false, "challenger", aitl, {conditions:[C.VAGINA], text: "Hey, nice :TCROTCHEX:! Gonna be crazy fun to pound it after I defeat you!"});
            add(false, "challenger", aitl, {conditions:[C.PENIS], text: "You have a pretty nice :TCROTCHEX: there, can't wait to make it mine after I defeat you!"});
            
            // Victim
            aitl = [[ait.aGroin, ait.tRub],[ait.aGroin, ait.tSqueeze],[ait.aGroin, ait.tTickle],[ait.aGroin, ait.tTwist]];
            add(false, "challenger", aitl, {conditions:[], text: 'Hands off the goods, creep!'}, false, true);
            add(false, "challenger", aitl, {conditions:[], text: 'Ey! Hands off my parts!'}, false, true);
            

            aitl = [[ait.aGroin, ait.tPunch], [ait.aGroin, ait.tKick], [ait.aGroin, ait.tTwist]];
            add(false, "challenger", aitl, {conditions:[], text: 'Ow! Uncool, dude!'}, false, true);
            add(false, "challenger", aitl, {conditions:[], text: 'Ow, hey! Quit that!'}, false, true);
            add(false, "challenger", aitl, {conditions:[], text: 'Oof, cut that out!'}, false, true);
            
            aitl = [[ait.aButt, ait.tPin], [ait.aGroin, ait.tPin]];
            add(false, "challenger", aitl, {conditions:[], text: 'Ah!'}, false, true);
            add(false, "challenger", aitl, {conditions:[], text: 'Nngh!'}, false, true);
            

            aitl = [[ait.aButt, ait.tSlap]];
            add(false, "challenger", aitl, {conditions:[], text: 'Don\'t touch what you can\'t afford yo!'}, false, true);
        //
            
        // Jailor
            aitl = [[ait.tWhip]];
            add(false, "TheJailor", aitl, {conditions:[], text: 'I will flog the secrets from you!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Confess!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Purified through pain!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'I will put you back in your cell!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Do not resist!'});
            
            aitl = [[ait.tZap]];
            add(false, "TheJailor", aitl, {conditions:[], text: 'Behold my power!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Confess!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Your secrets will be mine!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Let the pain course through you!'});
            add(false, "TheJailor", aitl, {conditions:[], text: 'Feel my power!'});
            
            aitl = [];
            let abil = C(CO.ABILITY, "JAILOR_TORTURE");
            // Torture in shackles
            add(false, "TheJailor", aitl, {conditions:[abil, C(CO.EFFECT, 'JailorShackle')], text: 'How powerless you are!'});
            add(false, "TheJailor", aitl, {conditions:[abil, C(CO.EFFECT, 'JailorShackle')], text: 'You cannot stop me!'});
            add(false, "TheJailor", aitl, {conditions:[abil, C(CO.EFFECT, 'JailorShackle')], text: 'You will stay my prisoner!'});
            add(false, "TheJailor", aitl, {conditions:[abil, C(CO.EFFECT, 'JailorShackle')], text: 'So powerless to stop me!'});
            add(false, "TheJailor", aitl, {conditions:[abil, C(CO.EFFECT, 'JailorShackle')], text: 'I will break you!'});
            

            abil = C(CO.ABILITY, "JAILOR_SHACKLE");
            aitl = [];
            add(false, "TheJailor", aitl, {conditions:[abil], text: 'There is no escaping my bonds!'});
            add(false, "TheJailor", aitl, {conditions:[abil], text: 'No escape!'});
            add(false, "TheJailor", aitl, {conditions:[abil], text: 'Now you are mine!'});
            add(false, "TheJailor", aitl, {conditions:[abil], text: 'It is useless to resist!'});
            add(false, "TheJailor", aitl, {conditions:[abil], text: 'Let the torture begin!'});
        //


        // Demonic queen
            aitl = [];
            abil = C(CO.ABILITY, "QUEEN_RITUAL");
            // Charge ritual
            add(false, "demonQueen", aitl, {conditions:[abil], text: 'Good, now hold :THIM: still while I prepare the ritual!'}, AIChat.Events.charged);
			

        //

        // Satinan

            aitl = [[ait.aButt, ait.tPin], [ait.aVag, ait.tPin]];
            add(false, "satinan", aitl, {conditions:[], text: 'A taste of what is to come!'});
            add(false, "satinan", aitl, {conditions:[], text: 'I can\'t wait to make you my slave!'});
            add(false, "satinan", aitl, {conditions:[], text: 'Squeal for me!'});
            add(false, "satinan", aitl, {conditions:[], text: 'You will be mine!'});
            add(false, "satinan", aitl, {conditions:[], text: 'Gonna fill you with my hot demon gel!'});
            

            aitl = [];
            abil = C(CO.ABILITY, "SATINAN_SHACKLES");
            add(false, "satinan", aitl, {conditions:[abil], text: 'It is useless to resist!'});

            abil = C(CO.ABILITY, "SATINAN_DECIMATE");
            add(false, "satinan", aitl, {conditions:[abil], text: 'I will destroy you!'}, AIChat.Events.charged);
            add(false, "satinan", aitl, {conditions:[abil], text: 'You will not survive this!'}, AIChat.Events.charged);
            add(false, "satinan", aitl, {conditions:[abil], text: 'You will be mine!'}, AIChat.Events.charged);
            
            

            abil = C(CO.ABILITY, "SATINAN_VOLATILE_IMP");
            add(false, "satinan", aitl, {conditions:[abil], text: 'Minions of Heck, obey me!'});
            add(false, "satinan", aitl, {conditions:[abil], text: 'Come to my aid!'});
            add(false, "satinan", aitl, {conditions:[abil], text: 'My minions will destroy you!'});
            

            abil = C(CO.ABILITY, "SATINAN_DANCE_RANDOM");
            add(false, "satinan", aitl, {conditions:[abil], text: 'Behold my power!'});
            add(false, "satinan", aitl, {conditions:[abil], text: 'Listen to a true master!'});
            add(false, "satinan", aitl, {conditions:[abil], text: 'There\'s never been a rock-off I ever lost!'});
            add(false, "satinan", aitl, {conditions:[abil], text: 'There\'s no way you\'ll win!'});
            
            
			
        //
                


    }

}

// These are the AIChat text hooks
AIChat.asset = class extends Asset{

    constructor(data){
        super();

        this.race = false;      // Specific race name to tie it to
        this.charname = false;  // Specific character id to tie it to
        this.ait = [];          // AI tags. Each element is a single tag or an array of tags that are ANDED. [["a", "b"], "c"]  = (a && b) || c
        this.text = new Text(); // Text object - Basic restrictions work here too
        this.event = 'ability'; // Event
        this.attacker = true;   // Valid if the AIChat character is the event attacker. Otherwise it checks if victim

        this.load(data);
    }


};

