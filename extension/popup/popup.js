
var interpolator =I18n.defaultInstance;

function showWarningMessage(text){
    $(".warning_message").html(text).slideDown(200).delay(1000).slideUp(200);
}

function updaterServerList(selectObj,list){
    let $$ = $(selectObj);
    $$.children().remove();
    for (let i = 0; i < list.length; ++i) {
        if(list[i].enabled === true){
            $$.append(`<option value='${list[i].url}' class='i18n_str'>${list[i].name}</option>`);
        }
    }
}

gbfbr.persistence.getMultiple([
        "default_locale"
        ,"debugging.loggerEnabled"
        ,"serverList"
    ],
    function(ret){
    var localServerList = ret['serverList']
        || {
            "list":[
                {
                    "url":"172.105.205.127:11451",
                    "name":"Thalatha",
                    "enabled":true
                }
            ]
        };
    var loc = ret['default_locale'] || 'en';
    interpolator['defaultLoc'] = loc;
    $("#options")
        //general options
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='raid_finder_title'></span>"
            },
            creator:function(idx){
                switch(idx){
                    case 0:
                        //disable this extension temporarily
                        //show tweets content or not
                        return $("<span class='option_label i18n_str' data-i18n_str='finder_switch_onoff'></span>")
                            .add(new Switcher({
                                bgcolor:'gray',
                                radius:'8px',
                                id:'boss_finder_switch',
                                on:function(){
                                    gbfbr.persistence.set("boss_finder_switch",true);
                                },
                                off:function(){
                                    gbfbr.persistence.set("boss_finder_switch",false);
                                }
                            }).get());
                    case 1:
                        return $("<span class='option_label i18n_str' data-i18n_str='finder_on_only_when_activated'></span>")
                            .add(new Switcher({
                                bgcolor:'gray',
                                radius:'8px',
                                id:'finder_on_only_when_activated',
                                on:function(){
                                    gbfbr.persistence.set("finder_on_only_when_activated",true);
                                },
                                off:function(){
                                    gbfbr.persistence.set("finder_on_only_when_activated",false);
                                }
                            }).get())
                            .add("<br/><span class='option_label i18n_str auxiliary' data-i18n_str='finder_switch_desc'></span>");
                    case 2:
                        //keep menu status
                        return $("<span class='option_label i18n_str' data-i18n_str='keep_raid_list_status'></span>")
                            .add(new Switcher({
                                bgcolor:'gray',
                                radius:'8px',
                                id:'keep_raid_list_status_switch',
                                on:function(){
                                    gbfbr.persistence.set("keep_raid_list_status_switch",true);
                                },
                                off:function(){
                                    gbfbr.persistence.set("keep_raid_list_status_switch",false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='keep_raid_list_status_desc'></span>")
                            .add("<br/><span id='keep_raid_list_status_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='keep_raid_list_status_desc'></span>");
                    case 3:{
                        //number of tracked boss
                        let label = $("<span class='i18n_str' data-i18n_str='boss_finder_list_number'>");
                        let ret = $("<select style='width:20%;float:right;text-align-last: center' id='boss_finder_list_number'></select>");
                        const max = 4;
                        for(let i=1;i<=max;++i){
                            ret.append("<option value='"+i+"'>"+i+"</option>");
                        }
                        ret.on("change",function(){
                            var interval = +($(this).find("option:selected").val());
                            if(isNaN(interval)){
                                interval = max;
                            }
                            if(interval<0){
                                interval = max;
                            }
                            gbfbr.persistence.set("boss_finder_list_number",interval);
                        });
                        return label.add(ret);
                    }
                    case 4:
                        return $("<span class='option_label i18n_str' data-i18n_str='reset_icon_position_desc'></span>")
                                .add($("<button class='i18n_str' style='float:right;width:70px;' data-i18n_str='reset_icon_position'></button>")
                                    .click(function(){
                                        gbfbr.persistence.set('boss_finder_icon_position',{x:"50px",y:"50px"});
                                        showWarningMessage(interpolator.localize('icon_position_reset_success'));
                                    }));
                    case 5:
                        //auto recovery
                        return $("<span class='option_label i18n_str' data-i18n_str='auto_recovery_switch_label'></span>")
                            .add(new Switcher({
                                bgcolor:'gray',
                                radius:'8px',
                                id:'auto_recovery_switch',
                                on:function(){
                                    gbfbr.persistence.set("auto_recovery_switch",true);
                                },
                                off:function(){
                                    gbfbr.persistence.set("auto_recovery_switch",false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='auto_recovery_switch_desc'></span>")
                            .add("<br/><span id='auto_recovery_switch_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='auto_recovery_switch_desc'></span>");

                }
            }
        }))
        //data fetching
        .append(new Accordion({
            title: function () {
                return "<span class= 'i18n_str' data-i18n_str='fetching_configuration'></span>"
            },
            creator: function (idx) {
                switch(idx){
                    case 0:
                        //show tweets content or not
                        return $("<span class='option_label i18n_str' data-i18n_str='finder_show_tweets'></span>")
                            .add(new Switcher({
                                bgcolor:'gray',
                                radius:'8px',
                                id:'boss_finder_show_tweets',
                                on:function(){
                                    gbfbr.persistence.set("boss_finder_show_tweets",true);
                                },
                                off:function(){
                                    gbfbr.persistence.set("boss_finder_show_tweets",false);
                                }
                            }).get());
                    case 1:{
                        //server list
                        let label = $("<span class='i18n_str' data-i18n_str='server_url_description'>");
                        let server_url = $("<select style='width:45%;float:right;text-align-last: center' id='server_url'></select>");
                        server_url.on("change", function () {
                            gbfbr.persistence.set("server_url", $(this).find("option:selected").val());
                        });
                        updaterServerList(server_url,localServerList.list);
                        return label.add(server_url).add("<span class='question' data-expand-desc='server_url_desc'></span>")
                            .add("<br/><span id='server_url_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='server_url_desc'></span>");
                    }
                    case 2:{
                        return $("<button class='i18n_str row-button' data-i18n_str='server_url_manual_refresh_button'></button>")
                            .click(function () {
                                $.getJSON('https://raw.githubusercontent.com/reimudev/Granblue-Integrated-Raid-Finder/master/bosslist.json'
                                    ,{_: new Date().getTime()}
                                    ,function(json){
                                        var removeServerListVersion = json['serverlist']['version'];
                                        var removeServerList = json['serverlist']['list'];
                                        if(!localServerList || removeServerListVersion>(localServerList['version'] || 0)){
                                            if( ! removeServerList || ! removeServerList.length){
                                                //server may produce invalid data
                                                return;
                                            }
                                            //silent update, don't bother here until fetching failed
                                            gbfbr.persistence.set('serverList',json['serverlist']);
                                            var server_url = $("#server_url");
                                            updaterServerList(server_url,removeServerList);
                                            server_url.find("option:first").prop("selected",true);
                                            server_url.change();
                                            showWarningMessage(interpolator.localize('server_url_manual_refreshed'));
                                        }else{
                                            showWarningMessage(interpolator.localize('server_url_manual_already_latest'));
                                        }
                                    });
                            });
                    }
                    case 3:{
                        return $("<span class='option_label i18n_str' data-i18n_str='beep_sound'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'beep_sound',
                                on: function () {
                                    gbfbr.persistence.set("beep_sound", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("beep_sound", false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='beep_sound_desc'></span>")
                            .add("<br/><span id='beep_sound_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='beep_sound_desc'></span>");
                    }
                }
            }
        }))
        //language
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='language'></span>"
            },
            creator:function(idx){
                switch(idx){
                case 0:{
                    let label = $("<span class='i18n_str' data-i18n_str='ui_language'>");
                    let ret = $("<select style='width:55%;float:right;'></select>")
                        .append("<option value='zh'>简体中文</option>")
                        .append("<option value='en'>English</option>")
                        .append("<option value='jpn'>日本語</option>")
                        .on("change",function(){
                            var loc = $(this).find("option:selected").val();
                            interpolator['defaultLoc'] = loc;
                            interpolator.interpolate();
                            gbfbr.persistence.set("default_locale",loc);
                        });
                    ret.find("option[value='"+loc+"']").prop("selected",true);
                    return label.add(ret);
                }
                case 1:{
                    let label = $("<span class='i18n_str' data-i18n_str='boss_name_language'>");
                    let ret = $("<select style='width:55%;float:right;' id='boss_finder_name_display_option'></select>")
                        .append("<option value='current' class='i18n_str' data-i18n_str='show_name_of_current_locale'></option>")
                        .append("<option value='all' class='i18n_str' data-i18n_str='show_all_available_names'></option>")
                        .on("change",function(){
                            var loc = $(this).find("option:selected").val();
                            gbfbr.persistence.set("boss_finder_name_display_option",loc);
                        });
                    return label.add(ret);
                }
                }
            }
        }))
        //coop-room
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='coop_menu_title'></span>"
            },
            creator:function(idx){
                switch(idx){
                    case 0:{
                        return $("<span class='option_label i18n_str auxiliary' data-i18n_str='coop_menu_desc'></span>");
                    }
                    case 1:{
                        //coop_menu_polling_interval
                        let label = $("<span class='i18n_str' data-i18n_str='coop_menu_polling_interval'>");
                        let ret = $("<select style='width:30%;float:right;text-align-last: center' id='coop_menu_polling_interval'></select>");
                        ret.append("<option value='10'>10</option>");
                        ret.append("<option value='10'>15</option>");
                        ret.append("<option value='10'>20</option>");
                        ret.append("<option value='9999999' style='width:30px;' class='i18n_str' data-i18n_str='coop_menu_polling_manual'></option>");
                        ret.on("change",function(){
                            var interval = +($(this).find("option:selected").val());
                            gbfbr.persistence.set("coop_menu_polling_interval",interval);
                        });
                        return label.add(ret);
                    }
                }
            }
        }))
        //boss list
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='boss_list'></span>"
            },
            creator:function(idx){
                switch(idx){
                case 0:
                    return $("<span class='option_label i18n_str' data-i18n_str='reset_boss_list'></span>")
                        .add($("<button class='i18n_str' style='float:right;width:70px;' data-i18n_str='reset_boss_list_button'></button>")
                            .click(function(){
                                gbfbr.resetBossListStatus(undefined,0);
                                showWarningMessage(interpolator.localize('reset_boss_list_success'));
                            }));
                case 1:
                    return $("<span class='option_label i18n_str' data-i18n_str='show_boss_portrait'></span>")
                        .add(new Switcher({
                            bgcolor:'gray',
                            radius:'8px',
                            id:'show_boss_portrait',
                            on:function(){
                                gbfbr.persistence.set("show_boss_portrait",true);
                            },
                            off:function(){
                                gbfbr.persistence.set("show_boss_portrait",false);
                            }
                        }).get());
                }
            }
        }))
        //omake
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='omake'></span>"
            },
            creator:function(idx) {
                switch (idx) {
                    case 0:
                        return $("<button class='i18n_str row-button' data-i18n_str='game_start'></button>")
                            .click(function () {
                                chrome.windows.create({url: 'http://game.granbluefantasy.jp/', type: 'popup', left: 0, width: 515});
                            });
                    case 1:
                        return $("<span class='option_label i18n_str' data-i18n_str='dialog_space_shortcuts_switch'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'dialog_space_shortcuts_switch',
                                on: function () {
                                    gbfbr.persistence.set("dialog_space_shortcuts_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("dialog_space_shortcuts_switch", false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='dialog_space_shortcuts_switch_desc'></span>")
                            .add("<br/><span id='dialog_space_shortcuts_switch_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='dialog_space_shortcuts_switch_desc'></span>");
                    case 2:
                        return $("<span style='display:none;' class='option_label i18n_str' data-i18n_str='skill_summon_shortcuts_switch'></span>")
                            /*.add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'skill_shortcuts_switch',
                                on: function () {
                                    //enable them together, for now
                                    gbfbr.persistence.set("skill_shortcuts_switch", true);
                                    gbfbr.persistence.set("summon_shortcuts_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("skill_shortcuts_switch", false);
                                    gbfbr.persistence.set("summon_shortcuts_switch", false);
                                }
                            }).get());*/
                    case 3:
                        return $("<span class='option_label i18n_str' data-i18n_str='char_hp_switch'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'char_hp_switch',
                                on: function () {
                                    gbfbr.persistence.set("char_hp_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("char_hp_switch", false);
                                }
                            }).get());
                    case 4:
                        return $("<span class='option_label i18n_str' data-i18n_str='accurate_hp_switch'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'accurate_hp_switch',
                                on: function () {
                                    //enable them together, for now
                                    gbfbr.persistence.set("accurate_hp_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("accurate_hp_switch", false);
                                }
                            }).get());
                    case 5:
                        return $("<span class='option_label i18n_str' data-i18n_str='close_error_window_switch'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'close_error_window_switch',
                                on: function () {
                                    gbfbr.persistence.set("close_error_window_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("close_error_window_switch", false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='close_error_window_switch_desc'></span>")
                            .add("<br/><span id='close_error_window_switch_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='close_error_window_switch_desc'></span>");
                    case 6:
                        return $("<span class='option_label i18n_str' data-i18n_str='barrier_free_playing_switch'></span>")
                            .add(new Switcher({
                                bgcolor: 'gray',
                                radius: '8px',
                                id: 'barrier_free_playing',
                                on: function () {
                                    gbfbr.persistence.set("barrier_free_playing_switch", true);
                                },
                                off: function () {
                                    gbfbr.persistence.set("barrier_free_playing_switch", false);
                                }
                            }).get())
                            .add("<span class='question' data-expand-desc='barrier_free_playing_switch_desc'></span>")
                            .add("<br/><span id='barrier_free_playing_switch_desc'" +
                                " class='option_label i18n_str auxiliary desc'" +
                                " data-i18n_str='barrier_free_playing_switch_desc'></span>");
                    case 7:
                    return $("<span class='option_label i18n_str' data-i18n_str='keep_playing'></span>")
                        .add(new Switcher({
                            bgcolor: 'gray',
                            radius: '8px',
                            id: 'keep_playing',
                            on: function () {
                                gbfbr.persistence.set("keep_playing", true);
                            },
                            off: function () {
                                gbfbr.persistence.set("keep_playing", false);
                            }
                        }).get())
                        .add("<span class='question' data-expand-desc='keep_playing_desc'></span>")
                        .add("<br/><span id='keep_playing_desc'" +
                            " class='option_label i18n_str auxiliary desc'" +
                            " data-i18n_str='keep_playing_desc'></span>");
                    case 9:
                        return $("<span class='option_label i18n_str' data-i18n_str='shortcuts_disclaimer'></span>");
                }
            }
            }))
        //contact
        .append(new Accordion({
            title:function(){
                return "<span class= 'i18n_str' data-i18n_str='about'></span>"
            },
            creator:function(idx){
                switch(idx){
                case 0:
                    return $("<span style='margin-right: 0.5em;'><a href='#' class='maillink'>reimu.dev@gmail.com</a></span>")
                        .click(function(){
                            chrome.tabs.update({
                                url: 'mailto:reimu.dev@gmail.com'
                            });
                        })
                        .add(
                        $("<span style='margin-right: 0.5em;'>"+chrome.runtime.getManifest().version+"</span>")
                    ).add(
                        $("<button class='i18n_str center_button' data-i18n_str='change_log_title'></button>")
                            .click(function(){
                                window.location = 'changelog.html';
                            })
                    );
                case 1:
                    return $("<span style='margin-right: 0.5em;'><a href='#'" +
                        " class='i18n_str' data-i18n_str='privacy_policy'></a></span>")
                        .click(function(){
                            chrome.tabs.create({
                                url: 'https://reimudev.github.io/Granblue-Integrated-Raid-Finder/docs/privacy.html?t='+new Date().valueOf()
                            });
                        });
                }
            }
        }))
        ;

    $(function(){
        $("span.question").click(function(){
            var related_id = this.getAttribute("data-expand-desc");
            $("#"+related_id).toggle();
        });
    });

    interpolator.interpolate();

    //initialization
    gbfbr.persistence.getMultiple([
            'skill_shortcuts_switch'
            ,'boss_finder_switch'
            ,'boss_finder_show_tweets'
            ,'boss_finder_name_display_option'
            ,'auto_recovery_switch'
            ,'keep_raid_list_status_switch'
            ,'show_boss_portrait'
            ,'twitter_fetch_interval'
            ,'boss_finder_list_number'
            ,'finder_on_only_when_activated'
            ,'dialog_space_shortcuts_switch'
            ,'coop_menu_polling_interval'
            ,'fetching_method_ex'
            ,'fetching_auto_switch'
            ,'char_hp_switch'
            ,'accurate_hp_switch'
            ,'close_error_window_switch'
            ,'barrier_free_playing_switch'
            ,'keep_playing'
            ,'beep_sound'
            ,'server_url'
        ]
        ,function(res){
            for(let name in res){
                if(!res.hasOwnProperty(name)){
                    continue;
                }
                var val = res[name];
                var elem = $(document.getElementById(name));
                if(!elem){
                    throw name;
                }
                //it is a Switcher
                if(elem.hasClass("switch")){
                    elem.get(0).handle.toggle(val);
                //it is a drop-down
                }else if(elem.is("select")){
                    var op;
                    if(val === undefined){
                        op = elem.find("option").eq(0);
                    }else{
                        op = elem.find("option[value='"+val+"']");
                    }
                    if(!op){
                        throw val;
                    }
                    op.prop("selected",true);
                }
            }
        });

    //turn on/off console debug logging
    var debuggingClickCount = 0;
    var currentDebuggingStatus = ret['debugging.loggerEnabled'];
    $(".debugging_trigger").click(function(){
        if(++debuggingClickCount===5){
            debuggingClickCount = 0;
            var text = interpolator.localize(currentDebuggingStatus ? "debugging_disabled" : "debugging_enabled");
            showWarningMessage(text);
            currentDebuggingStatus = !currentDebuggingStatus;
            gbfbr.persistence.set("debugging.loggerEnabled",currentDebuggingStatus);
        }
    });
});