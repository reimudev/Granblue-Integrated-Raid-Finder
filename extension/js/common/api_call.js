/*
* universal utility for calling API of game server
* */
(function(){
    var version;

    //get basic info about a coop room
    /**
     * the roomKey is referred as "RoomId" in the game, but there is actually a
     * room_id property in the response of this api call, which is totally different from the room key
     * and not used elsewhere
     */
    gbfbr.apiRoomKey = function(roomKey,callback){
        gbfbr.apipost("/coopraid/room_key"
            ,JSON.stringify({special_token: null, room_key: roomKey})
            ,callback);
    };
    //get basic info about a raid, used to determine preliminaries of a repeating coop room
    gbfbr.apiTreasureRaid = function(chapterId,callback){
        gbfbr.apiget("/quest/treasure_raid/"+chapterId+"/"+chapterId+"1/1",null,callback);
    };
    /**
     * this api is used to retrieve not only recovery items but also evolution items,
     * the recovery items (potions) are int the first element of the returned array
     */
    gbfbr.apiRecoveryItemList = function(callback){
        gbfbr.apiget('item/recovery_and_evolution_list_by_filter_mode',null,function(data){
           callback(data[0]);
        });
    };
    gbfbr.apiUserStatus = function(callback){
        gbfbr.apiget('/user/status',null,callback);
    };
    //intentionally ignores rare AP recovery items
    gbfbr.apiBPRecoveryItemList = function(callback){
        gbfbr.apiRecoveryItemList(function(data){
            if(!data){
                //unexpected response
                throw "unexpected response for recovery item list";
            }
            var recover_5_potion;
            var recover_1_potion;
            for(let i=0;i<data.length;++i){
                let obj = data[i];
                if(obj['item_id']==='3'){
                    recover_5_potion = obj;
                }else if(obj['item_id']==='5'){
                    recover_1_potion = obj;
                }
                if(recover_1_potion && recover_5_potion){
                    break;
                }
            }
            callback({
                recover_5_potion:recover_5_potion,
                recover_1_potion:recover_1_potion
            });
        });
    };
    gbfbr.apiAPRecoveryItemList = function(callback){
        gbfbr.apiRecoveryItemList(function(data){
            if(!data){
                //unexpected response
                throw "unexpected response for recovery item list";
            }
            var full;
            var half;
            for(let i=0;i<data.length;++i){
                let obj = data[i];
                if(obj['item_id']==='1'){
                    full = obj;
                }else if(obj['item_id']==='2'){
                    half = obj;
                }
                if(full && half){
                    break;
                }
            }
            callback({
                full:full,
                half:half
            });
        });
    };
    gbfbr.apiCheckQuestStart = function(chapter_id, callback){
        gbfbr.apiget("/quest/check_quest_start/"+chapter_id+"/1/"+chapter_id+"1",null,function(data){
            callback(data);
        });
    };
    //used by both bp recovery prompt and auto-recovery function
    gbfbr.apiUseRecoveryItem = function(item_id,item_amount,callback){
        var url = 'item/use_normal_item';
        //must be double quoted, not single quoted, or the server will throw a 500 error
        var data = JSON.stringify({special_token:null,item_id:item_id,num:item_amount});
        gbfbr.apipost(url,data,function(resp){
            gbfbr.log(resp);
            if(callback){
                callback(resp);
            }
        });
    };
    gbfbr.apiEnterRoom = function(roomKey,useItemId,callback){
        var obj = {special_token:null,room_key:roomKey};
        //what if there is an item with id 0?
        if(useItemId!==undefined){
            obj.use_item_id = useItemId;
        }
        gbfbr.apipost('/lobby/enter_room',JSON.stringify(obj),callback);
    };

    gbfbr.apiCoopOffer = function(page,callback){
        gbfbr.apiget('/lobby/offers/'+(page || 1),null,function(data){
            var list = [];
            if(data.list){
               for(var n in data.list){
                   if(data.list.hasOwnProperty(n)){
                       list.push(data.list[n]);
                   }
               }
            }
            callback(list, +(data.current));
        });
    };

    function apiCall(type,url,payload,callback){
        if (!url)
            throw "empty url for api get call";
        if (!callback)
            throw "always need a callback";
        initializeVersion();
        if (!version) {
            throw "cannot determine X-VERSION which is needed for calling api";
        }
        var cur = new Date().valueOf();
        var parameters = '_='+cur+'&t='+(cur+1);
        if(url.endsWith('&') || url.endsWith('?')){
            url += parameters;
        }else{
            if(url.indexOf('?')===-1){
                url += '?'+parameters;
            }else{
                url += '&'+parameters;
            }
        }
        $.ajax({
            url:url,
            type:type,
            headers: {
                Accept: "application/json, text/javascript, */*; q=0.01"
                ,"X-VERSION":version
            },
            contentType:'application/json',
            data:payload
        }).always(function(obj1,txtStatus,obj2){
            //data|jqXHR, textStatus, jqXHR|errorThrown
            if(obj1.responseText){
                //error
                callback(null,obj1,obj2);
            }else{
                //the server does return plain string for JSON requests
                //must handle this
                var parsed = (typeof obj1 === 'string') ? JSON.parse(obj1) : obj1;
                callback(parsed);
            }
        });
    }
    gbfbr.apiget = apiCall.bind(undefined,"GET");
    gbfbr.apipost = apiCall.bind(undefined,"POST");

    /**
     * detect game "version", this value is needed when invoking various api of server
     */
    function initializeVersion(){
        if(version)
            return;
        var reg = /.+\/assets(_en)?\/(\d+)\/.+/;
        var scripts = document.getElementsByTagName("script");
        for(let i =0;i<scripts.length;++i){
            var tag = scripts[i];
            var ret = reg.exec(tag.src);
            if(ret!=null){
                version = ret[2];
                break;
            }
        }
    }
}());

