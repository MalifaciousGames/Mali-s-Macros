// Mali's <<reveal>> macro

(() => {
   //config object
   const config = {
      innerElement: '<div>',
      macroName: 'reveal',
      transitionDelay: '.3s',
      args: {
         onHover: {
            default: false,
            keyWords: ['hover', 'onHover']
         },
         transition: {
            default: true,
            keyWords: ['t8n', 'transition']
         },
         startsOpen: {
            default: false,
            keyWords: ['open', 'startsOpen']
         }
      }
   };

Macro.add(config.macroName,{tags:null,handler(){const t=String(this.args[0]).trim(),n=[];this.config={};for(const t in config.args){const i=config.args[t];n.push(...i.keyWords),this.config[t]=this.args.includesAny(...i.keyWords)||i.default}this.config.groupID=this.args.slice(1).find((t=>!n.includes(t)));const i=$("<details>").attr({class:`macro-${this.name}`}),o=$("<summary>").wiki(t).attr({class:`macro-${this.name}-title`}),a=$(config.innerElement).attr({class:`macro-${this.name}-inner`}).wiki(this.payload[0].contents),e=t=>{"mouseenter"===t.type&&(i[0].open=!0),this.config.groupID&&$(`details[data-groupID='${this.config.groupID}'][open]`).not(i).removeAttr("open"),this.config.transition&&a.addClass("t8n").one("animationend",(()=>a.removeClass("t8n")))};i.append(o,a),this.config.groupID&&i.attr({"data-groupID":this.config.groupID}),this.config.startsOpen&&i.attr({open:""}),i.ariaClick({label:t},e),this.config.onHover&&i.on("mouseenter",e).on("mouseleave",(()=>{i.removeAttr("open")})),this.output.appendChild(i[0])}}),$("head").append(`<style>details summary {cursor : pointer;display : revert} .macro-${config.macroName}-inner.t8n {animation: ${config.macroName}-anim ${config.transitionDelay}} @keyframes ${config.macroName}-anim {0% {opacity: 0} to {opacity : 1}}</style>`);})();