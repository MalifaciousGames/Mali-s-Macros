
Macro.add('drop', {
  isAsync : true,
	tags : ['onEnter','onLeave','onDrop','onRemove'],

	handler() {
		
		const ID = (this.args[0]? this.args[0] : null), type = this.args[1], attributes = this.args.slice(2);
		const onEnter = this.payload.find(pay => pay.name === 'onEnter'),
					onLeave = this.payload.find(pay => pay.name === 'onLeave'),
					onDrop = this.payload.find(pay => pay.name === 'onDrop'),
					onRemove = this.payload.find(pay => pay.name === 'onRemove');
		let dropMode = onDrop ? onDrop.args[0] : null;
		const innerContent = this.payload[0].contents;

		[['Id', ID],['Element type', type]].forEach(item =>{
			if (item[1] && typeof item[1] !== 'string')
				return this.error(`${item[0]} must be a string, reading: '${typeof item[1]}'`);
		})
		
		if (dropMode && !['append', 'prepend', 'replace', 'swap','swapall','none','anywhere','fillswap','remove'].includes(dropMode)) return this.error(`Drop mode (<<onDrop mode>>) is not valid, reading '${dropMode}'`);
		
		const dropElem = $(`<${type ? type : 'div'}/>`);

		for (let i = 0; i < attributes.length;i++) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				dropElem.attr(attributes[i]);
				
			} else if (attributes[i].split('=').length > 1) {
				const pair = attributes[i].split('=', 2);
				
				dropElem.attr( pair[0], eval(parse(pair[1])));
				
			} else { //Simple pair
				dropElem.attr( attributes[i], attributes[i+1]);
				i++
			}
		}
		
		//Slots attribute, as a naked number or a x/y string
		
		if (dropElem.attr('slots')){
			var slots = dropElem.attr('slots');
			if (slots.split('/').length === 2){ //Taylored version
				slots = Number(slots.split('/')[1] - slots.split('/')[0]);
			} else { //Loose logic
				slots -= dropElem.children().length;
			}
		}
		
		if (dropMode === 'fillswap' && !dropElem.attr('slots')) {
			return this.error(`'Fillswap' mode needs a 'slots' property to work.`);
		} else if (dropMode === 'fillswap'){
			var fillswap = true;
		}
		
		if (ID){
			dropElem.data('drop-id', ID).addClass(`drag-${ID}`)
		}
		
		function findClosest(e,dragElem) {
			const chi = dropElem.children();
			if (!chi.length) {
				//Drop doesn't have children
				return null;
			} else {
				//Object of objects
				const dif = [], x = e.pageX, y = e.pageY;
				for (let i = 0; i < chi.length; i++){
					//Get index + diagonal distance
					const PosY = $(chi[i]).offset().top + $(chi[i]).width()/2,
								PosX = $(chi[i]).offset().left + $(chi[i]).height()/2;
					
					dif.push({
						diag : Math.hypot(Math.abs(PosY - y), Math.abs(PosX - x)) ,
						index : i ,
						offset : [PosX - x, PosY - y]
					});
				}
				//Find shortest distance
				const closest = dif.sort((a,b)=> a.diag - b.diag)[0];
				return [chi[closest.index], closest.offset];
			}
		}

		//Draggable is dragged from inside this drop container
		$(dropElem).on('DragStart', this.createShadowWrapper(
			(e) => {
				onRemove ? $.wiki(onRemove.contents): null;
				slots !== undefined ? slots ++ : null;
		}))
		
		dropElem.addClass(`macro-${this.name}`)
			.on('drop', this.createShadowWrapper(
				(e) => {
					const dragElem = State.temporary.drag;

					e.preventDefault();

					//By default, append draggable element
					if (dragElem.type === ID && ((slots ?? true) || fillswap)){
						//Run onDrop code
						onDrop ? $.wiki(onDrop.contents) : null;
						//Append draggable elem
						
						if (fillswap){
							dropMode = slots ? null : 'swap';
						}
																			 
						const target = findClosest(e,dragElem);
							
						switch (dropMode){
							case 'prepend': case 'append':
								dropElem[dropMode](dragElem.self);
								slots !== undefined ? slots -- : null;
							break;
							case 'swap':
								//Drag elem to container
								if (target === null) { //Only child
									dropElem.append(dragElem.self);
								} else {
									$(target[0])[target[1][0] < 0? 'after' : 'before'](dragElem.self);
								//Put target elemeent to drag elem's origin
									if (dragElem.originIndex === 0){//Drag was index 0
										$(dragElem.origin).prepend(target[0]);
									} else { //Drag had a sibbling, 
										$(dragElem.origin.children()[dragElem.originIndex-1]).after(target[0]);
									}
								}
								
							break;
							case 'swapall': 
								$(dragElem.origin).append(dropElem.children());
								dropElem.append(dragElem.self);
							break;
							case 'remove':
								dragElem.self.remove();
							break;
							case 'none':break;
							case 'replace':
								dropElem.empty().append(dragElem.self);
							break;
							default:
								if (target === null) {
									dropElem.append(dragElem.self);
								} else {
									$(target[0])[target[1][0] < 0 ? 'after' : 'before'](dragElem.self);
								}
								slots !== undefined ? slots -- : null;
						}
				}

				//Trigger related event
				$(e.target).trigger('Drop');
			
			}))
			.on('dragenter', this.createShadowWrapper(
				(e) => {
					//Run onEnter code
					onEnter ? $.wiki(onEnter.contents): null;

					e.preventDefault();

					//Trigger related event
					$(e.target).trigger('DragEnter');
			}))
			.on('dragover', (e) => {e.preventDefault();})
			.on('dragleave', this.createShadowWrapper(
				(e) => {
			
					//Run onLeave code
					onLeave ? $.wiki(onLeave.contents): null;

					//Trigger related event
					$(e.target).trigger('DragLeave');
					e.preventDefault();
			}))
		dropElem.wiki(innerContent);
		dropElem.appendTo(this.output);
	}
})

//---------------------------------------------------------------------
												 
Macro.add('drag', {
  isAsync : true,
	tags : ['onStart', 'data'],

	handler() {
		
		const ID = (this.args[0]? this.args[0] : null), type = this.args[1], attributes = this.args.slice(2);
		const innerContent = this.payload[0].contents,
					onStart = this.payload.find(pay => pay.name === 'onStart'),
					data = this.payload.find(pay => pay.name === 'data');
		
		//Type checker
		
		[['Id',ID],['Element type',type]].forEach(item =>{
			if (item[1] && typeof item[1] !== 'string')
				return this.error(`${item[0]} must be a string, reading: '${typeof item[1]}'`);
		})
		
		const dragElem = $(`<${type ? type : 'span'}/>`);
	
		for (let i = 0; i < attributes.length;i+=2) {
			if (typeof attributes[i] === 'object'){// jQuery style object
				dragElem.attr(attributes[i]);
				i--;
			} else { //Simple pair
				dragElem.attr( attributes[i], attributes[i+1]);
			}
		}
		
		if (ID){
			dragElem.data('drop-id', ID).addClass(`drag-${ID}`)
		}
		
		const oldData = State.temporary.drag;
		
		dragElem.attr('draggable','true')
			.addClass(`macro-${this.name}`)
			.on('dragstart', this.createShadowWrapper(
				(e) => {

					//Handle old data
					State.temporary.drag = {
						type : ID,
						self : dragElem,
						data : (data ? data.args[0] : null),
						contents : innerContent,
						origin : $(e.target).parent(),
						originIndex : $(e.target).index()
					};

					//Wikify associated payload
					onStart ? $.wiki(onStart) : null;

					//Apply to correct class to itself
					setTimeout(() => {
						$(e.target).hide()
					}, 0);

					//Trigger corresponding event
					$(e.target).trigger('DragStart');

			})).on('dragend', this.createShadowWrapper(
				(e) => {

					//Reset _drag to former value
					oldData === undefined ? 
						delete State.temporary.drag :
						State.temporary.drag = oldData;

					//Remove special class
					$(e.target).show();

					//Trigger corresponding event
					$(e.target).trigger('DragEnd');
			
			}));
			dragElem.wiki(innerContent);
			dragElem.appendTo(this.output);
	}
})
