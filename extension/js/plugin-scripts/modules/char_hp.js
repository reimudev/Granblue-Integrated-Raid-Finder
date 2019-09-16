(function(){

    function makeCharHpPercent(){

        if(!(
            document.getElementsByClassName("btn-command-character").length
            )
            ){
            setTimeout(makeCharHpPercent,100);
            return;
        }

        if(document.getElementsByClassName("gbfbr-char-hp").length){
            return;
        }

        var displays = [];
        var commands = document.querySelectorAll("#prt-command-top .btn-command-character");
        var gauges = [];

        var observer2 = new MutationObserver(function(mutationRecord){
            for(let i=0;i<commands.length;++i){
                let command = commands[i];
                if(!command || command.classList.contains("blank")){
                    displays[i].innerHTML = "";
                    continue;
                }
                var gauge = gauges[i];
                displays[i].innerHTML = parseInt(gauge.style.width) + "%";
            }
        });

        for(let i=0;i<commands.length;++i){
            let command = commands[i];
            let span = document.createElement("span");
            span.classList.add("gbfbr-char-hp");
            let first = command.childNodes[0];
            command.insertBefore(span,first);
            displays.push(span);
            let gauge = command.getElementsByClassName("prt-gauge-hp-inner")[0];
            gauge.setAttribute("data-pos",command.getAttribute("pos"));
            gauges.push(gauge);
            observer2.observe(gauge,{attributes:true});
        }

        var style = document.createElement("style");
        style.innerHTML = `
                span.gbfbr-char-hp {
                    position: absolute;
                    top: -10px;
                    color: white;
                    font-size: 10px;
                    width: 100%;
                    text-align: center;
                }`;
        document.body.appendChild(style);
    }

    window.girfInjected = window.girfInjected || {};
    window.girfInjected.battleModules.register(function(enable){
        if(enable){
            makeCharHpPercent();
        }
    });
}());