/* Mali's <<image-map>> macro set */

(()=>{const e={map:{name:"image-map",tags:["onClick","layers"]},area:{name:"area",tags:["hover","overlay"],liveHover:!1,hoverClickDuration:100,liveOverlay:!1}},a=e=>{let a={},r=0;for(;r<e.length;){const t=e[r];if("object"==typeof t)Array.isArray(t)?e.splice(r--,1,...t):Object.assign(a,t);else{const o=e[r+=1];if(void 0===o)throw new Error("Uneven number of arguments.");if("string"!=typeof t)throw new Error(`Attribute key must be a string, reading: '${t}'.`);a[t.toLowerCase()]=o}r++}return a},r=function(e){const r=this.payload.find((a=>a.name===e));return r&&(r.attr=a(r.args)),r};Macro.add(e.map.name,{tags:e.map.tags,count:0,handler(){if("string"!=typeof this.args[0])return this.error(`Image url must be a string! Currently : ${this.args[0]}.`);const t={name:this.name+this.self.count++,attr:a(this.args.slice(1)),click:r.call(this,e.map.tags[0]),layers:r.call(this,e.map.tags[1])};t.attr.style??="",["width","height"].forEach((e=>{t.attr[e]&&(t.attr.style+=`;${e} : ${t.attr[e]}`)})),this.wrapper=$("<div>").attr(t.attr).addClass(this.name+"-wrapper");const o=$("<img>").attr({src:this.args[0],usemap:"#"+t.name}).appendTo(this.wrapper);if(this.map=$("<map>").attr("name",t.name).appendTo(this.wrapper),new ResizeObserver((()=>{const{naturalHeight:e,naturalWidth:a,height:r,width:t}=o[0],s={y:r/e,x:t/a};this.map.find("area").trigger({type:"sizeToRatio",ratio:s})})).observe(o[0]),this.wrapper.wiki(this.payload[0].contents),t.click&&this.wrapper.on("click",(e=>"AREA"===e.target.nodeName?$.wiki(t.click.contents):null)),t.layers){const e=$(new DocumentFragment).wiki(t.layers.contents).find("img").addClass(this.name+"-layer");this.wrapper.append(e)}this.output.appendChild(this.wrapper[0])}}),Macro.add(e.area.name,{tags:e.area.tags,handler(){let t=this;for(;t&&t.name!==e.map.name;)t=t.parent;if(!t)return this.error(`<<${this.name}>> macro can only be used inside a <<${e.map.name}>> macro!`);const{map:o,wrapper:s}=t,i={shape:null,coords:this.args[0],attr:a(this.args.slice(1)),payload:this.payload[0].contents.trim(),hover:r.call(this,e.area.tags[0]),overlay:r.call(this,e.area.tags[1]),isPoint:!1};switch("string"==typeof i.coords&&(i.coords=i.coords.split(",")),i.coords=i.coords.map((e=>Number(e))),i.coords.length){case 0:case 1:return this.error("Improper number of coordinates!");case 2:i.shape="point",i.isPoint=!0,i.coords.push(5);break;case 3:i.shape="circle";break;case 4:i.shape="rect";break;default:i.shape="poly"}if("poly"===i.shape&&i.coords.length%2)return this.error("Odd number of coordinates! Each poly point should have an x and y value: x1,y1, x2,y2...");const n=$("<area>").attr(i.attr).attr({shape:i.isPoint?"circle":i.shape,coords:this.args[0]}).appendTo(o);if(n.on("sizeToRatio",(e=>{const a=i.coords.map(((a,r)=>Number(a)*e.ratio[r%2?"y":"x"]));n.attr({coords:a.join()});const r=(e=>{switch(e.length){case 3:return{top:e[1]-e[2],left:e[0]-e[2],width:2*e[2],height:2*e[2]};case 4:return{left:e[0],top:e[1],width:e[2]-e[0],height:e[3]-e[1]};default:let a="",r=[],t=[];t.min=r.min=1/0,t.max=r.max=0,e.forEach(((e,a)=>{a%2?(e>t.max&&(t.max=e),e<t.min&&(t.min=e),t.push(e)):(e>r.max&&(r.max=e),e<r.min&&(r.min=e),r.push(e))}));for(let e=0;e<r.length;e++)a+=`${r[e]}px ${t[e]}px,`;return{top:0,left:0,"padding-top":t.min+"px","padding-left":r.min+"px",width:r.max-r.min+"px",height:t.max-t.min+"px","clip-path":`polygon(${a.slice(0,-1)})`}}})(a);return i.hover?.elem.css(r),i.overlay?.elem.css(r),i.ptMarker?.css(r),!1})),n.ariaClick(this.createShadowWrapper((()=>{$.wiki(i.payload),i.hover&&(i.hover.elem.addClass("clicked"),setTimeout((()=>i.hover.elem.removeClass("clicked")),e.area.hoverClickDuration)),i.overlay?.live&&i.overlay.elem.empty().wiki(i.overlay.contents)}))),i.isPoint&&(i.ptMarker=$('<div class="point-marker">').appendTo(s),n.on("mouseover focus",(()=>i.ptMarker.addClass("hover"))).on("mouseout focusout",(()=>i.ptMarker.removeClass("hover"))),i.hover=i.overlay=null),i.hover){const a=i.hover.attr.live??e.area.liveHover;delete i.hover.attr.live,i.hover.elem=$("<div>").attr(i.hover.attr).wiki(i.hover.contents).addClass("area-hover "+i.shape+(i.attr.disabled?" disabled":"")).appendTo(s),n.on("mouseover focus",(()=>{a&&this.createShadowWrapper(i.hover.elem.empty().wiki(i.hover.contents)),i.hover.elem.show()})).on("mouseout focusout",(()=>i.hover.elem.hide()))}i.overlay&&(i.overlay.live=i.overlay.attr.live??e.area.liveOverlay,delete i.overlay.attr.live,i.overlay.elem=$("<div>").attr(i.overlay.attr).wiki(i.overlay.contents).addClass("area-overlay "+i.shape).appendTo(s)),State.temporary.this={hover:i.hover?.elem,overlay:i.overlay?.elem,area:n},this.addShadow("_this")}})})();

/* End of the <<image-map>> macro set */