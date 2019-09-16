//space short-cut for dialogs
gbfbr.persistence.get("dialog_space_shortcuts_switch",function(obj){
    if(!obj)
        return;
    var tap_event = document.createEvent("Event");
    tap_event.initEvent("tap", true, true);
    function checkHash(){
        function keyup(e){
            if(e.keyCode===32){
                let talkView = document.querySelector(".talkView");
                if( ! talkView){
                    //space will scroll the screen if backlog is shown
                    document.querySelector(".prt-scene-comment").dispatchEvent(tap_event);
                }
            }else if(e.keyCode===66){
                let logView = document.querySelector(".logView");
                let talkView = document.querySelector(".talkView");
                if(logView){
                    logView.dispatchEvent(tap_event);
                }else if(talkView){
                    talkView.dispatchEvent(tap_event);
                }
            }
        }
        var hash = window.location.hash;
        if(hash.startsWith("#quest/scene")
            || hash.startsWith("#archive/story")
            || hash.startsWith("#scene")
            || hash.startsWith("#sidestory/scene/")
            || (hash.startsWith("#event") && (hash.indexOf("scene/")>0 || hash.indexOf("opening/")>0))
            || (hash.indexOf("#archaic/scene/")>=0)
            ){
            window.addEventListener("keyup",keyup);
        }else{
            window.removeEventListener("keyup",keyup);
        }
    }
    window.addEventListener("hashchange",checkHash);
    checkHash();
});