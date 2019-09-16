//background script
//avoid chrome.tabs.query call by recording tab id of the tab which find_multi.js is in

//Default option values
var defaults = {
    'skill_shortcuts_switch':false,                                 //by default, the skill shortcuts feature is disabled
    'boss_finder_switch':true,                                      //by default, the integrated boss finder is enabled
    'boss_finder_show_tweets':false,                                //by default, the integrated boss finder does not show tweeter contents
    'debugging.loggerEnabled':false,                                //debugging is disabled by default
    'default_locale':'en',                                          //default locale for i18n
    'boss_finder_icon_position':{                                   //default icon position
        x:"50px",y:"50px"
    }
    ,'auto_recovery_switch':false
    ,'keep_raid_list_status_switch':false
    ,'show_boss_portrait':true
    ,'twitter_fetch_interval':5
    ,'boss_finder_list_number':1
    ,'dialog_space_shortcuts_switch':false
    ,'finder_on_only_when_activated':false
    ,'coop_menu_polling_interval':10000
    ,'fetching_method_ex':"1" //default to from backend server
    ,'fetching_auto_switch':true//default to auto-switch, 'reasonable default'
    ,'char_hp_switch':false
    ,'accurate_hp_switch':false
    ,'close_error_window_switch':false
    ,'barrier_free_playing_switch':false
    ,'keep_playing':false
    ,'beep_sound':false
    ,'server_url':'172.105.205.127:11451'
};

var keys = [];
for(var n in defaults){
    if(defaults.hasOwnProperty(n)){
        keys.push(n);
    }
}
gbfbr.persistence.getMultiple(keys,function(ret){
   for(var n in ret){
       //override default values with values in local storage
       if(ret.hasOwnProperty(n)){
           defaults[n] = ret[n];
       }
   }
   gbfbr.persistence.setMultiple(defaults);
});

/**
 * Be compatible with old version.
 * As this feature is removed, remove related locally stored data which is no longer in use
 */
gbfbr.persistence.remove("boss_finder_tweet_data");

const cache_size = 100;

//raids that passed preliminary check and are visited by user
gbfbr.persistence.get("boss_finder_visited_raid",function(ret){
    if(!ret){
        gbfbr.persistence.set("boss_finder_visited_raid",{cache:[],hash:{}});
        return;
    }
    //keep only the latest 100 entries
    var visited_raid = ret;
    var cache = visited_raid.cache;
    var hash = visited_raid.hash;
    if(cache.length<=cache_size)
        return;
    var split = cache.length - cache_size;
    var rem = visited_raid.cache.slice(0,split);
    visited_raid.cache = visited_raid.cache.slice(split);
    for(let i=0;i<rem.length;++i){
        delete visited_raid.hash[rem[i]];
    }
    gbfbr.persistence.set("boss_finder_visited_raid",visited_raid);
});

//copy text sent by content script
chrome.runtime.onMessage.addListener(function(message) {
    if (message && message.type == 'copy') {
        var input = document.createElement('input');
        document.body.appendChild(input);
        input.value = message.text;
        input.focus();
        input.select();
        document.execCommand('Copy');
        input.remove();
    }
});

chrome.webRequest.onBeforeSendHeaders.addListener(
    function(info) {
        var headers = info.requestHeaders;
        var isMyRequest = false;
        var i = 0;
        var referer = null;
        var cookie = null;
        for(;i<headers.length;++i){
            let header = headers[i];
            let name = header.name.toLowerCase();
            if(name === 'x-gbfbr-plugin-twitter-request'){
                isMyRequest = true;
                headers.splice(i,1);
                --i;
            }else if(name === 'referer'){
                referer = header;
            }else if(name === 'cookie'){
                //to make plugin fetch from twitter while the user is logged in twitter
                //we should send no cookie to twitter
                //otherwise twitter will response with 403 or an HTML page to prevent crawlers
                cookie = header;
            }else if(name === 'user-agent'){
                //prevent redirection to mobile.twitter.com
                var val = header.value;
                if(val.indexOf('Mobile')>=0){
                    val = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36';
                }
                header.value = val;
            }
        }
        if(isMyRequest){
            referer.value = info.url;
            cookie.value = "";
        }
        return {requestHeaders: headers};
    },
    {
        urls: [
            "https://twitter.com/i/search/timeline*"
        ],
        types: ["main_frame","sub_frame","xmlhttprequest"]
    },
    ["blocking","requestHeaders"]
);

chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        //don't receive cookies from twitter when we do this request
        //from within our extension, which will make subsequent login to twitter fails mysteriously
        var headers = info.responseHeaders;
        for(let i=0;i<headers.length;++i){
            //there are multiple set-cookie's
            if(headers[i].name === 'set-cookie'){
                headers[i].value = '';
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [
            "https://twitter.com/i/search/timeline*"
        ],
        types: ["main_frame","sub_frame","xmlhttprequest"]
    },
    ["blocking","responseHeaders"]
);