/**
 * boss class definition/auto boss discover
 */
var gbfbr = gbfbr || {};

/**
 * create a boss object
 * @param level level of this boss, should be a number or can be converted to a number
 * @param names an object which contains names under different locales of this boss, keys are short names of locales (like 'jpn', 'en' etc.)
 * and values are localized names
 * @param pic   an object which contains official twitter avatar of this boss, keys are short names of locales (like 'jpn', 'en' etc.)
 * and values are the last component (file name) in twitter picture URL
 * @constructor
 */
gbfbr.Boss = function Boss(level,names,pic){
    if(!names || !pic || !level){
        throw new Error("invalid argument!");
    }
    Object.defineProperties(this,{
        'level':{
            configurable:false,
            enumerable:true,
            value:+level,
            writable:false
        },
        'names':{
            configurable:false,
            enumerable:true,
            value:Boss.clone(names),
            writable:false
        },
        'pic':{
            configurable:false,
            enumerable:true,
            value:Boss.clone(pic),
            writable:false
        }
    });
};
/**
 * get a human-readable description of this boss
 * @param loc
 * @returns {string}
 */
gbfbr.Boss.prototype.toString = function(){
    var desc = "Lv";
    desc += this.level;
    if(this.names.jpn){
        desc += " ";
        desc += this.names.jpn;
    }
    if(this.names.en){
        desc += " ";
        desc += this.names.en;
    }
    return desc;
};

gbfbr.Boss.clone = function(obj){
    var ret = {};
    var props = {};
    for(var n in obj){
        if(obj.hasOwnProperty(n)){
            props[n]={
                configurable:false,
                enumerable:true,
                value:obj[n],
                writable:false
            };
        }
    }
    Object.defineProperties(ret,props);
    return ret;
};

gbfbr.Boss.twitter_image_link_prefix = "https://pbs.twimg.com/media/";