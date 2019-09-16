

function Switcher(option){
	var bgcolor = option['bgcolor'];
	var radius = option['radius'];
	var onturnon = option['on'];
	var onturnoff = option['off'];
    var id = option['id'];
	this.isOn = false;
	
	var switch_handle = $("<span class='switch_handle'></span>");
	var container = $("<span class='switch'></span>");
    if(id){
        container.attr("id",id);
    }
	
	switch_handle.add(container)
				.css("border","1px solid "+bgcolor)
				.css("display","inline-block")
				.css("cursor","pointer")
				.css("border-radius",radius)
				.css("-moz-user-select","none")
				.css("user-select","none")
				;
	
	var handledom = switch_handle.css("position","absolute")
						  .css("left","-1px")
						  .css("top","-1px")
						  .css("background-color","white")
						  .get(0);

    var context = this;
	var containerdom = container
						.css("position","relative")
						.css("background-color","white")
						.click(function(){
									if(context.isOn){
										if(onturnoff){
                                            onturnoff.call(containerdom,context);
										}
                                        $(handledom).css("left","-1px").css("right","auto");
                                        $(containerdom).css("background-color","white");
									}else{
										if(onturnon){
                                            onturnon.call(containerdom,context);
										}
                                        $(handledom).css("right","-1px").css("left","auto");
                                        $(containerdom).css("background-color",bgcolor);
									}
                                    context.isOn = !context.isOn;
								})
						.get(0);

	container.append(switch_handle);

	this.on = function(){
		if(this.isOn)
			return;
		$(containerdom).click();
	};
	this.off = function(){
		if(!this.isOn)
			return;
		$(containerdom).click();
	};
    this.toggle = function(desired){
        if(desired){
            this.on();
        }else{
            this.off();
        }
    };
	this.get = function(){
		return containerdom;
	};
    containerdom.handle = this;
}