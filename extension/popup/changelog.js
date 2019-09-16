
var change_logs = [
    {'version': '0.0.0.2',
        'en': '<p>minor optimization</p>'
            + '<p>faster twitter fetching.</p>'
    }
    ,
    {'version': '0.0.0.3',
        'en': '<p>more compact ui</p>'
            + '<p>now you can control how quickly saved tweets expire. Successfully fetched tweets are saved temporarily.' +
            ' If you revisit the raid page shortly afterwards they are displayed immediately instead of reading twitter again. This feature actually exists from the very first version.</p>'
    }
    ,
    {'version': '0.0.0.4',
        'en': '<p>fixed a bug that prevent the list from being shown when the Raid page is access from "Raid" button of Clash events and Event Raids tab are set as the "priority tab".</p>'
    }
    ,
    {'version': '0.0.0.5',
        'en': '<p>The plugin is re-implemented as a floating icon, which enables you to join raids from anywhere in the game.</p>'
            + '<p>Boss discovery now must be triggered manually from the settings menu.</p>'
            + '<p>As now the plugin will continuously fetch from tweeter in the background, the disable button is back.' +
            ' You can manually disable this extension when you temporarily do not need it to increase browser responsiveness.</p>'
    }
    ,
    {'version': '0.0.0.6',
        'en': '<p>Position of the floating icon is now automatically saved when you release the mouse.</p>'
            + '<p>If by accident the icon goes wild, you can always reset it to default position by clicking "reset" button in the setting page.</p>'
    }
    ,
    {'version': '0.0.0.7',
        'en': '<p>Fix a bug that cause the floating icon very difficult, sometimes impossible to expand by clicking.</p>'
    }
    ,
    {'version': '0.0.0.8',
        'en': '<p>Bug fix and improvement for boss discovery: recently a lot of tweets are posted without a boss picture, ' +
            'such twitters are simply ignored in former versions, as lack of picture disables merging bosses with English and Japanese names (namely from different locales), ' +
            'However this also leads to negligence of new bosses which is worse and not unacceptable. ' +
            'Now such tweets are analyzed and correctly added to the list if they contains new bosses, ' +
            'Though there will be two separate entries (English and Japanese) that are of the same boss, at least the boss does show up and we can now join raids.</p>'
    }
    ,
    {'version': '0.0.0.9',
        'en': '<p>Add support for gbf.game.mbga.jp environment,  as many people prefer to play the game on desktop computer through simulated mobile browser.</p>'
    }
    ,
    {'version': '0.0.1.0',
        'zh': '<p>修正了在某些情况下发现Boss功能会卡住的问题</p><p>现在点击过一次的Raid条目会用不同的颜色标记出来</p>' +
            '<p>现在可以选择显示当前语言的Boss名称，或者是显示所有语言的Boss名称，默认显示当前语言设定的Boss名称</p>' +
            '<p>添加日语支持</p>',
        'en': '<p>Fixed bugs that cause auto boss discovery to stall</p><p>Now raid tweets that are clicked (visited) will be highlighted</p>' +
            '<p>Now you can choose to display boss names of current language setting or all languages, by default only names of current language setting are displayed</p>' +
            '<p>Added Japanese support</p>',
        'jpn': '<p>新参ボス探知機能をフリーズさせる不具合を修正しました。</p><p>一度クリックしたツイッターは色付けで目立たせます</p>' +
        '<p>ボスの現在設定している言語の名前／全言語の名前の表示を切り替えます、初期設定は現在設定している言語の名前だけ表示します</p>' +
        '<p>日本語対応開始</p>'
    }
    ,
    {'version': '0.0.1.2',
        'zh': '<p>CY修改了推特的文本格式，插件逻辑做相应的修改</p>',
        'en': '<p>Fix parser logic to comply with new twitter format</p>',
        'jpn': '<p>ツイッターの新しい書式に応じる処理ロジック修正</p>'
    }
    ,
    {'version': '0.0.1.3',
        'zh': '<p>修正发现Boss功能的BUG</p>',
        'en': '<p>Fix bugs of boss discovery</p>',
        'jpn': '<p>新参ボス探知機能を不具合を修正しました</p>'
    }
    ,
    {'version': '0.0.1.4',
        'zh': '<p>添加了使用道具回复BP的功能</p>' +
            '<p>修正了在英文版下无法加入战斗的BUG</p>',
        'en': '<p>Now you can recover BP by using recovery items</p>' +
            '<p>Fixed a bug that cause errors in joining raids when the game is in English mode</p>',
        'jpn': '<p>回復アイテムでBPを回復する機能を追加しました。</p>' +
        '<p>言語設定が英語と設定する場合参戦できない不具合を修正しました</p>'
    }
    ,
    {'version': '0.0.1.5',
        'zh': '<p>添加了自动使用道具回复BP的功能：<br/>' +
            '&nbsp&nbsp;&nbsp;&nbsp;该功能默认关闭。<br/>' +
            '&nbsp&nbsp;&nbsp;&nbsp;为了防止过度回复和消耗较为贵重的粉盒，只会使用粉末回复BP。</p>',
        'en': '<p>Now BP can be automatically recovered when there is no enough BP to join raids:<br/>' +
        '&nbsp&nbsp;&nbsp;&nbsp;This feature is by default turned off.<br/>' +
        '&nbsp&nbsp;&nbsp;&nbsp;Only soul berry will be used to prevent over recovery and consuming soul balm which is considered rarer.</p>',
        'jpn': '<p>マルチを参加する時BPが足りない場合、自動的にアイテムを使って回復する機能を追加しました：<br/>' +
        '&nbsp&nbsp;&nbsp;&nbsp;初期状態ではこの機能は無効にしています。<br/>' +
        '&nbsp&nbsp;&nbsp;&nbsp;過度な回復と貴重なソウルパウダーの消費を防ぐためソウルシードだけ使用します。</p>'
    }
    ,
    {'version': '0.0.1.6',
        'zh': '<p>添加了保持Raid列表状态的功能，打开该选项时，除非手动关闭，否则保持Raid列表为展开状态。<br/>' +
            '<p>修正了无法关闭自动回复功能的BUG</p>',
        'en': '<p>Now the raid list can be kept as expanded unless it is hidden manually<br/>' +
        '<p>Fixed a bug that prevents the auto-recovery feature to be turned off</p>',
        'jpn': '<p>手動で隠す以外の場合マルチリストを展開しているままに維持する機能を追加しました。<br/>' +
        '<p>BP自動回復機能が無効にできない不具合を修正しました。</p>'
    }
    ,
    {'version': '0.0.1.7',
        'zh': '<p>移除了调整推特列表显示条数和旧推特数据保存时间的选项，因为一般Boss都死得很快，显示陈旧数据没有意义。<br/>因此现在总是直接从推特加载数据，并显示最新的数条推特。' +
            '<p>调整了从推特拉取数据的方式，以提高获取的数据的准确性和质量</p>' +
            '<p>现在在点击加入多人战斗时，会自动将参战ID拷贝至系统剪贴板</p>',
        'en': '<p>The config options for tweets list size and old tweets data expiration are removed, as normally bosses dies very fast and it makes no sense to display old tweets.<br/> So currently ' +
        'the extension will always try to fetch from twitter and display most recent ones.' +
        '<p>Improved fetching process to get better and more accurate results from twitter.</p>' +
        '<p>Now when you try to join a raid, the raid id is also copied to system clipboard.</p>',
        'jpn': '<p>ツイッターに救援依頼を出したボスが通常長く生存できなくて、古い依頼を表示する意味がないため、ツイッターリストの容量とツイッターデータのキャッシュの有効時間を調整する設定項目を削除しました。<br/>' +
        '現在いつもツイッターからデータを取得し、最新のいくつかの救援依頼を表示するようにしています。' +
        '<p>ツイッターとの通信方法を改善して、より適切で有用なデータを取得するようにしました。</p>' +
        '<p>マルチバトルに参加する時、参戦IDを同時にクリップボードにコピーするようにました。</p>'
    }
    ,
    {'version': '0.0.2.0',
        'zh': '<p>修正了检索功能导致插件崩溃的BUG</p>' +
            '<p>修正了检索时显示条目多于预定数量的BUG</p>' +
            '<p>新增了可以重置BOSS列表的功能</p>',
        'en': '<p>Fixed a bug that cause the extension to crash when fetching data from twitter</p>' +
            '<p>Fixed a bug that make the twitter list larger than expected</p>' +
            '<p>Now you can reset the boss list in the config menu</p>',
        'jpn': '<p>ツイッターからデータを取得する時拡張がクラッシュする不具合を修正しました</p>' +
        '<p>予定より多くのツイッター項目が表示される不具合を修正しました</p>' +
        '<p>ボスリストを初期化する機能を設定画面に追加しました</p>'
    }
    ,
    {'version': '0.0.3.1',
        'zh': '<p>添加了选择Boss时显示Boss头像的功能，默认开启，可在设置画面关闭</p>',
        'en': '<p>Now boss portraits are displayed when you scroll down the boss list. </p>' +
        'This feature is by default turned on and can be switched off in the setting panel',
        'jpn': '<p>ボスを選択する時ボスの画像を表示するようにしました。</p>' +
        '<p>表示したくない場合は設定画面で非表示にできます。</p>'
    }
    ,
    {'version': '0.0.4.0',
        'zh': '<p>在默认Boss列表中添加了四周年的新Boss</p>',
        'en': '<p>New bosses joined after 4th anniversary update has been added to initial boss list.</p>',
        'jpn': '<p>四周年アップデートで加入したマルチバトルは初期ボスリストに追加しました。</p>'
    }
    ,
    {'version': '0.0.5.0',
        'zh': '<p>在默认Boss列表中添加了四象活动的Boss</p>' +
            '<p>更新版本之后，请在设置菜单里执行一次重置Boss列表，否则看不到新添加的Boss</p>',
        'en': '<p>Bosses of the "Rise of the Beasts" event has been added to initial boss list.</p>' +
        '<p>Please reset the boss list from the config menu after updating to make those bosses show up in the list.</p>',
        'jpn': '<p>イヴェント「四象降臨」のマルチバトルは初期ボスリストに追加しました。</p>' +
        '<p>この更新を有効にするため、アップデートした後設定画面で一度ボスリストの初期化をお願いします。</p>'
    }
    ,
    {'version': '0.0.5.1',
        'zh': '<p>在默认Boss列表里添加了光六道和光·暗2.0方阵Boss，官方暂时未放出光·暗2.0方阵的头像</p>' +
            '<p>修复了一个导致消息窗口没有彻底隐藏的问题</p>' +
            '<p>更新版本之后，请在设置菜单里执行一次重置Boss列表，否则看不到新添加的Boss</p>',
        'en': '<p>Metatron and Avatar have been added to default boss list. Temporarily their portraits are nowhere to be found.</p>' +
        '<p>Fixed a bug that cause the popup box to not hide completely.</p>' +
        '<p>Please reset the boss list from the config menu after updating to make those bosses show up in the list.</p>',
        'jpn': '<p>ゼノ・コロゥ、メタトロンHLとアバターHLは初期ボスリストに追加しました。現在メタトロンHLとアバターHLの画像は公開されていない状態です。</p>' +
        '<p>ポップアップが正常に隠されない不具合を修正しました。</p>' +
        '<p>この更新を有効にするため、アップデートした後設定画面で一度ボスリストの初期化をお願いします。</p>'
    }
    ,
    {'version': '0.0.6.0',
        'zh': '<p>现在Boss列表会自动从服务器更新到本地。</p>',
        'en': '<p>Now boss list will be dynamically updated from server.</p>',
        'jpn': '<p>ボスリストは自動的にサーバーより更新するようになりました。</p>'
    }
    ,
    {'version': '0.0.7.0',
        'zh': '<p>现在Boss列表以不同的Boss类型分类显示。可以点击分类标题将任意类型Boss折叠隐藏。</p>',
        'en': '<p>Now boss list has been classified, you can show/hide certain kinds of boss by clicking on the separators.</p>',
        'jpn': '<p>ボスリストがグループにまとめて表示するようになりました。グループタイトルをクリックして同じグループのボスを非表示することができます。</p>'
    }
    ,
    {'version': '0.0.7.1',
        'zh': '<p>添加了中文的Boss名称。</p>',
        'en': '<p>Localized boss names in Chinese.</p>',
        'jpn': '<p>ボスの名前の中国語翻訳を追加しました。</p>'
    }
    ,
    {'version': '0.0.7.4',
        'zh': '<p>现在可以在登录推特的同时使用本插件了。</p>',
        'en': '<p>Now you can use this extension while logged in twitter.</p>',
        'jpn': '<p>ツイッターをログインしている状態で当拡張を使用できるように修正しました。</p>'
    }
    ,
    {'version': '0.0.7.6',
        'zh': '<p>修复使用插件时无法登录推特的问题。</p>',
        'en': '<p>Fix bugs that prevents you to log in twitter while using this plugin.</p>',
        'jpn': '<p>当拡張を使用している状態でツイッターをログインできない不具合を修正しました。</p>'
    }
    ,
    {'version': '0.0.7.7',
        'zh': '<p>现在可以调整从推特拉取数据的时间间隔了。</p>',
        'en': '<p>Now you can specify interval between polling requests to twitter.</p>',
        'jpn': '<p>ツイッターから救援データ取得の時間間隔を指定できるようになりました。</p>'
    }
    ,
    {'version': '0.0.8.0',
        'zh': '<p>现在可以同时检索多个Boss了，默认1个，最大4个。</p>' +
            '<p>现在可以选择在Raid列表关闭时不获取数据</p>' +
            '<p>添加了直接输入RaidID加入战斗的功能（和游戏内置功能一样），通过Boss列表上方的标签切换</p>' +
            '<p>添加了几个便利的小功能</p>',
        'en': '<p>Now you can track multiple boss (1 by default, 4 at maximum) at the same time.</p>' +
        '<p>Now you can choose not to fetch data in the background when raid list is folded.</p>' +
        '<p>An raid ID entry form has been added which is same as built-in entry form of the game.' +
        'Click on the tabs above boss list to switch between normal raid list and the entry form.</p>' +
        '<p>Some extra features have been added for convenience.</p>',
        'jpn': '<p>同時に複数のボスを検索できるようになりました。ボスの数は初期で1個、最大で4個になります。</p>' +
        '<p>マルチリストが非表示の時自動的にデータを取得しないと設定できるようになりました。</p>' +
        '<p>直接救援依頼IDを入力して参戦できるようになりました、ボスリストの上にあるタブで通常のマルチリストと入力枠の表示を切り替えられます。</p>' +
        '<p>便利のおまけ機能を追加しました。</p>'
    }
    ,
    {'version': '0.0.8.4',
        'zh': '<p>修正了弹出窗口消失后依然阻止点击页面其他按钮的Bug。</p>' +
            '<p>修正了在手机环境下（包括Yandex浏览器）无法运作的Bug，以及部分样式问题</p>',
        'en': '<p>Fixed a bug that prevents you from clicking buttons on the page even after the popup disappears.</p>' +
        '<p>Fixed bugs that prevent the plugin to function properly in mobile browsers (including Yandex) and some incorrect styles.</p>',
        'jpn': '<p>ポップアップが消えた後まだほかのボタンをクリックできない不具合を修正しました。</p>' +
        '<p>携帯環境（Yandexを含め）で動作できない不具合と画面表示の不具合を修正しました。</p>'
    }
    ,
    {'version': '0.0.8.6',
        'zh': '<p>修正了无法检索アルテHL的BUG（官方的推文里这个Boss居然没有等级）。</p>',
        'en': '<p>Fixed boss discovery for Arte(Impossible) which lacks a level in default twitter text.</p>',
        'jpn': '<p>アルテHLを検索できない不具合を修正しました。ゲーム内のツイッター機能でこのボスの救援を出す時レベルが未指定です。</p>'
    }
    ,
    {'version': '0.0.9.0',
        'zh': '<p>新增了共斗房间功能。点击第三个标签页以使用这个功能</p>' +
            '<p>在输入框里输入关键字可以以房间标题筛选房间，点击列表项可以加入共斗房间。</p>',
        'en': '<p>Co-op room list feature has been added, access it by switching to the thrid tab.</p>' +
        '<p>You can filter the list by entering keywords in the input box and you can join co-op rooms by clicking on list items.</p>',
        'jpn': '<p>共闘ルームリスト機能を追加しました、三つ目のタブをクリックして使用できます。</p>' +
        '<p>入力欄にキーワードを入力し、リストをさらに絞り込むことができます。リスト項目をクリックしてルームを加入することができます。</p>'
    }
    ,
    {'version': '0.0.9.2',
        'zh': '<p>修复了共斗房间列表不刷新的问题</p>',
        'en': '<p>Fixed a bug that prevent the co-op room to refresh</p>',
        'jpn': '<p>共闘ルームリストが更新されない不具合を修正しました</p>'
    }
    ,
    {'version': '0.0.9.4',
        'zh': '<p>修复了推特内容解析不正确的问题</p>',
        'en': '<p>Fixed a bug that cause the tweet content to be incorrectly parsed.</p>',
        'jpn': '<p>ツィターの内容が正確に解析されない不具合を修正しました。</p>'
    }
    ,
    {'version': '0.0.9.5',
        'zh': '<p>去掉了手动发现Boss的功能，因为根据用户要求Boss列表很长时间以来，同时以后也会是我手动维护。</p>',
        'en': '<p>Removed boss discovery, as per users\' request, the boss list has long been, and will continue be maintained by me manually.</p>',
        'jpn': '<p>新しいボス発見機能を取り除かれました。ユーザーの要望より、ボスリストの更新が過去の長い間、そしてこれからも私自分で実行することになります。</p>'
    }
    ,
    {'version': '0.1.0.0',
        'zh': '<p>现在插件默认从我在服务器上部署的程序处获取数据。几乎没有延迟，但如果服务器状态不佳时也可以切换至旧式的从推特拉取数据的方式。</p>' +
            '<p>现在即使从服务器拉取数据失败，也会显示存在本地的旧数据。</p>' +
            '<p>更新了本地默认的初始Boss列表。</p>',
        'en': '<p>Now by default the extension fetches data from the program I deployed to a server and there will be nearly no lag in the data.' +
        ' When the server is down users can switch back to old fetching method which directly reads from twitter.</p>' +
        '<p>Now the extension will display old data stored locally even when fetching from server failed.</p>' +
        '<p>Initial boss list has been updated.</p>',
        'jpn': '<p>現在当拡張はデフォルトで私がサーバーに配備したプログラムからデータを取得します、ラグが解消しますが' +
        'サーバー自身がダウンする間従来のツィーターからデータする方法に切り替えられます。</p>' +
        '<p>サーバーからの取得が失敗する場合、ローカルで保存した古いデータを表示するようにしました。</p>' +
        '<p>初期ボスリストの内容を更新しました。</p>'
    }
    ,
    {'version': '0.1.1.0',
        'zh': '<p>现在除非切换到第三个标签卡，共斗房间列表不会自动在后台拉取。即使‘仅激活时获取数据’开关关闭也是一样。</p>' +
            '<p>现在在服务器不可用时默认会自动切换到从推特获取数据，可以在配置菜单中关闭这个行为。</p>' +
            '<p>现在在Boss列表的分类被收起时会自动调整其高度。</p>',
        'en': '<p>Now the coop-room list will only be fetched in the background when the 3rd tab is activated,' +
        ' even when "fetch data only when activated" is switched on.</p>' +
        '<p>Now by default the extension will switch to fetching from twitter when server is down, ' +
        'this can be switched off in the config menu.</p>' +
        '<p>Now boss list will be correctly shortened when sections are folded.</p>',
        'jpn': '<p>現在「活性化した時のみデータを取得」の状態にかかわらず、三番目のタブが活性化されている場合のみバックグラウンドで共闘ルームリストを取得するようにしました。</p>' +
        '<p>サーバーへ接続できなくなる場合、自動的にツィーターからデータ取得に切り替えるようにしました。この自動切換えは設定メニューで無効化することができます。</p>' +
        '<p>ボスリストのグループが非表示される場合正常にボスリストを縮小するようにしました。</p>'
    }
    ,
    {'version': '0.1.2.0',
        'zh': '<p>公开了技能栏和召唤石快捷按钮功能。不要和其他提供类似功能的插件一起使用这个功能</p>',
        'en': '<p>Now the skill and summon shortcuts function is made public.' +
        ' However please do not use this function with other extensions which provide similar functions.</p>',
        'jpn': '<p>スキルと召喚石のショットカット機能を公開しました。ほかの類似な機能を提供する拡張と一緒に使用しないでください</p>'
    }
    ,
    {'version': '0.1.3.0',
        'zh': '<p>现在技能快捷按钮在技能进入技能轨但是尚未释放时会高亮显示</p>' +
            '<p>第二个标签的输入框现在同时支持多人战ID和共斗房间ID</p>' +
            '<p>改善了技能和召唤快捷键不显示的问题</p>',
        'en': '<p>Now shortcuts of pending skills are highlighted.</p>' +
        '<p>The input box in the second tab now supports both raid ID and coop-room ID.</p>' +
        '<p>Hopefully fixed the bug that cause skill and summon shortcuts not be created.</p>',
        'jpn': '<p>現在アビリティレールに表示されているスキルのショートカットがハイライト表示されます</p>' +
        '<p>二番目のタブの入力欄がマルチバトルの参戦IDと共闘ルームID両方をサポートするようにしました。</p>' +
        '<p>スキルと召喚石のショートカットが非表示される場合がある不具合を修正してみました。</p>'
    }
    ,
    {'version': '0.1.4.0',
        'zh': '<p>为两个附加功能添加了开关。现在它们默认关闭，升级之后如有需要请手动打开。</p>' +
            '<p>添加了显示角色血量百分比的功能，默认关闭</p>' +
            '<p>添加了显示Boss血量详细数值的功能，血量数字格式根据<b>插件</b>的语言设定改变。默认关闭</p>',
        'en': '<p>Configuration switches for two extra features has been added. They are by default after update, please turn them on manually if you need them.</p>' +
        '<p>Added a new feature that shows character HP in percentages, it is by default disabled.</p>' +
        '<p>Added a new feature that shows boss HP in detail. Number format of HP changes according to language setting of <b>this extension</b>,' +
        'it is by default disabled.</p>',
        'jpn': '<p>二つのおまけ機能を有効・無効にできるようになりました。アップデート後デフォルトで無効化しています、使用したい場合は手動で有効にしてください。</p>' +
        '<p>パーティメンバーのHPのパーセント表示機能を追加しました、デフォルトで無効化しています。</p>' +
        '<p>ボスのHPの詳細表示機能を追加しました。HP数値表示の形式は<b>拡張</b>の言語設定により変更します。デフォルトで無効化しています。</p>'
    }
    ,
    {'version': '0.1.5.0',
        'zh': '<p>现在页面刷新时会默认显示之前的Raid搜索结果，但是过于老旧的搜索结果则不会显示。</p>' +
            '<p>更改了加载中状态的提示语为一个图标。</p>',
        'en': '<p>Now old raid data will be displayed first when the page is reloaded, if they are not too out-dated.</p>' +
        '<p>Use a spinner image instead of hint message to indicate the extension is refreshing its raid result.</p>',
        'jpn': '<p>画面がリロードされる場合前回の取得結果を表示するようにしました。しかし古いすぎる取得結果は表示されません。</p>' +
        '<p>メッセージの代わりに、スピナーイメージでロード中の状態を表示するようにしました。</p>'
    }
    ,
    {'version': '0.1.5.1',
        'zh': '<p>适配勇气之地新UI</p>',
        'en': '<p>Update for compatibility of new UI introduced by Brave Ground event</p>',
        'jpn': '<p>ブレーブグラウンドイベントの新たなUIの対応</p>'
    }
    ,
    {'version': '0.1.6.0',
        'zh': '<p>增加了浏览器失去焦点时持续播放声音的功能，默认关闭</p>' +
            '<p>增加了特定条件下，有新推特时发出哔声提醒的功能，默认关闭</p>' +
            '<p>修复了手动拉取数据时不会中断正在进行的自动数据拉取的问题。</p>',
        'en': '<p>Added a new functionality that keeps sound playing when browser is deactivated. Should be enabled manually.</p>' +
        '<p>Added a new functionality that makes the browser beep when new tweets has been found when conditions are met. Should be enabled manually.</p>' +
        '<p>Fixed a bug that cause manual data fetching not cancelling automatically triggered ones which are running at the same time.</p>',
        'jpn': '<p>ブラウザーが非アクティブ化された時音声を維持する機能を追加しました。</p>' +
        '<p>特定の条件で新しい救援要請が取得した場合ビーの声で通知する機能を追加しました。</p>' +
        '<p>手動のデータ取得が同時に行っている自動データ取得をキャンセルしない不具合を修正しました。</p>'
    }
    ,
    {'version': '0.1.7.0',
        'zh': '<p>去掉了自动切换两种数据获取方式的功能，如果一直获取失败请手动切换</p>' +
            '<p>增加了获取数据的超时时间，减少了获取失败时的错误信息（大部分信息都没什么用且干扰操作）</p>' +
            '<p>去掉了设置数据获取间隔的功能，现在的数据获取间隔固定为5秒</p>',
        'en': '<p>Removed automatic switching between two data fetching methods, if fetching continues to fail, switch to another method manually.</p>' +
        '<p>Increased timeout period of fetching requests. Reduced error message (most of them are useless and boring) when fetching fails.</p>' +
        '<p>Data fetching interval can no longer be configured and now fixed at 5 seconds.</p>',
        'jpn': '<p>データ取得方法の自動切換えを取り消しました、何回も取得失敗の場合手動で別の取得方法に切り替えてください。</p>' +
        '<p>データ取得のタイムアウトを増加しました。取得失敗時のエラーメッセージを簡潔化にしました（役に立たなくて迷惑なのが多いと思うので）。</p>' +
        '<p>データ取得間隔が設定不能にし、5秒間に固定しました。</p>'
    }
    ,
    {'version': '0.1.8.0',
        'zh': '<p>因为技术性原因暂时去掉了快捷键功能</p>' +
            '<p>去掉了直接从推特拉取的功能。</p>' +
            '<p>增加了一台服务器。如果数据获取一直失败，请手动切换到其他服务器试试</p>' +
            '<p>调整了部分设置菜单的位置</p>',
        'en': '<p>Temporarily removed shortcuts feature for technical reasons.</p>' +
        '<p>Deprecated and removed fetching from twitter.</p>' +
        '<p>Deployed program to a new server. Please manually switch to alternative servers if fetching error persists.</p>' +
        '<p>Adjusted positions of some configuration items.</p>',
        'jpn': '<p>技術上の理由でショートカット機能を一時的に取り除きました。</p>' +
        '<p>直接ツィーターからの情報取得を廃止しました。</p>' +
        '<p>もう一つのサーバを配備しました。情報取得エラーが何度も現れる場合手動でほかのサーバへ切り替えてみてください。</p>' +
        '<p>一部の設定項目の位置を調整しました。</p>'
    }
    ,
    {'version': '0.1.8.3',
        'zh': '<p>修复了一个导致不够材料时也允许加入共斗房间的BUG</p>',
        'en': '<p>Fixed a bug that erroneously permits joining coop-room when you do not have sufficient treasure items.</p>',
        'jpn': '<p>トレジャーが足りなくても共闘ルームが参加できる不具合を修正しました。</p>'
    }
    ,
    {'version': '0.1.9.0',
        'zh': '<p>修复了在DMM商店页面样式显示不正常的问题。</p>' +
            '<p>设置菜单里增加了手动刷新服务器列表的按钮。</p>',
        'en': '<p>Fixed display issues when viewed in DMM store page.</p>' +
            '<p>Added a button to settings menu which manually updates the server list.</p>',
        'jpn': '<p>DMMストア画面で正常に表示されない不具合を修正しました。</p>' +
            '<p>手動でサーバーリストを更新するボタンを設定メニューに追加しました。</p>'
    }
];

var props = {
    'change_log_title':{
    'zh':'更新日志',
        'en':'ChangeLog'
        ,'jpn':'変更履歴'
    }
};
var pane = $(".text-pane");
for(let i=0,k=change_logs[i];i<change_logs.length;++i,k=change_logs[i]){
    props[k.version] = k;
    pane.prepend(`
        <div class="changelog-item">
                <p class="changelog-version">${k.version}</p>
                <ul class="changelog-list">
                    <li class="i18n_str" data-i18n_str="${k.version}">
                    </li>
                </ul>
        </div>
     `);
}

$("#back").click(function(){
    window.location = 'popup.html';
});

var interpolator = new I18n(props);
gbfbr.persistence.getMultiple(["default_locale"],function(ret) {
    interpolator['defaultLoc'] = ret['default_locale'] || 'en';
    interpolator.interpolate();
});
