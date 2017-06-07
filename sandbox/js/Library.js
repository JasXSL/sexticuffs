var DB = {
    Ability : [],
    Text : [],
    Tags : [],
    Armor : [],
    Character: [],              // Monsters and coop players
    Race:[],
};

DB.sort = function(assetType, on){

    var db = DB[assetType];
    // Sort
    db.sort(function(a,b){

        if(a[on] === b[on]){
            return 0;
        }

        return a[on] < b[on] ? -1 : 1;
    });

};

DB.ini = function(){
    "use strict";
    // Preset tags

        DB.Tags = [
            // Auto generated
            "nude",

            // Character status
            "c_breasts",
            "c_penis",
            "c_vagina",

            "c_uncut",      // penis uncut

            
            // Armor
            "a_thong",
            "a_shiny",
            "a_tight",
            "a_loose",
            "a_sling",
            "a_upper",      // Has upperbody
            "a_lower",      // Has lowerbody
            "a_bra",
            "a_loincloth",  // has a flappy front bit
            "a_stockings",

            // Species specific
            "s_tail",
            "s_fins",
            "s_skin",
            "s_fur",
            "s_scales",
            "s_tail_short",

            "s_demon",

            // Effects
            "fx_cold",              // player is cold
            "fx_mitigation",       // Player is mitigating
        ];


    // Armor
        // Not in store
        Armor.insert({id:'loincloth', name:'Tattered Loincloth', description:'A tattered loincloth.', tags:['a_loose', 'a_loincloth'], in_store:false});

        // Public
        Armor.insert({id:"goldenThong", name:"Golden Thong", description:"A shiny gold-colored thong that fits tight over your crotch.", tags:["a_shiny", "a_tight", "a_thong", "a_lower"]});
        Armor.insert({id:"goldenBikini", name:"Golden Bikini", description:"A shiny gold-colored thong and bra set.", tags:["a_shiny", "a_tight", "a_thong", "a_upper", "a_lower", "a_bra"]});
        Armor.insert({id:"slingBikini", name:"Sling Bikini", description:"A shiny sling bikini.", tags:["a_shiny", "a_tight", "a_thong", "a_sling", "a_upper", "a_lower"]});
        Armor.insert({id:"latexSet", name:"Latex Set", description:"An outfit made of tight and shiny black latex. Comes with a top, thong and stockings.", tags:["a_shiny", "a_tight", "a_thong", "a_stockings", "a_upper", "a_lower"]});
    //

    // Races
        // Monsters
        Race.insert({id:'imp', name_male : 'imp', playable:false, description : 'A stomach high impish creature with horns and hooves'});
        
        Race.insert({id:'breakerDemon', name_male : 'breaker demon', playable:false, description : 'A big muscular demonic canine.'});
        


        // Playable
        Race.insert({id:'fox',name_male : 'fox', description : 'A vulpine', tags:['s_fur', 's_tail']});
        Race.insert({id:'dragon',name_male : 'dragon', name_female : 'dragoness', description : 'A mythical creature', tags:['s_skin', 's_scales', 's_tail']});
        Race.insert({id:'skunk',name_male : 'skunk', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'lizard',name_male : 'lizard', description : '', tags:['s_skin', 's_scales', 's_tail']});
        Race.insert({id:'lynx',name_male : 'lynx', description : '', tags:['s_fur', 's_tail', 's_tail_short']});
        Race.insert({id:'housecat',name_male : 'cat', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'lion',name_male : 'lion', name_female : 'lioness', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'tiger',name_male : 'tiger', name_female : 'tigress', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'dog',name_male : 'dog', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'wolf',name_male : 'wolf', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'fennec',name_male : 'fennec', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'hyena',name_male : 'hyena', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'unicorn',name_male : 'unicorn', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'catgirl',name_male : 'catboy', name_female:'catgirl', description : '', tags:['s_skin', 's_tail']});
        Race.insert({id:'shark',name_male : 'shark', description : '', tags:['s_skin', 's_tail', 's_fins']});
        Race.insert({id:'ferret',name_male : 'ferret', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'panda',name_male : 'panda', description : '', tags:['s_fur', 's_tail', 's_tail_short']});
        Race.insert({id:'red_panda',name_male : 'red panda', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'jackal',name_male : 'jackal', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'rabbit', name_male : 'rabbit', description : '', tags:['s_fur', 's_tail', 's_tail_short']});
        Race.insert({id:'bull', name_male : 'bull', name_female : 'cow', description : '', tags:['s_fur', 's_tail']});
        Race.insert({id:'bear', name_male : 'bear', description : '', tags:['s_fur', 's_tail', 's_tail_short']});
        

    //





    // Abilities
        // IDs of default abilities everyone should have
        Ability.DEFAULTS = [
            "__BASE_ATTACK__"
        ];

        Ability.PUNISHMENTS = ['__PUNISHMENT_DOM__', '__PUNISHMENT_SUB__', '__PUNISHMENT_SAD__'];

        // __BASE_ATTACK__
        Ability.insert({
            id : '__BASE_ATTACK__',   // Should be unique
            name : 'Attack',
            description : 'Deals 2 damage to an enemy',
            manacost : 2,
            detrimental : true,
            conditions : [new Condition({type:Condition.ENEMY})],
            icon : "punch.svg",
            ai_tags : ["damage"],
            effects:[
                new Effect({
                    id : 'attack',
		            max_stacks : 1,
                    duration : 0,
                    detrimental : true,
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply],
                            effects:[[EffectData.Types.damage, 2]]
                        })
                    ]
                })
            ]
        });

        // Dummy abilities for punishments
        Ability.insert({
            id : '__PUNISHMENT_DOM__',
            name : 'Punishment dominant',
            allow_dead : true,
            manacost:0,
            conditions:[new Condition({type:Condition.ENEMY})]
        });

        Ability.insert({
            id : '__PUNISHMENT_SUB__',
            name : 'Punishment dominant',
            allow_dead : true,
            manacost:0,
            conditions:[new Condition({type:Condition.ENEMY})]
        });

        Ability.insert({
            id : '__PUNISHMENT_SAD__',
            name : 'Punishment dominant',
            allow_dead : true,
            manacost:0,
            conditions:[new Condition({type:Condition.ENEMY})]
        });
        

        

        // BITE
        Ability.insert({
            id : 'BITE',   // Should be unique
            name : 'Bite',
            description : 'Deals 4 armor damage',
            manacost : 3,
            cooldown : 3,
            detrimental : true,
            conditions : [
                new Condition({type:Condition.SELF, inverse:true}), // Can't be used on self
                new Condition({type:Condition.NOT_TAGS, data:["nude"]}),
            ],
            ai_tags : ["damage"],
            effects:[
                new Effect({
                    id : 'attack',
		            max_stacks : 1,
                    duration : 0,
                    detrimental : true,
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply],
                            effects:[[EffectData.Types.armorDamage, 4]]
                        })
                    ]
                })
            ]
        });

        // LOW_BLOW
        Ability.insert({
            id : 'LOW_BLOW',   // Should be unique
            name : 'Low Blow',
            description : 'Deals 4 damage and reduces your target\'s hit chance by 25% for one turn',
            manacost : 5,
            detrimental : true,
            conditions : [new Condition({type:Condition.SELF, inverse:true})],
            ai_tags : ["damage"],
            effects:[
                new Effect({
                    id : 'LOW_BLOW_dmg',
		            max_stacks : 1,
                    duration : 0,
                    detrimental : true,
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply],
                            effects:[[EffectData.Types.damage, 4]]
                        })
                    ]
                }),
                new Effect({
                    id : 'LOW_BLOW_hit',
                    name : 'Low Blow',
                    description : 'Hit chance reduced by 25%',
		            max_stacks : 1,
                    duration : 1,
                    detrimental : true,
                    icon : 'boxing-glove.svg',
                    applyText : ":TNAME:'s focus fell.",
                    events : [
                        new EffectData({
                            triggers: [],
                            effects:[[EffectData.Types.hit, -25]]
                        })
                    ]
                    
                }),
            ]
        });

        // FIST
        Ability.insert({
            id : 'FIST',   // Should be unique
            name : 'Fist',
            description : 'Fist a naked player\'s vagina',
            manacost : 6,
            detrimental : true,
            conditions : [
                new Condition({type:Condition.SELF, inverse:true}), 
                new Condition({type:Condition.TAGS, data:["c_vagina"]}), 
                new Condition({type:Condition.TAGS, data:["nude"]})
            ],
            ai_tags : ["damage"],
            effects:[
                new Effect({
                    id : 'FIST',
		            max_stacks : 1,
                    duration : 0,
                    detrimental : true,
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply],
                            effects:[[EffectData.Types.damage, 6]]
                        })
                    ]
                })
            ]
        });

        
        // GRASP
        Ability.insert({
            id : 'GRASP',   // Should be unique
            name : 'Grasp',
            description : 'Grabs a player in a vice-like grip, inflicting heavy damage and stunning the player for 1 turn.',
            manacost : 6,
            cooldown: 4,
            detrimental : true,
            conditions : [new Condition({type:Condition.SELF, inverse:true})],
            ai_tags : ["damage", "stun"],
            effects:[
                new Effect({
                    id : 'GRASP',
		            max_stacks : 1,
                    duration : 0,
                    detrimental : true,
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply],
                            effects:[[EffectData.Types.damage, 4]]
                        })
                    ]
                }),
                new Effect({
                    id : 'GRASP',
		            max_stacks : 1,
                    duration : 1,
                    detrimental : true,
                    fadeText : ":TNAME: recovers from being grasped.",
                    applyText : ":TNAME: is stunned.",
                    icon : 'stun.svg',
                    events : [
                        new EffectData({
                            triggers: [],
                            effects:[[EffectData.Types.stun]]
                        })
                    ]
                }),
            ]
        });

        // HYDROMANCE
        Ability.insert({
            id : 'HYDROMANCE',   // Should be unique
            name : 'Hydromance',
            description : 'Deals 2 damage instantly, and at turn start over 2 turns.',
            manacost : 4,
            cooldown: 3,
            detrimental : true,
            conditions : [new Condition({type:Condition.SELF, inverse:true})],
            ai_tags : ["damage"],
            effects:[
                new Effect({
                    id : 'HYDROMANCE',
                    name : 'Hydromance',
                    description: 'Taking 2 damage at the start of each turn.',
		            max_stacks : 1,
                    duration : 2,
                    detrimental : true,
                    icon : 'hydromance.svg',
                    events : [
                        new EffectData({
                            triggers: [EffectData.Triggers.apply, EffectData.Triggers.turnStart],
                            effects:[[EffectData.Types.damage, 2]]
                        })
                    ]
                }),
            ]
        });




        // Generic
            // Crush
            Ability.insert({
                id : 'generic_crush',   // Should be unique
                name : 'Crush',
                icon : 'gavel.svg',
                description : 'Deals 4 damage.',
                manacost : 4,
                cooldown:3,
                detrimental : true,
                playable:true,
                conditions : [new Condition({type:Condition.SELF, inverse:true})],
                ai_tags : ["damage"],
                effects:[
                    new Effect({
                        id : 'generic_crush',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : true,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.damage, 4]]
                            })
                        ]
                    })
                ]
            });

            // Taunt
            Ability.insert({
                id : 'generic_taunt',   // Should be unique
                name : 'Taunt',
                icon : 'taunt.svg',
                description : 'Forces an enemy to attack you for 1 turn and increases your dodge chance by 20% for one turn. Counts as mitigation.',
                manacost : 2,
                detrimental : true,
                playable:true,
                conditions : [new Condition({type:Condition.ENEMY})],
                ai_tags : ["defensive"],
                effects:[
                    new Effect({
                        id : 't0TANK',
                        max_stacks : 1,
                        duration : 1,
                        detrimental : true,
                        icon: 'taunt.svg',
                        name: 'Taunt',
                        description: 'Taunted by :ATTACKER:',
                        events : [
                            new EffectData({
                                triggers: [],
                                effects:[[EffectData.Types.taunt]]
                            })
                        ]
                    }),
                    new Effect({
                        id : 't0TANK_SELF',
                        max_stacks : 1,
                        duration : 1,
                        detrimental : false,
                        name: 'Prepared',
                        description:'Dodge chance increased by 20%',
                        icon : 'dodge.svg',
                        applyText:':ATTACKER:\'s defenses rose',
                        target : Game.Consts.TARG_ATTACKER,
                        tags : ["fx_mitigation"],
                        events : [
                            new EffectData({
                                triggers: [],
                                effects:[[EffectData.Types.dodge, 20]]
                            })
                        ]
                    }),
                ]
            });
            
            // Rest
            Ability.insert({
                id : 'generic_rest',   // Should be unique
                name : 'Rest',
                icon : 'rest.svg',
                description : 'Restores 4 HP to the caster.',
                manacost : 3,
                cooldown : 2,
                detrimental : false,
                playable:true,
                conditions : [new Condition({type:Condition.SELF})],
                ai_tags : ["heal"],
                effects:[
                    new Effect({
                        id : 'generic_rest',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.heal, 4]]
                            })
                        ]
                    }),
                ]
            });

            // Recover
            Ability.insert({
                id : 'generic_recover',   // Should be unique
                name : 'Recover',
                icon : 'recover.svg',
                description : 'Clears all detrimental effects from the caster.',
                manacost : 4,
                cooldown : 3,
                detrimental : false,
                playable:true,
                conditions : [new Condition({type:Condition.SELF})],
                ai_tags : ["dispel"],
                effects:[
                    new Effect({
                        id : 'recover',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.dispel, false, -1]]
                            })
                        ]
                    }),
                ]
            });
        //

        // Offensive //
            // Sap - Destroy 2 mana
            Ability.insert({
                id : 'offensive_sap',   // Should be unique
                name : 'Sap',
                icon : 'sap.svg',
                affinity : Ability.Packages.offensive,
                description : 'Destroys 2 mana crystals on an enemy target.',
                manacost : 1,
                cooldown : 3,
                detrimental : true,
                playable:true,
                conditions : [new Condition({type:Condition.MANA_GREATER_THAN, data:[0]}), new Condition({type:Condition.ENEMY})],
                ai_tags : ["offensive"],
                effects:[
                    new Effect({
                        id : 'sap',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.manaDamage, 2]]
                            })
                        ]
                    }),
                ]
            });
        //

        // Defensive //
            // masochism
            Ability.insert({
                id : 'defensive_masochism',   // Should be unique
                name : 'Masochism',
                icon : 'masochism.svg',
                affinity : Ability.Packages.defensive,
                description : 'Gives you 1 extra mana when you take damage this turn.',
                manacost : 0,
                cooldown : 3,
                detrimental : false,
                playable:true,
                conditions : [new Condition({type:Condition.SELF})],
                ai_tags : ["defensive", "self"],
                effects:[
                    new Effect({
                        id : 'masochism',
                        icon : 'masochism.svg',
                        description : 'Gains 1 mana when they take damage.',
                        max_stacks : 1,
                        duration : 1,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.takeDamage],
                                effects:[[EffectData.Types.manaHeal, 1]]
                            })
                        ]
                    }),
                ]
            });
        //

        // Support //
            // Purify
            Ability.insert({
                id : 'support_purify',   // Should be unique
                name : 'Purify',
                icon : 'purify.svg',
                affinity : Ability.Packages.support,
                description : 'Clears all detrimental effects from your target.',
                manacost : 4,
                cooldown : 1,
                detrimental : false,
                playable:true,
                conditions : [],
                ai_tags : ["dispel"],
                effects:[
                    new Effect({
                        id : 'purify',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.dispel, false, -1]]
                            })
                        ]
                    }),
                ]
            });

            // Heal
            Ability.insert({
                id : 'support_heal',   // Should be unique
                name : 'Heal',
                icon : 'heal.svg',
                affinity : Ability.Packages.support,
                description : 'Restores 6 HP.',
                manacost : 4,
                cooldown : 2,
                detrimental : false,
                playable:true,
                conditions : [],
                ai_tags : ["heal"],
                effects:[
                    new Effect({
                        id : 't0HEAL',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.heal, 6]]
                            })
                        ]
                    }),
                ]
            });
        // 
    
    //

    // Base abilities per type 
        Ability.BASELINE = {};
        Ability.BASELINE[Ability.Packages.offensive] = ["generic_crush", "generic_rest", "offensive_sap"];
        Ability.BASELINE[Ability.Packages.defensive] = ["generic_crush", "generic_rest", "generic_taunt"];
        Ability.BASELINE[Ability.Packages.support] = ["generic_crush", "support_heal", "support_purify"];



    //
    


    // ENEMY CHARACTER

        // Imp
        Character.insert({"id":"imp", name:'Imp', race:Race.get('imp'), description:"", body_tags:["impish"], abilities:[
            "BITE",
            "LOW_BLOW",
            "FIST"
        ], max_armor:5, max_hp:15, social:75, size:3, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')});


        // Hydromancer. Has a custom tag for mc_hydromancer
        Character.insert({"id":"impHydromancer", name:'Imp Hydromancer', race:Race.get('imp'), description:"", body_tags:["impish"], abilities:[
            "LOW_BLOW",
            // Does damage over time
            "HYDROMANCE",
            "BITE",
            "FIST"
        ], max_armor:5, max_hp:20, social:60, size:3, tags:["c_penis", "s_demon", "mc_hydromancer"], armorSet:Armor.get('loincloth')});

        Character.insert({"id":"breakerDemon", name:'Breaker Demon', race:Race.get('breakerDemon'), description:"", body_tags:["demonic"], abilities:[
            "LOW_BLOW",
            "GRASP"
        ], max_armor:10, max_hp:40, size:8, strength:9, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')});

        Character.insert({"id":"SunStreak", name:'Sun Streak', race:Race.get('shark'), description:"Egads, a shark!", image:'https://static1.e621.net/data/74/ef/74efbcf087504adc76e54d047db600c1.jpg', body_tags:[], abilities:[
                "generic_taunt",
                "BITE"
            ], max_armor:25, max_hp:20, size:4, strength:3, tags:["c_penis"], 
            armorSet:new Armor({id:"sunArmor", name:"Revealing Outfit", description:"A loose shirt, tight thong and stockings!", tags:["a_tight", "a_stockings", "a_thong", "a_upper", "a_lower"]})
        });


        
    //
    
    // Texts
        DB.generateTexts();
};



DB.generateTexts = function(){

    // Shortcut for building conditions
    var C = function(type, data, target, inverse){
        if(data === undefined){data = [];}
        if(data.constructor !== Array){data = [data];}
        target = target || Game.Consts.TARG_VICTIM;
        inverse = inverse || false;
        return new Condition({type:type, data:data, target:target, inverse:inverse});
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
    
    C.HAS_TOP = C(CO.TAGS, 'a_top');
    C.ARMOR_TIGHT = C(CO.TAGS, 'a_tight');
    C.ARMOR_THONG = C(CO.TAGS, 'a_thong');

    var humanoid = C(CO.HUMANOID);
    
    var ait = Text.AIT;
    

    // Base attack
        // Ability condition
        var abil = C(CO.ABILITY, "__BASE_ATTACK__");
        Text.insert({conditions:[abil], sound:'punch', ait:[ait.tPunch], text:":ANAME: throws a punch at :TNAME:!"});
        Text.insert({conditions:[abil, humanoid], sound:'slap', ait:[ait.aButt, ait.tSlap], text:":ANAME: smacks :TNAME:'s :BUTT:!"});
        Text.insert({conditions:[abil, humanoid, C.BREASTS, C(CO.TAGS, "a_sling")], sound:'stretch_snap', ait:[ait.aBreasts, ait.tTwang], text:":ANAME: tugs at the front of :TNAME:'s :TCLOTHES:, tugging the straps backwards and releasing them, causing them to snap against the :TRACE:'s :TBREASTS:!"});
        Text.insert({conditions:[abil, humanoid, C(CO.TAGS, "a_sling")], sound:'stretch_snap', ait:[ait.aGroin, ait.tTwang], text:":ANAME: grabs a hold of the bottom of :TNAME:'s :TCLOTHES:, stretching it down between the :TRACE:'s legs before letting it go, snapping up against the :TRACE:'s :TGROIN:!"});
        Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT], sound:'tickle', ait:[ait.aGroin, ait.tTickle], text:":ANAME: tickles at the :TGROIN: of :TARGET:'s tight :TCLOTHES:!"});
        Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NAKED], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: manages to get behind :TARGET: and quickly slips :AHIS: :APENIS: up the :TRACE:'s :BUTT:, landing a few thrusts!"});
        Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C(CO.TAGS, "a_thong")], ait:[ait.aButt, ait.tPin], sound:'squish', text:":ANAME: manages to get behind :TARGET:, quickly slipping the butt-string of the :TRACE:'s :TCLOTHES: aside and shoving :AHIS: :APENIS: up the :TRACE:'s :BUTT:, landing a few thrusts!"});
        Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NAKED, C.VAG], ait:[ait.aVag, ait.tPin], sound:'squish', text:":ANAME: manages to get behind :TARGET: and quickly slips :AHIS: :APENIS: up into the :TRACE:'s :TVAGINA:, landing a few thrusts!"});
        Text.insert({conditions:[abil, humanoid, C.ARMOR_THONG], sound:'tickle', ait:[ait.aButt, ait.tTickle], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, pushing it against the string and giving the :TRACE:'s :BUTT: a few tickles!"});
        Text.insert({conditions:[abil, humanoid, C.VAG, C(CO.TAGS, ['c_nude', 'a_tight'])], sound:'tickle', ait:[ait.aGroin, ait.tTickle], text:":ANAME: slips a finger between :TARGET:'s legs, pushing it against :THIS: :TGROIN: and giving the :TRACE: a few tickles!"});
        
        Text.insert({conditions:[abil, humanoid, C.BREASTS, C.CLOTHED, C(CO.TAGS, ['a_upper'])], sound:'stretch', ait:[ait.aBreasts, ait.tExpose], text:":ANAME: grabs a hold of the top of :TARGET:'s :TCLOTHES:, tugging it out of the way and exposing :TARGET:'s :TBREASTS:!"});
        Text.insert({conditions:[abil, humanoid, C.BREASTS, C.CLOTHED, C(CO.TAGS, ['a_upper'])], sound:'stretch', ait:[ait.aBreasts, ait.aCloth], text:":ANAME: grabs a hold of the top of :TARGET:'s :TCLOTHES:, tugging :THIS: body fowards and damaging the outfit!"});
        

        Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.PENIS], ait:[ait.aGroin, ait.tTickle], sound:'tickle', text:":ANAME: slips :AHIS: hand between :TARGET:'s legs from behind, using :AHIS: fingers to tickle at the :TRACE:'s balls through :THIS: tight :TCLOTHES:!"});
        Text.insert({conditions:[abil, humanoid, C.ARMOR_THONG], sound:'scratch', ait:[ait.aButt, ait.tScratch], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, pushing it against the string and scratching the :TRACE:'s :BUTT: through :THIS: butt-string!"});
        Text.insert({conditions:[abil, humanoid, C.NAKED], sound:'scratch', ait:[ait.aButt, ait.tScratch], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, giving the :TRACE:'s :BUTT: a couple of firm scratches!"});

        Text.insert({conditions:[abil, humanoid, C.CLOTHED, C.VAG], sound:'scratch', ait:[ait.aGroin, ait.tScratch], text:":ANAME: slips :AHIS: fingers between :TARGET:'s legs, giving the :TRACE:'s :TCROTCH: a couple of firm scratches!"});
        Text.insert({conditions:[abil, humanoid, C.CLOTHED, C(CO.TAGS, ['c_uncut'])], sound:'squish', ait:[ait.aGroin, ait.aForeskin, ait.tSqueeze], text:":ANAME: slips :ahis: hand inside :TARGET:'s :TCLOTHES:, grabbing a firm hold of the :TRACE:'s :TPENIS:! :ATTACKER: tugs back :TARGET:'s foreskin and starts pulling up and down, grinding the sensitive tip of :TARGET:'s :TPENIS: across the insides of :THIS: :TCLOTHES:!"});
        Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NAKED], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: manages to grab :TARGET:'s ankles, tripping :THIM: backwards! While the :TRACE: is dazed, :ATTACKER: separates :THIS: legs and jabs :AHIS: :APENIS: into :TARGET:'s :TBUTT:, rapidly forcing it in and out of the struggling :TRACE:."});
        Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NAKED, C.VAG], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: manages to grab :TARGET:'s ankles, tripping :THIM: backwards! While the :TRACE: is dazed, :ATTACKER: separates :THIS: legs and jabs :AHIS: :APENIS: into :TARGET:'s :TVAG:, rapidly forcing it in and out of the struggling :TRACE:!"});
        

        // imp
        var race_imp = C(CO.RACE, 'imp', Game.Consts.TARG_ATTACKER);
        var hydromancer = C(CO.TAGS, ['mc_hydromancer'], Game.Consts.TARG_ATTACKER);
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.aMouth, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: shoves :AHIS: :APENIS: into the :TRACE:'s mouth, humping it for a little while, and leaving a trail of demonic cum."});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.tFacial], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground! :TARGET: recovers from the daze to see the :ARACE: standing over :THIM:, cock in hand. Before :TARGET: can react, :ATTACKER:'s :TPENIS: twitches slightly before squirting a big load of demonic jizz into the :TRACE:'s face!"});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.tFacial], text:":ANAME: shoves :TARGET: from behind, tripping :THIM: face first to the ground! The :TRACE: pushes :THIS: torso off the ground, only to be greeted by the :ARACE:'s twitching :APENIS:. Before :TARGET: can turn away, :ATTACKER: launches a stream of demonic jizz right into the :TRACE:'s face!"});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.aMouth, ait.tPin, ait.tCumInside], text:":ANAME: shoves :TARGET: from behind, tripping :THIM: face first to the ground! The :TRACE: pushes :THIS: torso off the ground, only to be greeted by the :ARACE:'s :APENIS: shoved inside :THIS: mouth! :TARGET: tries to break free, but :ATTACKER: grabs a hold of :THIS: head and forces :AHIS: :APENIS: deeper inside, thrusting until :AHE: climaxes, forcing :AHIS: demonic load down the :TRACE:'s throat!"});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NAKED], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: pushes :TARGET:'s legs up as :AHE: shoves :APENIS: into the :TRACE:'s :BUTT:, humping it for a little while and leaving a trail of demonic cum."});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NAKED, C.VAG], sound:'squish', ait:[ait.aVag, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: shoves :AHIS: :APENIS: into the :TRACE:'s :TVAGINA:, humping it for a little while and leaving a trail of demonic cum."});
        Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NAKED, C.BREASTS], sound:'squish', ait:[ait.aBreasts, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: jumps onto their chest and forces :AHIS: :APENIS: between the :TRACE:'s :TBREASTS:, humping for a little while and leaving demonic penis-residue between them."});
        
        Text.insert({conditions:[abil, race_imp, C.NAKED, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around :TARGET:'s :TPENIS:, squeezing it firmly and leaving demonic saliva across the :TRACE:'s :TPENIS:!"});
        Text.insert({conditions:[abil, race_imp, C.NAKED, C.PENIS, C(CO.TAGS, ['c_uncut'])], sound:'wet_squeeze', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue towards :TARGET:'s :TPENIS:, where it slips beneath the :TRACE:'s foreskin and hoops around, leaving demonic saliva across the :TRACE:'s glans!"});
        Text.insert({conditions:[abil, race_imp, C.NAKED], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks, causing a tingling sensation to spread across the :TRACE:'s :BUTT: and leaving a gooey streak of demonic saliva!"});
        Text.insert({conditions:[abil, race_imp, C.NAKED], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks and into :THIS: :TBUTT:, causing a tingling sensation inside of :TARGET: and leaving a gooey streak of demonic saliva as the tongue retracts!"});
        Text.insert({conditions:[abil, race_imp, C.NAKED, C.VAG], sound:'slime_squish_bright', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s legs and into :THIS: :TVAG:, causing a tingling sensation inside of :TARGET: and leaving a gooey streak of demonic saliva as the tongue retracts!"});
        
        Text.insert({conditions:[abil, race_imp, C.ARMOR_THONG], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks, causing a tingling sensation to spread across the :TRACE:'s :BUTT: and leaving a gooey streak of demonic saliva!"});
        Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.PENIS], sound:'slap_wet', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue across :TARGET:'s bulge, causing it to jiggle while leaving a streak of demonic saliva!"});
        Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.VAG], sound:'slap_wet', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s legs, rubbing demonic saliva across :THIS: :TCROTCH:!"});
        Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.BREASTS, C.HAS_TOP], sound:'slap_wet', ait:[ait.aBreasts, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue across :TARGET:'s :TBREASTS:, causing them to jiggle while leaving a streak of demonic saliva!"});
        

        // Hydromancer
        Text.insert({conditions:[abil, humanoid, hydromancer, C.NAKED], sound:'slime_squish_bright', ait:[ait.aButt, ait.aTentacle, ait.tPen, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, pushing up and into the :TRACE:'s :TBUTT: multiple times!"});
        Text.insert({conditions:[abil, humanoid, hydromancer, C.NAKED, C.VAGINA], sound:'slime_squish_bright', ait:[ait.aVag, ait.aTentacle, ait.tPen, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, pushing up and into the :TRACE:'s :TVAGINA: multiple times!"});
        Text.insert({conditions:[abil, humanoid, hydromancer, C.NAKED, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.aTentacle, ait.tWet, ait.tSqueeze], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, wrapping itself around the :TRACE:'s :TPENIS: and rubbing it firmly!"});
        Text.insert({conditions:[abil, humanoid, hydromancer], sound:'wet_squeeze', ait:[ait.aGroin, ait.aButt, ait.tWet, ait.tTickle], text:":ANAME: summons a jet of water between :TARGET:\'s legs, the splashing water tickles :THIS: :TBUTT: and :TGROIN:!"});
        Text.insert({conditions:[abil, humanoid, hydromancer], sound:'slap_wet', ait:[ait.aButt, ait.aTentacle, ait.tWet, ait.tSlap], text:":ANAME: summons a water tendril behind :TARGET:! The tendril quickly lashes at the :TRACE:'s :TBUTT: a few times in rapid succession!"});
        Text.insert({conditions:[abil, humanoid, hydromancer, C(CO.TAGS, ['nude', 'a_thong'])], sound:'wet_squeeze', ait:[ait.aButt, ait.tWet, ait.tScratch], text:":ANAME: flings a watery glob towards :TARGET:, landing beneath :THIS: legs! A long piece of watermilfoil rises from the glob and slips in between the :TRACE:'s buttcheeks, where it starts moving in a flossing motion, sending tingles across :TARGET:'s rear!"});
        Text.insert({conditions:[abil, humanoid, hydromancer, C(CO.TAGS, ['nude', 'a_tight']), C.VAGINA], sound:'wet_squeeze', ait:[ait.aVag, ait.tWet, ait.tScratch], text:":ANAME: flings a watery glob towards :TARGET:, landing beneath :THIS: legs! A long piece of watermilfoil rises from the glob and slips in between the :TRACE:'s legs, where it starts moving in a flossing motion, sending tingles across :TARGET:'s :TGROIN:!"});
        

    // NPC
        // Bite
            abil = C(CO.ABILITY, "BITE");
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED], sound:'bite', ait:[ait.tBite], text:":ANAME: jumps at :TNAME:, biting at :THIS: :TCLOTHES:!"});
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED], sound:'bite', ait:[ait.aButt, ait.tBite], text:":ANAME: jumps at :TNAME:, biting at the :TRACE:'s butt through :THIS: :TCLOTHES:!"});
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED], sound:'stretch_snap', ait:[ait.aButt, ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the back of :THIS: :TCLOTHES:! The :ARACE: pulls back before letting the garment snap back onto :TARGET:'s :BUTT:!"});
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED, C.ARMOR_TIGHT], sound:'stretch_snap', ait:[ait.aGroin, ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the front of the groin of :THIS: :TCLOTHES:! The :ARACE: pulls back, letting the garment snap back onto :TARGET:'s :CROTCH:!"});
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED, C.ARMOR_TIGHT, C.PENIS], sound:'small_scratch', ait:[ait.aGroin, ait.tBite], text:":ANAME: jumps at :TNAME:, teeth bare! The :ARACE: manages to graze :TARGET:'s bulge with :AHIS: teeth!"});
            Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED, C.VAG, C.BREASTS, C(CO.TAGS, "a_sling")], sound:'stretch', ait:[ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the back of the :TRACE:'s sling bikini. Putting :AHIS: foot on :TARGET:'s back, the :ARACE: tugs back, wedging the garment against :THIS: :TGROIN: and :TBREASTS:!"});

        // Hydromance
            abil = C(CO.ABILITY, "HYDROMANCE");
            Text.insert({conditions:[abil, humanoid, C.CLOTHED, C.ARMOR_TIGHT], sound:'freeze', ait:[ait.aBody, ait.tCold], text:":ANAME: sends a blast of cold across :TARGET:, causing :THIS: :TCLOTHES: to freeze!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED], sound:'freeze', ait:[ait.aBody, ait.tCold], text:":ANAME: sends an icy blast across :TARGET:!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED], sound:'water_squish', ait:[ait.aButt, ait.tWet, ait.tPen], text:":ANAME: casts a spell! :TARGET: gasps as a small undulating glob of water slips up into :THIS: :TBUTT:!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.VAGINA], sound:'water_squish', ait:[ait.aVag, ait.tWet, ait.tPen], text:":ANAME: casts a spell! :TARGET: gasps as a small undulating glob of water slips up into :THIS: :TVAGINA:!"});
            Text.insert({conditions:[abil, humanoid, C.CLOTHED, C.PENIS], sound:'water_squish', ait:[ait.aGroin, ait.tWet, ait.tTickle], text:":ANAME: summons a watery glob that slips into :TARGET:'s :TCLOTHES:! The water starts swirling around, tickling :THIS: :TCROTCHEX: before pouring out onto the ground."});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C(CO.TAGS, ['c_uncut'])], sound:'brush_wiggle', ait:[ait.aGroin, ait.tWet, ait.tTickle, ait.aForeskin], text:":ANAME: hurls a watery glob at :TARGET:'s :TGROIN:! The :TRACE: gasps as a small length of watermilfoil slips beneath :THIS: foreskin and starts tickling against the tip of :THIS: :TPENIS:!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS], sound:'slime_squish_bright', ait:[ait.aGroin, ait.tWet, ait.tTickle, ait.aForeskin], text:":ANAME: hurls a watery glob at :TARGET:'s :TGROIN:! The :TRACE: gasps as a small length of watermilfoil wraps tight around :THIS: :TPENIS:, sending tingles across it as it starts wriggling!"});
            
            


        // Low blow
            abil = C(CO.ABILITY, "LOW_BLOW");
            Text.insert({conditions:[abil], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch between :TNAME:'s legs!"});
            Text.insert({conditions:[abil], sound:'punch_heavy', ait:[ait.aGroin, ait.tKick], text:":ANAME: throws a swift kick between :TNAME:'s legs!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.CLOTHED], sound:'punch_heavy', ait:[ait.aBreasts, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TBREASTS:, jiggling them around within :THIS: :TCLOTHES:"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.NAKED], sound:'punch_heavy', ait:[ait.aBreasts, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TBREASTS:, jiggling them around!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS], sound:'pinch', ait:[ait.aBreasts, ait.tPinch, ait.tTwist], text:":ANAME: grabs a hold of :TNAME:'s nipples, pulling forward while twisting them!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.ARMOR_TIGHT, C.HAS_TOP], sound:'pinch', ait:[ait.aBreasts, ait.tPinch, ait.tTwist], text:":ANAME: grabs a hold of :TNAME:'s nipples through :THIS: :TCLOTHES:, pulling forward while twisting them!"});
            
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.CLOTHED], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TPENIS:, jiggling :THIS: package around!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.NAKED], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TPENIS:, causing it to jiggle about!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: pushes :TARGET:'s :TPENIS: up against :THIS: stomach wihin :THIS: :TCLOTHES:, then quickly throws a few punches at it!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS: through :THIS: :TCLOTHES: before quickly twisting!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.NAKED], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS:, then quickly twists!"});
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS: through :THIS: :TCLOTHES:, then quickly twists!"});
            
            Text.insert({conditions:[abil, humanoid, C.PENIS, C.NAKED], sound:'slap', ait:[ait.aGroin, ait.tSlap], text:":ANAME: slaps :TARGET:'s :TPENIS:, multiple times!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.NAKED], sound:'slap', ait:[ait.aBreasts, ait.tSlap], text:":ANAME: slaps :TARGET:'s :TBREASTS:, multiple times!"});
            
            Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.PENIS], sound:'stretch', ait:[ait.aGroin, ait.tSqueeze], text:":ANAME: grabs a hold of :TARGET:'s bulge through :THIS: clothes, squeezing painfully!"});
            Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.BREASTS], sound:'stretch', ait:[ait.aBreasts, ait.tSqueeze], text:":ANAME: grabs a hold of :TARGET:'s :TBREASTS: through :THIS: clothes, squeezing painfully!"});
            
            Text.insert({conditions:[abil, humanoid, race_imp, C.ARMOR_TIGHT, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around :TARGET:'s bulge. Wrapping under the :TRACE:'s balls, :ATTACKER: contracts the tongue, painfully squeezing :TARGET: and leaving a mark of demonic saliva across :THIS: :CROTCH:!"});
            Text.insert({conditions:[abil, humanoid, race_imp, C.NAKED, C.BREASTS], sound:'wet_squeeze', ait:[ait.aBreasts, ait.tSqueeze, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around one of :TARGET:'s :TBREASTS:, hooping around. :ATTACKER: contracts the tongue, painfully squeezing :TARGET: and leaving a mark of demonic saliva across :THIS: :TBREASTS:!"});
            
            Text.insert({conditions:[abil, humanoid, race_imp, C.A_NAKED, C.A_PENIS, C.NAKED], sound:'squish', ait:[ait.aButt, ait.tCumInside, ait.tPin], text:":ANAME: lands a quick punch to :TARGET:'s throat, causing :THIM: to black out briefly! As the :TRACE: comes to, :THE: finds :THIM:self on top of :ATTACKER:, riding on :AHIS: :APENIS:. Before :TARGET: manages to get to :THIS: bearings, :THE: feels :ATTACKER:'s :APENIS: twitch as it launches a squirt of demonic jizz inside :TARGET:'s :TBUTT:!"});
            Text.insert({conditions:[abil, humanoid, race_imp, C.A_NAKED, C.A_PENIS, C.NAKED, C.VAG], sound:'squish', ait:[ait.aVag, ait.tCumInside, ait.tPin], text:":ANAME: lands a quick punch to :TARGET:'s throat, causing :THIM: to black out briefly! As the :TRACE: comes to, :THE: finds :THIM:self on top of :ATTACKER:, riding on :AHIS: :APENIS:. Before :TARGET: manages to get to :THIS: bearings, :THE: feels :ATTACKER:'s :APENIS: twitch as it launches a squirt of demonic jizz inside :TARGET:'s :TVAG:!"});
            
            // Hydromancer
            Text.insert({conditions:[abil, humanoid, hydromancer, C.CLOTHED, C.ARMOR_TIGHT, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob lashes beneath the :TRACE:'s balls and around :THIS: package, contracting and squeezing it painfully!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.CLOTHED, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob slips into :THIS: :TCLOTHES:, encircling :THIS: package before contracting painfully!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.NAKED, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob encircles :THIS: package and contracts painfully!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob encircles :THIS: penis and wrings, choking the :TRACE:'s :TPENIS: tightly!"});
            Text.insert({conditions:[abil, humanoid, hydromancer], sound:'slap_wet', ait:[ait.aGroin, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, lashing at the :TRACE:'s :TGROIN:!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.BREASTS], sound:'slap_wet', ait:[ait.aBreasts, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril before :TARGET:, lashing at the :TRACE:'s :TBREASTS:!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.NAKED, C.PENIS], sound:'slap_wet', ait:[ait.aGroin, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, lashing at the :TRACE:'s :TPENIS: multiple times!"});
            


        // Fist
            abil = C(CO.ABILITY, "FIST");
            Text.insert({conditions:[abil], sound:'squish', text:":ANAME: slips between :TNAME:'s legs, forcing :AHIS: fist up into the :TRACE:'s :TVAGINA:!"});
            Text.insert({conditions:[abil], sound:'squish', text:":ANAME: thrusts :AHIS: hand between :TARGET:'s legs, forcing it up inside :THIS: vagina! Thrusting it in and out of the :TRACE:!"});
        
        // GRASP
            abil = C(CO.ABILITY, "GRASP");
            Text.insert({conditions:[abil, humanoid], sound:'punch_heavy', text:":ANAME: grasps :TARGET: in a vice-like grip, painfully squeezing :thim:!"});
            Text.insert({conditions:[abil, humanoid], sound:'punch_heavy', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down with :THIS: :TGROIN: against the :ARACE:'s knee!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.A_NAKED, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down :BUTT: first onto the :ARACE:'s :APENIS:, letting :TARGET: bounce up and down on :AHIS: length for a while!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.A_NAKED, C.A_PENIS, C.VAGINA], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down :TVAGINA: first onto the :ARACE:'s :APENIS:, letting :TARGET: bounce up and down on :AHIS: length for a while!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground, flipping :THIM: upside-down! :ANAME: forces :AHIS: :APENIS: into :TARGET:'s mouth and starts raising and lowering :THIM:, causing :AHIS: :APENIS: to be thrust back and forth into :TARGET:'s mouth!"});
            Text.insert({conditions:[abil, humanoid], sound:'stretch', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs apart, causing :THIM: great pain and lifting :TARGET:'s hips towards the :ARACE:'s face. :ATTACKER: gives the struggling :TRACE: a quick lick across :THIS: :TGROIN:!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.A_NAKED, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs apart and lifts :TARGET:'s hips towards :AHIS: own. :ATTACKER: forces :AHIS: :APENIS: inside :TARGET:'s :BUTT: and starts thrusting firmly!"});
            Text.insert({conditions:[abil, humanoid, C.NAKED, C.A_NAKED, C.A_PENIS, C.VAGINA], sound:'squish', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs apart and lifts :TARGET:'s hips towards :AHIS: own. :ATTACKER: forces :AHIS: :APENIS: inside :TARGET:'s :TVAGINA: and starts thrusting firmly!"});
            

        


    // Generic abilities
        // Crush
            abil = C(CO.ABILITY, "generic_crush");
            Text.insert({conditions:[abil], sound:'punch_heavy', text:":ANAME: jumps at :TARGET:, slamming both :AHIS: fists into the :TRACE:!"});
        
        // Taunt
            abil = C(CO.ABILITY, "generic_taunt");
            Text.insert({conditions:[abil], sound:'taunt', text:":ANAME: heckles :TARGET:, readying for battle!"});
        
        // Recover
            abil = C(CO.ABILITY, "generic_recover");
            Text.insert({conditions:[abil], sound:'dispel_good', text:":ANAME: recovers, shaking off all detrimental effects!"});

        // Rest
            abil = C(CO.ABILITY, "generic_rest");
            Text.insert({conditions:[abil], sound:'heal', text:":ANAME: rests."});
        
    //

    // Defensive
        // masochism
            abil = C(CO.ABILITY, "defensive_masochism");
            Text.insert({conditions:[abil], sound:'masochism', text:":ANAME: cracks :AHIS: knuckles while looking aroused at :AHIS: enemies!"});

    //

    // Offensive
        // sap
            abil = C(CO.ABILITY, "offensive_sap");
            Text.insert({conditions:[abil], sound:'drain', text:":ANAME: saps :TARGET:'s power!"});
    //

    // Support
        // Heal
            abil = C(CO.ABILITY, "support_heal");
            Text.insert({conditions:[abil], sound:'heal', text:":ANAME: casts a heal on :TARGET:!"});
        
        // Pufiry
            abil = C(CO.ABILITY, "support_purify");
            Text.insert({conditions:[abil], sound:'dispel_good', text:":ANAME: purifies :TARGET:!"});

    //
    


    // Punishments

        // Dominant
            abil = C(CO.ABILITY, '__PUNISHMENT_DOM__');
            Text.insert({conditions:[abil], sound:'squish', text:"This is a DOMINANT punishment placeholder"});
            Text.insert({conditions:[abil, C.A_PENIS], sound:'squish', text:":ATTACKER: lays back on the ground, :APENIS: pointing into the air, before motionining at :TARGET: to come over. Catching the drift, and not wanting to risk a disqualification, the :TRACE: does as asked, seating :THIM:self onto the :ARACE:'s :APENIS:, facing away and separating :THIS: legs. :ATTACKER: grabs a hold of :TARGET:'s wrists and immediately starts bucking :AHIS: hips, forcing the :TRACE: to bounce up and down onto :ATTACKER:'s shaft! A few minutes later, the :ARACE: finally groans and bucks :AHIS: hips up high as :AHE: plants a big load into :TARGET:'s :TBUTT:, allowing the battle to come to a conclusion!"});
            
            
        // Sub
            abil = C(CO.ABILITY, '__PUNISHMENT_SUB__');
            Text.insert({conditions:[abil], sound:'squish', text:"This is a SUBMISSIVE punishment placeholder"});
            
        // Sadistic
            abil = C(CO.ABILITY, '__PUNISHMENT_SAD__');
            Text.insert({conditions:[abil], sound:'squish', text:"This is a SADISTIC punishment placeholder"});
            Text.insert({conditions:[abil, C.PENIS, C(CO.NOT_TAGS, ["c_uncut"])], sound:'squish', text:":ATTACKER: picks up a remote with various buttons and a cock ring, motioning for :TARGET: to come over. The :ARACE: slips the ring over :TARGET:'s :TPENIS:, right behind the tip, and pushes a button with a lightning bolt on it. :TARGET: winces as a short burst of electricity jolts through :THIS: :TPENIS:. :ATTACKER: throws the remote into the audience, who take turns pushing the various buttons. The poor :TRACE:'s :TPENIS: is treated to a range of various settings, including rapid shock pulses, long jolts, painful squeezes as some settings cause the ring to contract, and powerful vibrations. A few minutes later, a horn sounds, signifying that the battle is over, and letting the :TRACE: remove the ring."});
            Text.insert({conditions:[abil, C.PENIS, C(CO.TAGS, ["c_uncut"])], sound:'squish', text:":ATTACKER: picks up a remote with various buttons and a cock ring, motioning for :TARGET: to come over. The :ARACE: slips the ring under :TARGET:'s foreskin, nestling it at the back, and pushes a button with a lightning bolt on it. :TARGET: winces as a short burst of electricity jolts through :THIS: :TPENIS:. :ATTACKER: throws the remote into the audience, who take turns pushing the various buttons. The poor :TRACE:'s :TPENIS: is treated to a range of various settings, including rapid shock pulses, long jolts, painful squeezes as some settings cause the ring to contract, and powerful vibrations. A few minutes later, a horn sounds, signifying that the battle is over, and letting the :TRACE: remove the ring."});
            
        




};