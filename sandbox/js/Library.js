var DB = {
    Ability : [],
    Text : [],
    Tags : [],
    Armor : [],
    Character: [],              // Monsters and coop players
    Race:[],
    Challenge:[]
};

(function(){
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
    
    C.HAS_TOP = C(CO.TAGS, 'a_upper');
	C.HAS_BOTTOM = C(CO.TAGS, 'a_lower');
	C.NO_TOP = C(CO.NOT_TAGS, 'a_upper');
	C.NO_BOTTOM = C(CO.NOT_TAGS, 'a_lower');
	

    C.ARMOR_TIGHT = C(CO.TAGS, 'a_tight');
    C.ARMOR_THONG = C(CO.TAGS, 'a_thong');


    var humanoid = C(CO.HUMANOID);


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

                // These are wiped at the end of each turn
                "recently_attacked",            // Recently been the victim of an attack
                "recently_attacking",           // Used an attack this turn
                "recently_missed",              // Recently been the victim of an attack that missed
                



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
                "a_swimsuit",   // Swimsuit type
                "a_armored",
                "a_wettable",   // See through when wet

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
            Armor.insert({id:'loincloth', name:'Tattered Loincloth', description:'A tattered loincloth.', tags:['a_loose', 'a_loincloth', 'a_bottom'], in_store:false});
            Armor.insert({id:'plateBikini', name:'Plate Bikini', description:'An adorned plate bra and panties.', tags:['a_tight', 'a_thong', 'a_shiny', 'a_upper', 'a_lower'], in_store:false});
            Armor.insert({id:"sexticuffsShirt", name:"Sexticuffs Shirt", description:"It's just a T-Shirt with the Sexticuffs logo, and a thong. All in cotton.", tags:["a_tight", "a_upper", "a_lower", "a_wettable"], in_store:false});
            
            // Public
            Armor.insert({id:"goldenThong", name:"Golden Thong", cost:25, description:"A shiny gold-colored thong that fits tight over your crotch.", tags:["a_shiny", "a_tight", "a_thong", "a_lower"]});
            Armor.insert({id:"goldenBikini", name:"Golden Bikini", cost:25, description:"A shiny gold-colored thong and bra set.", tags:["a_shiny", "a_tight", "a_thong", "a_upper", "a_lower", "a_bra"]});
            Armor.insert({id:"slingBikini", name:"Sling Bikini", cost:30, description:"A shiny sling bikini.", tags:["a_shiny", "a_tight", "a_thong", "a_sling", "a_upper", "a_lower"]});
            Armor.insert({id:"latexSet", name:"Latex Set", cost:150, description:"An outfit made of tight and shiny black latex. Comes with a top, thong and stockings.", tags:["a_shiny", "a_tight", "a_thong", "a_stockings", "a_upper", "a_lower"]});
            Armor.insert({id:"latexSwimsuit", name:"Latex Swimsuit", cost:95, description:"A shiny tight black latex swimsuit with a thong back.", tags:["a_shiny", "a_tight", "a_thong", "a_upper", "a_lower", "a_swimsuit"]});
            Armor.insert({id:"techSuit", name:"Tech Swimsuit", cost:295, description:"A high tech one-piece with armored breasts and legs.", tags:["a_shiny", "a_tight", "a_upper", "a_lower", "a_swimsuit", "a_armored"]});
            

        //

        // Races
            // Monsters
            Race.insert({id:'imp', name_male : 'imp', playable:false, description : 'A stomach high impish creature with horns and hooves'});
            
            Race.insert({id:'breakerDemon', name_male : 'breaker demon', playable:false, description : 'A big muscular demonic canine.'});
            Race.insert({id:'succubus', name_male : 'succubus', playable:false, description : 'A voluptous lady with horns, wings and hooves.'});
            


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
            Race.insert({id:'horse', name_male : 'horse', description : '', tags:['s_fur', 's_tail']});
            Race.insert({id:'human', name_male : 'human', description : '', tags:['s_skin']});
            Race.insert({id:'raccoon', name_male : 'raccoon', description : '', tags:['s_fur', 's_tail']});
            Race.insert({id:'cheetah', name_male : 'cheetah', description : '', tags:['s_fur', 's_tail']});
            Race.insert({id:'rodent', name_male : 'rodent', description : '', tags:['s_fur', 's_tail']});
            Race.insert({id:'bat', name_male : 'bat', description : '', tags:['s_fur', 's_tail', 's_tail_short']});
            Race.insert({id:'bird', name_male : 'bird', description : '', tags:['s_feathers']});
            Race.insert({id:'otter', name_male : 'otter', description : '', tags:['s_fur', 's_tail']});
            Race.insert({id:'possum', name_male : 'possum', description : '', tags:['s_fur', 's_tail']});
            
            

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
                manacost : {offensive:2},
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
                conditions:[new Condition({type:Condition.ENEMY})]
            });

            Ability.insert({
                id : '__PUNISHMENT_SUB__',
                name : 'Punishment dominant',
                allow_dead : true,
                conditions:[new Condition({type:Condition.ENEMY})]
            });

            Ability.insert({
                id : '__PUNISHMENT_SAD__',
                name : 'Punishment dominant',
                allow_dead : true,
                conditions:[new Condition({type:Condition.ENEMY})]
            });
            

            

            

            




            // PC
                // Crush
                Ability.insert({
                    id : 'generic_crush',   // Should be unique
                    name : 'Crush',
                    icon : 'gavel.svg',
                    description : 'Deals 4 damage.',
                    manacost : {offensive:3},
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
                    description : 'Forces an enemy to attack you and reduces their damage done against you by 50%. Counts as mitigation. Can\'t miss.',
                    manacost : {defensive:2},
                    detrimental : true,
                    playable:true,
                    always_hit : true,
                    conditions : [new Condition({type:Condition.ENEMY})],
                    ai_tags : ["defensive"],
                    effects:[
                        new Effect({
                            id : 'genTaunt',
                            max_stacks : 1,
                            duration : 1,
                            detrimental : true,
                            icon: 'taunt.svg',
                            name: 'Taunt',
                            description: 'Taunted by :ATTACKER: and has a 40% miss chance against them.',
                            events : [
                                new EffectData({
                                    triggers: [],
                                    effects:[[EffectData.Types.taunt]]
                                }),
                                new EffectData({
                                    triggers: [],
                                    victim_on_attacker : 1,
                                    effects:[[EffectData.Types.damage_done_multi, 0.5]]
                                }),
                            ]
                        }),
                        new Effect({
                            id : 'tauntMitigation',
                            max_stacks : 1,
                            duration : 1,
                            detrimental : false,
                            applyText : ':ATTACKER: is now mitigating',
                            target : Game.Consts.TARG_ATTACKER,
                            tags : ['fx_mitigation']
                        })
                    ]
                });

                // Counterattack
                Ability.insert({
                    id : 'counterAttack',   // Should be unique
                    name : 'Counterattack',
                    icon : 'shield-reflect.svg',
                    description : 'Deals 4 damage. Only usable after being attacked.',
                    manacost : {defensive:3},
                    detrimental : true,
                    cooldown: 2,
                    playable:true,
                    conditions : [
                        new Condition({type:Condition.ENEMY}), 
                        new Condition({type:Condition.TAGS, data:["recently_attacked"], target : Game.Consts.TARG_ATTACKER}),
                    ],
                    ai_tags : ["defensive"],
                    effects:[
                        new Effect({
                            id : 'counterAttack',
                            max_stacks : 1,
                            duration : 0,
                            detrimental : false,
                            icon: 'shield-reflect.svg',
                            name: '',
                            description: '',
                            events : [
                                new EffectData({
                                    triggers: [EffectData.Triggers.apply],
                                    effects:[[EffectData.Types.damage, 4]], 
                                }),
                            ]
                        }),
                        
                    ]
                });
                

                // masochism
                Ability.insert({
                    id : 'defensive_masochism',   // Should be unique
                    name : 'Masochism',
                    icon : 'masochism.svg',
                    description : 'Gives you 2 offensive mana when you are attacked this turn.',
                    cooldown : 3,
                    detrimental : false,
                    playable:true,
                    conditions : [new Condition({type:Condition.SELF})],
                    ai_tags : ["defensive", "self"],
                    effects:[
                        new Effect({
                            id : 'masochism',
                            icon : 'masochism.svg',
                            description : 'Gains 2 offensive mana type when attacked.',
                            max_stacks : 1,
                            duration : 1,
                            detrimental : false,
                            events : [
                                new EffectData({
                                    triggers: [EffectData.Triggers.attacked],
                                    effects:[[EffectData.Types.manaHeal, {offensive:2}]]
                                })
                            ]
                        }),
                    ]
                });
            

                // Purify
                Ability.insert({
                    id : 'support_purify',   // Should be unique
                    name : 'Purify',
                    icon : 'purify.svg',
                    description : 'Clears all detrimental effects from your target.',
                    manacost : {support:2},
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
                    description : 'Restores 4 HP/Armor.',
                    manacost : {support:3},
                    cooldown : 1,
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
                                    effects:[[EffectData.Types.heal, 4]]
                                })
                            ]
                        }),
                    ]
                });

                // Corrupt
                Ability.insert({
                    id : 'corrupt',   // Should be unique
                    name : 'Corrupt',
                    icon : 'corrupt.svg',
                    description : 'Makes your healing abilities deal damage this turn, and cannot be dodged or resisted.',
                    manacost : {},
                    cooldown : 2,
                    detrimental : false,
                    playable:true,
                    conditions : [C(CO.SELF, [])],
                    ai_tags : ["buff"],
                    effects:[
                        new Effect({
                            id : 'corrupt',
                            max_stacks : 1,
                            duration : 1,
                            detrimental : false,
                            target : Game.Consts.TARG_ATTACKER,
                            icon : 'corrupt.svg',
                            description : 'Healing abilities now deal damage.',
                            events : [
                                new EffectData({
                                    triggers: [],
                                    effects:[[EffectData.Types.heal_to_damage]]
                                })
                            ]
                        }),
                    ]
                });

                



                // Bloodthirst
                /*
                Ability.insert({
                    id : 'bloodthirst',   // Should be unique
                    name : 'Bloodthirst',
                    icon : 'snake-bite.svg',
                    description : 'Deals 4 damage and heals you for 2. Can only be used on a character that has been healed prior to your turn.',
                    manacost : {offensive:2, support:1},
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
                                    effects:[[EffectData.Types.heal, 4]]
                                })
                            ]
                        }),
                    ]
                });
                */

            //
        
        //

        // Base abilities per type 
            Ability.BASELINE = {}; 
            Ability.BASELINE[Ability.AffinityOffensive] = ["generic_crush", "defensive_masochism"];
            Ability.BASELINE[Ability.AffinityDefensive] = ["generic_crush", "generic_taunt"];
            Ability.BASELINE[Ability.AffinitySupport] = ["generic_crush", "support_heal"];



        //
        


        // Texts
            DB.generateTexts();
            DB.generateChallenges();
    };









    DB.generateChallenges = function(){


        // Abilities

        // BITE
            Ability.insert({
                id : 'BITE',   // Should be unique
                name : 'Bite',
                description : 'Deals 3 armor damage',
                manacost : {offensive:3},
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

        // VAG_FIXATION
            Ability.insert({
                id : 'VAG_FIXATION',   // Should be unique
                name : 'Fixate Vag',
                description : 'Arouse a naked player with a vagina',
                manacost : {support:4},
                detrimental : true,
                conditions : [
                    new Condition({type:Condition.ENEMY}), 
                    new Condition({type:Condition.TAGS, data:["c_vagina"]}), 
                    new Condition({type:Condition.TAGS, data:["nude"]})
                ],
                ai_tags : ["damage"],
                effects:[
                    new Effect({
                        id : 'VAG_FIXATION',
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

        // NONVAG_FIXATION
            Ability.insert({
                id : 'NONVAG_FIXATION',   // Should be unique
                name : 'Fixate Body',
                description : 'Arouse a player without a vagina',
                manacost : {support:4},
                detrimental : true,
                conditions : [
                    new Condition({type:Condition.ENEMY}), 
                    new Condition({type:Condition.NOT_TAGS, data:["c_vagina"]}), 
                    new Condition({type:Condition.TAGS, data:["nude"]})
                ],
                ai_tags : ["damage"],
                effects:[
                    new Effect({
                        id : 'NONVAG_FIXATION',
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

        // LOW_BLOW
            Ability.insert({
                id : 'LOW_BLOW',   // Should be unique
                name : 'Low Blow',
                description : 'Deals 4 damage and reduces your target\'s hit chance by 25% for one turn',
                manacost : {offensive:2, defensive:2}, 
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

		// Succubus kiss
			Ability.insert({
                id : 'KISS',   // Should be unique
                name : 'Kiss',
                description : 'Destroys 3 defensive crystals on an enemy.',
                manacost : {support:2}, 
                detrimental : true,
                conditions : [new Condition({type:Condition.ENEMY}), C(CO.MANA_GREATER_THAN, {defensive:0})],
				cooldown: 3,
                ai_tags : [],
                effects:[
                    new Effect({
                        id : 'kiss',
                        max_stacks : 1,
                        duration : 0,
                        detrimental : true,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.apply],
                                effects:[[EffectData.Types.manaDamage, {defensive:3}]]
                            })
                        ]
                    })
                ]
            });

		// Succubus Aura
			Ability.insert({
                id : 'SUCCUBUS_AURA',   // Should be unique
                name : 'Succubus Aura',
                description : 'Attackers will be stunned for 2 turns. Caster takes 100% more damage the turn after.',
                manacost : {defensive:2}, 
                detrimental : false,
                conditions : [new Condition({type:Condition.SELF})],
				cooldown: 4,
                ai_tags : [],
                effects:[
                    new Effect({
                        id : 'succubusAura',
                        max_stacks : 1,
                        duration : 1,
                        detrimental : false,
                        
                        icon : 'lips.svg',
                        name: 'Stunning Aura',
                        description : 'Stuns anyone who uses a detrimental ability against this target.',

                        events : [
                            new EffectData({
                                triggers: [],
                                effects:[[EffectData.Types.invul]]
                            }),
                            // Trigger frailty after aura fades
                            new EffectData({
                                triggers: [EffectData.Triggers.remove],
                                effects: [
                                    [EffectData.Types.text, ":ATTACKER: looks frail as the aura ends!"],
                                    [EffectData.Types.applyEffect, new Effect({
                                        id : 'succubusFrail',
                                        duration : 1,
                                        detrimental : true,
                                        target: Game.Consts.TARG_ATTACKER,
                                        fadeText : ":TNAME: looks less frail.",
                                        icon : 'weaken.svg',
                                        name : 'Frailty',
                                        description : 'Taking 2x damage',
                                        events : [
                                            new EffectData({
                                                triggers: [],
                                                effects: [[EffectData.Types.damage_taken_multi, 2]]
                                            }),
                                        ]
                                    })]
                                ]
                            }),
                            // Trigger stun on attacked
							new EffectData({
                                triggers: [[EffectData.Triggers.attacked]],
                                effects:[
                                    [EffectData.Types.applyEffect, new Effect({
                                        id : 'succubusStun',
                                        duration : 2,
                                        detrimental : true,
                                        target: Game.Consts.TARG_RAISER,
                                        fadeText : ":TNAME: recovers from the succubus charm.",
                                        applyText : ":TNAME: is stunned.",
                                        icon : 'stun.svg',
                                        name : 'Succubus Charm',
                                        description : 'Stunned, taking 2x damage',
                                        tags : ["succubus_aura"],
                                        events : [
                                            new EffectData({
                                                triggers: [],
                                                effects: [[EffectData.Types.stun],[EffectData.Types.damage_taken_multi, 2]]
                                            }),
                                            new EffectData({
                                                triggers: [EffectData.Triggers.apply],
                                                effects: [[EffectData.Types.text, ":TARGET: succumbs to the :ARACE:'s aura!", 'mez']]
                                            }),
                                        ]
                                    })],
                                ]
                            }),
                        ]
                    })
                ]
            });

		// Whip crack
			Ability.insert({
                id : 'WHIPCRACK',   // Should be unique
                name : 'Whipcrack',
                description : 'Deals 4 damage and reduces your target\'s hit chance by 10% for two turns',
                manacost : {offensive:4, defensive:2}, 
                cooldown : 3,
                detrimental : true,
                conditions : [new Condition({type:Condition.SELF, inverse:true})],
                ai_tags : ["damage"],
                effects:[
                    new Effect({
                        id : 'WHIPCRACK_dmg',
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
                        id : 'WHIPCRACK_hit',
                        name : 'Low Blow',
                        description : 'Hit chance reduced by 15%',
                        max_stacks : 1,
                        duration : 2,
                        detrimental : true,
                        icon : 'boxing-glove.svg',
                        applyText : ":TNAME:'s focus fell.",
                        events : [
                            new EffectData({
                                triggers: [],
                                effects:[[EffectData.Types.hit, -10]]
                            })
                        ]
                        
                    }),
                ]
            });

            

            
        // GRASP
            Ability.insert({
                id : 'GRASP',   // Should be unique
                name : 'Grasp',
                icon: 'grab.svg',
                description : 'Grabs a player in a vice-like grip, inflicting heavy damage and stunning the player for 1 turn unless mitigating.',
                manacost : {offensive:2, support:2},
                cooldown: 3,
                detrimental : true,
                charged : 1,
                conditions : [new Condition({type:Condition.SELF, inverse:true})],
                charge_hit_conditions : [C(CO.NOT_TAGS, ["fx_mitigation"])],
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
                                effects:[[EffectData.Types.damage, 6]]
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
                manacost : {offensive:4},
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

        // CHALLENGER_SLAM
            Ability.insert({
                id : 'CHALLENGER_SLAM',   // Should be unique
                name : 'Challenger Slam',
                icon: 'gavel.svg',
                description : 'Deals 12 damage. Interrupted by taking damage.',
                manacost : {offensive:2, support:2},
                cooldown: 3,
                detrimental : true,
                charged : 1,
                passives : [
                    new Effect({
                        id : 'challengerSlamInterrupt',
                        max_stacks : 1,
                        duration : Infinity,
                        detrimental : false,
                        events : [
                            new EffectData({
                                triggers: [EffectData.Triggers.takeDamage],
                                effects:[[EffectData.Types.interrupt, 'CHALLENGER_SLAM']]
                            })
                        ]
                    })
                ],
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
                                effects:[[EffectData.Types.damage, 12]]
                            })
                        ]
                    }),               
                ]
            });


        // Base characters here
            // Imp
            Character.insert({"id":"imp", image:'media/npc/imp.svg', name:'Imp', race:Race.get('imp'), description:"", body_tags:["impish"], abilities:[
                //"BITE",
                "LOW_BLOW"
            ], max_armor:5, max_hp:15, social:75, size:3, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')});

            // Hydromancer. Has a custom tag for mc_hydromancer
            Character.insert({"id":"impHydromancer", name:'Imp Hydromancer', race:Race.get('imp'), description:"", body_tags:["impish"], abilities:[
                "LOW_BLOW",
                // Does damage over time
                "HYDROMANCE",
                "BITE"
            ], max_armor:5, max_hp:20, social:60, size:3, tags:["c_penis", "s_demon", "mc_hydromancer"], armorSet:Armor.get('loincloth')});

            Character.insert({"id":"breakerDemon", name:'Breaker Demon', race:Race.get('breakerDemon'), description:"", body_tags:["demonic"], abilities:[
                "LOW_BLOW",
                "GRASP"
            ], max_armor:10, max_hp:40, size:8, strength:9, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')});


            Character.insert({"id":"succubus", name:'Succubus', image:'media/npc/succubus.jpg', race:Race.get('succubus'), description:"A busty succubus with a long whip. Beware before attacking.", body_tags:[], abilities:[
                "KISS",						// Kiss a player, destroying 3 defensive crystals
                "SUCCUBUS_AURA",			// Adds 100% dodge chance for 1 turn and stuns all players that attack her for 2 turns
                "WHIPCRACK"					// Whips a player, inflicting extra damage
            ], max_armor:15, max_hp:15, social:75, size:5, tags:["c_vagina", "c_breasts", "s_demon"], armorSet:Armor.get('plateBikini')});



        


        // For challenges, monster HP will increase based on nr players

        // Insert custom NPCS
        
        // Succubi
        var suca = Character.get('succubus').clone(),
            sucb = Character.get('succubus').clone()
        ;
        suca.name = 'Xyllia';
        sucb.name = 'Vylnila';


        // Tutorial
        Challenge.insert({
            id : 'tutorial',
            name : 'Welcome to Sexticuffs',
            description : 'A primer for new fighters!',
            buttonbg : '',
            wings : [

                // Only one wing for tutorial
                new ChallengeWing({

                    id : 'tutorial',
                    name : 'Tutorial',
                    description : 'Think you got what it takes to perform in Sexticuffs? Try the crash course!',
                    stages:[

                        // Target Dummy
                        new ChallengeStage({
                            difficulty: ChallengeStage.difficulty.none,
                            id : 'targetDummy',
                            icon : 'media/npc/barrel.svg',
                            name : 'Target Dummy',
                            //music : 'rocket_power',
                            //background : '',
                            description : 'Learn the ropes, fight a target dummy!',
							intro : [
								new ChallengeTalkingHead({icon:'', text:'Instructor: Welcome to the sexticuffs holo-arena!', sound:''}),
                                new ChallengeTalkingHead({icon:'', text:'Instructor: All combat is digitally managed by our computers.', sound:''}),
                                new ChallengeTalkingHead({icon:'', text:'Instructor: Reduce your opponent\'s hit points by using the provided abilities to win.', sound:''}),
                                new ChallengeTalkingHead({icon:'', text:'Instructor: Abilities are charged with power gems.', sound:''}),
                                new ChallengeTalkingHead({icon:'', text:'Instructor: You will gain bonus power each round based on your affinity.', sound:''}),
                                new ChallengeTalkingHead({icon:'', text:'Instructor: Familiarize yourself with these gems while defeating the target dummy!', sound:''}),
                            ],
                            npcs : [
                                new Character({
                                    "id":"dummy", name:'Target Dummy', 
                                    race:new Race({
                                        id : 'targetDummy',
                                        name_male : 'Target Dummy',
                                        humanoid : false
                                    }), 
                                    image: 'media/npc/barrel.svg',
                                    description:"A target dummy.", 
                                    abilities:[], 
                                    max_armor:0, max_hp:10, size:5, 
                                    ignore_default_abils : true,
                                    passives : [
                                        new Effect({
                                            id : 'alertAt5hp',
                                            duration : Infinity,
                                            depletable : true,
                                            detrimental : false,
                                            events : [
                                                new EffectData({
                                                    triggers : [[EffectData.Triggers.takeDamageAfter]],
                                                    conditions : [C(CO.BP_LESS_THAN, [0.5])],
                                                    effects : [
                                                        [EffectData.Types.talking_head, new ChallengeTalkingHead({icon:'', text:'Instructor: Good job! Half way there!', sound:''})]
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                            ],
                            passives : [
                                new Effect({
                                    id : 'alertAtGameEnd',
                                    duration : Infinity,
                                    detrimental : false,
                                    events : [
                                        new EffectData({
                                            triggers : [[EffectData.Triggers.gameEnded]],
                                            effects : [
                                                [
                                                    EffectData.Types.talking_head, 
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: Nicely done! The victor decides the punishment!', sound:''}),
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: Return to the arena when you are ready to fight a trainer!', sound:''}),
                                                ],
                                                [EffectData.Types.removeArenaPassive, '_THIS_']
                                            ]
                                        })
                                    ]
                                })
                            ]
                        }),

                        // Trainer
                        new ChallengeStage({
                            difficulty: ChallengeStage.difficulty.easy,
                            id : 'trainer',
                            icon : 'media/npc/dogbot.jpg',
                            name : 'Virtual Trainer',
                            //music : 'rocket_power',
                            //background : '',
                            description : 'Time for a real fight, even if it\'s just against a virtual trainer!',
							intro : [
								new ChallengeTalkingHead({icon:'', text:'Instructor: Next up you will fight our trainer droid!', sound:''}),
                            ],
                            npcs : [
                                new Character({
                                    "id":"droid", name:'Virtual Trainer', 
                                    race:Race.get('dog'), 
                                    image: 'media/npc/dogbot.jpg',
                                    description:"A female AI, used for training.", 
                                    abilities:[], 
                                    armorSet : Armor.get('techSuit'),
                                    tags:["c_vagina", "c_breasts"], 
                                    max_armor:10, max_hp:10, size:5, 
                                    passives : [
                                        new Effect({
                                            id : 'alertAtHalf',
                                            duration : Infinity,
                                            depletable : true,
                                            detrimental : false,
                                            events : [
                                                new EffectData({
                                                    triggers : [[EffectData.Triggers.takeDamageAfter]],
                                                    conditions : [C(CO.BP_LESS_THAN, [0.501])],
                                                    effects : [
                                                        [EffectData.Types.talking_head, new ChallengeTalkingHead({icon:'', text:'Instructor: Nice! You got her clothes off!', sound:''})]
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                            ],
                            passives : [
                                new Effect({
                                    id : 'alertAtGameVictory',
                                    duration : Infinity,
                                    detrimental : false,
                                    events : [
                                        new EffectData({
                                            triggers : [[EffectData.Triggers.gameWon]],
                                            conditions: [C(CO.PC, [])],
                                            effects : [
                                                [
                                                    EffectData.Types.talking_head, 
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: Nicely done!', sound:''}),
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: Only one battle left to earn our matching shirt and underwear set!', sound:''}),
                                                ],
                                                [EffectData.Types.removeArenaPassive, '_THIS_']
                                            ],
                                        }),
                                        new EffectData({
                                            triggers : [[EffectData.Triggers.gameLost]],
                                            conditions: [C(CO.PC, [])],
                                            effects : [
                                                [
                                                    EffectData.Types.talking_head, 
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: No luck this time! Go for a rematch!', sound:''}),
                                                ],
                                                [EffectData.Types.removeArenaPassive, '_THIS_']
                                            ],
                                        }),
                                    ]
                                })
                            ]
                        }),

                        // Challenger
                        new ChallengeStage({
                            difficulty: ChallengeStage.difficulty.easy,
                            id : 'challenger',
                            icon : 'media/npc/muscle-up.svg',
                            name : 'Challenger',
                            //music : 'rocket_power',
                            //background : '',
                            description : 'To win the fabulous official T-shirt and underwear set, you must defeat the other challenger!',
							intro : [
								new ChallengeTalkingHead({icon:'', text:'Instructor: Your final challenge will be to defeat a fellow challenger!', sound:''}),
                                new ChallengeTalkingHead({icon:'media/npc/muscle-up.svg', text:'Challenger: That shirt is mine! You\'re going down, chump!', sound:''}),
                            ],
                            npcs : [
                                new Character({
                                    "id":"challenger", name:'', 
                                    race:Race.get('dog'), 
                                    image: 'media/npc/muscle-up.svg',
                                    description:"Another challenger trying out for Sexticuffs.", 
                                    abilities:[
                                        "CHALLENGER_SLAM"
                                    ], 
                                    armorSet : Armor.get('goldenThong'),
                                    tags:["c_penis"], 
                                    max_armor:20, max_hp:20, size:5, 
                                    passives:[
                                        new Effect({
                                            id : 'alertOnChallengerSlam',
                                            duration : Infinity,
                                            depletable : true,
                                            detrimental : false,
                                            events : [
                                                new EffectData({
                                                    triggers : [[EffectData.Triggers.abilityCharged, "CHALLENGER_SLAM"]],
                                                    effects : [
                                                        [
                                                            EffectData.Types.talking_head, 
                                                            new ChallengeTalkingHead({icon:'', text:'Instructor: He\'s charging an attack!', sound:''}),
                                                            new ChallengeTalkingHead({icon:'', text:'Instructor: This one can be interrupted by damaging him!', sound:''}),
                                                            new ChallengeTalkingHead({icon:'media/npc/muscle-up.svg', text:'Challenger: Uncool yo, you\'re supposed to be impartial!', sound:''}),
                                                        ]
                                                    ]
                                                })
                                            ]
                                        })
                                    ]
                                }),
                            ],
                            passives : [
                                new Effect({
                                    id : 'alertAtGameVictory',
                                    duration : Infinity,
                                    detrimental : false,
                                    events : [
                                        new EffectData({
                                            triggers : [[EffectData.Triggers.gameWon]],
                                            conditions: [C(CO.PC, [])],
                                            effects : [
                                                [
                                                    EffectData.Types.talking_head, 
                                                    new ChallengeTalkingHead({icon:'media/npc/muscle-up.svg', text:'Challenger: So uhh, we\'re still pals right?', sound:''}),
                                                    new ChallengeTalkingHead({icon:'', text:'Instructor: Good job! Return backstage for your reward!', sound:''}),
                                                ],
                                                [EffectData.Types.removeArenaPassive, '_THIS_']
                                            ],
                                        }),
                                        new EffectData({
                                            triggers : [[EffectData.Triggers.gameLost]],
                                            conditions: [C(CO.PC, [])],
                                            effects : [
                                                [
                                                    EffectData.Types.talking_head, 
                                                    new ChallengeTalkingHead({icon:'media/npc/muscle-up.svg', text:'Challenger: Hah, now you\'re mine!', sound:''}),
                                                ],
                                                [EffectData.Types.removeArenaPassive, '_THIS_']
                                            ],
                                        }),
                                    ]
                                })
                            ]
                        }),
                    ],
                    rewards : [
                        new ChallengeReward({
                            type:ChallengeReward.Types.clothes,
                            data: 'sexticuffsShirt',
                        }),
                        new ChallengeReward({
                            type:ChallengeReward.Types.money,
                            data: 50,
                        }),
                    ],
                }),
            ],
            
            conditions : []
        });








        // Hell bent for latex
        Challenge.insert({
            id : 'sexyHell',
            name : 'Hell Bent for Latex',
            description : 'Raid the sexy demonic dimension. Defeat the denizens to receive a reward!',
            buttonbg : 'media/backgrounds/hell.jpg',
            wings : [
                new ChallengeWing({
                    id : 'gatesOfHell',
                    name : 'The Gates of Heck',
                    description : 'You have arrived at the gates of heck, you must defeat the gatekeepers to breach it.',
                    stages : [

                        // One will have a special ability on vaginas, the other will have special abilities on non-vaginas
                        // The trick will be to kill the one not relevant to you
                        new ChallengeStage({
                            id : 'imps',
                            icon : 'media/npc/imp.svg',
                            name : 'Imp Brothers',
                            music : 'rocket_power',
                            background : 'media/backgrounds/hell.jpg',
                            description : 'The two imp brothers have wildy separate interests.',
							intro : [
								new ChallengeTalkingHead({icon:'media/npc/imp.svg', text:'Impo: Let\'s get ready to pound some pussy!', sound:''}),
                                new ChallengeTalkingHead({icon:'media/npc/imp.svg', text:'Impicus: Ew no, not not when they have so many other nice things to play with!', sound:''}),
							],
                            npcs : [
                                // Wants vagina
                                new Character({
                                    "id":"impo", name:'Impo', race:Race.get('imp'), description:"Really likes vaginas", body_tags:["impish"], abilities:["BITE","VAG_FIXATION"], max_armor:5, max_hp:10, social:75, size:3, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')
                                }),
                                // Does not want
                                new Character({
                                    "id":"impicus", name:'Impicus', race:Race.get('imp'), description:"Does not like vaginas", body_tags:["impish"], abilities:["BITE","NONVAG_FIXATION"], max_armor:5, max_hp:10, social:75, size:3, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')
                                }),
                            ]
                        }),


                        // Stage 2 - Gatekeeper. Charged attack
                        new ChallengeStage({
                            id : 'gatekeeper',
                            icon : '',
                            name : 'The Gatekeeper',
                            description : 'The gatekeeper blocks the path, keep your defenses up!',
                            music : 'rocket_power',
                            background : 'media/backgrounds/hell.jpg',
							intro : [
								new ChallengeTalkingHead({icon:'', text:'Must... smash...', sound:'', left:true})
							],
                            npcs : [
                                new Character({"id":"gatekeeper", name:'The Gatekeeper', race:Race.get('breakerDemon'), description:"A cruel gatekeeper stands in your way.", body_tags:["demonic"], abilities:[
                                    "LOW_BLOW",			// Lowers offenses
                                    "GRASP"				// Charged, stuns and damages unless mitigated
                                ], max_armor:10, max_hp:40, social:75, size:3, tags:["c_penis", "s_demon"], armorSet:Armor.get('loincloth')}),
                            ]
                        }),


                        // Stage 3 - Succubus
                        new ChallengeStage({
                            id : 'succubi',
                            icon : 'media/npc/succubus.jpg',
                            name : 'The Succubi',
                            description : 'Two succubi stand in your way, think before you attack.',
                            music : 'rocket_power',
                            background : 'media/backgrounds/hell.jpg',
							intro : [
								new ChallengeTalkingHead({icon:'media/npc/succubus.jpg', text:'Xyllia: Oh my, what have we here?', sound:'', left:true}),
                                new ChallengeTalkingHead({icon:'media/npc/succubus.jpg', text:'Vylnila: A new plaything for us!', sound:'', left:true}),
							],
                            npcs : [
								suca, sucb
                            ]
                        }),
                    ],
                    rewards : [
                        new ChallengeReward({
                            type:ChallengeReward.Types.clothes,
                            data:'plateBikini',
                        }),
                        new ChallengeReward({
                            type:ChallengeReward.Types.money,
                            data:100,
                        }),
                    ],
                })
                
            ],
            rewards : [

            ],
            // Not yet supported
            conditions : [],
        });

    };





    DB.generateTexts = function(){

        
        
        var ait = Text.AIT;
        

        // Base attack
            // Ability condition
            var abil = C(CO.ABILITY, "__BASE_ATTACK__");
            Text.insert({conditions:[abil], sound:'punch', ait:[ait.tPunch], text:":ANAME: throws a punch at :TNAME:!"});
            Text.insert({conditions:[abil, humanoid], sound:'slap', ait:[ait.aButt, ait.tSlap], text:":ANAME: smacks :TNAME:'s :BUTT:!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C(CO.TAGS, "a_sling")], sound:'stretch_snap', ait:[ait.aBreasts, ait.tTwang], text:":ANAME: tugs at the front of :TNAME:'s :TCLOTHES:, tugging the straps backwards and releasing them, causing them to snap against the :TRACE:'s :TBREASTS:!"});
            Text.insert({conditions:[abil, humanoid, C(CO.TAGS, "a_sling")], sound:'stretch_snap', ait:[ait.aGroin, ait.tTwang], text:":ANAME: grabs a hold of the bottom of :TNAME:'s :TCLOTHES:, stretching it down between the :TRACE:'s legs before letting it go, snapping up against the :TRACE:'s :TGROIN:!"});
            Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.HAS_BOTTOM], sound:'tickle', ait:[ait.aGroin, ait.tTickle], text:":ANAME: tickles at the :TGROIN: of :TARGET:'s tight :TCLOTHES:!"});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.NO_BOTTOM], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: manages to get behind :TARGET: and quickly slips :AHIS: :APENIS: up the :TRACE:'s :BUTT:, landing a few thrusts!"});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.NO_BOTTOM, C(CO.TAGS, "a_thong")], ait:[ait.aButt, ait.tPin], sound:'squish', text:":ANAME: manages to get behind :TARGET:, quickly slipping the butt-string of the :TRACE:'s :TCLOTHES: aside and shoving :AHIS: :APENIS: up the :TRACE:'s :BUTT:, landing a few thrusts!"});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.NO_BOTTOM, C.NO_BOTTOM, C.VAG], ait:[ait.aVag, ait.tPin], sound:'squish', text:":ANAME: manages to get behind :TARGET: and quickly slips :AHIS: :APENIS: up into the :TRACE:'s :TVAGINA:, landing a few thrusts!"});
            Text.insert({conditions:[abil, humanoid, C.ARMOR_THONG], sound:'tickle', ait:[ait.aButt, ait.tTickle], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, pushing it against the string and giving the :TRACE:'s :BUTT: a few tickles!"});
            Text.insert({conditions:[abil, humanoid, C.VAG, C(CO.TAGS, ['c_nude', 'a_tight'])], sound:'tickle', ait:[ait.aGroin, ait.tTickle], text:":ANAME: slips a finger between :TARGET:'s legs, pushing it against :THIS: :TGROIN: and giving the :TRACE: a few tickles!"});
            
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.HAS_TOP, C(CO.TAGS, ['a_upper'])], sound:'stretch', ait:[ait.aBreasts, ait.tExpose], text:":ANAME: grabs a hold of the top of :TARGET:'s :TCLOTHES:, tugging it out of the way and exposing :TARGET:'s :TBREASTS:!"});
            Text.insert({conditions:[abil, humanoid, C.BREASTS, C.HAS_TOP, C(CO.TAGS, ['a_upper'])], sound:'stretch', ait:[ait.aBreasts, ait.aCloth], text:":ANAME: grabs a hold of the top of :TARGET:'s :TCLOTHES:, tugging :THIS: body fowards and damaging the outfit!"});
            

            Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.PENIS, C.HAS_BOTTOM], ait:[ait.aGroin, ait.tTickle], sound:'tickle', text:":ANAME: slips :AHIS: hand between :TARGET:'s legs from behind, using :AHIS: fingers to tickle at the :TRACE:'s balls through :THIS: tight :TCLOTHES:!"});
            Text.insert({conditions:[abil, humanoid, C.ARMOR_THONG], sound:'scratch', ait:[ait.aButt, ait.tScratch], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, pushing it against the string and scratching the :TRACE:'s :BUTT: through :THIS: butt-string!"});
            Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM], sound:'scratch', ait:[ait.aButt, ait.tScratch], text:":ANAME: slips a finger between :TARGET:'s buttcheeks, giving the :TRACE:'s :BUTT: a couple of firm scratches!"});

            Text.insert({conditions:[abil, humanoid, C.HAS_BOTTOM, C.VAG], sound:'scratch', ait:[ait.aGroin, ait.tScratch], text:":ANAME: slips :AHIS: fingers between :TARGET:'s legs, giving the :TRACE:'s :TCROTCH: a couple of firm scratches!"});
            Text.insert({conditions:[abil, humanoid, C.HAS_BOTTOM, C(CO.TAGS, ['c_uncut'])], sound:'squish', ait:[ait.aGroin, ait.aForeskin, ait.tSqueeze], text:":ANAME: slips :ahis: hand inside :TARGET:'s :TCLOTHES:, grabbing a firm hold of the :TRACE:'s :TPENIS:! :ATTACKER: tugs back :TARGET:'s foreskin and starts pulling up and down, grinding the sensitive tip of :TARGET:'s :TPENIS: across the insides of :THIS: :TCLOTHES:!"});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NO_BOTTOM], v_turntags:['humped_butt', 'knockdown_back'], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: manages to grab :TARGET:'s ankles, tripping :THIM: backwards! While the :TRACE: is dazed, :ATTACKER: separates :THIS: legs and jabs :AHIS: :APENIS: into :TARGET:'s :TBUTT:, rapidly forcing it in and out of the struggling :TRACE:."});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C.NO_BOTTOM, C.VAG], v_turntags:['humped_pussy', 'knockdown_back'], sound:'squish', ait:[ait.aVag, ait.tPin], text:":ANAME: manages to grab :TARGET:'s ankles, tripping :THIM: backwards! While the :TRACE: is dazed, :ATTACKER: separates :THIS: legs and jabs :AHIS: :APENIS: into :TARGET:'s :TVAG:, rapidly forcing it in and out of the struggling :TRACE:!"});
            Text.insert({conditions:[abil, humanoid, C.A_PENIS, C.A_NAKED, C(CO.TAGS, ['humped_pussy', 'humped_butt']), C(CO.TAGS, ['knockdown_back'])], sound:'squish', ait:[ait.aMouth, ait.tPin], text:":ANAME: jumps on the already knocked down :TRACE:, forcing :AHIS: :APENIS: inside :TARGET:'s mouth!"});

            Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.VAG], sound:'squish', ait:[ait.aVag, ait.tRub], text:":ANAME: slips :AHIS: hand between :TARGET:'s legs and pushes :AHIS: fingers against :TARGET:'s clit, rubbing it firmly!"});
            Text.insert({conditions:[abil, humanoid, C.HAS_BOTTOM, C.VAG], sound:'squish', ait:[ait.aVag, ait.tRub], text:":ANAME: slips :AHIS: hand between :TARGET:'s legs and into :THIS: :TCLOTHES:, pushing :AHIS: fingers against :TARGET:'s clit. :ANAME: manages to rub it firmly for a little while!"});
            

            // Succubus aura
            var race_succubus = C(CO.RACE, 'succubus', Game.Consts.TARG_ATTACKER);
            var sucAura = C(CO.TAGS, ['succubus_aura']);
            Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.VAG, sucAura], sound:'squish', ait:[ait.aVag, ait.tRub], text:":ANAME: commands the mesmerized :TRACE: to reach inbetween :THIS: own legs, rubbing :THIS: :TVAG:!"});
            Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.PENIS, sucAura], sound:'squish', ait:[ait.aVag, ait.tRub], text:":ANAME: commands the mesmerized :TRACE: to reach inbetween :THIS: own legs, stroking :THIS: :TPENIS:!"});
            

            // imp
            var race_imp = C(CO.RACE, 'imp', Game.Consts.TARG_ATTACKER);
            var hydromancer = C(CO.TAGS, ['mc_hydromancer'], Game.Consts.TARG_ATTACKER);
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.aMouth, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: shoves :AHIS: :APENIS: into the :TRACE:'s mouth, humping it for a little while, and leaving a trail of demonic cum."});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.tFacial], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground! :TARGET: recovers from the daze to see the :ARACE: standing over :THIM:, cock in hand. Before :TARGET: can react, :ATTACKER:'s :TPENIS: twitches slightly before squirting a big load of demonic jizz into the :TRACE:'s face!"});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.tFacial], text:":ANAME: shoves :TARGET: from behind, tripping :THIM: face first to the ground! The :TRACE: pushes :THIS: torso off the ground, only to be greeted by the :ARACE:'s twitching :APENIS:. Before :TARGET: can turn away, :ATTACKER: launches a stream of demonic jizz right into the :TRACE:'s face!"});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS], sound:'squish', ait:[ait.aMouth, ait.tPin, ait.tCumInside], text:":ANAME: shoves :TARGET: from behind, tripping :THIM: face first to the ground! The :TRACE: pushes :THIS: torso off the ground, only to be greeted by the :ARACE:'s :APENIS: shoved inside :THIS: mouth! :TARGET: tries to break free, but :ATTACKER: grabs a hold of :THIS: head and forces :AHIS: :APENIS: deeper inside, thrusting until :AHE: climaxes, forcing :AHIS: demonic load down the :TRACE:'s throat!"});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NO_BOTTOM], sound:'squish', ait:[ait.aButt, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: pushes :TARGET:'s legs up as :AHE: shoves :APENIS: into the :TRACE:'s :BUTT:, humping it for a little while and leaving a trail of demonic cum."});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NO_BOTTOM, C.VAG], sound:'squish', ait:[ait.aVag, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: shoves :AHIS: :APENIS: into the :TRACE:'s :TVAGINA:, humping it for a little while and leaving a trail of demonic cum."});
            Text.insert({conditions:[abil, race_imp, C.A_NAKED, C.A_PENIS, C.NO_TOP, C.BREASTS], sound:'squish', ait:[ait.aBreasts, ait.tPin], text:":ANAME: jumps at :TARGET:, tripping :THIM: to the ground, before :THE: realizes what has happened, the :ARACE: jumps onto their chest and forces :AHIS: :APENIS: between the :TRACE:'s :TBREASTS:, humping for a little while and leaving demonic penis-residue between them."});
            
            Text.insert({conditions:[abil, race_imp, C.NO_BOTTOM, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around :TARGET:'s :TPENIS:, squeezing it firmly and leaving demonic saliva across the :TRACE:'s :TPENIS:!"});
            Text.insert({conditions:[abil, race_imp, C.NO_BOTTOM, C.PENIS, C(CO.TAGS, ['c_uncut'])], sound:'wet_squeeze', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue towards :TARGET:'s :TPENIS:, where it slips beneath the :TRACE:'s foreskin and hoops around, leaving demonic saliva across the :TRACE:'s glans!"});
            Text.insert({conditions:[abil, race_imp, C.NO_BOTTOM], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks, causing a tingling sensation to spread across the :TRACE:'s :BUTT: and leaving a gooey streak of demonic saliva!"});
            Text.insert({conditions:[abil, race_imp, C.NO_BOTTOM], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks and into :THIS: :TBUTT:, causing a tingling sensation inside of :TARGET: and leaving a gooey streak of demonic saliva as the tongue retracts!"});
            Text.insert({conditions:[abil, race_imp, C.NO_BOTTOM, C.VAG], sound:'slime_squish_bright', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s legs and into :THIS: :TVAG:, causing a tingling sensation inside of :TARGET: and leaving a gooey streak of demonic saliva as the tongue retracts!"});
            
            Text.insert({conditions:[abil, race_imp, C.ARMOR_THONG], sound:'slime_squish_bright', ait:[ait.aButt, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s buttcheeks, causing a tingling sensation to spread across the :TRACE:'s :BUTT: and leaving a gooey streak of demonic saliva!"});
            Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.HAS_BOTTOM, C.PENIS], sound:'slap_wet', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue across :TARGET:'s bulge, causing it to jiggle while leaving a streak of demonic saliva!"});
            Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.HAS_BOTTOM, C.VAG], sound:'slap_wet', ait:[ait.aGroin, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue between :TARGET:'s legs, rubbing demonic saliva across :THIS: :TCROTCH:!"});
            Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.BREASTS, C.HAS_TOP], sound:'slap_wet', ait:[ait.aBreasts, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue across :TARGET:'s :TBREASTS:, causing them to jiggle while leaving a streak of demonic saliva!"});
            
            Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.VAG, C(CO.TAGS, ["a_swimsuit"])], sound:'stretch', ait:[ait.aGroin, ait.tTickle], text:":ANAME: grabs a hold of the front of :TARGET:'s :TCLOTHES:, near the groin and tugs up, revealing a camel toe! :attacker: gives it a few tickles!"});
            Text.insert({conditions:[abil, race_imp, C.ARMOR_TIGHT, C.VAG, C(CO.TAGS, ["a_swimsuit"])], sound:'stretch', ait:[ait.aGroin, ait.tRub], text:":ANAME: grabs a hold of the front of :TARGET:'s :TCLOTHES:, near the groin and tugs up, revealing a camel toe! :attacker: smushes :AHIS: fingers against it and gives it a few thorough rubs!"});
            


            // Hydromancer
            Text.insert({conditions:[abil, humanoid, hydromancer, C.NO_BOTTOM], sound:'slime_squish_bright', ait:[ait.aButt, ait.aTentacle, ait.tPen, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, pushing up and into the :TRACE:'s :TBUTT: multiple times!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.NO_BOTTOM, C.VAGINA], sound:'slime_squish_bright', ait:[ait.aVag, ait.aTentacle, ait.tPen, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, pushing up and into the :TRACE:'s :TVAGINA: multiple times!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C.NO_BOTTOM, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.aTentacle, ait.tWet, ait.tSqueeze], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, wrapping itself around the :TRACE:'s :TPENIS: and rubbing it firmly!"});
            Text.insert({conditions:[abil, humanoid, hydromancer], sound:'wet_squeeze', ait:[ait.aGroin, ait.aButt, ait.tWet, ait.tTickle], text:":ANAME: summons a jet of water between :TARGET:\'s legs, the splashing water tickles :THIS: :TBUTT: and :TGROIN:!"});
            Text.insert({conditions:[abil, humanoid, hydromancer], sound:'slap_wet', ait:[ait.aButt, ait.aTentacle, ait.tWet, ait.tSlap], text:":ANAME: summons a water tendril behind :TARGET:! The tendril quickly lashes at the :TRACE:'s :TBUTT: a few times in rapid succession!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C(CO.TAGS, ['nude', 'a_thong'])], sound:'wet_squeeze', ait:[ait.aButt, ait.tWet, ait.tScratch], text:":ANAME: flings a watery glob towards :TARGET:, landing beneath :THIS: legs! A long piece of watermilfoil rises from the glob and slips in between the :TRACE:'s buttcheeks, where it starts moving in a flossing motion, sending tingles across :TARGET:'s rear!"});
            Text.insert({conditions:[abil, humanoid, hydromancer, C(CO.TAGS, ['nude', 'a_tight']), C.VAGINA], sound:'wet_squeeze', ait:[ait.aVag, ait.tWet, ait.tScratch], text:":ANAME: flings a watery glob towards :TARGET:, landing beneath :THIS: legs! A long piece of watermilfoil rises from the glob and slips in between the :TRACE:'s legs, where it starts moving in a flossing motion, sending tingles across :TARGET:'s :TGROIN:!"});
            

        // NPC
            // Bite
                abil = C(CO.ABILITY, "BITE");
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED], sound:'bite', ait:[ait.tBite], text:":ANAME: jumps at :TNAME:, biting at :THIS: :TCLOTHES:!"});
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.HAS_BOTTOM], sound:'bite', ait:[ait.aButt, ait.tBite], text:":ANAME: jumps at :TNAME:, biting at the :TRACE:'s butt through :THIS: :TCLOTHES:!"});
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.HAS_BOTTOM], sound:'stretch_snap', ait:[ait.aButt, ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the back of :THIS: :TCLOTHES:! The :ARACE: pulls back before letting the garment snap back onto :TARGET:'s :BUTT:!"});
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.HAS_BOTTOM, C.ARMOR_TIGHT], sound:'stretch_snap', ait:[ait.aGroin, ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the front of the groin of :THIS: :TCLOTHES:! The :ARACE: pulls back, letting the garment snap back onto :TARGET:'s :CROTCH:!"});
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.HAS_BOTTOM, C.ARMOR_TIGHT, C.PENIS], sound:'small_scratch', ait:[ait.aGroin, ait.tBite], text:":ANAME: jumps at :TNAME:, teeth bare! The :ARACE: manages to graze :TARGET:'s bulge with :AHIS: teeth!"});
                Text.insert({conditions:[C(CO.ABILITY, "BITE"), C.CLOTHED, C.VAG, C.BREASTS, C(CO.TAGS, "a_sling")], sound:'stretch', ait:[ait.tTwang], text:":ANAME: jumps at :TNAME:, biting a hold of the back of the :TRACE:'s sling bikini. Putting :AHIS: foot on :TARGET:'s back, the :ARACE: tugs back, wedging the garment against :THIS: :TGROIN: and :TBREASTS:!"});

            // Hydromance
                abil = C(CO.ABILITY, "HYDROMANCE");
                Text.insert({conditions:[abil, humanoid, C.CLOTHED, C.ARMOR_TIGHT], sound:'freeze', ait:[ait.aBody, ait.tCold], text:":ANAME: sends a blast of cold across :TARGET:, causing :THIS: :TCLOTHES: to freeze!"});
                Text.insert({conditions:[abil, humanoid, C.NAKED], sound:'freeze', ait:[ait.aBody, ait.tCold], text:":ANAME: sends an icy blast across :TARGET:!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM], sound:'water_squish', ait:[ait.aButt, ait.tWet, ait.tPen], text:":ANAME: casts a spell! :TARGET: gasps as a small undulating glob of water slips up into :THIS: :TBUTT:!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.VAGINA], sound:'water_squish', ait:[ait.aVag, ait.tWet, ait.tPen], text:":ANAME: casts a spell! :TARGET: gasps as a small undulating glob of water slips up into :THIS: :TVAGINA:!"});
                Text.insert({conditions:[abil, humanoid, C.HAS_BOTTOM, C.PENIS], sound:'water_squish', ait:[ait.aGroin, ait.tWet, ait.tTickle], text:":ANAME: summons a watery glob that slips into :TARGET:'s :TCLOTHES:! The water starts swirling around, tickling :THIS: :TCROTCHEX:."});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.NO_BOTTOM, C(CO.TAGS, ['c_uncut'])], sound:'brush_wiggle', ait:[ait.aGroin, ait.tWet, ait.tTickle, ait.aForeskin], text:":ANAME: hurls a watery glob at :TARGET:'s :TGROIN:! The :TRACE: gasps as a small length of watermilfoil slips beneath :THIS: foreskin and starts tickling against the tip of :THIS: :TPENIS:!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT, C.HAS_BOTTOM], sound:'brush_wiggle', ait:[ait.aGroin, ait.tWet, ait.tSqueeze], text:":ANAME: hurls a watery glob at :TARGET:'s :TGROIN:! The :TRACE: gasps as a long piece of a watery plant wraps tight around :THIS: package, squeezing a firm hold around the :TCROTCH: of :THIS: :TCLOTHES:!"});
                
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.NO_BOTTOM], sound:'slime_squish_bright', ait:[ait.aGroin, ait.tWet, ait.tTickle, ait.aForeskin], text:":ANAME: hurls a watery glob at :TARGET:'s :TGROIN:! The :TRACE: gasps as a small length of watermilfoil wraps tight around :THIS: :TPENIS:, sending tingles across it as it starts wriggling!"});
                

            // Low blow
                abil = C(CO.ABILITY, ["LOW_BLOW", "CHALLENGER_SLAM"]);
                Text.insert({conditions:[abil], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch between :TNAME:'s legs!"});
                Text.insert({conditions:[abil], sound:'punch_heavy', ait:[ait.aGroin, ait.tKick], text:":ANAME: throws a swift kick between :TNAME:'s legs!"});
                Text.insert({conditions:[abil, humanoid, C.BREASTS, C.HAS_TOP], sound:'punch_heavy', ait:[ait.aBreasts, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TBREASTS:, jiggling them around within :THIS: :TCLOTHES:"});
                Text.insert({conditions:[abil, humanoid, C.BREASTS, C.NO_TOP], sound:'punch_heavy', ait:[ait.aBreasts, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TBREASTS:, jiggling them around!"});
                Text.insert({conditions:[abil, humanoid, C.BREASTS], sound:'pinch', ait:[ait.aBreasts, ait.tPinch, ait.tTwist], text:":ANAME: grabs a hold of :TNAME:'s nipples, pulling forward while twisting them!"});
                Text.insert({conditions:[abil, humanoid, C.BREASTS, C.ARMOR_TIGHT, C.HAS_TOP], sound:'pinch', ait:[ait.aBreasts, ait.tPinch, ait.tTwist], text:":ANAME: grabs a hold of :TNAME:'s nipples through :THIS: :TCLOTHES:, pulling forward while twisting them!"});
                
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.HAS_BOTTOM], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TPENIS:, jiggling :THIS: package around!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.NO_BOTTOM], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: throws a punch at :TNAME:'s :TPENIS:, causing it to jiggle about!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT, C.HAS_BOTTOM], sound:'punch_heavy', ait:[ait.aGroin, ait.tPunch], text:":ANAME: pushes :TARGET:'s :TPENIS: up against :THIS: stomach wihin :THIS: :TCLOTHES:, then quickly throws a few punches at it!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT, C.HAS_BOTTOM], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS: through :THIS: :TCLOTHES: before quickly twisting!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.NO_BOTTOM], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS:, then quickly twists!"});
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.ARMOR_TIGHT, C.HAS_BOTTOM], sound:'stretch', ait:[ait.aGroin, ait.tTwist], text:":ANAME: grabs a hold of :TARGET:'s :TPENIS: through :THIS: :TCLOTHES:, then quickly twists!"});
                
                Text.insert({conditions:[abil, humanoid, C.PENIS, C.NO_BOTTOM], sound:'slap', ait:[ait.aGroin, ait.tSlap], text:":ANAME: slaps :TARGET:'s :TPENIS:, multiple times!"});
                Text.insert({conditions:[abil, humanoid, C.BREASTS, C.NO_TOP], sound:'slap', ait:[ait.aBreasts, ait.tSlap], text:":ANAME: slaps :TARGET:'s :TBREASTS:, multiple times!"});
                
                Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.PENIS, C.HAS_BOTTOM], sound:'stretch', ait:[ait.aGroin, ait.tSqueeze], text:":ANAME: grabs a hold of :TARGET:'s bulge through :THIS: clothes, squeezing painfully!"});
                Text.insert({conditions:[abil, humanoid, C.ARMOR_TIGHT, C.BREASTS, C.HAS_TOP], sound:'stretch', ait:[ait.aBreasts, ait.tSqueeze], text:":ANAME: grabs a hold of :TARGET:'s :TBREASTS: through :THIS: clothes, squeezing painfully!"});
                
                Text.insert({conditions:[abil, humanoid, race_imp, C.ARMOR_TIGHT, C.PENIS, C.HAS_BOTTOM], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around :TARGET:'s bulge. Wrapping under the :TRACE:'s balls, :ATTACKER: contracts the tongue, painfully squeezing :TARGET: and leaving a mark of demonic saliva across :THIS: :CROTCH:!"});
                Text.insert({conditions:[abil, humanoid, race_imp, C.BREASTS, C.NO_TOP], sound:'wet_squeeze', ait:[ait.aBreasts, ait.tSqueeze, ait.tLick], text:":ANAME: lashes :AHIS: long demonic tongue around one of :TARGET:'s :TBREASTS:, hooping around. :ATTACKER: contracts the tongue, painfully squeezing :TARGET: and leaving a mark of demonic saliva across :THIS: :TBREASTS:!"});
                
                Text.insert({conditions:[abil, humanoid, race_imp, C.A_NAKED, C.A_PENIS, C.NO_BOTTOM], sound:'squish', ait:[ait.aButt, ait.tCumInside, ait.tPin], text:":ANAME: lands a quick punch to :TARGET:'s throat, causing :THIM: to black out briefly! As the :TRACE: comes to, :THE: finds :THIM:self on top of :ATTACKER:, riding on :AHIS: :APENIS:. Before :TARGET: manages to get to :THIS: bearings, :THE: feels :ATTACKER:'s :APENIS: twitch as it launches a squirt of demonic jizz inside :TARGET:'s :TBUTT:!"});
                Text.insert({conditions:[abil, humanoid, race_imp, C.A_NAKED, C.A_PENIS, C.NO_BOTTOM, C.VAG], sound:'squish', ait:[ait.aVag, ait.tCumInside, ait.tPin], text:":ANAME: lands a quick punch to :TARGET:'s throat, causing :THIM: to black out briefly! As the :TRACE: comes to, :THE: finds :THIM:self on top of :ATTACKER:, riding on :AHIS: :APENIS:. Before :TARGET: manages to get to :THIS: bearings, :THE: feels :ATTACKER:'s :APENIS: twitch as it launches a squirt of demonic jizz inside :TARGET:'s :TVAG:!"});
                
                Text.insert({conditions:[abil, humanoid, race_imp, C.ARMOR_TIGHT, C.VAG, C(CO.TAGS, ["a_swimsuit"])], sound:'slap', ait:[ait.aGroin, ait.tSlap], text:":ANAME: grabs a hold of the front of :TARGET:'s :TCLOTHES:, near the groin and tugs up, revealing a camel toe! :attacker: throws a couple of slaps at it, sending short bursts of pain through :TARGET:'s :TGROIN:!"});
            

                // Hydromancer
                Text.insert({conditions:[abil, humanoid, hydromancer, C.ARMOR_TIGHT, C.PENIS, C.HAS_BOTTOM], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob lashes beneath the :TRACE:'s balls and around :THIS: package, contracting and squeezing it painfully!"});
                Text.insert({conditions:[abil, humanoid, hydromancer, C.PENIS, C.HAS_BOTTOM], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob slips into :THIS: :TCLOTHES:, encircling :THIS: package before contracting painfully!"});
                Text.insert({conditions:[abil, humanoid, hydromancer, C.NO_BOTTOM, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob encircles :THIS: package and contracts painfully!"});
                Text.insert({conditions:[abil, humanoid, hydromancer, C.PENIS], sound:'wet_squeeze', ait:[ait.aGroin, ait.tSqueeze, ait.tWet], text:":ANAME: casts a glob of water towards :TARGET:'s :TGROIN:! A long piece of watermilfoil within the glob encircles :THIS: penis and wrings, choking the :TRACE:'s :TPENIS: tightly!"});
                Text.insert({conditions:[abil, humanoid, hydromancer], sound:'slap_wet', ait:[ait.aGroin, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, lashing at the :TRACE:'s :TGROIN:!"});
                Text.insert({conditions:[abil, humanoid, hydromancer, C.BREASTS], sound:'slap_wet', ait:[ait.aBreasts, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril before :TARGET:, lashing at the :TRACE:'s :TBREASTS:!"});
                Text.insert({conditions:[abil, humanoid, hydromancer, C.NO_BOTTOM, C.PENIS], sound:'slap_wet', ait:[ait.aGroin, ait.tSlap, ait.tWet], text:":ANAME: summons a watery tendril between :TARGET:\'s legs, lashing at the :TRACE:'s :TPENIS: multiple times!"});
                

            // GRASP
                abil = C(CO.ABILITY, "GRASP");
                Text.insert({conditions:[abil, humanoid], sound:'punch_heavy', text:":ANAME: grasps :TARGET: in a vice-like grip, painfully squeezing :thim:!"});
                Text.insert({conditions:[abil, humanoid], sound:'punch_heavy', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down with :THIS: :TGROIN: against the :ARACE:'s knee!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.A_NAKED, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down :BUTT: first onto the :ARACE:'s :APENIS:, letting :TARGET: bounce up and down on :AHIS: length for a while!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.A_NAKED, C.A_PENIS, C.VAGINA], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground and slamming :THIM: down :TVAGINA: first onto the :ARACE:'s :APENIS:, letting :TARGET: bounce up and down on :AHIS: length for a while!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: in :AHIS: arms, lifting the :TRACE: off the ground, flipping :THIM: upside-down! :ANAME: forces :AHIS: :APENIS: into :TARGET:'s mouth and starts raising and lowering :THIM:, causing :AHIS: :APENIS: to be thrust back and forth into :TARGET:'s mouth!"});
                Text.insert({conditions:[abil, humanoid], sound:'stretch', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs wide apart, causing :THIM: great pain and lifting :TARGET:'s hips towards the :ARACE:'s face. :ATTACKER: gives the struggling :TRACE: a quick lick across :THIS: :TGROIN:!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.A_NAKED, C.A_PENIS], sound:'squish', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs wide apart and lifts :TARGET:'s hips towards :AHIS: own. :ATTACKER: forces :AHIS: :APENIS: inside :TARGET:'s :BUTT: and starts thrusting firmly!"});
                Text.insert({conditions:[abil, humanoid, C.NO_BOTTOM, C.A_NAKED, C.A_PENIS, C.VAGINA], sound:'squish', text:":ANAME: grasps :TARGET: by the legs and lifts! The :ARACE: forces :TARGET:'s legs apart and lifts :TARGET:'s hips towards :AHIS: own. :ATTACKER: forces :AHIS: :APENIS: inside :TARGET:'s :TVAGINA: and starts thrusting firmly!"});
                

            


        
        //
        
        // Player abilities
            // Crush
                abil = C(CO.ABILITY, "generic_crush");
                Text.insert({conditions:[abil], sound:'punch_heavy', text:":ANAME: jumps at :TARGET:, slamming both :AHIS: fists into the :TRACE:!"});
            
            // Taunt
                abil = C(CO.ABILITY, "generic_taunt");
                Text.insert({conditions:[abil], sound:'taunt', text:":ANAME: heckles :TARGET:, preparing for :THIM: to attack!"});
                        
            // masochism
                abil = C(CO.ABILITY, "defensive_masochism");
                Text.insert({conditions:[abil], sound:'masochism', text:":ANAME: cracks :AHIS: knuckles while looking aroused at :AHIS: enemies!"});

            // Heal
                abil = C(CO.ABILITY, "support_heal");
                Text.insert({conditions:[abil], sound:'heal', text:":ANAME: casts a heal on :TARGET:!"});
            
            // Purify
                abil = C(CO.ABILITY, "support_purify");
                Text.insert({conditions:[abil], sound:'dispel_good', text:":ANAME: purifies :TARGET:!"});

            // Counter
                abil = C(CO.ABILITY, "counterAttack");
                Text.insert({conditions:[abil], sound:'punch_heavy', text:":ANAME: counterattacks :TARGET:, dealing a large amount of damage!"});
            
            // Counter
                abil = C(CO.ABILITY, "corrupt");
                Text.insert({conditions:[abil], sound:'dark_cast', text:":ANAME: is surrounded by a dark aura!"});
            


        //


        // Challenge NPCs

            // HELL BENT FOR LATEX

                // Wing A
                    // Vag fixation
                        abil = C(CO.ABILITY, "VAG_FIXATION");
                        Text.insert({conditions:[abil], ait:[ait.aGroin, ait.tFist], sound:'squish', text:":ANAME: slips between :TNAME:'s legs, forcing :AHIS: fist up into the :TRACE:'s :TVAGINA:!"});
                        Text.insert({conditions:[abil], ait:[ait.aGroin, ait.tFist], sound:'squish', text:":ANAME: thrusts :AHIS: hand between :TARGET:'s legs, forcing it up inside :THIS: vagina! Thrusting it in and out of the :TRACE:!"});
                        Text.insert({conditions:[abil], ait:[ait.aGroin, ait.tPin], sound:'squish', text:":ANAME: grabs a hold of :TARGET:'s leg, lifting it up while shoving :AHIS: :APENIS: into the :TRACE:'s :TVAGINA:, thrusting it in and out of :THIM: a few times!"});
                        Text.insert({conditions:[abil], ait:[ait.aGroin, ait.tLick], sound:'squish', text:":ANAME: slips between :TARGET:'s legs. Cocking :AHIS: neck upwards, the :ARACE: sticks :AHIS: :AMOUTH: against :TARGET:'s :TGROIN: and slips :AHIS: long tongue inside! The :TRACE: squirms as the demonic tongue swirls around inside :THIM:!"});
                        
                    //

                    // Non-Vag fixation
                        abil = C(CO.ABILITY, "NONVAG_FIXATION");
                        Text.insert({conditions:[abil, C.PENIS], sound:'squeeze', ait:[ait.aGroin, ait.tSqueeze], text:":ANAME: grabs a hold of :TARGET:'s exposed :TPENIS:, rubbing it sensually!"});
                        Text.insert({conditions:[abil, C.A_PENIS, C.A_NAKED], sound:'squeeze', ait:[ait.aButt, ait.tPin], text:":ANAME: gets behind :TARGET: and forces :AHIS: :APENIS: up inside the :TRACE:'s :TBUTT:, thrusting into :THIM: a couple of times!"});
                        Text.insert({conditions:[abil, C.A_PENIS, C.A_NAKED], sound:'squeeze', ait:[ait.aMouth, ait.tPin], text:":ANAME: jumps at :TARGET:'s head and forces :AHIS: :APENIS: into the :TRACE:'s mouth, thrusting into :THIM: a couple of times!"});
                        Text.insert({conditions:[abil, C.A_PENIS, C.A_NAKED], sound:'squeeze', ait:[ait.aButt, ait.tLick], text:":ANAME: slips behind :TARGET:, pressing :AHIS: head against the :TRACE:'s :TBUTT:! :ATTACKER: pushes :AHIS: long tongue inside of the :TRACE:, forcing :THIM: to squirm as the demonic tongue swirls around inside :THIM:!"});
                        

                    //
                    
                //

                // WING C (Succubus)
                    abil = C(CO.ABILITY, "SUCCUBUS_AURA");
                    Text.insert({conditions:[abil], ait:[], sound:'dark_aura', text:":ANAME: is surrounded by a dark aura!"});
                    
                    abil = C(CO.ABILITY, "KISS");
                    Text.insert({conditions:[abil], ait:[ait.aMouth, ait.tKiss], sound:'kiss', text:":ANAME: places a kiss on :TARGET:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil], ait:[ait.aButt, ait.tKiss], sound:'kiss', text:":ANAME: places a kiss on :TARGET:'s :TBUTT:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil, C.ARMOR_TIGHT, C.PENIS, C.HAS_BOTTOM], ait:[ait.aGroin, ait.tKiss], sound:'kiss', text:":ANAME: places a kiss on :TARGET:'s :TGROIN: through :THIS: :TCLOTHES:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil, C.ARMOR_TIGHT, C.BREASTS, C.HAS_TOP], ait:[ait.aBreasts, ait.tKiss], sound:'kiss', text:":ANAME: gently kisses :TARGET:'s :TBREASTS: through :THIS: :TCLOTHES:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil, C.NO_BOTTOM, C.PENIS], ait:[ait.aGroin, ait.tKiss], sound:'kiss', text:":ANAME: places a quick kiss at the tip of :TARGET:'s :TPENIS:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil, C.NO_TOP, C.BREASTS], ait:[ait.aBreasts, ait.tKiss], sound:'kiss', text:":ANAME: places some quick kisses on :TARGET:'s :TBREASTS:, lowering :THIS: defenses!"});
                    Text.insert({conditions:[abil, C.NO_BOTTOM, C.VAG], ait:[ait.aVag, ait.tKiss], sound:'kiss', text:":ANAME: slips between :TARGET:'s legs and plants a kiss on the :TRACE:'s clit, lowering :THIS: defenses!"});
                    

                    abil = C(CO.ABILITY, "WHIPCRACK");
                    Text.insert({conditions:[abil], ait:[ait.aButt, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across :TARGET:'s :TBUTT:!"});
                    Text.insert({conditions:[abil], ait:[ait.aGroin, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across :TARGET:'s :TGROIN:!"});
					Text.insert({conditions:[abil, C.PENIS, C.ARMOR_TIGHT, C.HAS_BOTTOM], ait:[ait.aGroin, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across the :TGROIN: of :TARGET:'s :TCLOTHES:, smacking :THIS: bulge around!"});
					Text.insert({conditions:[abil, C.PENIS, C.NO_BOTTOM], ait:[ait.aGroin, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across target's :TPENIS:, smacking it around!"});
					
                    Text.insert({conditions:[abil, C.BREASTS, C.ARMOR_TIGHT, C.HAS_TOP], ait:[ait.aBreasts, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across :TARGET:'s :TBREASTS:, smacking them around within :THIS: :TCLOTHES:!"});
					Text.insert({conditions:[abil, C.BREASTS, C.NO_TOP], ait:[ait.aBreasts, ait.tWhip], sound:'whip', text:":ANAME: lashes :AHIS: whip across :TARGET:'s :TBREASTS:, smacking them around!"});
					
                //


            //


        //
        


        // Punishments

            // Dominant
                abil = C(CO.ABILITY, '__PUNISHMENT_DOM__');
                Text.insert({conditions:[abil], sound:'squish', text:"This is a DOMINANT punishment placeholder"});
                Text.insert({conditions:[abil, C.A_PENIS], sound:'squish', text:":ATTACKER: lays back on the ground, :APENIS: pointing into the air, before motionining at :TARGET: to come over. Catching the drift, and not wanting to risk a disqualification, the :TRACE: does as asked, seating :THIM:self onto the :ARACE:'s :APENIS:, facing away and separating :THIS: legs. :ATTACKER: grabs a hold of :TARGET:'s wrists and immediately starts bucking :AHIS: hips, forcing the :TRACE: to bounce up and down onto :ATTACKER:'s shaft! A few minutes later, the :ARACE: finally groans and bucks :AHIS: hips up high as :AHE: plants a big load into :TARGET:'s :TBUTT:, allowing the battle to come to a conclusion!"});
                Text.insert({conditions:[abil, C.A_PENIS, C(Condition.SIZE_LESS_THAN_N, [3])], sound:'squish', text:":ANAME: saunters over to :AHIS: little victim and shoves :TARGET: to the ground. :ANAME: kneels down over the :TRACE: before shoving thier :APENIS: into :TNAME:'s mouth. Grinding deeply into them, :ANAME: moans softly as :AHE: cums into their mouth, filling it with the taste of defeat. Slowly :ANAME: gets up off of the little :TRACE:'s mouth, dribbling their fluids all over :TNAME:'s face and marking them as :AHIS: own. :TNAME: lays there defeated in more ways that one."});
                
            // Sub
                abil = C(CO.ABILITY, '__PUNISHMENT_SUB__');
                Text.insert({conditions:[abil], sound:'squish', text:"This is a SUBMISSIVE punishment placeholder"});
                
            // Sadistic
                abil = C(CO.ABILITY, '__PUNISHMENT_SAD__');
                Text.insert({conditions:[abil], sound:'squish', text:"This is a SADISTIC punishment placeholder"});
                Text.insert({conditions:[abil, C.PENIS, C(CO.NOT_TAGS, ["c_uncut"])], sound:'squish', text:":ATTACKER: picks up a remote with various buttons and a cock ring, motioning for :TARGET: to come over. The :ARACE: slips the ring over :TARGET:'s :TPENIS:, right behind the tip, and pushes a button with a lightning bolt on it. :TARGET: winces as a short burst of electricity jolts through :THIS: :TPENIS:. :ATTACKER: throws the remote into the audience, who take turns pushing the various buttons. The poor :TRACE:'s :TPENIS: is treated to a range of various settings, including rapid shock pulses, long jolts, painful squeezes as some settings cause the ring to contract, and powerful vibrations. A few minutes later, a horn sounds, signifying that the battle is over, and letting the :TRACE: remove the ring."});
                Text.insert({conditions:[abil, C.PENIS, C(CO.TAGS, ["c_uncut"])], sound:'squish', text:":ATTACKER: picks up a remote with various buttons and a cock ring, motioning for :TARGET: to come over. The :ARACE: slips the ring under :TARGET:'s foreskin, nestling it at the back, and pushes a button with a lightning bolt on it. :TARGET: winces as a short burst of electricity jolts through :THIS: :TPENIS:. :ATTACKER: throws the remote into the audience, who take turns pushing the various buttons. The poor :TRACE:'s :TPENIS: is treated to a range of various settings, including rapid shock pulses, long jolts, painful squeezes as some settings cause the ring to contract, and powerful vibrations. A few minutes later, a horn sounds, signifying that the battle is over, and letting the :TRACE: remove the ring."});
            


            // Target dummy
                Text.insert({conditions:[C(CO.ABILITY, '__PUNISHMENT_DOM__'), C(CO.RACE, "targetDummy")], sound:'punch', text:":ATTACKER: humps at the wooden dummy a few times. Yeah that's right you wooden bastard, owned!"});
                Text.insert({conditions:[C(CO.ABILITY, '__PUNISHMENT_SUB__'), C(CO.RACE, "targetDummy")], sound:'squish', text:":ATTACKER: licks the wooden dummy where its crotch would have been if it had one, carefully avoiding getting splinters in :AHIS: tongue!"});
                Text.insert({conditions:[C(CO.ABILITY, '__PUNISHMENT_SAD__'), C(CO.RACE, "targetDummy")], sound:'slap', text:":ATTACKER: slaps the wooden dummy across its \"face\". Take that you pile of wood!"});
                

        //




    };



})();
