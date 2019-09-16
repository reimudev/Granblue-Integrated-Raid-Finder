gbfbr.persistence.getMultiple([
    "skill_shortcuts_switch22222"
    ,"char_hp_switch"
    ,"default_locale"
    ,"accurate_hp_switch"
    ,"barrier_free_playing_switch"
    ,"close_error_window_switch"
    ,"keep_playing"
],function(obj){

    var enabled = false;
    for(var n in obj){
        if(obj.hasOwnProperty(n)){
            if(obj[n]===true){
                enabled = true;
                break;
            }
        }
    }
    if(enabled){

        if(obj['keep_playing']){
            injectScript('/js/plugin-scripts/modules/keep_playing.js');
        }

        var basic_module = injectScript('/js/plugin-scripts/modules/modules_basic.js');
        basic_module.addEventListener('load',function(){

            if(obj['close_error_window_switch']){
                injectScriptDirect("window['gbfbr-close_error_window_switch']='" + obj["close_error_window_switch"] + "'");
            }
            if(obj['skill_shortcuts_switch22222']){
                injectScript('/js/plugin-scripts/modules/shortcuts.js');
            }
            if(obj['barrier_free_playing_switch']){
                injectCSS('/js/plugin-scripts/css/barrier_free.css');
            }

            if(obj['char_hp_switch']){
                injectScript('/js/plugin-scripts/modules/char_hp.js');
            }

            if(obj['accurate_hp_switch']) {
                {
                    injectScriptDirect("window['gbfbr-defaultLoc']='" + obj["default_locale"] + "'");
                    injectCSS('/js/plugin-scripts/css/battle_boss_hp_injected.css');
                    injectScript('/js/plugin-scripts/modules/boss_hp.js');
                }
            }
        });
        function injectScriptDirect(content){
            let s = document.createElement('script');
            s.innerHTML = content;
            s.setAttribute("id","girf_script_"+new Date().valueOf()+"_"+Math.floor(Math.random()*100));
            var head = (document.head || document.documentElement);
            var first = head.childNodes[0];
            head.insertBefore(s,first);
            return s;
        }
        function injectScript(url){
            let s = document.createElement('script');
            s.src = chrome.extension.getURL(url);
            s.setAttribute("id","girf_script_"+new Date().valueOf()+"_"+Math.floor(Math.random()*100));
            var head = (document.head || document.documentElement);
            var first = head.childNodes[0];
            head.insertBefore(s,first);
            return s;
        }
        function injectCSS(url){
            let style = document.createElement("link");
            style.setAttribute("rel","stylesheet");
            style.setAttribute("type","text/css");
            style.setAttribute("href",chrome.extension.getURL(url));
            style.id = "girf_css_"+new Date().valueOf()+"_"+Math.floor(Math.random()*100);
            document.body.appendChild(style);
            return style;
        }
    }
});
