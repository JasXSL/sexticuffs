var IDB = {
    config: {
        db : 'Fight',
        version : 1,
        tables : [
            {
                name : "characters",
                primaryKey : 'UUID',
                keys: [
                    {
                        field : 'modified',
                        unique:false
                    },
                    {
                        field : 'id',
                        unique : true
                    }
                ]
            },
            // {type:(str)type, value:(var)value}
            {
                name : "config",
                primaryKey : 'type'
            }
        ]
    }
};


IDB.connect = function(){

    return new Promise(function(res){
        var request = window.indexedDB.open(IDB.config.db, IDB.config.version);
        request.onerror = function(event) {
            console.error("Connect error", event);
        };
        request.onsuccess = function(event) {
            res(event.target.result);
        };
        request.onupgradeneeded = IDB.buildSchema;
    });

};

IDB.buildSchema = function(event){

    var db = event.target.result;

    for(var i =0; i<IDB.config.tables.length; ++i){

        var tbl = IDB.config.tables[i];
        try{
            var store = db.createObjectStore(tbl.name, { keyPath: tbl.primaryKey });
            for(var x =0; x<tbl.keys.length; ++x){
                store.createIndex(tbl.keys[x].field, tbl.keys[x].field, {unique:tbl.keys[x].unique});
            }
        }catch(err){
            
        }
        
    }


};

IDB.getObjectStore = function(table, readOnly){

    return new Promise(function(res, rej){

        IDB.connect().then(function(db){
            if(table === undefined){
                console.error("table is undefined");
                rej();
                return;
            }
            var transaction = db.transaction([table], readOnly ? 'readonly' : "readwrite");
            transaction.onerror = function(event) {
                console.error("Transaction error", event);
            }; 
            var os = transaction.objectStore(table);
            res(os);
        });
        

    });
};

// Data can be an array or single object
IDB.put = function(table, data){

    if(!data)
        data = [];
    if(data.constructor !== Array)
        data = [data];

    return new Promise(function(res, rej){

        var generatePut = function(os, d){

            return new Promise(function(pp){
                
                var call = os.put(d);
                call.onsuccess = function(){
                    pp();
                };
                call.onerror = function(event){
                    console.log("Put failed", event);
                    pp();
                };

            });
        };

        IDB.getObjectStore(table).then(function(os){

            var inserts = [];
            for(var i =0; i<data.length; ++i){
                inserts.push(generatePut(os, data[i]));
            }

            Promise.all(inserts).then(res);

        });

    });
};

IDB.search = function(table, index, descending, limit){

    return new Promise(function(res, rej){

        var out = [];
        IDB.getObjectStore(table).then(function(os){

            if(os.keyPath !== index){
                os = os.index(index);
            }
            os.openCursor(null, descending ? 'prev': 'next').onsuccess = function(event) {
                var cursor = event.target.result;
                if(cursor) {
                    out.push(cursor.value);

                    if(!limit || --limit <= 0){
                        cursor.continue();
                        return;
                    }
                }
                res(out);
            };


        });

    });

};

// Gets a single item
IDB.get = function(table, index, item){

    return new Promise(function(res, rej){

        IDB.getObjectStore(table).then(function(os){

            if(os.keyPath !== index){
                os = os.index(index);
            }

            var request;
            try{
                request = os.get(item);
            }
            catch(err){
                alert("Your viewer doesn't fully suppor IDB. Try chrome/edge/opera/safari");
                console.error("Request error", err);
            }
            request.onsuccess = function(){

                if(!request.result){
                    res(false);
                }else{
                    res(request.result);
                }
            };

            request.onerror = function(){
                console.error("Error!", request);
                res(false);
            };

        });

    });

};

// Deletes a single item. Requires use of primary key
IDB.delete = function(table, item){
    
    return new Promise(function(res, rej){

        IDB.getObjectStore(table).then(function(os){

            var request = os.delete(item);
            request.onsuccess = function(){
                if(!request.result){
                    res(false);
                }else{
                    res(true);
                }
            };

            request.onerror = function(){
                res(false);
            };

        });

    });

};

