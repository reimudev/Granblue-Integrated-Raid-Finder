/*
* combine several scripts into one to make loading faser
* */

 window.girfInjected = window.girfInjected || {};

(function(){
    var content = "";
    window.girfInjected.log = function(s){
        content += s + "\n";
    };
    window.girfInjected.printLog = function(){
        return content;
    };
    window.girfInjected.clear = function(){
        content = "";
    }
}());

(function(){
    var registeredCallbacks = [];
    window.girfInjected.ajaxHooks = {
        register: function(f){
            if(!f)return;
            registeredCallbacks.push(f);
        },
        deregister: function(f){
            if(!f)return;
            var idx = registeredCallbacks.indexOf(f);
            if(idx!==undefined){
                registeredCallbacks.splice(idx,1);
            }
        }
    };
    var handle = setInterval(function(){
        if(window.jQuery){
            clearInterval(handle);
            jQuery(window.document).ajaxComplete(function( event, xhr, settings ){
                if(!registeredCallbacks.length){
                    return;
                }
                for(let i=0;i<registeredCallbacks.length;++i){
                    let func = registeredCallbacks[i];
                    setTimeout(function () {
                        func( event, xhr, settings );
                    }, 0);
                }
            });
        }
    },50);
    //get rid of the Game.reportError function
    var handle2 = setInterval(function(){
        if(window.onerror){
            clearInterval(handle2);
            let str = window.onerror.toString();
            let valueOf = window.onerror.valueOf();
            let fake = function(){
                return true;
            };
            fake.toString = function(){return str;};
            fake.valueOf = function(){return valueOf;};
            window.onerror = fake;
        }

    },50);
}());

/*
 * this hook must be injected from the very beginning,
 * otherwise the creation of web socket object will not be intercepted
 */
(function(){
    var registeredCallbacks = [];
    window.girfInjected.ws = {
        register: function(f){
            if(!f)return;
            registeredCallbacks.push(f);
        },
        deregister: function(f){
            if(!f)return;
            var idx = registeredCallbacks.indexOf(f);
            if(idx!==undefined){
                registeredCallbacks.splice(idx,1);
            }
        },
        debug:function(){
            return registeredCallbacks;
        }
    };

    var ws = window.WebSocket;
    window.WebSocket = function(a,b) {
        var ret = new ws(a, b);
        //we cannot directly set the onmessage property or
        //replace the WebSocket object with deliberated proxies here.
        //the game is smart enough to detect that the object has been tampered and
        //start to use polling instead
        //this seemingly stupid method does work for this case
        var counter = 10;
        var handle = setInterval(function () {
            if(counter===0){
                window.girfInjected.log('cannot inject websocket');
                clearInterval(handle);
                return;
            }
            if(!ret.onmessage){
                --counter;
                return;
            }
            clearInterval(handle);
            let o = ret.onmessage;
            ret.onmessage = function (m) {
                o(m);
                for(let i=0;i<registeredCallbacks.length;++i){
                    let func = registeredCallbacks[i];
                    setTimeout(function () {
                        func(m);
                    }, 0);
                }
            };
        }, 50);
        return ret;
    }
}());

(function(){
    var registeredCallbacks = [];
    window.girfInjected.battleModules = {
        register: function(f){
            if(!f)return;
            registeredCallbacks.push(f);
        },
        call:function(flag){
            for(let i=0;i<registeredCallbacks.length;++i){
                try{
                    registeredCallbacks[i](flag);
                }catch(e){
                    window.girfInjected.log(e.stack);
                }
            }
        }
    };
}());

window.girfInjected.createMouseEvent = (function(){
    var mobage_container = document.getElementById("mobage-game-container");
    var zoom = (mobage_container && mobage_container.style.zoom) || -1;
    var gapX = 0,gapY = 0;
    var oldFakeEvent = document.createEvent("Event");
    oldFakeEvent.initEvent("tap",true,true);
    return function(reference,target){
        if(zoom==-1){
            return oldFakeEvent;
        }
        var $$ = $(target);
        //sometimes we are triggering click event without a user action
        //under such situations there will not be a referential event object
        if(reference){
            gapX = reference.screenX - reference.clientX;
            gapY = reference.screenY - reference.clientY;
        }
        var ofs = $$.offset();
        var height = $$.height() * Math.random();
        var width = $$.width() * Math.random();
        var cx = ofs.left*zoom + width;
        var cy = ofs.top*zoom + height;
        var mouseEvent = document.createEvent('MouseEvent');
        mouseEvent.initMouseEvent("tap", true, true, window, 0, cx+gapX, cy+gapY, cx, cy, false, false, false, false, 0, null);
        return mouseEvent;
    };
}());

window.girfInjected.registerErrorPopupCloser = function(predicator){
    //observer3
    let pop = document.querySelector("#pop");
    let observer3 = new MutationObserver(function(){
        if(predicator()){
            var error = pop.getElementsByClassName("common-pop-error")[0];
            if(error){
                document.getElementsByClassName("mask")[0].display = "none";
                error.style.display = "none";
                var usual_ok = error.getElementsByClassName("btn-usual-ok")[0];
                usual_ok.dispatchEvent(window.girfInjected.createMouseEvent(null,usual_ok));
            }
        }
    });
    observer3.observe(pop,{
        childList:true
    });
};

//var handle = setInterval(function(){
//    var o = Game.reportError;
//    if(o && (typeof o === 'function')){
//        clearInterval(handle);
//        Game.reportError = function(){};
//        Game.reportError.toString = function(){return o.toString();};
//    }
//},50);

(function(){
    var contents = document.getElementsByClassName("contents")[0];
    if( ! contents || ! contents.tagName.toLowerCase()!=='div'){
        window.girfInjected.log("div.contents does not exist");
    }
    new MutationObserver(function(){
        window.girfInjected.battleModules.call(document.getElementsByClassName("prt-member").length>0);
    }).observe(contents, {
            childList:true
        });
}());