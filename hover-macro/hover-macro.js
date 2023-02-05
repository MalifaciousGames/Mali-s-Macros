Macro.add('hover', {
	tags : ['swap','tip'],
	
	handler() {
		const swap = this.payload.find(pay => pay.name === 'swap'),
			tip = this.payload.find(pay => pay.name === 'tip'),
			contAttr = this.args.slice(1);
		
		if (swap && !swap.contents) {
			//Empty <<swap>> has very problematic behavior, thus the error
			return this.error('<<swap>> tag has no content.');
		}
		
		//Create outer + inner container
		const container = $(document.createElement(this.args[0]||'span')),
			innerCont = $('<span>').wiki(this.payload[0].contents);
		
		container.append(innerCont);
		
		// Catch capture mode!
		if (contAttr.includes('capture')){
			var capture = contAttr.deleteAt([contAttr.indexOf('capture')+1])[0];
			contAttr.delete('capture');
		}
		
		function applyAttr(elem,array) {
			for (let i = 0; i < array.length;i++) {
				if (typeof array[i] === 'object'){//JQuery style object
					elem.attr(array[i]);
				} else { // Simple pairs
					elem.attr(array[i], array[i+1]);
					i++;
				}
			}
			return elem;
		}

		applyAttr(container, contAttr);
		
		if (tip) {//Create tip elem, add attributes
			var tipElem = $('<span>');
			applyAttr(tipElem, tip.args).addClass('macro-hover-tip');
			if (capture) {tipElem.wiki(tip.contents)};
			container.append(tipElem);
		}
		
		if (swap) {//Add attributes to inner container (mostly for targetting)
			applyAttr(innerCont, swap.args);
			if (capture) {
				var shadowSwap = $(document.createDocumentFragment()).wiki(swap.contents),
				    shadowCont = $(document.createDocumentFragment()).wiki(this.payload[0].contents);	
			};
		}
		
		innerCont.addClass('macro-hover-inner');

		$(container).hover(this.createShadowWrapper(() => {//In
			if (swap) {
				innerCont.empty();
				capture ?
					innerCont.append(clone(shadowSwap)) :
					innerCont.wiki(swap.contents);
			}
			if (tip) {
				tipElem.empty().wiki(tip.contents);
			}
		}),
		this.createShadowWrapper(() => {//Out
			if (swap) {
				innerCont.empty();
				capture ?
					innerCont.append(clone(shadowCont)) :
					innerCont.wiki(this.payload[0].contents);
			}
		}));
		
	container.addClass('macro-hover').appendTo(this.output);
	}
});
