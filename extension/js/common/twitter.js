//utilities for crawling twitter
var gbfbr = gbfbr || {};

gbfbr.persistence.get("server_url",function(ret){
    //#############from server################
    gbfbr.searchTwitterFromServer = (function(){
        const base_url = "http://"+ret+"/r?b=";
        return function(boss,clientData,success,failure){
            var keyword = boss.id;
            if(keyword === undefined){
                failure(new gbfbr.TwitterError(TwitterError.INVALID_BOSS_LIST,"invalid boss list"),clientData);
                return;
            }
            gbfbr.log("twitter keywords are:",keyword);
            var now = new Date().valueOf();
            $.ajax({
                url:base_url+keyword,
                type:'GET',
                headers:{
                    "accept":"application/json"
                }
            }).done(function(ret){
                /**
                 *    {
                    "data": [
                        "2L8kHVVrO5KikHS,1538789542524,0C62012E,"
                        .....
                    ],
                    "ts": 1538789660911
                }
                 */
                var data = ret['data'];
                var list = [];
                for(let i=0;i<data.length;++i){
                    list.push(makeTweetObject(data[i]));
                }
                success(list,clientData);
            }).fail(function(a,b,e){
                let status = +(a.status);
                failure(new gbfbr.TwitterError(status,e.toString()),clientData);
            });
        };

        function makeTweetObject(row){
            var username,ts_num,raidid,tweetContent;
            let st = 0;
            let step = 0;
            for(let i=0;i<row.length;++i){
                if(row[i]===','){
                    let comp = row.substring(st,i);
                    st = i+1;
                    if(step===0){
                        username = comp;
                    }else if(step===1){
                        ts_num = +comp
                    }else if(step===2){
                        raidid = comp;
                        tweetContent = row.substring(i+1);
                        break;
                    }
                    ++step;
                }
            }
            return {
                username: username,
                ts_num:ts_num,
                raidid: raidid,
                tweetContent: tweetContent
            };
        }
    }());

    //#######ErrorObject##########

    gbfbr.TwitterError = function(code,msg){
        return {
            statusCode: function(){
                return code;
            },
            toString: function(){
                return msg;
            }
        }
    };

    gbfbr.TwitterError.INVALID_BOSS_LIST = -133;
    gbfbr.TwitterError.SERVER_DOWN = -511;
});
