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
		
		function applyAttr(elem,array) {
			for (let i = 0; i < array.length;i++) {
				if (typeof array[i] === 'object'){//JQuery style object
					elem.attr(array[i]);
				} else { // Simple pairs
					elem.attr(array[i], array[i+1]);
					i++;
				}
			}
		}
		
		//Create outer + inner container
		const container = $(document.createElement(this.args[0] ? this.args[0] : 'span')), innerCont = $('<span>');
		container.append(innerCont);
		
		applyAttr(container, contAttr);
		
		if (tip) {//Create tip elem, add attributes
			var tipElem = $('<span>').attr('data-extra','');
			applyAttr(tipElem, tip.args);
			container.append(tipElem.addClass('macro-hover-tip'));
		}
		
		if (swap) {//Add attributes to inner container (mostly for targetting)
			applyAttr(innerCont, swap.args);
		}
		
		innerCont.addClass('macro-hover-inner').attr('data-extra','');
		
		$(container).hover(this.createShadowWrapper(() => {//In
				if (swap) {
					const wikiContent = swap.contents + innerCont.attr('data-extra');
					innerCont.empty().wiki(wikiContent);
				}
				if (tip) {
					const wikiContent = tip.contents + tipElem.attr('data-extra');
					tipElem.empty().wiki(wikiContent);
				}
			}),
			this.createShadowWrapper(() => {//Out
				if (swap) {
					const wikiContent = this.payload[0].contents + innerCont.attr('data-extra');
					innerCont.empty().wiki(wikiContent);
				}
			})
		);
		
		innerCont.wiki(this.payload[0].contents);
		container.addClass('macro-'+ this.name).appendTo(this.output);
	}
});
