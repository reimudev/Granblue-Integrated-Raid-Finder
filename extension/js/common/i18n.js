/**
 * i18n interpolator
 * finds all DOM elements (typically <span> elements) with a CSS class of {classname},
 * and replace their innerHTML with localized string of their data attribute data-{dataname}
 */
var I18n =
	(function(){
		var specials = {'defaultLoc':0,'classname':0};
		return function (prop){
			var dfLoc = '';
			Object.defineProperty(this,'defaultLoc',{
				enumerable:true,
				configurable:false,
				get:function(){
					return dfLoc;
				},
				set:function(val){
					dfLoc = (val+'').toLowerCase();
				}
			});

			this['defaultLoc'] = 'en';
			this['classname'] = 'i18n_str';
            this['dataname'] = 'i18n_str';
            this['paramprefix'] = 'i18n_param';
			var strings = {};

			for(var name in prop){
				if( ! prop.hasOwnProperty(name)){
					continue;
				}
				if(name in specials){
					this[name] = prop[name].toLowerCase();
				}else{
					strings[name] = prop[name];
				}
			}
			this.strings = strings;

            /**
             * search a DOM tree for i18n placeholder elements and
             * replace their innerHTML with localized string.
             * localized string are searched based on special data attributes.
             * @param container root of the DOM tree, namely the start point of searching
             * @param loc   locale, default to 'defaultLoc' property
             */
			this.interpolate=function(container,loc){
				container = container || document.body;
				loc = loc || this['defaultLoc'];
                var dataAttrName = "data-"+this['dataname'];
				var col = container.getElementsByClassName(this['classname']);
				for(var idx=0,j=col.length;idx<j;++idx){
					var elem = col[idx];
                    var dataAttrVal = elem.getAttribute(dataAttrName);
					var localized = this.___raw_localize(dataAttrVal,loc);
                    if(!localized){
                        localized = this.___raw_localize(dataAttrVal,'en');
                        if(!localized){
                            localized = dataAttrVal;
                        }
                    }
					if(localized){
                        var params = [];
                        for(let m=0;;++m){
                            var attrName = "data-"+this['paramprefix']+m;
                            var param = elem.getAttribute(attrName);
                            if( ! param)
                                break;
                            elem.removeAttribute(attrName);
                            params.push(param);
                        }
                        if(params.length){
                            localized = replaceParameters(localized,params);
                        }
                        elem.innerHTML = localized;
					}
				}
			};

            this.___raw_localize = function(string,loc){
                var obj = this['strings'][string];
                if(obj){
                    var localized;
                    if(loc && ((loc+'').toLowerCase() in obj))
                        localized = obj[loc];
                    else if(this['defaultLoc'] in obj)
                        localized = obj[this['defaultLoc']];
                    else
                        return undefined;
                    if(arguments.length>=2){
                        localized = replaceParameters(localized,Array.prototype.slice.call(arguments,1));
                    }
                    return localized;
                }
                return undefined;
            };

            /**
             * get a localized string
             * @param string    name (key) of the localized string
             * @param loc   locale, default to 'defaultLoc' property
             * @returns {*} localized string, if not found, the key itself is returned as is
             */
			this.localize = function(string,loc){
				return this.___raw_localize(string,loc) || string;
			};

            function replaceParameters(str,args){
                let st = 0;
                for(let paramIdx=0,paramStr="{"+paramIdx+"}";
                    paramIdx<args.length;++paramIdx,paramStr="{"+paramIdx+"}"){
                    var param = args[paramIdx];
                    var found = str.indexOf(paramStr,st);
                    if(found<0){
                        break;
                    }
                    str = str.substring(0,found)+param+str.substring(found+paramStr.length);
                    st = found+param.length;
                }
                return str;
            }
		}
	}());

/**
 * default I18n instance,
 * initialize with default translations
 */
I18n.defaultInstance = new I18n({
    'settings_title':{
        'zh':'选项',
        'en':'Settings',
        'jpn':'各種設定'
    },
    'settings_hint':{
        'zh':'更改设置后请刷新游戏页面',
        'en':'Please refresh the browser after modifying settings'
        ,'jpn':'設定変更したのちリロードしてください'
    },
    'raid_finder_title':{
        'zh':'一般选项',
        'en':'General'
        ,'jpn':'一般設定'
    },
    'finder_switch_onoff':{
        'zh':'启用搜Raid功能',
        'en':'enable raid finding'
        ,'jpn':'マルチバトル検索の有効化'
    },
    'finder_switch_desc':{
        'zh':'彻底关闭插件，或者选择在Raid列表关闭时不在后台获取数据以提升浏览器的响应速度',
        'en':'Disable this extension completely or disable background fetching when raid list is folded to improve browser performance'
        ,'jpn':'拡張の機能を無効に、あるいはマルチリストが展開していない時データの取得を禁止させることでブラウザーの性能を向上させられます。'
    },
    'finder_show_tweets':{
        'zh':'显示推特内容',
        'en':'show tweets content'
        ,'jpn':'ツイッターの投稿内容の表示'
    },
    'language':{
        'zh':'语言',
        'en':'Language'
        ,'jpn':'言語'
    },
    'about':{
        'zh':'关于',
        'en':'About'
        ,'jpn':'この拡張について'
    },
    'debugging_enabled':{
        'zh':'调试模式已启用',
        'en':'Debugging mode activated'
        ,'jpn':'デバッグ機能を有効にしました'
    },
    'debugging_disabled':{
        'zh':'调试模式已关闭',
        'en':'Debugging mode deactivated'
        ,'jpn':'デバッグ機能を無効にしました'
    }
    ,'loading_hint':{
        'zh':'正在加载...',
        'en':'Loading...'
        ,'jpn':'ロード中...'
    }
    ,'boss_auto_discovery_failure':{
        'zh':'搜寻新Boss数据时出现错误',
        'en':'Error discovering new bosses'
        ,'jpn':'ボス探知に失敗しました'
    }
    ,'twitter_reading_failure':{
        'zh':'读取推特失败，请尝试刷新页面',
        'en':'Error fetching from twitter, please try reloading this page'
        ,'jpn':'ツイッターを読み込めませんでした、ブラウザーをリロードしてみてください'
    }
    ,'tweet_timestamp_now':{
        'zh':'现在',
        'en':'now'
        ,'jpn':'<1分'
    }
    ,'tweet_timestamp_m':{
        'zh':'分',
        'en':'m'
        ,'jpn':'分'
    }
    ,'tweet_timestamp_h':{
        'zh':'小时',
        'en':'h'
        ,'jpn':'時間'
    }
    ,'tweet_timestamp_d':{
        'zh':'天',
        'en':'d'
        ,'jpn':'日'
    }
    ,'no_enough_battle_points_hint':{
        'zh':'BP不足',
        'en':'No enough BP'
        ,'jpn':'BPが足りません'
    }
    ,'too_many_unclaimed':{
        'zh':'未确认的战斗太多',
        'en':'Too many unclaimed raids'
        ,'jpn':'未確認バトルが多すぎます'
    }
    ,'boss_discovery_title':{
        'zh':'搜索新Boss',
        'en':'Boss Discovery'
        ,'jpn':'新しいボスの探知'
    }
    ,'boss_discovery_desc':{
        'zh':'点击下面的按钮以手动触发一次搜索，如果没有关于这个Boss的推则无法检测',
        'en':'Boss discovery is triggered by clicking the button below. If there are no tweets about the new boss, it will not succeed no matter how many times you try.'
        ,'jpn':'下のボタンをクリックして新しいボスを探知できます。このボスの関連ツイッターがない場合探知できません。'
    }
    ,'boss_discovery_searching':{
        'zh':'正在搜索...',
        'en':'Searching...'
        ,'jpn':'検索中...'
    }
    ,'boss_discovery_button':{
        'zh':'搜索新Boss',
        'en':'Discover New Boss'
        ,'jpn':'新しいボスを探知'
    }
    ,'boss_discovery_no_gain':{
        'zh':'没有找到新Boss',
        'en':'No new boss has been found'
        ,'jpn':'新しいボスが見つかりませんでした'
    }
    ,'boss_discovery_found':{
        'zh':'以下Boss被找到或更新：',
        'en':'The following boss(es) have been discovered or updated:'
        ,'jpn':'以下のボスがリストに追加、まだ更新されました。'
    }
    ,'change_log_title':{
        'zh':'更新日志',
        'en':'ChangeLog'
        ,'jpn':'変更履歴'
    }
    ,'reset_icon_position_desc':{
        'zh':'浮动图标位置',
        'en':'position of floating icon'
        ,'jpn':'アイコンの位置'
    }
    ,'reset_icon_position':{
        'zh':'重置',
        'en':'reset'
        ,'jpn':'初期化'
    }
    ,'icon_position_reset_success':{
        'zh':'浮动图标位置已经重置',
        'en':'position of floating icon has been reset'
        ,'jpn':'アイコンの位置を初期化しました'
    }
    ,'ui_language':{
        'zh':'界面',
        'en':'interface'
        ,'jpn':'UI'
    }
    ,'boss_name_language':{
        'zh':'Boss名称',
        'en':'name of bosses'
        ,'jpn':'ボスの名前'
    }
    ,'show_all_available_names':{
        'zh':'显示所有语言的名称',
        'en':'show all languages'
        ,'jpn':'全言語の名前を表示'
    }
    ,'show_name_of_current_locale':{
        'zh':'显示当前语言设定的名称',
        'en':'show current language'
        ,'jpn':'現在設定している言語の名前を表示'
    }
    ,'incomplete_boss_entry_hint':{
        'zh':'该条目不完整，只有部分语言的Boss名称',
        'en':'this is an incomplete entry which lacks names of some locales'
        ,'jpn':'不完全な項目です、一部言語の名前がありません。'
    }
    ,'recover_battle_point_failed':{
        'zh':'使用道具回复BP失败',
        'en':'Error in recovering battle points by using item'
        ,'jpn':'アイテムでBPを回復することに失敗しました'
    }
    ,'recover_battle_point_success':{
        'zh':'BP已经回复，现在的BP为{0}',
        'en':'Battle points recovered, currently you have {0} battle point(s)'
        ,'jpn':'BPを回復しました、現在のBPは{0}点です'
    }
    ,'recover_battle_point_button_title':{
        'zh':'使用',
        'en':'Use'
        ,'jpn':'使用する'
    }
    ,'auto_recovery_switch_label':{
        'zh':'自动回复BP',
        'en':'automatically recover BP'
        ,'jpn':'BPの自動回復'
    }
    ,'auto_recovery_switch_desc':{
        'zh':'参加多人战斗时如果BP不够，自动使用道具恢复BP。为了防止过度回复和消耗较为贵重的粉盒，只会使用粉末回复。',
        'en':'Recover BP automatically when there is no enough BP to join battle.' +
            ' Only soul berry will be used to prevent over recovery and consuming soul balm which is considered rarer.'
        ,'jpn':'マルチを参加する時BPが足りない場合、自動的にアイテムを使って回復します。ソウルシードだけ使用します'
    }
    ,'auto_recovery_failure':{
        'zh':'自动回复BP失败，没有足够的粉末',
        'en':'Cannot automatically recover BP as there is no enough soul berry.'
        ,'jpn':'ソールシードが足りないため、BP自動回復できませんでした。'
    }
    ,'keep_raid_list_status':{
        'zh':'保持Raid列表的状态',
        'en':'keep raid list status'
        ,'jpn':'マルチリストの状態の維持'
    }
    ,'keep_raid_list_status_desc':{
        'zh':'除非手动关闭，否则保持Raid列表为展开状态',
        'en':'Keep the raid list as expanded unless it is folded manually'
        ,'jpn':'手動で隠す以外の場合マルチリストを展開しているままに維持します'
    }
    ,'boss_list':{
        'zh':'Boss列表',
        'en':'Boss List'
        ,'jpn':'ボスリスト'
    }
    ,'reset_boss_list':{
        'zh':'重置Boss列表',
        'en':'reset boss list'
        ,'jpn':'ボスリストの初期化'
    }
    ,'reset_boss_list_button':{
        'zh':'重置',
        'en':'reset'
        ,'jpn':'実行'
    }
    ,'reset_boss_list_success':{
        'zh':'Boss列表已重置',
        'en':'Boss list has been reset'
        ,'jpn':'ボスリストは初期化されました'
    }
    ,'show_boss_portrait':{
        'zh':'显示Boss头像',
        'en':'show boss portrait'
        ,'jpn':'ボス画像の表示'
    }
    ,'boss_list_updated':{
        'zh':'已从服务器更新Boss列表，刷新页面后生效',
        'en':'Boss list has been updated from server, please reload your browser to make it take effect.'
        ,'jpn':'サーバーよりボスリストを更新しました、ブラウザーをリロードしてください。'
    }
    ,'twitter_fetch_interval':{
        'zh':'推特拉取间隔（秒）'
        ,'en':'polling interval(second(s))'
        ,'jpn':'ツイッター取得間隔（秒）'
    }
    ,'twitter_fetch_interval_desc':{
        'zh':'指定在成功拉取一次推特数据之后多少秒再开始一次拉取操作。从后台服务器拉取时固定为5秒一次'
        ,'en':'Specify in how many seconds should a new polling be started when the previous successful one has been done. ' +
            'When fetching from backend server, the interval is fixed at 5 seconds.'
        ,'jpn':'一度取得を成功した後何秒以内にもう一度取得を行うことを指定できます。バックエンドサーバーから取得する場合は5秒間に固定します。'
    }
    ,'boss_finder_list_number':{
        'zh':'同时检索的Boss数量'
        ,'en':'number of boss(es) to track'
        ,'jpn':'同時に検索するボスの数'
    }
    ,'tabs_label':{
        'zh':'多人,输入ID,共斗'
        ,'en':'Raid,ID Entry,Co-op'
        ,'jpn':'マルチ,ID入力,共闘'
    }
    ,'hint_entry_join':{
        'zh':'输入多人或者共斗房间ID'
        ,'en':'Input raid ID or co-op room ID'
        ,'jpn':'参戦ID・共闘ルームIDを入力'
    }
    ,'id_entry_join':{
        'zh':'加入'
        ,'en':'Join'
        ,'jpn':'参戦'
    }
    ,'id_coop_enter':{
        'zh':'进房'
        ,'en':'Enter'
        ,'jpn':'参加する'
    }
    ,'coop_filter_hint':{
        'zh':'以房间名筛选，多个关键字以半角/全角逗号或半角/全角空格分隔'
        ,'en':'filter room title by keywords separated by comma or space'
        ,'jpn':'タイトルで絞り込む、複数のキーワードは半角/全角コンマ、半角/全角スペースで区切る'
    }
    ,'finder_on_only_when_activated':{
        'zh':'仅激活时获取数据'
        ,'en':'fetch data only when activated'
        ,'jpn':'活性化した時のみデータを取得'
    }
    ,'omake':{
        'zh':'附加功能'
        ,'en':'Extra'
        ,'jpn':'おまけ'
    }
    ,'game_start':{
        'zh':'开始游戏'
        ,'en':'Launch Game'
        ,'jpn':'ゲームを起動'
    }
    ,'dialog_space_shortcuts_switch':{
        'zh':'剧情界面快捷键'
        ,'en':'shortcuts in cut scenes'
        ,'jpn':'会話シーンのショットカット'
    }
    ,'dialog_space_shortcuts_switch_desc':{
        'zh':'按空格键前进，按"b"键打开/关闭对话记录'
        ,'en':'space key for advancing the scene, "b" key for toggling backlog'
        ,'jpn':'スペースキーで会話を進めます。"b"でバックログの表示/非表示を切り替えます'
    }

    ,'coop_room_error_unknown':{
        'zh':'意外错误，加入共斗房间失败'
        ,'en':'Failed to join this room due to unknown error.'
        ,'jpn':'予想外のエラーにより参加できません'
    }

    ,'coop_room_error_unknown2':{
        'zh':'服务器未指定Raid名称，加入共斗房间失败'
        ,'en':'Failed to join this room due to absent of raid id in server response'
        ,'jpn':'サーバがマルチバトルを指定していないため参加できません。'
    }

    ,'coop_room_error_start_check_failed':{
        'zh':'自发该boss的每日限制已到，或者其他条件不符合，无法参加此共斗房间'
        ,'en':'Failed join this room because you reached daily limit of this raid or not qualified with other pre-conditions'
        ,'jpn':'該当マルチの毎日自発制限が達しているか、ほかの条件が満たさないためこのルームに参加できません'
    }

    ,'coop_room_error_elixir_check_failed':{
        'zh':'没有足够的半红以回复AP，无法加入此共斗房间'
        ,'en':'Failed join this room because you do not have enough Half Elixir to recover AP'
        ,'jpn':'エリクシールハーフが足りなくAPを回復できないためこのルームに参加できません'
    }

    ,'coop_room_popup_1':{
        'zh':'消耗以下道具以加入共斗房间 {0}'
        ,'en':'Consume following items to join room {0}'
        ,'jpn':'下記のアイテムを消費してルーム {0} に参加します'
    }

    ,'coop_room_popup_2':{
        'zh':'半红： {0}&nbsp;→&nbsp;{1}'
        ,'en':'Elixir Half: {0}&nbsp;→&nbsp;{1}'
        ,'jpn':'エリクシールハーフ: {0}&nbsp;→&nbsp;{1}'
    }

    ,'coop_room_popup_3':{
        'zh':'选择一种门票'
        ,'en':'choose a treasure'
        ,'jpn':'消費するトレジャーを指定してください'
    }

    ,'coop_room_popup_4':{
        'zh':'该Boss需要消耗全部种类的门票'
        ,'en':'raid of this room requires consuming some of each treasure'
        ,'jpn':'全種類のトレジャーを消費する必要があります'
    }

    ,'coop_room_error_room_type_unexpected':{
        'zh':'未知的房间类型，无法加入房间'
        ,'en':'Failed to join this room due to unknown room type'
        ,'jpn':'予想外の種類のルームのため参加できません'
    }

    ,'auto_recovery_ap_failure':{
        'zh':'回复AP失败',
        'en':'Cannot recover AP.'
        ,'jpn':'APを回復できませんでした。'
    }

    ,'coop_room_error_insufficient_treasure':{
        'zh':'门票不够，无法加入房间'
        ,'en':'You cannot join this room due to insufficient treasure items'
        ,'jpn':'トレジャーが足りないため参加できません'
    }

    ,'coop_room_cancel':{
        'zh':'取消'
        ,'en':'Cancel'
        ,'jpn':'取り消し'
    }

    ,'coop_room_ok':{
        'zh':'参加'
        ,'en':'Join'
        ,'jpn':'参加する'
    }

    ,'coop_room_copy_room_key':{
        'zh':'点击以复制到剪贴板'
        ,'en':'Click to copy room ID to clipboard'
        ,'jpn':'クリックしてクリップボードへコピーする'
    }

    ,'coop_menu_title':{
        'zh':'共斗房间列表'
        ,'en':'Co-op Room List'
        ,'jpn':'共闘ルームリスト'
    }

    ,'coop_menu_polling_manual':{
        'zh':'手动'
        ,'en':'Manually'
        ,'jpn':'手動'
    }

    ,'coop_menu_desc':{
        'zh':'定时拉取所有共斗房间信息，点击列表项可自动加入房间。<br/>' +
            '同时还可以输入关键字(多个关键字以半角/全角逗号或半角/全角空格分隔）筛选房间标题。'
        ,'en':'Fetch info of ALL co-op room periodically, and you can join room by clicking on list items.<br/>' +
            ' The list can be filtered by entering keywords (multiple keywords can be separated by commas or spaces) in the input box.'
        ,'jpn':'定期的にすべての共闘ルームの情報を取得します。リストの項目をクリックすると自動的にルームに参加します。<br/>' +
            '入力欄にキーワード（複数のキーワードは半角/全角コンマ、半角/全角スペースで区切る）を入力し、リストを絞り込むこともできます。'
    }

    ,'coop_menu_polling_interval':{
        'zh':'拉取间隔（秒）'
        ,'en':'polling interval (seconds)'
        ,'jpn':'取得間隔（秒）'
    }

    ,'coop_room_repeating':{
        'zh':'连车'
        ,'en':'repeating'
        ,'jpn':'連続'
    }

    ,'privacy_policy':{
        'zh':'隐私声明'
        ,'en':'Privacy Policy'
        ,'jpn':'個人情報方針'
    }

    ,'twitter_error_1':{
        'zh':'本地Boss列表过期，请更新Boss列表数据'
        ,'en':'Local boss list is out-dated, please update boss list data'
        ,'jpn':'ローカルのボスリストデータが古いため、更新してください'
    }

    ,'twitter_error_2':{
        'zh':'请求过于频繁，请等待15秒后再尝试拉取'
        ,'en':'Your connection is temporarily rate-limited, please wait for 15 seconds before fetching again'
        ,'jpn':'過多なリクエストを送信したため、15秒ほどのをあけてからデータ取得してください'
    }

    ,'twitter_error_3':{
        'zh':'暂时失去和服务器的连接'
        ,'en':'Connection with the server is temporarily lost'
        ,'jpn':'しばらくサーバーと接続できなくなりました'
    }
    ,'twitter_error_4':{
        'zh':'服务器正在维护'
        ,'en':'Server is temporarily under maintenance'
        ,'jpn':'サーバーはしばらくメインテナンス中です'
    }
    ,'fetching_switch_to_twitter':{
        'zh':'切换至直接从推特拉取数据'
        ,'en':'Switched to directly fetching from twitter'
        ,'jpn':'直接ツィーターからデータ取得するように切り替えます'
    }
    ,'fetching_server_connection_restore':{
        'zh':'恢复和服务器的连接，开始从服务器拉取数据'
        ,'en':'Reconnected to server, start fetching data from server'
        ,'jpn':'サーバーとの接続が復旧しました、サーバーからデータを取得します'
    }
    ,'fetching_auto_switch':{
        'zh':'自动切换获取方法'
        ,'en':'Fetching methods auto-switch'
        ,'jpn':'取得方法の自動切換え'
    }
    ,'fetching_auto_switch_desc':{
        'zh':'在连不上服务器时自动切换至从推特获取数据，并且间断性地尝试重新连接至服务器'
        ,'en':'Automatically switch to fetching from twitter when loses connection with server and periodically attempts to reconnect with server.'
        ,'jpn':'サーバーとの接続が中止される場合自動的にツィーターからのデータ取得に切り替えて、定期的にサーバーと再接続を試します。'
    }

    ,'fetching_method_description':{
        'zh':'数据获取方式'
        ,'en':'fetching method'
        ,'jpn':'データ取得方法'
    }
    ,'fetching_method_direct_twitter':{
        'zh':'直接从推特获取'
        ,'en':'directly from twitter'
        ,'jpn':'直接ツィーターから'
    }
    ,'fetching_method_from_server':{
        'zh':'从后台服务器获取'
        ,'en':'from backend server'
        ,'jpn':'バックエンドサーバーから'
    }
    ,'fetching_method_direct_twitter_desc':{
        'zh':'旧式的直接从推特获取数据的方式，有一定数据延迟，但是基本不会出现获取失败的情况。作为后台服务器崩溃时的临时方案。'
        ,'en':'Traditional fetching method which directly reads from twitter. It has some lags but hardly fails so serves as a backstop when the backend server is down.'
        ,'jpn':'従来の直接ツイッターから読み込む方法です、ラグがありますがほぼ必ずデータを取得できます。バックエンドサーバがダウンしてる間の応急処置となれます。'
    }
    ,'fetching_method_from_server_desc':{
        'zh':'从部署在服务器上的程序处获取数据，其及时性和其他Raider网站等同。但是服务器本身会崩溃或下线。'
        ,'en':'From the program deployed on a server. It can achieve the same timeliness as other raider sites, however the server itself may crash or go offline.'
        ,'jpn':'サーバに配備したプログラムから取得します。ほかの類似サイトと同じラグが解消しますがサーバ自身がダウン、または停止することがあります。'
    }
    ,'fetching_configuration':{
        'zh':'数据获取'
        ,'en':'Data Fetching'
        ,'jpn':'データ取得'
    }

    ,'skill_summon_shortcuts_switch':{
        'zh':'技能栏和召唤石快捷键'
        ,'en':'skill and summon shortcuts'
        ,'jpn':'スキルと召喚石ショートカット'
    }
    ,'shortcuts_disclaimer':{
        'zh':'不要和其他提供类似功能的插件一起使用这些附加功能'
        ,'en':'Do not enable these extra features while using other extensions which provide similar functions.'
        ,'jpn':'ほかの類似な拡張と同時におまけ機能を使用しないでください'
    }
    ,'char_hp_switch':{
        'zh':'显示角色血量百分比'
        ,'en':'display character hp in percentages'
        ,'jpn':'パーティHPのパーセント表示'
    }

    ,'accurate_hp_switch':{
        'zh':'boss血量详细显示'
        ,'en':'accurate boss HP display'
        ,'jpn':'ボスHP詳細表示'
    }

    ,'close_error_window_switch':{
        'zh':'自动关闭错误窗口'
        ,'en':'auto close error popups'
        ,'jpn':'エラーポップアップの自動消去'
    }

    ,'close_error_window_switch_desc':{
        'zh':'自动关闭直前以及其他错误窗口，只在和技能栏同时启用时才起作用'
        ,'en':'close error popups including "The last turn is waiting to be processed"' +
            ', only valid when enabled together with skill/summon shortcuts.'
        ,'jpn':'直前を含めむエラーポップアップを自動消去します、スキル・召喚石のショートカットと同時に有効化する場合のみ有効します。'
    }

    ,'barrier_free_playing_switch':{
        'zh':'无障碍游戏'
        ,'en':'barrier-free playing'
        ,'jpn':'快適プレー'
    }

    ,'barrier_free_playing_switch_desc':{
        'zh':'允许在Boss转换状态/进场动画期间释放技能或攻击，但是如果释放一个以上的技能或碰到有进场技能的Boss可能会导致服务器报错。谨慎使用。'
        ,'en':'Allow skill casting or attacking during status change or entrance animation of bosses, however trying to cast more than one skill or act before ' +
            'boss uses its preemptive skills may cause errors to be sent to server. Use with care.'
        ,'jpn':'ボスの状態転換や入場の演出と同時にスキルの使用・アタックすることを可能にします。しかし一つ以上のスキルを使用すること、あるいは' +
            'ボスの先制特殊行動の前にスキルを使用・アタックすることはエラーを起こしサーバーへ送信する場合があります。これを理解する上に使用してください'
    }

    ,'keep_playing':{
        'zh':'保持浏览器声音'
        ,'en':'keep playing sound'
        ,'jpn':'音声維持'
    }

    ,'keep_playing_desc':{
        'zh':'浏览器失去焦点时保持声音'
        ,'en':'Keep playing sound when browser is deactivated.'
        ,'jpn':'ブラウザーが非アクティブ化された時ゲームの音声を維持する'
    }

    ,'beep_sound':{
        'zh':'哔声提醒'
        ,'en':'beep notification'
        ,'jpn':'ビーの声で通知する'
    }

    ,'beep_sound_desc':{
        'zh':'有新推特，非手动拉取，且面板为打开状态时发出哔声提醒'
        ,'en':'Beep to notify only when there are new tweets, fetching is not done manually and the raid list is expanded'
        ,'jpn':'新しい救援要請が取得していて、データ取得が自動的で、かつマルチリストが展開している時のみビーの声で通知する'
    }

    ,'fetch_failure':{
        'zh':'数据获取错误{0}，请尝试切换到其他服务器'
        ,'en':'fetching error {0}, try alternative servers if this persists'
        ,'jpn':'情報取得エラー {0}、ほかのサーバへ切り替えて見てください'
    }
    ,'server_url_description':{
        'zh':'服务器列表'
        ,'en':'server list'
        ,'jpn':'サーバリスト'
    }
    ,'server_url_desc':{
        'zh':'拉取失败时切换到其他服务器试试'
        ,'en':'try switching to another server when fetching failure persists'
        ,'jpn':'何度も情報取得が失敗する場合、ほかのサーバへ切り替えて見てください'
    }
    ,'server_url_manual_refresh_button':{
        'zh':'更新服务器列表'
        ,'en':'update server list'
        ,'jpn':'サーバリストの更新'
    }
    ,'server_url_manual_refreshed':{
        'zh':'已经更新服务器列表'
        ,'en':'server list has been updated'
        ,'jpn':'サーバリストが更新されました'
    }
    ,'server_url_manual_already_latest':{
        'zh':'服务器列表已经是最新'
        ,'en':'server list is already latest'
        ,'jpn':'最新のサーバリストです'
    }


    //boss types
    ,"OMEGA_HARD":{'zh':"小岛主",'en':"Omega HARD",'jpn':"マグナHARD"}
    ,"OMEGA_EX":{'zh':"EX岛主",'en':"Omega Extreme",'jpn':"島ボス"}
    ,"OMEGA_HL":{'zh':"方阵1.0HL",'en':"Omega HL",'jpn':"マグナHL"}
    ,"VER2":{'zh':"2.0boss",'en':"Tier1 Summons",'jpn':"召喚石マルチ1"}
    ,"VER2HL":{'zh':"2.0bossHL",'en':"Tier1 HL Summons",'jpn':"召喚石マルチ1HL"}
    ,"VER3":{'zh':"3.0boss",'en':"Tier2 Summons",'jpn':"召喚石マルチ2"}
    ,"FOUR_BEASTS":{'zh':"四象",'en':"Rise of the Beasts",'jpn':"四象降臨"}
    ,"TENSHI":{'zh':"天司",'en':"Primarch",'jpn':"四大天司"}
    ,"HIGH_CARBANCLE":{'zh':"大马",'en':"Tier3 HL Summons",'jpn':"高級鞄マルチ"}
    ,"OMEGAII":{'zh':"新方阵",'en':"Omega II",'jpn':"マグナII"}
    ,"EVENT":{'zh':"活动",'en':"Event",'jpn':"イヴェント"}
    ,"ADVANCED":{'zh':"高级boss",'en':"Advanced",'jpn':"HIGH LEVEL"}
    ,"GUILD_WAR":{'zh':"古战场",'en':"Unite and Fight",'jpn':"古戦場"}
    ,"UNKNOWN":{'zh':"未分类",'en':"Unknown",'jpn':"その他"}
});