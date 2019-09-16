//local persistence utility
var gbfbr = gbfbr || {};
var noop = function(){};
gbfbr['persistence'] = {
    get:function(name,func){
        chrome.storage.local.get(name, function(obj){
            func(obj[name]);
        });
    },
    getMultiple:function(obj,func){
        func = func || noop;
        chrome.storage.local.get(obj, func);
    },
    set:function(key,val,func){
        var obj = {};
        obj[key] = val;
        func = func || noop;
        chrome.storage.local.set(obj,func);
    },
    setMultiple:function(obj,func){
        func = func || noop;
        func = func || noop;
        chrome.storage.local.set(obj,func);
    },
    remove:function(name){
        chrome.storage.local.remove(name);
    },
    saveLastPosition:function(key,val){
        //TODO: mysterious error here
        if(key.level && key.names && key.pic){
            key = gbfbr.Boss.prototype.toString.call(key);
        }
        key = "position_v2_"+key;
        this.set(key,val);
    },
    getLastPosition:function(key,func){
        if(key.level && key.names && key.pic){
            key = gbfbr.Boss.prototype.toString.call(key);
        }
        key = "position_v2_"+key;
        this.get(key,function(val){
            func(val);
        });
    },
    saveOldQueryResult:function(key,val){
        if(key.level && key.names && key.pic){
            key = gbfbr.Boss.prototype.toString.call(key);
        }
        key = "result_v2_"+key;
        this.set(key,val);
    },
    getOldQueryResult:function(key,func){
        if(key.level && key.names && key.pic){
            key = gbfbr.Boss.prototype.toString.call(key);
        }
        key = "result_v2_"+key;
        this.get(key,func);
    },
    saveBossList:function(list,version,func){
        if(list){
            this.set("boss_finder_boss_list",list,func);
        }else{
            this.remove("boss_finder_boss_list");
        }
        version = +version;
        if( ! isNaN(version)){
            this.set("boss_finder_boss_list_version",version);
        }
    },
    getBossList:function(func){
        this.getMultiple(["boss_finder_boss_list","boss_finder_boss_list_version"]
            ,function(ret){
            var list = ret['boss_finder_boss_list'];
            var version = +(ret['boss_finder_boss_list_version']) || 0;
            func({
                list:list,
                version:version
            });
        })
    }
};