Macro.add('dropOverride', {
  isAsync : true,

	handler() {
		State.temporary.DropOverride = true;
		setTimeout(()=> {
			State.temporary.DropOverride = false;
		},40)
	}
})

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
		
		//Type errors
		[['Id', ID],['Element type', type]].forEach(item =>{
			if (item[1] && typeof item[1] !== 'string')
				return this.error(`${item[0]} must be a string, reading: '${typeof item[1]}'`);
		})
		
		//Invalid dropMode
		if (dropMode && !['append', 'prepend', 'replace', 'swap','none','anywhere','remove','fillswap'].includes(dropMode)) return this.error(`Drop mode (<<onDrop mode>>) is not valid, reading '${dropMode}'`);
		
		const dropElem = $(`<${type ? type : 'div'}/>`);
	
		//Apply attributes
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
		
		//Fillswap special variable
		if (dropMode === 'fillswap' && !dropElem.attr('slots')) {
			return this.error(`'Fillswap' mode needs a 'slots' property to work.`);
		} else if (dropMode === 'fillswap'){
			var fillswap = true;
		}
		
		if (ID){
			dropElem.data('drop-id', ID).addClass(`drag-${ID}`)
		}
		
		//Manage slots system
		if (dropElem.attr('slots')){
			var slots = dropElem.attr('slots');
			if (slots.split('/').length === 2){ //Taylored version
				slots = Number(slots.split('/')[1] - slots.split('/')[0]);
			} else { //Loose logic
				slots -= dropElem.children().length;
			}
			dropElem.removeAttr('slots').attr('data-slots', slots);
		}
		
		//Finds the closest existing element in the drop target
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
		
		//Draggable is dragged out
		dropElem.on('dragstart', this.createShadowWrapper(
			(e) => {
				const dragElem = State.temporary.drag;
				
				//Wait for the ':predrop' event to validate the move
				//This stops improper drags from running the removal code
				$(document).off(':predrop');
				$(document).one(':predrop', (e) => {
						onRemove ? $.wiki(onRemove.contents): null;
					if (e.origin !== 'swap' && slots !== undefined) {
						slots += dragElem.size;
						dropElem.removeAttr('slots').attr('data-slots', slots);
					}
				});
			}
		));
		
		dropElem.addClass(`macro-${this.name}`)
			.on('drop', this.createShadowWrapper(
				(e) => {
					const dragElem = State.temporary.drag;
					
					/*$(e.target).trigger(
						{type : ':predrop', slots : slots, origin : e.origin}
					);*/
					
						if (fillswap){
							dropMode = slots > 0 ? null : 'swap';
						}
					
					e.preventDefault();
					
					if (ID && dragElem.type !== ID){
						//Wrond id match!
						$(e.target).trigger(':idmissmatch');
					} else if (slots - dragElem.size < 0 && dropMode !== 'swap'){
						$(e.target).trigger(':noslots');
					} else if (State.temporary.DropOverride){
						//No slots left (and no fillswap)
						$(e.target).trigger(':dropoverride');
					} else {
						
						$(e.target).trigger(
							{type : ':predrop', slots : slots, origin : e.origin}
						);
						
						onDrop ? $.wiki(onDrop.contents) : null;
						
						const target = findClosest(e,dragElem);
							
						switch (dropMode){
							case 'prepend': case 'append':
								dropElem[dropMode](dragElem.self);
								slots !== undefined ? slots -= dragElem.size : null;
								dropElem.removeAttr('slots').attr('data-slots', slots);
							break;
							case 'swap':
								//Drag elem to container
								if (target === null) {
									//Only child, no element to swap
									dropElem.append(dragElem.self);
								} else {
									$(target[0])[target[1][0] < 0? 'after' : 'before'](dragElem.self);
									if (e.origin !== 'swap'){
										//Avoid infinite swap loop!
										$(target[0]).trigger('dragstart');
										$(dragElem.origin).trigger(
											{type : 'drop', origin : 'swap'}
										);
										setTimeout(() => {
											$(target[0]).show();
										});
									}
								}
							break;
							case 'remove':
								dragElem.self.remove();
							break;
							case 'none':break;
							case 'replace':
								if (target !== null) {
									$(target[0]).trigger('dragstart');//Trigger removal
								}
								dropElem.empty().append(dragElem.self);
							break;
							default:
								if (target === null) {
									dropElem.append(dragElem.self);
								} else {
									$(target[0])[target[1][0] < 0 ? 'after' : 'before'](dragElem.self);
								}
								slots !== undefined ? slots -= dragElem.size : null;
								dropElem.removeAttr('slots').attr('data-slots', slots);
						}
				}

				//Trigger related event
				$(e.target).trigger(':postdrop');
			
			}))
			.on('dragenter', this.createShadowWrapper(
				(e) => {
					//Run onEnter code
					onEnter ? $.wiki(onEnter.contents): null;

					e.preventDefault();
					
			}))
			.on('dragover', (e) => {e.preventDefault();})
			.on('dragleave', this.createShadowWrapper(
				(e) => {
					//Run onLeave code
					onLeave ? $.wiki(onLeave.contents): null;

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
		
		if (dragElem.attr('size')){
			var size = Number(dragElem.attr('size'));
			dragElem.removeAttr('size').attr('data-size', size);
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
						size : (size ?? 1),
						data : (data ? data.args[0] : null),
						contents : innerContent,
						origin : $(e.target).parent(),
						originIndex : $(e.target).index()
					};

					//Wikify associated payload
					onStart ? $.wiki(onStart) : null;

					//Hide static copy when dragged
					setTimeout(() => {
						$(e.target).hide()
					});

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