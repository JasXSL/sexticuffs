class Mod extends Asset{



    constructor(data){
        super();

        this.name = '';
        this.version = 1;
        this.lib = {
            Ability : [],
            Text : [],
            Armor : [],
            Character: [],              // Monsters and coop players
            Race:[],
            Challenge:[]
        };
        this.active = true;

        this.load(data);
        return this;
    }


    // Converts and install assets into library
    unpackIntoLib(type, assets){
        for(let asset of assets){
            Mod.assetTypes[type].insert(asset);
        }        
    }

    // Installs all mods
    unpack(){

        for(let i in this.lib){
            if(DB.hasOwnProperty(i)){
                this.unpackIntoLib(i, this.lib[i]);
            }
        }

    }

    onLoaded(){
        let lib = this.lib;
        for(let i in lib){
            for(let idx =0; idx<lib[i].length; ++idx)
                lib[i][idx] = Mod.type2obj(i, lib[i][idx]);
        }
    }
    

    export(){

        let lib = this.lib;
        let libout = {};
        for(let i in lib){
            libout[i] = [];
            for(let asset of lib[i]){
                
                if(asset.constructor === Character){
                    libout[i].push(asset.hostExportFull(true));
                }else{
                    libout[i].push(asset.export(true));
                }
            }
        }
        return {
            UUID : this.UUID,
            name : this.name,
            lib : libout,
            active: this.active,
            version : this.version
        };

    }





    static ini(){
        // Load all mods

        Mod.assetTypes = {
            Ability : Ability,
            Text : Text,
            Armor : Armor,
            Character: Character,              // Monsters and coop players
            Race: Race,
            Challenge: Challenge
        };

        return new Promise(function(res, rej){

            IDB.getAll("mods")
            .then(function(results){
                
                console.log("Installing mods", results);
                for(let mod of results){
                    if(!mod.active)
                        break;
                    let m = new Mod(mod);
                    console.log("Unpacking", m);
                    m.unpack();
                }


                res();
            });

        });


    };

    static type2obj(clsname, data){
        return new Mod.assetTypes[clsname](data);
    }

    // Adds a new mod to IDB
    static installFromJson(modObj){
        modObj.active = true;
        let mod = new Mod(modObj);
        IDB.put('mods', mod.export());

    }

    static removeByUUID(uuid){
        IDB.delete("mods", uuid);
    }


        
}




