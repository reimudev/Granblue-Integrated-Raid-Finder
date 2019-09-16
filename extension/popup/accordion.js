var Accordion = (function (){
    var accordion = "<div class='accordion'>"
                    + "<p class='accordion_trigger before-plus'>Title Here</p>"
                    + " <div class='accordion_panel'>"
                    + " <ul class='accordion_option_list'>"
                    + " </ul>"
                    + " </div>"
                    + "</div>";
    var option_item = "<li class='accordion_option'></li>";
    return function(option){
        var title = option['title'];
        if(typeof title === 'function'){
            title = title();
        }
        var creator = option['creator'];

        var acc = $(accordion);
        var dom = acc.get();
        var panel = acc.find(".accordion_panel").get();
        acc.find(".accordion_trigger")
            .html(title)
            .click(function(){
                if(dom['accordion-closed']){
                    $(panel).show();
                    $(this).removeClass('before-plus').addClass('before-minus');
                }else{
                    $(panel).hide();
                    $(this).removeClass('before-minus').addClass('before-plus');
                }
                dom['accordion-closed'] = !dom['accordion-closed'];
            });
        var option_list = acc.find(".accordion_option_list");
        for(var i=0;;++i){
            let result = creator(i,option);
            if(!result){
                break;
            }
            option_list.append($(option_item).append(result));
        }
        dom['accordion-closed'] = true;
        return dom;
    }
}());