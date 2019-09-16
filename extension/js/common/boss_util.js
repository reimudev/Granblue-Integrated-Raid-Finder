/**
 * Util function of Boss object
 * They are all somehow business-logic-related, so are improper to replace within boss.js
 */

/**
 * make a string description of a boss object
 * @param boss
 * @returns {string}
 */
gbfbr.Boss.bossObjectToString = function (boss){
    var str = "Lv";
    str += boss.level;
    if(boss.names['jpn']){
        str += " ";
        str += boss.names['jpn'];
    }
    if(boss.names['en']){
        str += " ";
        str += boss.names['en'];
    }
    if(boss.names['zh']){
        str += " ";
        str += boss.names['zh'];
    }
    return str;
};

/**
 * get localized boss name
 * @param boss boss object
 * @param loc locale
 */
gbfbr.Boss.toLocalizedString = function(boss,loc){
    if( ! boss.names[loc]){
        throw "undefined name for locale:"+loc;
    }
    var str = "Lv";
    str += boss.level;
    str += " " + boss.names[loc];
    return str;
};

/**
 * check whether two boss objects are the same
 * @param b1    {'level','jpn','en'}
 * @param b2    {'level','jpn','en'}
 * @returns {boolean}
 */
gbfbr.Boss.isSameBossObject = function(b1,b2){
    if(!b1 || !b2)
        return false;
    return (b1.names['jpn'] === b2.names['jpn'] ||  b1.names['en'] === b2.names['en'])
        && b1['level'] === b2['level'];
};
/**
 * convert a boss object to a keyword for twitter searching.
 * but no encoding is done
 * @param boss {'level','jpn','en'}
 * @returns {string}
 */
gbfbr.Boss.bossObjectToTwitterKeyword = function(boss){
    var lvl = +boss['level'],jpn = boss.names['jpn'],en = boss.names['en'];
    var str1 = '';
    if(jpn){
        if(lvl){
            str1 += 'Lv' + lvl+' ';
        }
        str1 += jpn.trim();
    }
    var str2 = '';
    if(en){
        if(lvl){
            str2 +=  'Lvl '+lvl+' ';
        }
        str2 += en.trim();
    }
    if(str1 && str2){
        return '"'+str1+'"' + " OR " + '"'+str2+'"';
    }
    return str1 || str2;
};
gbfbr.Boss.isBossObject = function(boss){
    return boss && boss.level && boss.names;
};
/**
 * wrapper for function that makes human-readable description from a timestamp
 * involves i18n conversion
 */
(function(){
    const minute = 1000*60;
    const hour = minute*60;
    const day = hour * 24;
    const str_now = I18n.defaultInstance.localize('tweet_timestamp_now');
    const str_min = I18n.defaultInstance.localize('tweet_timestamp_m');
    const str_hr = I18n.defaultInstance.localize('tweet_timestamp_h');
    const str_d = I18n.defaultInstance.localize('tweet_timestamp_d');

    gbfbr.Boss.makeTsString = function(ts,now){
        var gap = now - ts;
        if(gap < minute){
            return str_now;
        }else if(gap < hour){
            return Math.floor(gap/minute)+str_min;
        }else if(gap< day){
            return Math.floor(gap/hour)+str_hr;
        }else{
            return Math.floor(gap/day)+str_d;
        }
    };

    gbfbr.Boss.isNowTsString = function(str){
        return str === str_now;
    }
}());
