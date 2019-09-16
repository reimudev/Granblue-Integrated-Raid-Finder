(function (){
    function makeAbilityShortcuts() {

        //this function will be called multiple times
        //even when necessary elements have already been created
        //due to deficiencies in detection mechanism
        //make it idempotent
        if (document.getElementById("quickability")) {
            makeSummonShortCut();
            return;
        }

        /**
         * We want to enable skill casting during stage entrance for bosses
         * that has long entrance animation, however at this time the attack button is still hidden yet.
         * So we need another global status to explicitly enable skill shortcut clicking
         * and auto dismissing of the skill popup.
         */
        let preemptiveStatus = true;
        //as in a multi-scene battle, the DOM elements will be completely destroyed after advancing to next scene
        if (!(
            document.getElementsByClassName("prt-sub-command").length
            && document.getElementsByClassName("prt-command").length
            && document.getElementsByClassName("prt-member").length
            && document.getElementsByClassName("btn-command-character").length
            && document.getElementsByClassName("lis-ability").length
            && document.getElementsByClassName("txt-recast").length
            && window.jQuery
            )
            ) {
            setTimeout(function () {
                try {
                    makeAbilityShortcuts();
                } catch (e) {
                    window.girfInjected.log(e.stack);
                }
            }, 100);
            return;
        }

        var $ = jQuery;
        $("#battle_injected_css").remove();

        var subcommand = $(".prt-sub-command");
        var command = $("div.prt-command");
        var sequenceInfo = $("#prt-sequence-info");
        var countmulti = $("div.cnt-multi");
        var container = $("<div id='quickability'>");//outermost container for shortcuts

        //container for skills of each party member
        container.append("<div class='qabilitybox'>");
        container.append("<div class='qabilitybox'>");
        container.append("<div class='qabilitybox'>");
        container.append("<div class='qabilitybox'>");

        subcommand.before(container);

        //4 skills and their cool down indicator
        $("div.qabilitybox")
            .append("<div class='qability'>")
            .append("<div class='qability'>")
            .append("<div class='cdindicator'>")
            .append("<div class='cdindicator'>")
            .append("<div class='qability'>")
            .append("<div class='qability'>")
            .append("<div class='cdindicator'>")
            .append("<div class='cdindicator'>");

        var subcommandtop = parseInt(subcommand.css("margin-top"));
        var containerwidth = $("div.prt-member").width();
        var boxw = $("div.btn-command-character").width();
        var indicatorh = 10;
        var indicatorw = boxw / 2;
        var abilityw = indicatorw;
        var abilityh = abilityw;
        var boxh = abilityh * 2 + indicatorh * 2;
        var containerh = abilityh * 2 + indicatorh * 2;
        //var countMultiHeight = (parseInt(countmulti.css("margin-top")) || 0)+containerh-6;
        var paddingLeft = $("div.prt-party").css("padding-left");
        var commandHeight = command.height() + containerh;
        var sequenceInfoTop = parseInt(sequenceInfo.css("marginTop"));
        var style = `<style id='battle_injected_css'>
                    div.qabilitybox{
                        width:${boxw}px;
                        height:${boxh}px;
                    }
                    div.qability{
                        width:${abilityw}px;
                        height:${abilityw}px;
                        display:inline-block;
                        background-size:${abilityw}px ${abilityw}px;
                        background-repeat:no-repeat
                    }
                    div.qability.unavailable{
                        opacity:0.5;
                    }
                    div.qability.inrail{
                        width:${abilityw - 4}px;
                        height:${abilityw - 4}px;
                        background-size:${abilityw - 4}px ${abilityw - 4}px;
                        border:2px solid yellow;
                    }
                    div.cdindicator{
                        width:${indicatorw}px;
                        height:${indicatorh}px;
                        display:inline-block;
                        text-align;center;
                        line-height:${indicatorh - 2}px;
                        color:white;
                        vertical-align:top;
                        text-align:center;
                    }
                    #quickability{
                        margin-top:${subcommandtop}px;
                        margin-bottom:${-subcommandtop}px;
                        padding-top:5px;
                        width:${containerwidth}px;
                        height:${containerh}px;
                        display:-webkit-box;
                        -webkit-box-pack:justify;
                        padding-left:${paddingLeft};
                    }
                    div.prt-command{
                        height:${commandHeight}px !important;
                    }
                    div#prt-sequence-info{
                        margin-top:${sequenceInfoTop+containerh}px !important;
                    }
                 </style>`;
        $(document.body).append($(style));
        countmulti.hide();
        countmulti.css("margin-top", command.position().top + command.height() - 20 + "px");
        countmulti.show();

        let autoCloseErrorPopup = false;
        /**
         * automatically dismiss ability dialogue during stage entrance for bosses that possess long entrance animation.
         * as a side effect, disables skill usage confirmation when triggered from our shortcut.
         */
        let autoCloseAbilityPopup = false;

        var btn = document.getElementsByClassName("btn-attack-start")[0];
        var btn2 = document.getElementsByClassName("btn-summon-use")[0];
        $(btn).add(btn2).click(function () {
            autoCloseErrorPopup = true;
        });

        let quickAbilities = document.querySelectorAll("div.qability");
        let quickAbilityIndicators = document.querySelectorAll("div.cdindicator");
        let abilityWrapper = document.querySelectorAll("div.prt-command-chara");

        let rawAbilities = [];
        {
            let length = Math.min(4,abilityWrapper.length);
            for(let k=0;k<length;++k){
                let wrapper = abilityWrapper[k];
                let abilitiesOfThisChara = wrapper.querySelectorAll("div.lis-ability");
                for(let s=0;s<=3;++s){
                    rawAbilities.push(abilitiesOfThisChara[s]);
                }
            }
        }
        {
            //observer1
            let observer = new MutationObserver(ob1Callback);
            for(let s=0;s<rawAbilities.length;++s){
                if(rawAbilities[s]){
                    observer.observe(rawAbilities[s], {
                        attributes: true
                    });
                }
            }
            ob1Callback();
            function ob1Callback(mutationsList, observer){
                try{
                    let p = 0;
                    //mysteriously, under some circumstances there will be 5 chara boxes but the last one is invisible
                    //some special battle has only three slots
                    let length = Math.min(4,abilityWrapper.length);
                    for(let k=0;k<length;++k){
                        let wrapper = abilityWrapper[k];
                        let abilitiesOfThisChara = wrapper.querySelectorAll("div.lis-ability");
                        for(let s=0;s<=3;++s){
                            let originalAbility = abilitiesOfThisChara[s];
                            let quickAbility = quickAbilities[p];
                            let quickAbilityIndicator = quickAbilityIndicators[p];
                            p++;
                            if(originalAbility){
                                let img = originalAbility.querySelector("img");
                                let image = img ? img.getAttribute("src") : "";
                                let turn = +(originalAbility.querySelector("div").getAttribute("ability-recast"));
                                let available = originalAbility.classList.contains('btn-ability-available')
                                    &&  ! originalAbility.classList.contains('ability-disable');
                                //ability in ability-rail
                                let tempMask = originalAbility.classList.contains("tmp-mask");

                                quickAbility.style.backgroundImage = "url('"+image+"')";
                                quickAbilityIndicator.innerHTML = (turn===0 || turn>1000) ? "" : turn;
                                quickAbility.setAttribute("data-disabled",available ? "" : "1");

                                quickAbility.classList.remove("unavailable");
                                quickAbility.classList.remove("inrail");

                                if(tempMask){
                                    quickAbility.classList.add("inrail");
                                }else if(!available){
                                    quickAbility.classList.add("unavailable");
                                }

                            }else{
                                quickAbility.style.backgroundImage = "";
                                quickAbilityIndicator.innerHTML = "";
                                quickAbility.disabled = true;
                                quickAbility.style.opacity = 0.2;
                            }
                        }
                    }
                }catch(e){
                    window.girfInjected.log(e.stack);
                }
            }
        }
        {
            //observer2
            let btnAttackStart = document.querySelector(".btn-attack-start");
            var observer2 = new MutationObserver(function(a,b){
                if(btnAttackStart.classList.contains("display-on")){
                    observer2.disconnect();
                    preemptiveStatus = false;
                }
            });
            observer2.observe(btnAttackStart, {
                attributes: true
            });
        }
        if(window['gbfbr-close_error_window_switch']==='true'){
            window.girfInjected.registerErrorPopupCloser(function(){
                if(autoCloseErrorPopup){
                    autoCloseErrorPopup = false;
                    return true;
                }
                return false;
            });
        }
        {
            //observer4
            let abilityPopup = document.querySelector("div.pop-usual.prt-ability-dialog");
            let usual_ok = abilityPopup.getElementsByClassName("btn-usual-ok")[0];
            let usual_cancel = abilityPopup.getElementsByClassName("btn-usual-cancel")[0];
            let observer4 = new MutationObserver(function(a,b){
                if(autoCloseAbilityPopup){
                    autoCloseAbilityPopup = false;
                    if(abilityPopup.style.display==="block"){
                        usual_ok.dispatchEvent(window.girfInjected.createMouseEvent(null,usual_ok));
                    }
                }
            });
            observer4.observe(abilityPopup,{
                attributes: true
            });
        }

        for(var i=0;i<quickAbilities.length;++i){
            let quickAbility = quickAbilities[i];
            let originalAbility = rawAbilities[i];
            let originalAbilityWrapper = abilityWrapper[Math.floor(i/4)];
            quickAbility.onclick = function(e){

                e.stopPropagation();
                e.stopImmediatePropagation();

                if(quickAbility.getAttribute("data-disabled")){
                    return true;
                }
                //during attack or attack command is issued,
                //should not make the operation pass through
                if(!preemptiveStatus && ! document.querySelector(".btn-attack-start.display-on")){
                    return;
                }
                autoCloseErrorPopup = true;
                autoCloseAbilityPopup = true;
                originalAbilityWrapper.style.display = "block";
                //the img element will be replaced by a new one each time when it is clicked
                //so the img element cannot be reused
                var img = originalAbility.querySelector("img");
                originalAbility.dispatchEvent(window.girfInjected.createMouseEvent(e,img));
                originalAbilityWrapper.style.display = "none";
            };
        }

        makeSummonShortCut();
    }

    function makeSummonShortCut(){

        if(document.getElementById("quicksummons")){
            return;
        }

        if(!(
            document.getElementsByClassName("lis-summon").length
            && document.getElementById("quickability")
            )
            ) {
            setTimeout(makeSummonShortCut, 100);
            return;
        }

        var $ = jQuery;
        $("#summon_injected_css").remove();
        var subcommand = $(".prt-sub-command");
        var summoncontainer = $("<div id='quicksummons'>");
        subcommand.before(summoncontainer);
        summoncontainer
            .append("<div class='qsummon'>")
            .append("<div class='qsummon'>")
            .append("<div class='qsummon'>")
            .append("<div class='summonindicator'>")
            .append("<div class='summonindicator'>")
            .append("<div class='summonindicator'>")
            .append("<div class='qsummon'>")
            .append("<div class='qsummon'>")
            .append("<div class='qsummon'>")
            .append("<div class='summonindicator'>")
            .append("<div class='summonindicator'>")
            .append("<div class='summonindicator'>")
        ;

        var subcommandtop = parseInt(subcommand.css("margin-top"));
        var boxw = $("div.btn-command-character").width();
        var indicatorh = 10;
        var indicatorw = boxw/2;
        var abilityw = indicatorw;
        var abilityh = abilityw;
        var boxh = abilityh*2+indicatorh*2;
        var containerh = abilityh*2+indicatorh*2;

        var style = `<style id='summon_injected_css'>
                        #quicksummons{
                            margin-top:${subcommandtop-containerh}px;
                            margin-bottom:${-subcommandtop}px;
                            width:${indicatorw*3+12}px;
                            height:${containerh}px;
                            display:-webkit-box;
                            -webkit-box-pack:justify;
                            padding-left:${$(".btn-command-summon").position().left}px;
                        }
                        div.qsummonbox{
                            width:${boxw}px;
                            height:${boxh}px;
                        }
                        div.qsummon{
                            width:${abilityw}px;
                            height:${abilityw}px;
                            display:inline-block;
                            background-repeat:no-repeat;
                            margin-right:2px;
                            background-size:${abilityw+2}px;
                            background-position:-1px -1px;
                        }
                        div.qsummon.unavailable{
                            opacity:0.5;
                        }
                        div.qsummon.inrail{
                            width:${abilityw-4}px;
                            height:${abilityw-4}px;
                            background-size:${abilityw}px;
                            border:2px solid yellow;
                        }
                        div.summonindicator{
                            width:${indicatorw}px;
                            height:${indicatorh}px;
                            display:inline-block;
                            margin-right:2px;
                            text-align;center;
                            line-height:${indicatorh-2}px;
                            color:white;
                            vertical-align:top;
                            text-align:center;
                        }
                     </style>`;
        //div.qsummon:
        //background-size+2 for removing right border in original image
        //background-position-1px for removing left and top border in original image
        $(document.body).append($(style));

        var autoCloseErrorPopup = false;
        var autoCloseSummonPopup = false;

        var rawSummons = document.querySelectorAll("div.lis-summon");
        var quickSummons = document.querySelectorAll("div.qsummon");
        var quickSummonIndicators = document.querySelectorAll("div.summonindicator");
        var summonListButton = document.querySelector(".btn-command-summon");
        let observer = new MutationObserver(observerCallback);
        for(let s=0;s<rawSummons.length;++s){
            observer.observe(rawSummons[s], {
                attributes: true
            });
        }
        observerCallback();
        if(window['gbfbr-close_error_window_switch']==='true'){
            window.girfInjected.registerErrorPopupCloser(function(){
                if(autoCloseErrorPopup){
                    autoCloseErrorPopup = false;
                    return true;
                }
                return false;
            });
        }
        {
            //observer4
            let pop = document.querySelector("div.pop-summon-detail");
            let observer4 = new MutationObserver(function(a,b){
                if(autoCloseSummonPopup){
                    autoCloseSummonPopup = false;
                    if(pop && $(pop).is(":visible")){
                        var btn = pop.getElementsByClassName("btn-usual-ok")[0];
                        if(btn && $(btn).is(":visible")){
                            btn.dispatchEvent(window.girfInjected.createMouseEvent(null,btn));
                        }else{
                            var usual_cancel = pop.getElementsByClassName("btn-usual-cancel")[0];
                            usual_cancel.dispatchEvent(window.girfInjected.createMouseEvent(null,usual_cancel));
                        }
                        var command_back = document.getElementsByClassName("btn-command-back")[0];
                        command_back.dispatchEvent(window.girfInjected.createMouseEvent(null,command_back));
                    }
                }
            });
            observer4.observe(pop,{
                attributes: true
            });
        }

        for(var i=0;i<quickSummons.length;++i){
            let quickSummon = quickSummons[i];
            let originalSummon = rawSummons[i];
            quickSummon.onclick = function(e){

                e.stopPropagation();
                e.stopImmediatePropagation();

                if(quickSummon.getAttribute("data-disabled")){
                    return true;
                }
                autoCloseErrorPopup = true;
                autoCloseSummonPopup = true;
                summonListButton.dispatchEvent(window.girfInjected.createMouseEvent(e,summonListButton));
                originalSummon.dispatchEvent(window.girfInjected.createMouseEvent(e,originalSummon));

                return true;
            };
        }

        function observerCallback(mutationsList, observer){
            for(let s=0;s<rawSummons.length;++s){
                let originalSummon = rawSummons[s];
                let image = originalSummon.querySelector("img").getAttribute("src");
                let turn = +(originalSummon.getAttribute("summon-recast"));
                let available = originalSummon.classList.contains('btn-summon-available');
                //summon on the rail
                let tempMask = originalSummon.classList.contains("tmp-mask");
                let quickSummon = quickSummons[s];

                quickSummon.style.backgroundImage = "url('"+image+"')";
                quickSummonIndicators[s].innerHTML = (turn===0 || turn>1000) ? "" : turn;
                quickSummon.setAttribute("data-disabled",available ? "" : "1");

                quickSummon.classList.remove("unavailable");
                quickSummon.classList.remove("inrail");

                if(tempMask){
                    quickSummon.classList.add("inrail");
                }else if(!available){
                    quickSummon.classList.add("unavailable");
                }
            }
        }
    }

    window.girfInjected = window.girfInjected || {};
    window.girfInjected.log(window.girfInjected.battleModules);
    window.girfInjected.battleModules.register(function(enable){
        if(enable){
            makeAbilityShortcuts();
        }
    });
}());