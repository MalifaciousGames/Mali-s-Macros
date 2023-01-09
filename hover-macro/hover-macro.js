Macro.add('hover', {
	tags : ['swap','tip'],
	
	handler() {
		const swap = this.payload.find(pay => pay.name === 'swap'),
					tip = this.payload.find(pay => pay.name === 'tip'),
					contAttr = this.args.slice(1);
		
		if (swap && !swap.contents) {
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
		
		const container = $(document.createElement(this.args[0] ? this.args[0] : 'span')), innerCont = $('<span>');
		container.append(innerCont);
		
		applyAttr(container, contAttr);
		
		if (tip) {
			var tipElem = $('<span>');
			applyAttr(tipElem, tip.args);
			container.append(tipElem.addClass('macro-hover-tip'));
		}
		
		innerCont.addClass('macro-hover-'+ (swap ? 'swap' : 'inner'));
		
		$(container).hover(this.createShadowWrapper(() => {
				if (swap) {
					innerCont.empty().wiki(swap.contents);
				}
				if (tip) {
					tipElem.empty().wiki(tip.contents);
				}
			}),//Out
			this.createShadowWrapper(() => {
				if (swap) {
					innerCont.empty().wiki(this.payload[0].contents);
				}
			})
		);
		
		innerCont.wiki(this.payload[0].contents);
		container.addClass('macro-'+ this.name).appendTo(this.output);
	}
});