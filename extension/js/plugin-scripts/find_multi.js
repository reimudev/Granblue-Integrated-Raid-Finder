/**
 * content scripts that operates provides auto raid finder function
 * in the form of a floating icon
 */

//content scripts that match the same url pattern do affect each other even you put them in separate js files.
//do not use same variable names, they are the same
gbfbr.persistence.getMultiple(["boss_finder_switch"
                              ,"boss_finder_show_tweets"
                              ,"default_locale"
                              ,"boss_finder_icon_position"
                              ,"boss_finder_visited_raid"
                              ,"boss_finder_name_display_option"
                              ,"auto_recovery_switch"
                              ,"keep_raid_list_status_switch"
                              ,"boss_finder_raid_list_expanded"
                              ,"show_boss_portrait"
                              ,"bossListData"
                              ,"boss_finder_list_number"
                              ,"finder_on_only_when_activated"
                              ,"gbfr_coop_room_filter_str"
                              ,"gbfr_current_tab"
                              ,"coop_menu_polling_interval"
                              ,"fetching_method_ex"
                              ,"fetching_auto_switch"
                              ,"beep_sound"
                                ],function(ret){
    //boss finder is disabled, do nothing
    if(! ret['boss_finder_switch'])
        return;
    gbfbr.persistence.getBossList(function(bossListObject){
        //--------------flags-------------
        var show_tweets = ret['boss_finder_show_tweets'];                           //show tweets content or not
        var name_display_option = ret['boss_finder_name_display_option'];           //boss name display preference
        var auto_recovery_switch = ret['auto_recovery_switch'];                     //auto bp recovery switch
        var keep_raid_list_status_switch = ret['keep_raid_list_status_switch'];     //keep raid list as expanded
        var show_boss_portrait = ret['show_boss_portrait'];                         //show boss portrait or not
        var twitter_fetch_interval = 5000;//to milliseconds
        var finder_on_only_when_activated = ret['finder_on_only_when_activated'];

        //--------------config values-------------
        var default_locale = ret['default_locale'];
        var globalBossList = bossListObject['list'] || gbfbr.defaultBosses;
        var icon_position = ret['boss_finder_icon_position'];                       //saved or default floating icon position
        var visited_raid = ret['boss_finder_visited_raid'];                         //raids that has been visited
        var bossListCount = ret['boss_finder_list_number'] || 1;
        var beepSound = ret['beep_sound'];
        //--------------locally saved data-------------
        var bossListData = ret['bossListData'] || [];
        bossListData.length = bossListCount;
        for(let i=0;i<bossListCount;++i){
            if(bossListData[i]===undefined){
                bossListData[i] = {
                    prevBoss:globalBossList[0],
                    scrollPos:0,
                    foldedSeparators:{}
                };
            }
            bossListData[i].prevBoss = bossListData[i].prevBoss || globalBossList[0];
            bossListData[i].scrollPos = bossListData[i].scrollPos || 0;
        }

        //whether the raid list is currently expanded or not, this status is changed manually by clicking
        var boss_finder_raid_list_expanded = ret['boss_finder_raid_list_expanded'];
        const popupAnimationDuration = 100;

        //-------------- DOM elements -----------------
        //this one is frequently used
        var container_icon_jq = undefined;
        var container_jq = undefined;
        var bossPortrait = undefined;
        var coop_room_list_jq = undefined;
        var coop_room_input_jq = undefined;
        var gbfr_current_tab = +ret['gbfr_current_tab'] || 0;
        var coop_menu_polling_interval = +ret['coop_menu_polling_interval'] || 10000;
        var filters = [];

        //prevent interleaving coop room fetching requests
        //to proceed in parallel;
        var epoch = 0;

        //-------------- aggregated temprary data ----------------
        var displayInfo = new Array(bossListCount);
        for(let i=0;i<displayInfo.length;++i){
            displayInfo[i] = {
                twitterListDom:undefined,
                handle:-1,
                bossListDropDown:undefined
            };
        }

        //--------------initialization-------------
        //default locale for hints, titles and messages
        I18n.defaultInstance.defaultLoc = ret['default_locale'];
        //default boss list when this plugin is installed for the first time
        if( ! globalBossList){
            globalBossList = gbfbr.defaultBosses;
        }
        //update boss list from server
        $.getJSON('https://raw.githubusercontent.com/reimudev/Granblue-Integrated-Raid-Finder/master/bosslist.json'
            ,{_: new Date().getTime()}
            ,function(json){
                var serverBossListVersion = json['version'];
                var list = json['list'];
                if(serverBossListVersion>bossListObject['version']){
                    if( ! list || ! list.length){
                        //server may produce invalid data
                        return;
                    }
                    gbfbr.resetBossListStatus(list,serverBossListVersion);
                    showPopup(I18n.defaultInstance.localize("boss_list_updated"),4000);
                }
            });

        //clear tweets and show "Loading..." hint
        //normally this function does not clear existing list item
        //optionally clears(hides) all items and only shows a loading hint label
        var showLoadingHint = function(index,clearAll){
            if(clearAll){
                $(displayInfo[index].twitterListDom).find("li").css("visibility","hidden");
            }
            switchRaidListRefreshButton(index,true);
        };

        var stopPropagation = function(elem){
            var tmp = elem.jquery ? elem : $(elem);
            tmp.on("mousedown mouseup tap touchstart touchend",function(e){
                e.stopPropagation();
                e.stopImmediatePropagation();
                return true;
            }).on("touchmove",function(e){
                e.stopPropagation();
                e.stopImmediatePropagation();
                return false;
            })
        };

        //------------- popup text box -----------------
        var popupObj = (function(){
            var popup = undefined;

            var inner = $("<div>");
            var spanText = $("<span class='popup_text'></span>");
            var spanCross = $("<span class='cross_mark'>&times;</span>");
            //top:-10%:initially hidden
            spanCross.click(function(){
                popupObj.destroyPopup();
            });
            inner.append(spanText).append(spanCross);

            function get(){
                if(!popup){
                    var tmp = document.getElementById("GBFR_Popup");
                    if(!tmp){
                        var outer = $("<div id='GBFR_Popup'>");
                        outer.append(inner).appendTo(document.body);
                        tmp = outer;
                    }
                    popup = $(tmp);
                }
                return popup;
            }
            return {
                showPopup:function(text,delay,keepOpen){
                    var $$ = get();
                    $$.queue(function(){
                        var $$ = $(this);
                        $$.css("display","block");
                        $$.find(".popup_text").html(text);
                        $$.dequeue();
                    }).animate({opacity:1},{duration:popupAnimationDuration});
                    if(!keepOpen){
                        $$.delay(delay || 2000)
                            .animate((function(){
                                return {
                                    opacity:0
                                };
                            }()),{duration:popupAnimationDuration,complete:function(){
                                $$.css("display","none");
                            }});
                    }
                },
                destroyPopup:function(){
                    if(popup===undefined){
                        return;
                    }
                    inner.detach();
                    popup.remove();
                    popup = undefined;
                }
            }
        }());
        //show/hide popup
        var showPopup = popupObj.showPopup;
        var hidePopup = popupObj.destroyPopup;

        //initialization, kick off tweet fetching etc.
        makeDOM();

        //---------- coop room join facilities -----------

        function joinCoopRoom(roomKey){
            gbfbr.apiRoomKey(roomKey,function(data){
                if(data['popup']){
                    var popup = data['popup'];
                    if(popup.body){
                        showPopup(popup.body);
                    }else{
                        showPopup(I18n.defaultInstance.localize('coop_room_error_unknown'));
                    }
                    return;
                }
                if(data['redirect']){
                    //not a repeating room, join now
                    window.location.hash = data.redirect.substr(1);
                    return;
                }
                if( ! data['chapter_id']){
                    showPopup(I18n.defaultInstance.localize('coop_room_error_unknown2'));
                    return;
                }
                var chapter_id = data['chapter_id']; // === A
                //challenge times of a quest is limited
                gbfbr.apiCheckQuestStart(chapter_id,function(ret){
                   if(!ret || ret.result!=='ok'){
                       if(ret.popup){
                           showPopup(ret.popup.body);
                           return;
                       }else{
                           showPopup(I18n.defaultInstance.localize('coop_room_error_start_check_failed'));
                           return;
                       }
                   }
                   var elixirInfo = {consumes:0};
                   gbfbr.apiTreasureRaid(chapter_id,function(treasureRaidInfo){
                        var action_point = treasureRaidInfo['action_point'];                    // === B
                        var current_action_point = treasureRaidInfo['current_action_point'];    // === C
                        var need_recovery = +action_point > current_action_point;   // === F
                        if(need_recovery){
                            gbfbr.apiUserStatus(function(userStatus){
                                userStatus = userStatus['status'];
                                var elixir_half_recover_value = userStatus['elixir_half_recover_value'];
                                var elixirAmount = Math.ceil((action_point - current_action_point)/elixir_half_recover_value);
                                elixirInfo.consumes = elixirAmount;
                                gbfbr.apiAPRecoveryItemList(function(itemList){
                                    var half = itemList['half'];
                                    if(half.number<elixirAmount){
                                        showPopup(I18n.defaultInstance.localize('coop_room_error_elixir_check_failed'));
                                    }else{
                                        elixirInfo.total = half.number;
                                        promptAndEnterRoom();
                                    }
                                });
                            });
                        }else{
                            promptAndEnterRoom();
                        }

                        function promptAndEnterRoom(){
                            var treasure_id = treasureRaidInfo['treasure_id'];                      // === D
                            var treasure_image_id = treasureRaidInfo['treasure_image_id'];
                            var treasure_name = treasureRaidInfo['treasure_name'];
                            var use_item_type = treasureRaidInfo['use_item_type'];                  // === E
                            var consume = treasureRaidInfo['consume'];                              // === G
                            var num = treasureRaidInfo['num'];                                      // === H
                            //action_point is a string
                            action_point = +action_point;

                            //create popup content
                            var container = $('<div id="coop_room_prompt"></div>');
                            $('<p>'+I18n.defaultInstance.localize('coop_room_popup_1',roomKey)+'</p>').appendTo(container);
                            if(elixirInfo.consumes>0){
                                //need AP recovery
                                //the potion must be sufficient here, otherwise previous check will show a warning
                                let p = $('<p>'+I18n.defaultInstance.localize(
                                    'coop_room_popup_2',elixirInfo.total,(elixirInfo.total - elixirInfo.consumes))
                                    +'</p>')
                                    .appendTo(container);
                            }
                            //use == not ===, this property can be string or number
                            //the server does not provide a consistent interface
                            if(use_item_type==1){
                                //consume one type of treasure
                                $('<p>'+I18n.defaultInstance.localize('coop_room_popup_3')+'</p>').appendTo(container);
                            }else if(use_item_type==2){
                                //consume multiple types of treasures
                                $('<p>'+I18n.defaultInstance.localize('coop_room_popup_4')+'</p>').appendTo(container);
                            }else{
                                showPopup(I18n.defaultInstance.localize('coop_room_error_room_type_unexpected'));
                                return;
                            }
                            var treasureList = $("<ul></ul>");
                            var sufficient_treasure = true;
                            for(let i=0;i<treasure_id.length;++i){
                                let li = $("<li class='coop_room_list_item'>");
                                let url = "/assets/img_mid/sp/assets/item/article/s/"+treasure_image_id[i]+".jpg";
                                let img = $("<img class='coop_room_treasure_image' src='"+url+"'>").appendTo(li);
                                $("<span>"+treasure_name[i]+"</span>").appendTo(li);
                                let cur_num = num[i];
                                let consume_num = consume[i];
                                let gap = cur_num - consume_num;
                                $("<span>"+cur_num+"&nbsp;→&nbsp;"+gap+"</span>").appendTo(li);
                                if(use_item_type==1){
                                    $("<input type='radio' name='gbfbr_coop_room_treasure' value='"+treasure_id[i]+"' />")
                                        .prop("disabled",gap<0)
                                        .prop("checked",i===0 && gap>=0)
                                        .insertBefore(img);
                                }
                                li.appendTo(treasureList);
                                if(gap<0){
                                    li.addClass('treasure_insufficient');
                                }
                                sufficient_treasure = sufficient_treasure && gap>=0;
                            }
                            treasureList.appendTo(container);

                            if(sufficient_treasure){
                                let btn_bar = $("<div class='coop_room_btn_bar'></div>");
                                $("<button>"+I18n.defaultInstance.localize('coop_room_cancel')+"</button>").click(function(){
                                    popupObj.destroyPopup();
                                }).appendTo(btn_bar);
                                $("<button>"+I18n.defaultInstance.localize('coop_room_ok')+"</button>").click(function(){
                                    $(this).prop("disabled",true);
                                    if(elixirInfo.consumes){
                                        gbfbr.apiUseRecoveryItem(2,elixirInfo.consumes,function(resp){
                                            if(resp.use_flag!==true){
                                                showPopup(I18n.defaultInstance.localize('auto_recovery_ap_failure'));
                                                return;
                                            }
                                            enterRoom();
                                        });
                                    }else{
                                        enterRoom();
                                    }
                                    function enterRoom(){
                                        var useItemId = use_item_type == 1 ?
                                            $("input[name='gbfbr_coop_room_treasure']:checked").val()
                                            : treasure_id[0];
                                        gbfbr.apiEnterRoom(roomKey,useItemId,function(data){
                                            if(data.redirect_url){
                                                popupObj.destroyPopup();
                                                window.location.hash = data.redirect_url.substr(1);
                                            }else{
                                                showPopup(data.popup.body);
                                            }
                                        });
                                    }
                                }).appendTo(btn_bar);
                                btn_bar.appendTo(container);
                            }else{
                                $("<p>"+I18n.defaultInstance.localize('coop_room_error_insufficient_treasure')+"</p>")
                                    .appendTo(container);
                            }

                            showPopup(container,0,true);
                        }
                    });
                });
            });
        }

        //---------- automatic raids joining facilities ---------------
        /**
         * join raid from anywhere in the game
         * @param id the id to lookup
         *  @param callback callback before any redirection happens,
         *          receive two parameters:
         *          the first boolean indicates whether successfully joined the raid
         *          the second boolean indicates whether preliminary check has passed
         */
        function joinRaid(id,callback){
            var payload = '{"special_token":null,"battle_key":"'+id+'"}';
            var url = '/quest/battle_key_check';
            gbfbr.apipost(url,payload,function(data){
                gbfbr.log(data);
                try{
                    var parsed = (typeof data === 'string') ? JSON.parse(data) : data;
                    if(parsed.redirect) {
                        window.location.hash = parsed.redirect.substr(1);
                        //fold the panel after we successfully advanced to the supporter page
                        //as it covers the summon stone list
                        //if the user wants to keep the raid list ad expanded, do not automatically fold it here
                        if(keep_raid_list_status_switch===false){
                            container_icon_jq.click();
                        }
                        callback(true,true);
                    }else{
                        hidePopup();
                        if(parsed.battle_point_check===false) {
                            /*
                             *  no enough battle points
                             * prompt to replenish battle points
                             */
                            //how many battle points we need to recover
                            var battle_points_gap = parsed.used_battle_point - parsed.current_battle_point;
                            gbfbr.apiBPRecoveryItemList(function(data){
                                var recover_5_potion = data['recover_5_potion'];
                                var recover_1_potion = data['recover_1_potion'];
                                //no more soul seeds or powder, cannot recover
                                if(!recover_1_potion && !recover_5_potion){
                                    showPopup(I18n.defaultInstance.localize('no_enough_battle_points_hint'));
                                    callback(false,true);
                                    return;
                                }
                                gbfbr.log(recover_1_potion);
                                gbfbr.log(recover_5_potion);
                                //auto recover if it is desired to do so
                                if(auto_recovery_switch){
                                    let num = recover_1_potion.number;
                                    if(num<battle_points_gap){
                                        showPopup(I18n.defaultInstance.localize('auto_recovery_failure'));
                                        callback(false,true);
                                    }else{
                                        gbfbr.apiUseRecoveryItem(recover_1_potion['item_id'],battle_points_gap
                                            ,function(resp){
                                                if(resp.use_flag!==true){
                                                    showPopup(I18n.defaultInstance.localize('auto_recovery_failure'));
                                                    return;
                                                }
                                                showPopup(I18n.defaultInstance.localize('recover_battle_point_success',resp.after));
                                                joinRaid(id,callback);
                                            });
                                    }
                                    return;
                                }
                                //prompt to recover bp by using items
                                showReplenishBPPopup(recover_5_potion,recover_1_potion,battle_points_gap,id,callback);
                                callback(false,true);
                            });
                        }else if(parsed.popup.okCallBackName === 'locationUnclaimed'){
                            //too many unclaimed
                            showPopup(I18n.defaultInstance.localize('too_many_unclaimed'));
                            window.location.hash = "quest/assist/unclaimed";
                            callback(false,true);
                        }else{
                            //miscellaneous errors
                            //like 'raid id does not exist;, 'the raid is over', 'you are currently participating this raid', etc.
                            showPopup(parsed.popup.body);
                            callback(false,false);
                        }
                    }
                }catch(e){
                    gbfbr.log(e);
                }
            });
        }
        /**
         * show popup for replenishing battle points by using items
         * @param recover_5 soul powder (recover 5 battle points)
         * @param recover_1 soul seed (recover 1 battle point)
         * @param gap   how many battle points we need to recover
         * @param original_raid_id   id of the raid originally intended to join
         * @param callback original callback function passed to joinRaid
         */
        function showReplenishBPPopup(recover_5,recover_1,gap,original_raid_id,callback){
            var inner = $("<div id='rep_popup'></div>");
            var span0 = $("<span>"+I18n.defaultInstance.localize('no_enough_battle_points_hint')+"</span>");
            var span1 = $("<span class='rep_popup_label'>"+recover_5.name+"</span>");
            var dropDown1 = createDropDown(gap,recover_5.number,5);
            var button1 = $("<button>"+I18n.defaultInstance.localize('recover_battle_point_button_title')+"</button>")
                .click(function(){
                    gbfbr.apiUseRecoveryItem(recover_5.item_id,dropDown1.selectedOptions[0].value
                        ,function(resp){
                            if(resp.use_flag!==true){
                                showPopup(I18n.defaultInstance.localize('recover_battle_point_failed'));
                                return;
                            }
                            showPopup(I18n.defaultInstance.localize('recover_battle_point_success',resp.after));
                            joinRaid(original_raid_id,callback);
                        });
                });
            var span2 = $("<span class='rep_popup_label'>"+recover_1.name+"</span>");
            var dropDown2 = createDropDown(gap,recover_1.number,1);
            var button2 = $("<button>"+I18n.defaultInstance.localize('recover_battle_point_button_title')+"</button>")
                .click(function(){
                    gbfbr.apiUseRecoveryItem(recover_1.item_id,dropDown2.selectedOptions[0].value
                        ,function(resp){
                            if(resp.use_flag!==true){
                                showPopup(I18n.defaultInstance.localize('recover_battle_point_failed'));
                                return;
                            }
                            showPopup(I18n.defaultInstance.localize('recover_battle_point_success',resp.after));
                            joinRaid(original_raid_id,callback);
                        });
                });
            inner.append(span0)
                .append("<br/>")
                .append(span1)
                .append(dropDown1)
                .append(button1)
                .append("<br/>")
                .append(span2)
                .append(dropDown2)
                .append(button2);

            showPopup(inner,0,true);

            function createDropDown(gap,max,weight){
                var select = document.createElement("select");
                var i = 1;
                var selectedOp;
                for(;i<=9;++i){
                    if(i>max)
                        break;
                    let op = document.createElement("option");
                    op.value = i;
                    op.innerHTML = i;
                    if(!selectedOp && i*weight>=gap){
                        /*
                         * by default, select the smallest item that satisfies
                         * the battle points we need to recover
                         */
                        selectedOp = op;
                        op.selected = true;
                    }
                    select.appendChild(op);
                }
                for(;i<=60;i+=10){
                    if(i>max)
                        break;
                    let op = document.createElement("option");
                    op.value = i;
                    op.innerHTML = i;
                    if(!selectedOp && i*weight>=gap){
                        /*
                         * by default, select the smallest item that satisfies
                         * the battle points we need to recover
                         */
                        selectedOp = op;
                        op.selected = true;
                    }
                    select.appendChild(op);
                }
                return select;
            }
        }

        //0:raid list 1:raid id input 2:coop room
        var currentTabType = gbfr_current_tab;

        function shouldFetchData(){
            //if this flag is off, fetch data unconditionally
            if( ! finder_on_only_when_activated){
                return true;
            }
            return  ! container_jq.hasClass('hidden') && currentTabType === 0;
        }

        function shouldFetchCoopData(){
            if( ! finder_on_only_when_activated){
                return currentTabType === 2;
            }
            return  ! container_jq.hasClass('hidden') && currentTabType === 2;
        }

        function shouldBeep(){
            return beepSound && ! container_jq.hasClass('hidden') && currentTabType === 0;
        }

        /**
         * make basic DOM structure,
         * the function will complete asynchronously,
         * put codes that relies on completion of DOM creating in the callback function
         * @returns void
         */
        function makeDOM(){

            //----------- outermost container-----------
            var hidden = (keep_raid_list_status_switch && boss_finder_raid_list_expanded!==false) ? "" : "hidden";
            var container = $("<div id='GBFR_Container' class='"+hidden+"'>").css("left",icon_position.x).css("top",icon_position.y);
            container_jq = container;
            //if showing tweet content is unwanted
            if( ! show_tweets){
                container.append("<style>.tweetcontentspan{display:none;}</style>");
            }
            //this is necessary because:
            //1. the user expands the raid list
            //2. the user turned this feature off
            //3. the user reloads the browser
            //4. now the raid list is actually folded, this should be stored
            //5. the user turned this feature on
            //6. the user reloads the browser
            //7. if the following statement had been left out, the raid list will be erroneously expanded
            gbfbr.persistence.set("boss_finder_raid_list_expanded",hidden === '');
            makeDraggable(container.get(0),function(elem){
                //save position
                gbfbr.persistence.set('boss_finder_icon_position',{
                    x:elem.style.left,
                    y:elem.style.top
                });
            });

            //----------- floating icon -------------
            //make dragging not expanding the panel
            var draggingFlag = false;
            var img = $("<img>");
            img.attr("src",chrome.extension.getURL("img/48.png"));
            //floating icon
            container_icon_jq = $("<div id='GBFR_Container-icon' class='exempt'></div>")
                .append(img)
                .appendTo(container)
                //show/hide boss list and tweet list
                .on("click touchend",function(){
                    if(draggingFlag) {
                        draggingFlag = false;
                    }else{
                        var parent = $(this).parent();
                        if( ! parent.hasClass("hidden")){
                            for(let i=0;i<displayInfo.length;++i){
                                displayInfo[i].bossListDropDown.hide();
                            }
                        }
                        parent.toggleClass("hidden");
                        gbfbr.persistence.set("boss_finder_raid_list_expanded",parent.hasClass("hidden")===false);
                        /*
                         * the coop room list fetching has been changed to a totally manual one,
                         * regardless of the 'finder_on_only_when_activated' setting, it is activated when the 3rd tab is
                         * activated and deactivated otherwise.
                         */
                        if(currentTabType===2){
                            $(".GBFR_coop_refresh_button").click();
                        }
                        if(finder_on_only_when_activated){
                            //refresh multilist or coop room list when the panel is unfolded
                            if(currentTabType===0){
                                $(".GBFR_refresh_button").click();
                            }
                        }
                    }
                });

            //tabs
            var currentTab = null;
            let tabs = [];
            let tabOnClickCallbacks = [function(){
                $(".gbfbr_raid_subcontainer").show();
                $(".gbfbr_id_input_subcontainer").hide();
                $(".gbfbr_coop_subcontainer").hide();
                if(currentTab){
                    currentTab.removeClass('current active');
                }
                currentTab = $(this).addClass('current active');
                currentTabType = 0;
                if(finder_on_only_when_activated){
                    $(".GBFR_refresh_button").click();
                }
                gbfbr.persistence.set('gbfr_current_tab',0);
            },function(){
                $(".gbfbr_raid_subcontainer").hide();
                $(".gbfbr_id_input_subcontainer").show();
                $(".gbfbr_coop_subcontainer").hide();
                if(currentTab){
                    currentTab.removeClass('current active');
                }
                currentTab = $(this).addClass('current active');
                currentTabType = 1;
                gbfbr.persistence.set('gbfr_current_tab',1);
            },function(){
                $(".gbfbr_raid_subcontainer").hide();
                $(".gbfbr_id_input_subcontainer").hide();
                $(".gbfbr_coop_subcontainer").show();
                if(currentTab){
                    currentTab.removeClass('current active');
                }
                currentTab = $(this).addClass('current active');
                currentTabType = 2;
                $(".GBFR_coop_refresh_button").click();
                gbfbr.persistence.set('gbfr_current_tab',2);
            }];
            let tabContainer = $("<div id='tabs'>");
            var strings = I18n.defaultInstance.localize('tabs_label').split(',');
            for(let i=0;i<strings.length;++i){
                let str = strings[i];
                let tab = $("<div class='tab'>"+str+"</div>");
                tab.appendTo(tabContainer);
                tab.mouseenter(function(){
                    tab.addClass('active');
                }).mouseleave(function(){
                    if( ! tab.hasClass('current')){
                        tab.removeClass('active');
                    }
                }).click(tabOnClickCallbacks[i]);
                stopPropagation(tab);
                tabs.push(tab);
            }
            tabContainer.appendTo(container);

            //------------- boss portrait -------------
            bossPortrait = $('<div id="GBFR_PortraitDiv"></div>').appendTo(container);

            //------------- idinput subcontainer -------------
            {
                let subcontainer = $("<div class='gbfbr_subcontainer gbfbr_id_input_subcontainer' />");
                //input box
                let idInput = $("<input type='text' class='GBFR_BossInput GBFR_IDInput' />").appendTo(subcontainer);
                idInput.attr("placeholder",I18n.defaultInstance.localize('hint_entry_join'));
                stopPropagation(idInput);
                let enterButton = $("<button id='GBFR_idEnterButton' />")
                    .click(function(){
                        let val = idInput.val();
                        if(val.length===8){
                            //raid
                            joinRaid(val,$.noop);
                        }else if(val.length===6){
                            //coop-room
                            joinCoopRoom(val);
                        }
                    })
                    .appendTo(subcontainer)
                    .html(I18n.defaultInstance.localize('id_entry_join'));
                //for the same reason as raid input box
                stopPropagation(enterButton);
                subcontainer.appendTo(container);
            }

            //------------- coop subcontainer -------------
            {
                let subcontainer = $("<div class='gbfbr_subcontainer gbfbr_coop_subcontainer' />");
                //input box
                let idInput =
                    $("<input type='text' id='GBFR_CoopInput' class='GBFR_BossInput GBFR_CoopInput' />")
                    .attr("placeholder",I18n.defaultInstance.localize('coop_filter_hint'))
                    .attr("title",I18n.defaultInstance.localize('coop_filter_hint'))
                    .keyup(function(){
                            var val = idInput.val();
                            createFilterArray(val);
                            filterCoopRoom(filters);
                            gbfbr.persistence.set('gbfr_coop_room_filter_str',val);
                        })
                    .appendTo(subcontainer);
                var coop_room_filter_str = ret['gbfr_coop_room_filter_str'];
                if(coop_room_filter_str){
                    idInput.val(coop_room_filter_str);
                    createFilterArray(coop_room_filter_str);
                }
                stopPropagation(idInput);
                coop_room_input_jq = idInput;
                //refresh button
                $("<img class='GBFR_coop_refresh_button'>")
                    .attr("src",chrome.extension.getURL("img/replay-icon.png"))
                    .appendTo(subcontainer)
                    .click(function(){
                        switchCoopRoomRefreshButton();
                        startCoopRoomTask(++epoch);
                    });
                $("<img class='GBFR_coop_refresh_button_spin GBFR_hidden_refresh_button'>")
                    .attr("src",chrome.extension.getURL("img/spinner.png"))
                    .appendTo(subcontainer);
                let coop_room_list = $("<ul id='GBFR_CoopRoomList' class='GBFR_CoopRoomList'>");
                stopPropagation(coop_room_list);
                coop_room_list.appendTo(subcontainer);
                subcontainer.appendTo(container);
                coop_room_list_jq = coop_room_list;
                startCoopRoomTask(epoch);

                function createFilterArray(val){
                    filters.length = 0;
                    var fts = [];
                    let st = 0;
                    for(let i=0;i<val.length;++i){
                        let s = val[i];
                        if(s===' ' || s=== '　' || s===',' || s==='、' || s==='，'){
                            fts.push(val.substring(st,i));
                            while(i<val.length && (s===' ' || s=== '　' || s===',' || s==='、' || s==='，')){
                                ++i;
                                s = val[i];
                            }
                            st = i;
                        }
                    }
                    if(st<val.length){
                        fts.push(val.substr(st));
                    }
                    for(let i=0;i<fts.length;++i){
                        let tmp = fts[i].trim();
                        if(tmp.length>0){
                            filters.push(tmp);
                        }
                    }
                }
            }


            //------------- raid subcontainer -------------
            for(let i=0;i<bossListCount;++i){
                let subcontainer = $("<div class='gbfbr_subcontainer gbfbr_raid_subcontainer' />");
                var tmp;
                try{
                    tmp = getLocalizedBossName(bossListData[i].prevBoss);
                }catch(e){
                    tmp = gbfbr.Boss.bossObjectToString(bossListData[i].prevBoss)
                }

                //input box
                let inputBox = $("<input type='text' readonly='readonly' class='GBFR_BossInput' />")
                    .attr("id","GBFR_BossInput"+i)
                    .val(tmp)
                    .appendTo(subcontainer);
                //without this line the click event will bubble up on mobile
                stopPropagation(inputBox);

                //boss list and tweet list
                //don't let the click events float up to container
                let bossList = $("<ul class='GBFR_BossList'>")
                    .attr("id","GBFR_BossList"+i)
                    .appendTo(subcontainer);
                stopPropagation(bossList);

                //refresh button
                $("<img class='GBFR_refresh_button'>")
                    .attr("data-index",i)
                    .attr("src",chrome.extension.getURL("img/replay-icon.png"))
                    .appendTo(subcontainer);
                $("<img class='GBFR_refresh_button_spin GBFR_hidden_refresh_button'>")
                    .attr("data-index",i)
                    .attr("src",chrome.extension.getURL("img/spinner.png"))
                    .appendTo(subcontainer);

                //tweet list
                let $tweet_list = $("<ul id='GBFR_TweetList' class='GBFR_TweetList'>");
                stopPropagation($tweet_list);
                displayInfo[i].twitterListDom = $tweet_list.get(0);
                $tweet_list.appendTo(subcontainer);

                displayInfo[i].bossListDropDown = new CustomDropDown(
                    {
                        readonly:false
                        ,filtering:false
                        ,input:"#GBFR_BossInput"+i
                        ,list:"#GBFR_BossList"+i
                        ,selectedItemClass:"selected"
                    }
                );
                subcontainer.appendTo(container);
            }
            var hasHiddenClassUntilHere = hidden === 'hidden';
            container.appendTo(document.body);
            if(hasHiddenClassUntilHere){
                container.removeClass("hidden");
            }
            let width = 0;
            $(".gbfbr_raid_subcontainer").each(function(){
                width += $(this).outerWidth();
            });
            container.css("min-width",width+"px");
            if(hasHiddenClassUntilHere){
                container.addClass("hidden");
            }

            let counter = 0;
            for(let i=0;i<bossListCount;++i){
                showOldResultIfPossibleForIndex(i,function(){
                   if(++counter==bossListCount){
                       tabOnClickCallbacks[gbfr_current_tab].call(tabs[gbfr_current_tab],true);
                   }
                });
            }

            for(let i=0;i<displayInfo.length;++i){
                initializeBossDropDownObject(displayInfo[i].bossListDropDown,i);
            }

            //------------- register events ----------------
            var refreshButton = $(".GBFR_refresh_button").on("click touchend",function(e){
                var index = this.getAttribute("data-index");
                displayInfo[index].bossListDropDown.disabled = true;
                if(e===false){
                    //called by tabOnClickCallbacks[gbfr_current_tab].call(
                    showLoadingHint(index,false);
                }else{
                    showLoadingHint(index,true);
                }
                clearAndStartTimerAtIndex(index,true);
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
            stopPropagation(refreshButton);

            function initializeBossDropDownObject(bossDropDown,myindex){
                //switch to another boss
                bossDropDown.itemSelected = function(idx){
                    //set the global previouslySelectedBoss
                    let prevBoss = globalBossList[idx];
                    bossListData[myindex].prevBoss = prevBoss;
                    gbfbr.persistence.set("bossListData",bossListData);
                    showOldResultIfPossibleForIndex(myindex,function(shown){
                        showLoadingHint(myindex,!shown);
                        gbfbr.log("changing to:",prevBoss);
                        clearAndStartTimerAtIndex(myindex,false);
                        bossPortrait.hide();
                    });
                };
                bossDropDown.itemMouseEnter = function(idx){
                    if(show_boss_portrait){
                        var boss = globalBossList[idx];
                        var imgName = boss.pic['en'] || boss.pic['jpn'];
                        if(imgName){
                            //not all bosses have a portrait
                            bossPortrait.css("backgroundImage","url("+gbfbr.Boss.twitter_image_link_prefix+imgName+")").show();
                        }else{
                            //portrait not available, hide it to prevent showing portrait of another boss
                            bossPortrait.hide();
                        }
                    }
                };
                //when bossDropDown is hidden, hide the portrait
                bossDropDown.onHidden = function(object){
                    bossPortrait.hide();
                    bossListData[myindex].scrollPos = object.scrollTop;
                    gbfbr.persistence.set("bossListData",bossListData);
                };
                bossDropDown.onShown = function(object){
                    object.scrollTop = bossListData[myindex].scrollPos;
                };
                bossDropDown.separatorFolded = function(i,text,elem){
                    var type = elem.getAttribute('data-separator-type');
                    bossListData[myindex].foldedSeparators[type]=1;
                    gbfbr.persistence.set("bossListData",bossListData);
                };
                bossDropDown.separatorExpanded = function(i,text,elem){
                    var type = elem.getAttribute('data-separator-type');
                    delete bossListData[myindex].foldedSeparators[type];
                    gbfbr.persistence.set("bossListData",bossListData);
                };

                //------------------ initialize boss list -------------------

                var bosses = globalBossList;
                if( ! bosses || ! bosses.length){
                    return;
                }
                var folded = [];
                var separator_counter = 0;
                var foldedSeparators = bossListData[myindex].foldedSeparators;
                bossDropDown.delegate = (function(){
                    var tmp_type = undefined;
                    var offset = 0;
                    return function(idx,rtnVal){
                        if(idx+offset>=globalBossList.length){
                            tmp_type = undefined;
                            offset = 0;
                            return false;
                        }
                        var classes = [];
                        var boss = globalBossList[idx+offset];
                        rtnVal.type = CustomDropDown.TYPE_ITEM;
                        if(boss.TYPE!==tmp_type){
                            tmp_type = boss.TYPE;
                            rtnVal.type = CustomDropDown.TYPE_SEPARATOR;
                            let localizedTYPE = I18n.defaultInstance.localize(boss.TYPE);
                            if( ! localizedTYPE || localizedTYPE === boss.TYPE){
                                localizedTYPE = I18n.defaultInstance.localize("UNKNOWN");
                            }
                            rtnVal.text = localizedTYPE;
                            --offset;
                            classes.push("separator");
                            if(foldedSeparators[boss.TYPE]){
                                folded.push(separator_counter);
                            }
                            ++separator_counter;
                            rtnVal.properties = {
                                'data-separator-type':boss.TYPE
                            }
                        }else{
                            rtnVal.type = CustomDropDown.TYPE_ITEM;
                            var properties = {};
                            if(name_display_option === 'all'){
                                //show names of all languages
                                rtnVal.text = gbfbr.Boss.bossObjectToString(boss);
                            }else{
                                try{
                                    rtnVal.text = getLocalizedBossName(boss);
                                }catch(e){
                                    //if boss name is not valid, mark this entry as incomplete and show names of all languages
                                    rtnVal.text = gbfbr.Boss.bossObjectToString(boss);
                                    classes.push("incomplete_boss_entry");
                                }
                            }
                            classes.push("listitem");
                            properties.title = rtnVal.text;
                            rtnVal.properties = properties;
                        }
                        rtnVal.styleClass = classes;
                        return true;
                    }
                }());
                bossDropDown.initialize();
                let prevBoss = bossListData[myindex].prevBoss;
                for(let i=0;i<bosses.length;++i){
                    var boss = bosses[i];
                    if(gbfbr.Boss.isSameBossObject(boss,prevBoss)){
                        bossDropDown.select(i);
                        break;
                    }
                }
                for(let i=0;i<folded.length;++i){
                    bossDropDown.toggleSeparator(folded[i]);
                }
            }

            function makeDraggable(elem,mouse_up_callback){
                if(!elem)
                    return;
                mouse_up_callback = mouse_up_callback || $.noop;
                var $elem = $(elem);
                $elem.css("transition","0s");
                $elem.css("position","fixed");
                $elem.css("z-index",9999999);
                var delta = null;
                var origin = null;
                //use transition to improve responsiveness
                function callback(e1){
                    var delta = Math.max(Math.abs(getPageX(e1)-origin.pageX),Math.abs(getPageY(e1)-origin.pageY));
                    //only dragging over a threshold are considered a real dragging
                    //setting this threshold because clicking will actually drag the object a bit
                    if(delta>10){
                        draggingFlag = true;
                    }
                    elem.style.transform = "translate(" + (getPageX(e1)-origin.pageX) + "px," + (getPageY(e1)-origin.pageY) + "px)";
                    return false;
                }
                $elem.on("mousedown touchstart",function(e){
                    var position = $(this).position();
                    delta = {
                        x:position.left -getPageX(e),
                        y:position.top - getPageY(e)
                    };
                    origin = {
                        pageX:getPageX(e),
                        pageY:getPageY(e)
                    };
                    $(document).on("mousemove touchmove",callback);
                    return false;
                }).on("mouseup touchend",function(e){
                    $(document).off("mousemove touchmove",callback);
                    elem.style.transform = "";
                    elem.style.left = (getPageX(e) + delta.x)+"px";
                    elem.style.top = (getPageY(e) + delta.y)+"px";
                    mouse_up_callback(elem);
                    return false;
                });

                function getPageX(eventObject){
                    if(eventObject.originalEvent && eventObject.originalEvent.changedTouches){
                        return eventObject.originalEvent.changedTouches[0].pageX
                    }
                    return eventObject.pageX;
                }
                function getPageY(eventObject){
                    if(eventObject.originalEvent && eventObject.originalEvent.changedTouches){
                        return eventObject.originalEvent.changedTouches[0].pageY;
                    }
                    return eventObject.pageY;
                }
            }

            function getLocalizedBossName(boss){
                var str = gbfbr.Boss.toLocalizedString(boss,default_locale) || gbfbr.Boss.toLocalizedString(boss,'en');
                if(!str){
                    throw 1;
                }
                return str;
            }
        }

        /**
         * make and display tweets items
         * @param tweet_list list dom element
         * @param data {'timestamp','tweets'}
         */
        function displayTweets(tweet_list,data){
            if(!data)
                return;
            var tweets = data;
            var elem = $(tweet_list);
            elem.find("li").remove();
            gbfbr.log("display tweets..success");
            gbfbr.log(tweets);
            for(let i=0;i<tweets.length;++i){
                var li = MakeTweetListItem(tweets[i]);
                if(li){
                    elem.append(li);
                }
            }

            //make a <li> from tweet object
            function MakeTweetListItem(tweet){
                try{
                    var li = $("<li></li>");
                    var raidid = $("<span class='raididspan'></span>").html(tweet['raidid']);
                    var timestamp = $("<span class='timestampspan'></span>").html(tweet['ts']);
                    var username = $("<span class='usernamespan'></span>").html(tweet['username']);
                    li.append(raidid).append(timestamp).append(username);
                    if(tweet['tweetContent']){
                        let tweetContent = $("<span class='tweetcontentspan'></span>").html(tweet['tweetContent']);
                        li.append(tweetContent);
                    }
                    li.attr("data-raidid",tweet['raidid']);
                    li.click((function(rid){
                        return function(){
                            joinRaid(rid,function(flag,pre){
                                //recoverable error (like no enough bp, too many unclaimed loots are considered 'visited' rather than 'invalid')
                                //save to visited cache
                                visited_raid.cache.push(rid);
                                visited_raid.hash[rid]=pre;
                                gbfbr.persistence.set('boss_finder_visited_raid',visited_raid);
                                //visited_raid: passed preliminary check
                                //invalid_raid: failed preliminary check
                                li.addClass(pre ? 'visited_raid' : 'invalid_raid');
                            });
                            //use the background page to copy raid id to clipboard
                            chrome.runtime.sendMessage({
                                type: 'copy',
                                text: rid
                            });
                        }
                    }(tweet['raidid'])));
                    //visisted raid, show in different color
                    var joinFlag = visited_raid.hash[tweet['raidid']];
                    if(joinFlag===true){
                        li.addClass('visited_raid');
                    }else if(joinFlag===false){
                        li.addClass('invalid_raid');
                    }
                    return li;
                }catch(e){
                    //handle invalid tweets
                    gbfbr.log(e);
                    return null;
                }
            }
        }

        function filterCoopRoom(filters){
            var col = coop_room_list_jq.find("li");
            for(let k=0;k<col.length;++k){
                let li = col.eq(k);
                var comment = li.find(".coop_room_comment").html();
                var show = false;
                if(filters.length>0){
                    for(let i=0;i<filters.length;++i){
                        let filter = filters[i];
                        if(filter.length>0 && comment.indexOf(filter)>=0){
                            show = true;
                            break;
                        }
                    }
                }else{
                    show = true;
                }
                if(!show){
                    li.css("display","none");
                }else{
                    li.css("display","block");
                }
            }
        }

        function displayCoopRoom(coopRoomResult){
            let _list = coop_room_list_jq;
            _list.find("li").remove();
            if(coopRoomResult===undefined){
                return;
            }
            for(let idx=0;idx<coopRoomResult.length;++idx){
                var room = coopRoomResult[idx];
                var comment = room.comment;
                var rmn = room.member_number;
                var rml = room.member_limit;
                var ratio = Math.ceil((rmn/rml).toPrecision(1)*10);
                var room_key = room.room_key;
                var li = $("<li>");
                $("<p class='coop_room_row1'>").append("<span class='coop_room_user'>"+room.name+"</span>")
                                .append("<span class='coop_room_rank'>RANK"+room.rank+"</span>")
                                .append(
                                $("<span class='coop_room_key'>"+room_key+"</span>")
                                    .click((function(rk){
                                        return function(e){
                                            chrome.runtime.sendMessage({
                                                type: 'copy',
                                                text: rk
                                            });
                                            e.stopPropagation();
                                            e.stopImmediatePropagation();
                                        }
                                    }(room_key)))
                                    .attr("title",I18n.defaultInstance.localize('coop_room_copy_room_key'))
                                )
                                .append(room.is_continuequest ? "<span class='coop_room_repeating'>"+I18n.defaultInstance.localize('coop_room_repeating')+"</span>" : '')
                                .appendTo(li);
                $("<p class='coop_room_row2'>").append("<span class='coop_room_comment'>"+comment+"</span>").appendTo(li);
                $("<p class='coop_room_row3'>").append("<span class='coop_room_limit'>"+room.limit+"</span>")
                                .append("<span class='coop_room_member_status'>"+(room.member_number+"/"+room.member_limit)+"</span>")
                                .appendTo(li);
                li.appendTo(_list);
                li.addClass("full"+ratio);
                li.click((function(rk){
                    return _join.bind(this,rk);
                }(room_key)))
            }
            filterCoopRoom(filters);

            function _join(rk){
                joinCoopRoom(rk);
                if(keep_raid_list_status_switch===false){
                    container_icon_jq.click();
                }
            }
        }

        function startCoopRoomTask(_epoch){
            if( ! shouldFetchCoopData()){
                return;
            }
            if(_epoch!==epoch){
                gbfbr.log("not my epoch");
                return;
            }
            const max = 8;
            for(let i=1;i<=max;++i){
                gbfbr.apiCoopOffer(i,f1);
            }
            let coopRoomResult = [];
            function f1(list,page){
                if(_epoch!==epoch){
                    return;
                }
                coopRoomResult = coopRoomResult.concat(list);
                if(page===max){
                    displayCoopRoom(coopRoomResult);
                    switchCoopRoomRefreshButton();
                    setTimeout(startCoopRoomTask.bind(undefined,_epoch),coop_menu_polling_interval);
                }
            }
        }

        /**
         * Start reading from twitter repeatedly
         * @param index use which tweet list
         * @param boss  target boss
         * @param manual whether this function is called manually,
         * when manually triggered, 429 error is not reported with a popup
         */
        function startTwitterTimerTask(boss,index,manual){
            if( ! shouldFetchData()){
                return;
            }
            var clientData = {
                boss:boss,
                index:index,
                manual:manual
            };
            gbfbr.searchTwitterFromServer(boss,clientData,twitterSuccessCallback,twitterFailureCallback);
        }
        var beep = (function(){
            var ctx = new AudioContext(); // browsers limit the number of concurrent audio contexts, so you better re-use'em
            return function(){
                _beep(250,500,300);
            };
            function _beep(vol, freq, duration){
                v=ctx.createOscillator();
                u=ctx.createGain();
                v.connect(u);
                v.frequency.value=freq;
                v.type="square";
                u.connect(ctx.destination);
                u.gain.value=vol*0.01;
                v.start(ctx.currentTime);
                v.stop(ctx.currentTime+duration*0.001);
            }
        }());
        /**
         * success callback for crawling twitter
         * @param tweets
         * {
         * username: user who tweeted
         * ts_num:epoch millis on which this tweet was created
         * raidid:self evidence
         * tweetContent:arbitrary (maybe empty) user supplied tweet content other than text generated by the game itself
         * }
         * @param clientData  the selected boss at the time of initiating ajax call, and index of the tweet list from which this call is initiated
         * may has been already changed when this function is called
         */
        function twitterSuccessCallback(tweets,clientData){
            tweets = tweets || [];
            let originallySearchedBoss = clientData['boss'];
            let index = clientData['index'];
            if(! gbfbr.Boss.isSameBossObject(bossListData[index].prevBoss,originallySearchedBoss)){
                gbfbr.log("boss changed before ajax call returns, old:",originallySearchedBoss,", new boss:",bossListData[index].prevBoss);
                return;
            }
            var timestamp = new Date().valueOf();
            for(let i=0;i<tweets.length;++i){
                tweets[i]['ts'] = gbfbr.Boss.makeTsString(tweets[i].ts_num,timestamp);
            }
            gbfbr.persistence.getOldQueryResult(originallySearchedBoss,function(ret){
                let idx = 0;
                ret = ret || [];
                if(ret){
                    //append old data after adjusting their timestamp strings
                    while(tweets.length<15 && idx<ret.length){
                        let oldObject = ret[idx++];
                        if( ! oldObject){
                            continue;
                        }
                        let ts_num = oldObject.ts_num;
                        if( ! ts_num){
                            oldObject.ts = "";
                        }else{
                            oldObject.ts = gbfbr.Boss.makeTsString(ts_num,timestamp);
                        }
                        tweets.push(oldObject);
                    }
                }
                tweets.length = Math.min(tweets.length,15);
                gbfbr.persistence.saveOldQueryResult(originallySearchedBoss,tweets);
                displayInfo[index].bossListDropDown.disabled = true;
                if(shouldBeep()
                  && (tweets.length>0 && ret.length>0 && tweets[0]['raidid']!==ret[0]['raidid'])
                  && ! clientData.manual){
                    beep();
                }
                displayTweets(displayInfo[index].twitterListDom,tweets);
                displayInfo[index].bossListDropDown.disabled = false;
                switchRaidListRefreshButton(index,false);
                //schedule the next task
                clearAndStartTimerAtIndex(index,false);
            });
        }
        function twitterFailureCallback(e,clientData){
            gbfbr.log("fetching failed:",e);
            switch(e.statusCode()){
                case 429:
                    if(clientData.manual){
                        showPopup(I18n.defaultInstance.localize('twitter_error_2'));
                    }
                    break;
                default:
                    showPopup(I18n.defaultInstance.localize('fetch_failure',e.statusCode()));
                    break;
            }
            //display old results instead of empty list on failure
            twitterSuccessCallback([],clientData);
        }

        function clearAndStartTimerAtIndex(index,manual){
            clearTimeout(displayInfo[index].handle);
            displayInfo[index].handle = setTimeout(function(){
                startTwitterTimerTask(bossListData[index].prevBoss,index,manual);
            },twitter_fetch_interval);
        }

        /**
         * show old result if they are still not too old
         * @param index
         * @param callback  called with one boolean parameter which indicates whether old results
         * are shown (replaced anything existing)
         */
        function showOldResultIfPossibleForIndex(index,callback){
            gbfbr.persistence.getOldQueryResult(bossListData[index].prevBoss,function(ret){
                if(!ret || !ret.length){
                   callback(false);
                   return;
                }
                var base = new Date().valueOf();
                var first = ret[0];
                if(first.ts_num < base-30000){
                    callback(false);
                    return;//too old
                }
                var tweets = [];
                for(let i=0;i<ret.length;++i){
                    let oldObject = ret[i];
                    if( ! oldObject){
                        continue;
                    }
                    let ts_num = oldObject.ts_num;
                    if( ! ts_num){
                        oldObject.ts = "";
                    }else{
                        oldObject.ts = gbfbr.Boss.makeTsString(ts_num,base);
                    }
                    tweets.push(oldObject);
                }
                tweets.length = Math.min(tweets.length,15);
                displayInfo[index].bossListDropDown.disabled = true;
                displayTweets(displayInfo[index].twitterListDom,tweets);
                displayInfo[index].bossListDropDown.disabled = false;
                callback(true);
            });
        }

        function switchCoopRoomRefreshButton(){
            var refresher = document.getElementsByClassName("GBFR_coop_refresh_button")[0];
            var spinner = document.getElementsByClassName("GBFR_coop_refresh_button_spin")[0];
            if(refresher.classList.contains("GBFR_hidden_refresh_button")){
                refresher.classList.remove("GBFR_hidden_refresh_button");
                spinner.classList.add("GBFR_hidden_refresh_button");
            }else{
                spinner.classList.remove("GBFR_hidden_refresh_button");
                refresher.classList.add("GBFR_hidden_refresh_button");
            }
        }

        function switchRaidListRefreshButton(index,onoff){
            var refresher = $(".GBFR_refresh_button[data-index="+index+"]");
            var spinner = $(".GBFR_refresh_button_spin[data-index="+index+"]");
            if(onoff){
                refresher.addClass("GBFR_hidden_refresh_button");
                spinner.removeClass("GBFR_hidden_refresh_button");
            }else{
                refresher.removeClass("GBFR_hidden_refresh_button");
                spinner.addClass("GBFR_hidden_refresh_button");
            }
        }
    });
});