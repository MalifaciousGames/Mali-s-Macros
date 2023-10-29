/* Mali's <<hover>> macro */
(()=>{

const $tip = $('<div>').attr({id:'macro-hover-tip','aria-live':'polite'});
  
const getSqPos = ($e,dir) => {
	const {left : x, top : y, height : h, width : w} = $e[0].getBoundingClientRect(),
        p = [x + w/2, y + h/2];

  	switch (dir) {
      case 'left': p[0] = x; break;
      case 'right': p[0] = x + w; break;
      case 'up': p[1] = y; break;
      case 'down': p[1] = y + h;
    }
  	return p;
};
  
let curScroll = 0, tipVis = false;
  
const summonTip = (txt, $cont, dir) => {
  	tipVis = true;
  	curScroll = $(document).scrollTop();
  	$cont.append($tip);
  	$tip.removeClass().wiki(txt);
  
  	const {height : h, width : w} = $tip[0].getBoundingClientRect(), mrg = 4;

  	let [x,y] = getSqPos($cont, dir);
  	//Have overflow safety?
    switch (dir) {
		case 'up': x -= w/2; y -= h+mrg; break;
		case 'down': x -= w/2; y += mrg; break;
		case 'left': y -= h/2; x -= w+mrg; break;
		case 'right': x += mrg; y -= h/2; break;
		default: x -= w/2; y -= h/2;
    }

  	$tip.attr({'aria-hidden':false}).css({top:y, left:x}).addClass('visible '+dir);
};

const hideTip = () => {
  	tipVis = false;
  	$tip.attr({'aria-hidden':true}).removeClass().empty();
};

$(document).on('scroll', e => {
  	if (!tipVis) return;
  
	const scr = $(document).scrollTop(), off = scr - curScroll;
  	const pos = Number($tip.css('top').replace('px',''));
	$tip.css({top : pos - off});
  	curScroll = scr;
}).on(':passageinit', hideTip);

  
Macro.add('hover', {
	tags : ['swap','tip'],
  	handler() {
      	const attr = this.args.find(a => typeof a === 'object') ?? {},
            pay = {}, $wrap = $('<span>'),
            inner = this.payload[0].contents,
            callbacks = {in : [], out : []};
      
      	let active = false;

      	//Attributes argument
      	attr.tabindex = 0;
      	$wrap.attr(attr);
      
		this.payload.slice(1).forEach((p,i) => {
          	pay[p.name] = p;
          	$wrap.addClass(p.name);
        });
		
      	//swap
      	if (pay.swap) {
        	callbacks.in.push(e => {$wrap.empty().wiki(pay.swap.contents)});
        	callbacks.out.push(e => {
              $wrap.empty().wiki(inner)
            });
        }
      	
      	//tip 
      	if (pay.tip) {
        	const dir = pay.tip.args.find(a => ['down','left','right','over'].includes(a)) ?? 'up';
          
          	$wrap.attr('role','tooltip');
          	callbacks.in.push(summonTip.bind(null, pay.tip.contents, $wrap, dir));
          	callbacks.out.push(hideTip); 
        }

      	$wrap.on('mouseenter focus', e => {
          	if (active) return;
          	active = true;
          	callbacks.in.forEach(f => f.call());
        }).on('mouseleave focusout', e => {
          	active = false;
        	callbacks.out.forEach(f => f.call());
        }).wiki(inner).addClass(`macro-${this.name}`);

    	$(this.output).append($wrap);
    }
});
})();
