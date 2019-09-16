(function(){

    var bossInfo;

    function initialized(){
        return window['gbfbr-boss-hp-initizlied'];
    }

    function Main(enable){
        if(enable){
            if(initialized()){
               return;
            }
            window.girfInjected.ajaxHooks.register(ajaxResultHook);
            window.girfInjected.ws.register(onMessageCallback);
            window['gbfbr-boss-hp-initizlied'] = "1";
        }else{
            window.girfInjected.ajaxHooks.deregister(ajaxResultHook);
            window['gbfbr-boss-hp-initizlied'] = undefined;
        }
    }

    window.girfInjected = window.girfInjected || {};
    window.girfInjected.battleModules.register(function(enable){
        Main(enable);
    });

    function onMessageCallback(m){
        m = m.data;
        var json;
        for(let i=0;i<m.length;++i){
            if(m[i]==='['){
                try{
                    json = JSON.parse(m.substr(i));
                }catch(e){
                }
                break;
            }
        }
        if(!json){
            return;
        }
        var hps = [];
        for(let i=0;i<json.length;++i){
            let obj = json[i];
            if(obj.bossUpdate && obj.bossUpdate.param){
                hps.push(obj.bossUpdate.param.boss1_hp);
                hps.push(obj.bossUpdate.param.boss2_hp);
                hps.push(obj.bossUpdate.param.boss3_hp);
                break;
            }else if(obj.battleFinish){
                hps.push(0);
                hps.push(0);
                hps.push(0);
                break;
            }
        }

        if(hps[0]===undefined){
            return;
        }
        bossInfo.setBossInfo(0,undefined,+hps[0]);
        bossInfo.setBossInfo(1,undefined,+hps[1]);
        bossInfo.setBossInfo(2,undefined,+hps[2]);
    }

    function ajaxResultHook( event, xhr, settings ){
        setTimeout(function(){
            var url = settings.url;
            var type = -1;
            if((url.indexOf('ability_result.json')>0
                || url.indexOf('normal_attack_result.json')>0
                || url.indexOf('summon_result.json')>0
                || url.indexOf('temporary_item_result.json')>0 //use potion
                || url.indexOf('user_recovery.json')>0)){ //use elixir
                type = 1;
            }else if(url.indexOf('start.json')>0){
                type = 2;
            }else{
                return;
            }

            var json = JSON.parse(xhr.responseText);
            switch(type){
                case 2:{
                    let params;
                    try{
                        params = json.boss.param;
                        //always create new object
                        //as the json.boss may be different each time we enter new battle in multi-stage battles
                        bossInfo = new BossInfo(json.boss,window['gbfbr-defaultLoc'],window.document);
                        bossInfo.initializeUI();
                    }catch(e){
                        window.girfInjected.log(e.stack);
                        return;
                    }
                    if(!params || !bossInfo){
                        break;
                    }
                    for(let i=0;i<params.length;++i){
                        let boss = params[i];
                        if(!boss){
                            continue;
                        }
                        bossInfo.setBossInfo(i,+boss.hpmax,+boss.hp);
                    }
                    break;
                }
                case 1:{
                    try{
                        let scenario = json.scenario;
                        for(let i=0;i<scenario.length;++i){
                            let obj = scenario[i];
                            if(obj.cmd === 'boss_gauge'){
                                bossInfo.setBossInfo(+obj.pos,+obj.hpmax,+obj.hp);
                            }else if(obj.cmd === 'die' && obj.to === 'boss' && obj.pos !== undefined){
                                bossInfo.setBossInfo(+obj.pos,undefined,0);
                            }
                        }
                    }catch(e){
                    }
                }
            }
        },0);
    }

    function BossInfo(bossJSON,loc,document){
        var onlyOneBoss = bossJSON.number === 1;
        var type = bossJSON.type; //l for 'large' boss, m for medium-sized boss, s for small-sized boss
        var internal = [
            {max:0,cur:0},
            {max:0,cur:0},
            {max:0,cur:0}
        ];
        var liveBossOB = new MutationObserver(checkReducedToOneBoss);
        var spanLeft;

        function makePercentString(val){
            if(val!==val){
                return "0%";
            }
            return (val).toFixed(2)+"%";
        }
        function makeLocalizedNumber(val,loc){
            val = ''+val;
            var ret = '';
            if(loc === 'en'){
                let st = val.length-3,end = val.length;
                if(st>0){
                    ret = val.substring(st,end);
                    end = st;
                    st -= 3;
                }else{
                    return val.substring(0,end);
                }
                if(st>0){
                    ret = val.substring(st,end)+","+ret;
                    end = st;
                    st -= 3;
                }else{
                    return val.substring(0,end) + "," + ret;
                }
                if(st>0){
                    ret = val.substring(st,end)+","+ret;
                    end = st;
                    st -= 3;
                }else{
                    return val.substring(0,end) + "," + ret;
                }
                if(st>0){
                    ret = val.substring(st,end)+","+ret;
                    /*end = st;
                    st -= 3;*/
                }else{
                    return val.substring(0,end) + "," + ret;
                }
                return ret;
            }else if(loc === 'zh'){
                let st = val.length-4,end = val.length;
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx);
                    }
                    end = st;
                    st -= 4;
                }else{
                    return val.substring(0,end);
                }
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx)+"万"+ret;
                    }
                    end = st;
                    st -= 4;
                }else{
                    return val.substring(0,end) + "万" + ret;
                }
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx)+"亿"+ret;
                    }
                    /*end = st;
                    st -= 4;*/
                }else{
                    return val.substring(0,end) + "亿" + ret;
                }
                return ret;
            }else if(loc === 'jpn'){
                let st = val.length-4,end = val.length;
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx);
                    }
                    end = st;
                    st -= 4;
                }else{
                    return val.substring(0,end);
                }
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx)+"萬"+ret;
                    }
                    end = st;
                    st -= 4;
                }else{
                    return val.substring(0,end) + "萬" + ret;
                }
                if(st>0){
                    let part = val.substring(st,end);
                    let idx = trimLeft(part,'0');
                    if(idx<part.length){
                        ret = part.substring(idx)+"億"+ret;
                    }
                    /*end = st;
                    st -= 4;*/
                }else{
                    return val.substring(0,end) + "億" + ret;
                }
                return ret;
            }

            function trimLeft(str,char){
                for(var i=0;i<str.length;++i){
                    if(str[i]!==char){
                        break;
                    }
                }
                return i;
            }
        }
        function checkReducedToOneBoss(){
            //two bosses died, only one survived
            var col = document.querySelectorAll(".btn-enemy-gauge.prt-enemy-percent.alive");
            if(col.length===1){
                //whether the boss gauge is restored to the long form
                //under some rare situations the gauge will not be restored unless users do a manual refresh
                if(col[0].classList.contains("gauge-mode-l1-1")){
                    col[0].classList.add("gbfbr-1boss");
                    spanLeft.classList.add("gbfbr-1boss-left");
                    liveBossOB.disconnect();
                }
            }
        }
        this.initializeUI = function(){
            //must be re-entrant
            for(let i=0;i<=2;++i){
                let gauge = document.getElementById("enemy-hp"+i);
                if(!gauge.getAttribute("data-girf-initialized")){
                    gauge.setAttribute("style",(gauge.getAttribute("style") || "")+";display:none;");
                    gauge.setAttribute("data-girf-initialized","1");
                }
                let percentDiv = gauge.nextElementSibling;
                if(!percentDiv.getAttribute("data-girf-initialized")){
                    percentDiv.setAttribute("style",(percentDiv.getAttribute("style") || "")+"display:none;");
                    percentDiv.setAttribute("data-girf-initialized","1");
                }

                let parent = gauge.parentNode;
                let span1,span2;
                if( ! parent.getAttribute("data-girf-has-span")){
                    span1 = document.createElement("span");
                    span1.setAttribute("class","gbfbr-hp-left");
                    span2 = document.createElement("span");
                    span2.setAttribute("class","gbfbr-hp-right");
                    parent.appendChild(span1);
                    parent.appendChild(span2);
                    parent.setAttribute("data-girf-has-span","1");
                }else{
                    span1 = parent.getElementsByClassName("gbfbr-hp-left")[0];
                    span2 = parent.getElementsByClassName("gbfbr-hp-right")[0];
                }

                //the 'alive' class is only added after the screen is initialized
                //so it is not a reliable way to detect whether there is only one boss through checking whether there is only
                //one div with 'alive' class
                if(onlyOneBoss){
                    if(type === 'l'){
                        parent.classList.add("gbfbr-1boss");
                        span1.classList.add("gbfbr-1boss-left");
                    }else if(type === 'm' || type === 's'){
                        //in fact small-sized boss has the same size gauge as medium ones
                        //the only known small-sized boss is mimics in arcanum world
                        parent.classList.add('gbfbr-medium-1boss');
                    }
                }else{
                    spanLeft = span1;
                    liveBossOB.observe(parent,{
                        attributes: true
                    });
                }
            }
        };
        this.setBossInfo = function(idx,max,cur){
            if(max!==undefined){
                internal[idx].max=max;
            }
            if(cur!==undefined){
                internal[idx].cur=cur;
            }
            this.initializeUI();
            var leftSpans = document.querySelectorAll("span.gbfbr-hp-left");
            var rightSpans = document.querySelectorAll("span.gbfbr-hp-right");
            leftSpans[0].innerHTML = makePercentString(internal[0].cur/internal[0].max*100);
            leftSpans[1].innerHTML = makePercentString(internal[1].cur/internal[1].max*100);
            leftSpans[2].innerHTML = makePercentString(internal[2].cur/internal[2].max*100);
            rightSpans[0].innerHTML = makeLocalizedNumber(internal[0].cur,loc);
            rightSpans[1].innerHTML = makeLocalizedNumber(internal[1].cur,loc);
            rightSpans[2].innerHTML = makeLocalizedNumber(internal[2].cur,loc);
        };

    }
}());

