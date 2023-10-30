/* Mali's <<hover>> macro */
(()=>{
let curScroll = 0, tipVis = false;
  
const $tip = $('<div>').attr({id:'macro-hover-tip','aria-live':'polite'});
  
const summonTip = (txt, $cont, dir) => {
  	tipVis = true;
  	curScroll = $(document).scrollTop();
  	$cont.append($tip);
  	$tip.removeClass().wiki(txt);

  const {height : h, width : w} = $tip[0].getBoundingClientRect(), mrg = 4, contRect = $cont[0].getBoundingClientRect();
  contRect.center = {y :contRect.top+contRect.height/2, x : contRect.left+contRect.width/2};
    
    const positions = {
          	up : {at : [contRect.center.x, contRect.top], stickout : {main : -(h+mrg), sec : w/2}},
            down : {at : [contRect.center.x, contRect.bottom], stickout : {main : h+mrg, sec : w/2}},
            left : {at : [contRect.left, contRect.center.y], stickout : {main : -(w+mrg), sec : h/2}},
            right : {at : [contRect.right, contRect.center.y], stickout : {main : w+mrg, sec : h/2}},
            over : {at : [contRect.center.x, contRect.center.y], stickout : {main : 0, sec : 0}}
          };
	
  	const checkPos = dir => {
    	const pos = positions[dir], checked = [];
      	switch (dir) {
          case 'up': case 'down': 
            const vert = pos.at[1] + pos.stickout.main;
            checked.push(
              	(vert > 0 && vert < window.innerHeight), 
           		(pos.at[0] - pos.stickout.sec > 0), 
            	(pos.at[0] + pos.stickout.sec < window.innerWidth)
            );
          	break;
          case 'left': case 'right': 
            const hori = pos.at[0] + pos.stickout.main;
            checked.push(
              	(hori > 0 && hori < window.innerWidth), 
           		(pos.at[1] - pos.stickout.sec > 0), 
            	(pos.at[1] + pos.stickout.sec < window.innerHeight)
            );
          	break;
          default: checked.push(true);
        }
      	return checked.every(e => e);
    };

  	dir = dir.find(d => checkPos(d));
  	if (!dir) {dir = ['up','right','down','left','over'].find(d => checkPos(d))}
  
  	let [x,y] = positions[dir].at, {main,sec} = positions[dir].stickout;

    switch (dir) {
		case 'up': y += main; x -= sec; break;
		case 'down': y += mrg; x -= sec; break;
		case 'left': y -= sec; x += main; break;
		case 'right': y -= sec; x += mrg; break;
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
  	const pos = Number($tip.css('top').slice(0,-2));
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

      	attr.tabindex = 0;
      	$wrap.attr(attr);
      
		this.payload.slice(1).forEach((p,i) => {
          	pay[p.name] = p;
          	$wrap.addClass(p.name);
        });
		
      	if (pay.swap) {
        	callbacks.in.push(e => {$wrap.empty().wiki(pay.swap.contents)});
        	callbacks.out.push(e => {
              $wrap.empty().wiki(inner)
            });
        }
      	
      	if (pay.tip) {
          	let dir = [];
          	if (pay.tip.args.length) {
            	dir = pay.tip.args.map(a => a.split(' ')).flat();
            }
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
        }).wiki(inner).addClass(`macro-${this.name}`).appendTo($(this.output));
    }
});
})();
