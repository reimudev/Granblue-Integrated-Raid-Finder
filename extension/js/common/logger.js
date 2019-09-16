//logging utility
var gbfbr = gbfbr || {};
if(!gbfbr || !gbfbr.persistence){
    throw new Error("logger depends on persistence util");
}
gbfbr.persistence.get("debugging.loggerEnabled",function(debugging){
    gbfbr['log'] = debugging ? function(){
        console.log.apply(undefined,arguments);
    } : function(){};
});