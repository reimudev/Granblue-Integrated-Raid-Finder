var CustomDropDown = (function(){
    function _CustomDropDown(option){
        option = option || {};

        var input;
        var list;

        var listItems = [];
        var separators = [];
        var currentListItems = [];
        var selectedItem;

        var scrollTop = 0;
        Object.defineProperty(this,"scrollTop",{
            get: function(){
                return scrollTop;
            },
            set: function(pos){
                scrollTop = pos;
                list.scrollTop = pos;
            }
        });

        var disabled = false;
        Object.defineProperty(this,"disabled",{
            get: function(){
                return disabled;
            },
            set: function(val){
                disabled = !!val;
            }
        });

        var initialized = false;
        var isShown = false;
        var filtering = option['filtering'] === true;
        var selectedItemClass = option['selectedItemClass'] || "selected";
        var selectedItemClassReg = new RegExp("[]?"+selectedItemClass+"[]?",'gi');
        var that = this;

        this.hide = function hide(){
            if(!isShown){
                return;
            }
            scrollTop = list.scrollTop;
            toggleVisibility(list,false);
            isShown = false;
            this.onHidden(this);
        };

        this.show = function(){
            if(isShown){
                return;
            }
            toggleVisibility(list,true);
            isShown = true;
            list.scrollTop = scrollTop;
            this.onShown(this);
        };

        this.toggle = function(){
            if(!isShown){
                this.show();
            }else{
                this.hide();
            }
        };

        this.select = function(idx){
            listItems[idx].click();
        };

        this.toggleSeparator = function(idx){
            separators[idx].click();
        };

        function noop(text,idx){}

        function isSeparator(item){
            return +(item.getAttribute("data-list-item-type")) === CustomDropDown.TYPE_SEPARATOR;
        }
        function getText(item){
            return item.getAttribute("data-list-item-text");
        }

        this.itemSelected  = noop;
        this.itemMouseMove = noop;
        this.itemMouseEnter = noop;
        this.itemMouseLeave = noop;
        this.onHidden = noop;
        this.onShown = noop;
        this.separatorExpanded = noop;
        this.separatorFolded = noop;

        this.initialize = function(){
            if(!this.delegate){
                return;
            }
            if(!initialized){
                input = document.querySelector(option.input);
                if(option.readonly!==false){
                    input.setAttribute("readonly","readonly");
                }
                list = document.querySelector(option.list);
                list.style.display = "none";
                input.addEventListener("click", function(e){
                    if(disabled)
                        return;
                    that.toggle();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                });
                if(filtering){
                    input.addEventListener("keyup",function(){
                        if(disabled)
                            return;
                        that.filter();
                    });
                }
                initialized = true;
            }
            this.reload();
        };

        //note this version is different from that in find_multi.js
        function stopPropagation(elem){
            var tmp = elem.jquery ? elem : $(elem);
            tmp.on("mousedown mouseup tap touchstart touchend touchmove",function(e){
                e.stopPropagation();
                e.stopImmediatePropagation();
                return true;
            });
        }

        this.reload = function(){

            listItems.length = 0;
            separators.length = 0;

            var delegate = this.delegate;
            var row = {};
            var k = 0;
            for(;;++k){
                delete row.type;
                delete row.text;
                delete row.dom;
                delete row.styleClass;
                if( ! delegate(k,row)){
                    break;
                }
                let type = row.type;
                let text = row.text;
                let dom = row.dom;
                let styleClass = row.styleClass;
                let properties = row.properties;
                let liElem = undefined;
                if(currentListItems[k]){
                    liElem = currentListItems[k];
                    liElem.innerHTML = "";
                }else{
                    liElem = document.createElement("li");
                    list.appendChild(liElem);
                    currentListItems.push(liElem);
                    stopPropagation(liElem);
                }

                if(type === CustomDropDown.TYPE_SEPARATOR){
                    liElem.setAttribute("data-list-item-type",CustomDropDown.TYPE_SEPARATOR);
                    separators.push(liElem);
                }else if(type === CustomDropDown.TYPE_ITEM){
                    liElem.setAttribute("data-list-item-type",CustomDropDown.TYPE_ITEM);
                    listItems.push(liElem);
                }else{
                    throw "invalid type: "+type;
                }

                liElem.setAttribute("data-list-item-text",text);

                let classStr = "";
                if(styleClass){
                    if(typeof styleClass==='string'){
                        classStr = styleClass;
                    }else if(styleClass.length){
                        for(let p=0;p<styleClass.length;++p){
                            classStr += styleClass[p];
                            classStr += " ";
                        }
                        if(classStr){
                            classStr = classStr.substring(0,classStr.length-1);
                        }
                    }
                }
                if(classStr){
                    liElem.setAttribute("class",classStr);
                }

                if(properties){
                    for(let n in properties){
                        if(properties.hasOwnProperty(n)){
                            liElem.setAttribute(n,properties[n]);
                        }
                    }
                }

                if(typeof dom==='string' || !dom){
                    let tmp2 = document.createElement("span");
                    tmp2.innerHTML = text;
                    liElem.appendChild(tmp2);
                }else if(dom.length){
                    for(let j=0;j<dom.length;++j){
                        liElem.appendChild(dom[j])
                    }
                }else{
                    liElem.appendChild(dom);
                }

            }
            for(let q=k;q<currentListItems.length;++q){
                currentListItems[q].parentNode.removeChild(currentListItems[q]);
            }
            currentListItems.length = k;

            for(let i=0;i<listItems.length;++i){
                listItems[i].onclick = function(e){
                    if(disabled)
                        return;
                    var index = i;
                    var item = e.currentTarget;
                    var text = getText(item);
                    //show selected text
                    input.value = text;
                    that.filter();
                    //change bg color of selected item to blue
                    //restore bg color of previously selected item
                    //click multiple times on the same item takes no effect
                    for(let i=0;i<listItems.length;++i){
                        let item_tmp = listItems[i];
                        let old_cls = item_tmp.getAttribute("class") || "";
                        if(item_tmp === selectedItem){
                            if(item_tmp!==item) {
                                item_tmp.setAttribute("class", old_cls.replace(selectedItemClassReg, ""));
                            }
                        }else{
                            if(item_tmp===item){
                                item.setAttribute("class",old_cls + " " + selectedItemClass);
                            }
                        }
                    }
                    selectedItem = item;
                    //call callback
                    that.itemSelected(index,text,item);
                    //fold the list
                    that.hide();
                };
                listItems[i].onmouseenter = function(e){
                    if(disabled)
                        return;
                    var index = i;
                    var item = e.currentTarget;
                    that.itemMouseEnter(index,getText(item),item);
                };
                if(that.itemMouseMove!==noop){
                    listItems[i].onmousemove = function(e){
                        if(disabled)
                            return;
                        var index = i;
                        var item = e.currentTarget;
                        that.itemMouseMove(index,getText(item),item);
                    };
                }
                listItems[i].onmouseleave = function(e){
                    if(disabled)
                        return;
                    var index = i;
                    var item = e.currentTarget;
                    that.itemMouseLeave(index,getText(item),item);
                };
            }
            for(let i=0;i<separators.length;++i){
                separators[i].onclick = function(e){
                    if(disabled)
                        return;
                    var status = false;
                    var index = i;
                    //if separator, toggle visibility current section
                    let item = e.currentTarget;
                    for(;;){
                        let next = item.nextSibling;
                        if(!next){
                            break;
                        }
                        if(next.nodeType !== Node.ELEMENT_NODE){
                            continue;
                        }
                        if(next.nodeName.toLowerCase() !== "li"){
                            break;
                        }
                        if(isSeparator(next)){
                            //reached next section
                            break;
                        }
                        status = toggleVisibility(next);
                        item = next;
                    }
                    //call callback
                    //if status===true, this section is expaned
                    //otherwise this section is folded
                    (status ? that.separatorExpanded : that.separatorFolded)(index,getText(separators[index]),separators[index]);
                };
            }
            that.filter();
        };

        this.filter = function(){
            if(!filtering){
                return;
            }
            var keyword = input.value;
            var curr = list.querySelector("li");
            var prevSeparator;
            var counter = 0;
            for(;;){
                if(!curr){
                    break;
                }
                if(curr.nodeType !== Node.ELEMENT_NODE){
                    continue;
                }
                if(curr.nodeName.toLowerCase() !== "li"){
                    break;
                }
                if(isSeparator(curr)){
                    if(prevSeparator!==undefined){
                        if(counter===0){
                            toggleVisibility(prevSeparator,false);
                        }else{
                            toggleVisibility(prevSeparator,true);
                        }
                    }
                    counter = 0;
                    prevSeparator = curr;
                }else{
                    if(getText(curr).indexOf(keyword)>=0){
                        toggleVisibility(curr,true);
                        ++counter;
                    }else{
                        toggleVisibility(curr,false);
                    }
                }
                curr = curr.nextSibling;
            }
            if(prevSeparator){
                if(counter===0){
                    toggleVisibility(prevSeparator,false);
                }else{
                    toggleVisibility(prevSeparator,true);
                }
            }
        };

        function toggleVisibility(elem,show){
            var curr = elem.style.display;
            if(show===true){
                if(curr !== 'none'){
                    return;
                }
                let saved = elem.getAttribute("data-toggle-display-value");
                if(!saved){
                    elem.style.display = "initial";
                }else{
                    elem.style.display = saved;
                }
            }else if(show===false){
                if(curr === 'none'){
                    return;
                }
                elem.setAttribute("data-toggle-display-value",elem.style.display);
                elem.style.display = "none";
            }else{
                if(curr === 'none'){
                    show = true;
                    let saved = elem.getAttribute("data-toggle-display-value");
                    if(!saved){
                        elem.style.display = "";
                    }else{
                        elem.style.display = saved;
                    }
                }else if(curr !=='none'){
                    show = false;
                    elem.setAttribute("data-toggle-display-value",elem.style.display);
                    elem.style.display = "none";
                }
            }
            return show;
        }
    }
    Object.defineProperty(_CustomDropDown,"TYPE_SEPARATOR",{
        writable:false,
        value:0
    });
    Object.defineProperty(_CustomDropDown,"TYPE_ITEM",{
        writable:false,
        value:1
    });
    return _CustomDropDown;
}());