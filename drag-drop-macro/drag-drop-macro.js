(()=> {
  	const dataPool = {};
  
	const argsToObj = (args) => {
    	let argObject = {}, i = 0;
    	while(i < args.length){
          	const arg = args[i];
        	if (Array.isArray(arg)) {//An array, splice into position
            	args.splice(i--, 1, ...arg);
            } else if (typeof arg === 'object') {//Merge objects!
            	Object.assign(argObject, arg);
            } else {//Following pairs
              	const val = args[i+=1];
              	if (val === undefined){throw new Error('Uneven number of arguments.')};
            	argObject[arg.toLowerCase()] = val;
            }
        i++;
        }
      	return argObject;
    }, varWrapper = (obj, toRun) => {
      	if (!toRun){return;}
      	const ref = {'_': State.temporary, '$': State.variables};
      	let old = {}, k;
      
      	for(k in obj) {
          	const nSpace = ref[k[0]], n = k.slice(1);
          	old[k] = nSpace[n];
          	nSpace[n] = obj[k];
        }
      	try {
          	typeof toRun === 'function' ? toRun.call() : $.wiki(toRun);
        } finally {
    		for(k in old) {
            	const nSpace = ref[k[0]], n = k.slice(1);
              	nSpace.hasOwnProperty(n) ? nSpace[n] = old[k] : delete nSpace[n];
        	}
        }
    }, touchFocus = (el, state) => {
      	if (state) {
        	$('.touchActive').removeClass('touchActive');
        } else {
        	State.temporary.drag = null;
          	$('.dropPossible').removeClass('dropPossible');
            $('.dropForbidden').removeClass('dropForbidden');
        }
      	el[(state ? 'add' : 'remove')+'Class']('touchActive');
	}, insertAt = (target, insert, index) => {
      	const ch = target.children();
      	if (index >= ch.length) {
        	target.append(insert);
        } else if (index && ch.length) {
        	$(ch[index]).before(insert);
        } else {
        	target.prepend(insert);
        }
    };
  
  	//In the edge case the game has drag items in a non-passage element, it'd be more convenient to assume that no drag element survives a passage transition, still...
	$(document).on(':passageend', e => {
      	const activeRef = $('.macro-drag').filter('[data-id]').toArray().map(e => e.getAttribute('data-id'));
    	for(const k in dataPool) {
        	if (!activeRef.includes(k)){
            	delete dataPool[k];
            }
        }
    });  

Macro.add('drop', {
	tags : ['onDrop', 'onRemove', 'onAny', 'fromSource'],
  	getDragData(el) {
    	return dataPool[el.attr('data-id')];
    },
  	setSource(s, el) {
    	if (!s.token){return this;}
      	const arr = [];
    	el.children().filter('[data-id]').each((i,e) => {
        	arr.push(dataPool[e.getAttribute('data-id')]);
        });
      	State.setVar(s.token, s.notArray ? arr[0] : arr);
      	return this;
    },
  	setSlots(config,el) {
    	if (!config.hasOwnProperty('maxSlots')) {return this;}
      
        let n = 0;
      	el.children().filter('[data-size]').each((i,e) => {
        	n += Number(e.getAttribute('data-size'));
        });
      	config.curSlots = config.maxSlots - n;
      	el.attr('data-slots', config.curSlots);
      	return this;
    },
  	getTarget($el, e) {
    	if (!$el[0].childElementCount) {return [null];}
      
		let children = $el.children(),
        	x = (e.clientX ?? e.touches[0].pageX) + window.scrollX,
        	y = (e.clientY ?? e.touches[0].pageY) + window.scrollY,
            diag = [], closest, dir;
      
        children.each((i,e) => {
          	let el = $(e), {top:top, left:left} = el.offset();
          	top += el.height()/2, left += el.width()/2;
          	diag.push({dist: Math.hypot(x-left, y-top), x: x-left, y: y-top});
        });
      
        closest = diag.toSorted((a,b) => a.dist - b.dist)[0];
      
      	if (diag.every(e => e.y === closest.y)) {//horizontal
        	dir = closest.x > 0;
        } else if (diag.every(e => e.x === closest.x)) {
        	dir = closest.y > 0;
        } else {//double directions, do the diagonal thing
        	dir = (closest.x + closest.y) > 0;
        }
      
        return [$(children[diag.indexOf(closest)]), dir];
    },
  	handler() {
		let inner, items, attr, drop = '', remove = '', dragObj, canDrop, dropError, mode;
      	const config = {}, source = {};
      
      	//Process payload
      	this.payload.forEach((p,i) => {
          	if (!i) {
            	attr = argsToObj(p.args);
              	inner = p.contents.trim();
            } else {
            	switch (p.name) {
                  case 'onDrop': config.dropMode = p.args[0]; drop += p.contents.trim(); break;
                  case 'onRemove': remove += p.contents.trim(); config.remove = p.args[0]; break;
                  case 'onAny': drop += p.contents.trim(); remove += p.contents.trim(); break;
                  case 'fromSource':
                  	source.token = p.args[0];
                    source.pattern = {
                    	alias : p.args[1] || '_item',
                      	attr: p.args[2] || '',
                      	content : p.contents.trim() || p.args[1] || '_item'
                    };
                 	break;
                }
            }
        });
		
      	const $el = $('<div>').wiki(inner);
      
      	if (source.token) {
          	if (typeof source.token !== 'string') {return this.error('Source variable must be in quotation marks.')}
          
          	source.data = State.getVar(source.token);
          	let {attr : attr, alias: alias , content : content} = source.pattern;
          	if (typeof attr === 'object') {attr = '`'+JSON.stringify(attr)+'`'}
          
          	if (!Array.isArray(source.data)) {
            	source.data = [source.data], source.notArray = true;
            }
          
          	//The wapper is only there for cleanup
			varWrapper({[alias]: null}, () => {
        		source.data.forEach((item,i) => {
              		State.setVar(alias, item);
            		$el.wiki(`<<drag ${attr}>>${content}<<data ${alias}>><</drag>>`);
            	});
            });
        }
      	
      	if (config.remove) {
        	$el.attr('data-'+config.remove,true);
        }
      
      	//Special attributes
      	if (attr.hasOwnProperty('slots')) {
        	config.maxSlots = Number(attr.slots);
          	this.self.setSlots(config, $el);
        	delete attr.slots;
        } else if (config.dropMode === 'fillswap') {
        	return this.error('"fillswap" containers need a "slots" attribute to work.')
        }
      
      	if (attr.hasOwnProperty('type')) {
          	if (!attr.type || typeof attr.type !== 'string') {return this.error('Type parameter must be a non-empty string!')}
        	config.type = attr.type;
        	delete attr.type;
        }
      	if (attr.hasOwnProperty('condition')) {
          	if (typeof attr.condition !== 'function') {return this.error('Condition parameter must be a function')}
        	config.condition = attr.condition;
        	delete attr.condition;
        }

      	$el.attr(attr).addClass('macro-'+this.name)
        .on('dragover', e => e.preventDefault()).on('dragleave', e => {
          	const leaveTo = $(e.relatedTarget);
          	if (!$el.find(leaveTo).length && !$el.is(leaveTo)) {
            	$el.removeClass('dropPossible dropForbidden');
            }
        }).on('dragenter', this.createShadowWrapper(e => {
        	e.preventDefault();

          	dragObj = State.temporary.drag, canDrop = true, dropError = '';
          
          	if (dragObj == null || dragObj.parent.is($el)) {return canDrop = false;}
          
          	//Decide on mode
          	mode = typeof config.dropMode === 'function' ? config.dropMode.call(null, $el, dragObj) : config.dropMode;
          
          	if (config.remove) {
            	dropError = ':forbiddendrop';
            } else if (config.condition && !config.condition.call(null, $el, dragObj)) {
          		dropError = ':badcondition';
            } else if (config?.curSlots - dragObj?.size < 0) {
              	 mode === 'fillswap' ? mode = 'swap' : dropError = ':nospace';
            } else if (config.type && dragObj?.type !== config.type) {
            	dropError = ':wrongtype';
            } else if (mode === 'fillswap') {
            	mode = 'anywhere';
            }
          
          	$el.attr('data-drop', mode);
          	canDrop = !dropError;
            $el.addClass(canDrop ? 'dropPossible' : 'dropForbidden');
          
        })).on('drop touchstart', this.createShadowWrapper(e => {
          	//Set again to avoid ghosts
          	dragObj = State.temporary.drag;

			if (dragObj == null){return;}
          	if (e.originalEvent){e = e.originalEvent;}

          	if (dragObj.touch) {
              	touchFocus(dragObj.self, false);
            } else {
              	$el.removeClass('dropPossible dropForbidden');
            }
          
          	if (!canDrop) {
              	if (dropError) {$el.trigger(dropError)}
              	State.temporary.drag = null;
              	return;
            }
          
          	let [$trg, toRight] = this.self.getTarget($el, e);
          
          	if (config.dropMode === 'fillswap' && mode === 'swap') {
              	const trgSize = Number($trg.attr('data-size') ?? 0);
              	if ((dragObj.size ?? 0) > (trgSize + config.curSlots)) {return $el.trigger(':nospace')};
            }

          	switch(mode) {
              case 'append': case 'prepend': $el[mode](dragObj.self); break;
              case 'none':break;
              case 'remove':
              	dragObj.self.trigger('dragend').remove();
                dragObj.parent.trigger('removal');
                break;
              case 'replaceAll': $el.empty().append(dragObj.self); break;
              default : $trg ? $trg[toRight ? 'after' : 'before'](dragObj.self) : $el.append(dragObj.self); 
            }
          
          	if ($trg) {
          		if (mode === 'replace' || mode === 'swap' && dragObj.parent.attr('data-restock')) {
            		$trg.remove();
                } else if (mode === 'swap') {
                  	insertAt(dragObj.parent, $trg, dragObj.index);
                }
            }
          
          	this.self.setSource(source, $el).setSlots(config, $el);
			varWrapper({'_this': $el}, drop);
          
          	dragObj.dropped = true;
          
          	//Manually end the drag
            if (dragObj.touch) {dragObj.self.trigger('dragend')}

        })).on('removal', this.createShadowWrapper((e) => {
          
          	if (config.remove === 'destroy'){
            	return $el.remove();
            }
          
          	this.self.setSource(source, $el).setSlots(config, $el);
          	varWrapper({'_this': $el}, remove);
        })).appendTo($(this.output));
    }
});

Macro.add('drag', {
	tags : ['data', 'onStart', 'onEnd','onAny'],
  	counter : 0,
  	handler() {
      	let content, attr, data, parent, payload = {start: '', end : ''};
      
      	//Process payload
      	this.payload.forEach((p,i) => {
          	if (!i) {
            	attr = argsToObj(p.args);
              	content = p.contents.trim();
            } else {
            	switch (p.name) {
                  case 'data': data = { val : p.args[0], token : p.arguments}; break;
                  case 'onStart': payload.start += p.contents; break;
                  case 'onEnd': payload.end += p.contents; break;
                  case 'onAny': payload.start += p.contents; payload.end += p.contents; break;
                }
            }
        });
      
      	const $el = $('<div>').attr({draggable:true}),
            specAttr = ['size','type'],
            dragObject = {
            	self : $el,
              	touch : false,
              	contents : content
            },
            shadowed = {};
      
      	if (data) {
          	$el.attr('data-id', this.self.counter+=1)
        	dataPool[this.self.counter] = data.val;
          	dragObject.data = data.val;
          
          	if (['_','$'].includes(data.token[0])) {
              	shadowed[data.token] = data.val;
              	this.addShadow(data.token);
            }
        } else {
          	dragObject.data = null;
        }
      
      	shadowed['_this'] = State.temporary.this = $el;
      	this.addShadow('_this');
      
      	//Wikify after adding the shadows
		$el.wiki(this.payload[0].contents).find('*').each((i,e) => {e.setAttribute('draggable','false')});
      
      	//Process special attributes
      	specAttr.forEach(k => {
          	const ent = attr[k];
            if (ent != null) {
              	dragObject[k] = ent
        		$el.attr('data-'+k, ent);
        	}
          	delete attr[k];
        });
      
      	if (attr.hasOwnProperty('quantity')) {
          	const q = dragObject.quantity = attr.quantity;
          	if (typeof q === 'number' && q > 1) {
              	$el.attr('data-quantity', q);
            }
          	delete attr.quantity;
        }
      
    	$el.attr(attr).attr('tabindex',0).addClass('macro-'+this.name)
      	.on('dragstart touchstart', this.createShadowWrapper((e) => {
          	if (e.originalEvent){e = e.originalEvent;}
            parent = $el.parent();

          	if (e.type === 'touchstart') {
              	if (e.target.onclick || $._data(e.target, 'events').click) {//A clickable element inside the drag elem
                  	e.stopPropagation();
                	return;
                }
              	//Fetch existing _drag object, if any
              	const dragObj = State.temporary.drag;
              	if (dragObj?.self === $el) {//Lose focus on second tap
					e.stopPropagation();
					return touchFocus($el,false);
				} else if (dragObj?.parent && !dragObj.parent.is(parent)) {//Tap from elsewhere, $el is the target
					return;
				} else {//Prevent door on container
                	e.stopPropagation();
                }
              	touchFocus($el, true);
            }
              
			dragObject.parent = parent;
          	dragObject.index = $el.index();
          
          	State.temporary.drag = dragObject;
          	varWrapper(shadowed, payload.start);

          	if (e.type === 'touchstart') {
            	dragObject.touch = true;
          		$('.macro-drop').trigger('dragenter');//Prime drop containers
            } else if (!dragObject.quantity){	
            	$el.hide(100);
            }
        })).on('dragend', this.createShadowWrapper((e) => {
          
          	$el.show(100);
          	varWrapper(shadowed, payload.end);

          	if (dragObject.dropped && dragObject.hasOwnProperty('quantity')) {
              	const q = dragObject.quantity;
              	if (q !== 0 && q !== 1) {
                	const frag = $(document.createDocumentFragment()),
                    	src = typeof q === 'number' ? this.source.replace(/(?<=\squantity\s)(\d+)/, m => q-1) : this.source;
                	varWrapper(shadowed, () => {frag.wiki(src)});
                	insertAt(parent, frag, dragObject.index);
                }
              	//This instance is the one that ends up in the next container
              	delete dragObject.quantity;
              	$el[0].removeAttribute('data-quantity');
            }
          
          	const newParent = $el.parent();
          	if (!newParent.is(parent)) {
            	parent.trigger('removal');
              	dragObject.parent = newParent;
              	dragObject.index = $el.index();
              	parent = newParent;
            }
          	setTimeout(() => {State.temporary.drag = null}, 40);
        })).appendTo($(this.output));
      	
    }
});
})();
