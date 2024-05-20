/* Mali's cooldown macro */

Macro.add("cooldown",{tags:null,clickTargets:["a","button",'input[type="button"]','input[type="submit"]',"area"],handler(){const t=$("<span>").addClass(`macro-${this.name}`).wiki(this.payload[0].contents),a=this.args[1],e=this.self.clickTargets;let i=this.args[0]??40;if("string"==typeof i){const[t,a,e]=i.match(/([.\d]+)(\w*)/);switch(i=Number(a),e){case"ms":break;case"s":i*=1e3;break;case"min":i*=6e4;break;default:if(e)return this.error(`Improper time unit : ${e}.`)}}i=Math.max(i,40),t.on("click",(s=>{if(!e.includes(s.target.localName))return;const r=a?t.find(e.join()):$(s.target);r.ariaDisabled(1),setTimeout((()=>{r.ariaDisabled(0)}),i)})),this.output.appendChild(t[0])}});