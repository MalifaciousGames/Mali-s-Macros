function scCommandWrapper() { /* Outer function for scope */
	// Global payload
	var payload, Passage, Tags, Old = null;
	var localMemory = {}; //Object with passage names as keys
	var activeEdit; //Passage being currently edited
	// localMemory = {Passage : passage contents...}
	const tagList = ['StoryInit', 'PassageHeader', 'PassageFooter', 'PassageReady', 'PassageDone', 'StoryCaption', 'StoryMenu', 'StoryTitle']
	
	function ToValue(value, placeholder) {
		$('#sc-command-input').val(value).attr({'placeholder':placeholder});
		payload = value;
	}
	
	function fetchTags(passage) {
		
		if (passage[0] === '[') {//Is a payload
			Tags = passage.split(']', 1)[0].replace('[','');
		} else if (localMemory[passage] !== undefined){//Passage is in memory 
			Tags = localMemory[passage][0] === '['? passage.split(']', 1)[0].replace('[',''): '' ;
		} else { //first time, get from story
			Tags = Story.get(passage).tags.join(' ');
		}
		console.log(Tags)
	}
	
	function codeboxFetch() {
		
		fetchTags(activeEdit);
		/*if (localMemory[activeEdit] === undefined && (tagList.includes(activeEdit) || activeEdit === Passage)){
			Tags = Story.get(activeEdit).tags.join(' ');
			console.log('From codeboxFetch:'+Tags);
		}*/
		
		if (activeEdit === Passage){ //Is the active passage
			
			ToValue(
				localMemory[Passage] !== undefined ? 
				localMemory[Passage] : 
				(Tags? '['+Tags+']\n' : '') + Story.get(Passage).text, 'Current passage is empty');
			
		} else if (activeEdit === '') {//activeEdit is null on transition
			activeEdit = Passage;
			codeboxFetch();
			
		} else if (localMemory[activeEdit] !== undefined) {//activeEdit is in memory
			ToValue(localMemory[activeEdit], activeEdit);
			
		} else if (Story.has(activeEdit)) {//actieEdit is story-fetchable
			
			ToValue((Tags? '['+Tags+']\n' : '') + Story.get(activeEdit).text, activeEdit);
			
		} else {
			
			ToValue(
				(activeEdit === 'StoryTitle'? 
				 (Tags? '['+Tags+']\n' : '') + Story.title : 
				 localMemory[activeEdit])
				, activeEdit);
		}
	};
	
	function toWiki(target, wikiLoad, passage) {
		
		if (wikiLoad !== undefined) {
			if (wikiLoad[0] === '['){//Tags are likely present
				fetchTags(wikiLoad);
				$(`html, #passage-${Passage.toLowerCase()}`).attr('data-tags', Tags);
				//Remove tags from wikifier
				wikiLoad = wikiLoad.splice(0,wikiLoad.indexOf(']')+1) + '\n';
			}

	//Apply nobr to passages that can have tags
	if (Tags.includes('nobr')) {
		wikiLoad = wikiLoad.replace(/^\n+|\n+$/g,'').replace(/\n+/g,' ')
	}
		//Target is supplied and exists as an element on page
		if (target != null && $(target).length){
			$(target).empty().wiki(wikiLoad);
		} else {
			$.wiki(wikiLoad);
		}
		}
	}
	
	//On first init, sets payload and activeEdit to current passage
	$(document).on(':passagestart', function(){
		Passage = passage();
		activeEdit = Passage;
		fetchTags(Passage);
		Old = Passage;
	});
	
	$(document).on(':passagestart', function() {
		
		// Simulate PassageReady
		toWiki('', localMemory.PassageReady, 'PassageReady');
		
		//Assign tags based on localMemory
		$('html').attr('data-tags', Tags);
		
		if (activeEdit === Old){activeEdit = Passage}
	});

	// Simulate PassageDone
	$(document).on(':passagerender', function() {
		toWiki('', localMemory.PassageDone, 'PassageDone');
	});
	
	//Processing on each passage
	$(document).on(':passagedisplay', function() {

		//Create PassageHeader target, wikify to it
		$('#passages').prepend($('<div id=PassageHeader></div>'));
		if (localMemory.PassageHeader !== undefined) {
			toWiki('#PassageHeader', localMemory.PassageHeader, 'PassageHeader');
		}				
	
		//Create PassageFooter target, wikify to it
		$('#passages').append($('<div id=PassageFooter></div>'));
		if (localMemory.PassageFooter  !== undefined) {
			toWiki('#PassageFooter', localMemory.PassageFooter, 'PassageFooter');
		}		
	
		//If passage contents are in localMemory, replace whole passage with that
		if (localMemory[Passage] !== undefined) {
			toWiki('.passage', localMemory[Passage], Passage);
		}
		//Needs to be async for some reason
		setTimeout(() => {
 			codeboxFetch();
		}, 10);
	});
	
	$(document).on(':passageend', function() {
		if(localMemory.StoryCaption !== undefined) {
			toWiki('#story-caption', localMemory.StoryCaption, 'StoryCaption');
		} 
		if(localMemory.StoryMenu !== undefined) {
			toWiki('#menu-story', localMemory.StoryMenu, 'StoryMenu');
		} 
		if(localMemory.StoryTitle !== undefined) {
			toWiki('#story-title', localMemory.StoryTitle, 'StoryTitle');
		} 
	});
	
function CommandPrompt() {
	const Passages = [Passage, 'Javascript', 'Stylesheet', 'StoryInit', 'PassageHeader', 'PassageFooter', 'PassageReady', 'PassageDone', 'StoryCaption', 'StoryMenu', 'StoryTitle'];
	
	function wikiTry() {
	
		try {
			switch (activeEdit){
				case Passage:
					toWiki('.passage', payload);
					break;
				case 'Javascript':
					eval(payload);
					break;
				case 'Stylesheet':
					document.styleSheets[12].insertRule(payload);
					break;
				case 'StoryInit':
					//Does not wikify whole StoryInit again or it would reset values
					break;
				case 'StoryCaption':
					//Deal with other UI passages...
					toWiki('#story-caption', payload);
					break;
				case 'StoryTitle':
					//Deal with other UI passages...
					toWiki('#story-title', payload);
					break;
				case 'StoryMenu':
					//Deal with other UI passages...
					toWiki('#menu-story', payload);
					break;
				case '':
					//activeEdit is in 'run mode', just wikify...
					toWiki('', payload);
					break;
				default:
					toWiki(`#${activeEdit}`, payload);
			}
			runButton.removeClass().addClass('sc-command-success');
			//As long as it runs successfully, save payload
			savePayload();
			
		} catch (error) {
			
			console.log(error);
			runButton.removeClass().addClass('sc-command-error');
			
		}
	}

	const toggleBox = jQuery(document.createElement('div'))
	.attr({'class' : 'sc-command-toggleBox', 'id' : 'sc-command-toggleBox'});
	
	function editToggle(editName) {
		
		const newToggle = jQuery(`<button>${editName === Passage? `Current passage: ${Passage}` : editName }</button>`)
		.attr( {'class' : `${activeEdit === editName? 'sc-command-success' : ''} sc-passageToggle`, 'id' : 'sc-command-toggle'+editName } ) 
		.ariaClick({
		namespace : '.macros',
		role      : 'button'},
		function (event) {
			
		//The toggle is the active one
			if (activeEdit === editName){
				activeEdit = '';
				$(this).removeClass('sc-command-success');
				ToValue('',"No active code target, typed code won't be commited to memory.");
				payload = '';
			} else {
				activeEdit = editName;
				$(this).addClass('sc-command-success');
				codeboxFetch();
			}
			refreshToggles();
		});
		toggleBox.append(newToggle);
	}
	
	function refreshToggles() {
		toggleBox.empty();
		Passages.forEach(passage => editToggle(passage));
	}
	
	function savePayload() {
	
		if (localMemory[activeEdit]){
			//The passage already exists in localMemory
				console.log('Old payload updated');
			} else {
				//The passage doesn't exist
				console.log('New payload added to memory.');
			}
		/*if ([Passage,...tagList].includes(activeEdit) && Tags){
			payload = '['+Tags.trim()+']'+payload
		}*/
			localMemory[activeEdit] = payload;
		setup.localMemory = localMemory;
	};
	
	//Container
	const container = jQuery(document.createElement('div'))
	.attr({'class' : 'sc-command-container', 'id' : 'sc-command-container'});
	
//Code box
	const codebox = jQuery(document.createElement('textarea'))
	.attr({'type' : 'text',
								'class' : 'sc-command-input',
								'id' : 'sc-command-input',
								'spellcheck' : 'false',
				 				'placeholder' : activeEdit
	})
		.on('input', function() {
	//Any keysytroke edits the payload
		payload = this.value.trim();
	}).on('keypress.macros', function(e) {
			//Crtl + enter runs the content
			if (e.ctrlKey && e.keyCode === 13) {
				e.preventDefault();
				//Payload being null can only happen on empty passages...
				wikiTry();
			} 
		}).on('keydown', function(e) {//Handles tab, thx StackOverflow
				
				if(e.keyCode === 9) { // tab was pressed
        // get caret position/selection
        const start = this.selectionStart, end = this.selectionEnd;
        codebox.val(codebox.val().substring(0, start) + "\t" + codebox.val().substring(end));
        this.selectionStart = this.selectionEnd = start + 1;

        // Keep focus
        return false;
   		}
		});
	
	//Run button
	const runButton = jQuery('<button>Run</button>')
	.attr({'id' : 'sc-command-runbutton'})
	.ariaClick({
		namespace : '.macros',
		role      : 'button'},
		function (event) {
			wikiTry();
		});
	
	//Stow button
	const stowbutton = jQuery('<button>⇣</button>')
	.attr({'id' : 'sc-command-stowbutton'})
	.ariaClick({
			namespace : '.macros',
			role      : 'button'},
			function (event) {
				container.hasClass('scstowed') ? container.removeClass('scstowed') : container.addClass('scstowed');
				stowbutton.text() === '⇣' ? stowbutton.text('⇡') : stowbutton.text('⇣');
		});
	
	//Push localMemory to file
	const tofilebutton = jQuery('<button>💾</button>')
	.attr({'id' : 'sc-command-tofilebutton'})
	.ariaClick({namespace : '.macros', role : 'button'},
		function (event) { ToFile(); });	
	
	//Loop through passages, add toggles
	Passages.forEach(passage => editToggle(passage));
	
	container.append(toggleBox,codebox,$('<br>'),runButton,tofilebutton,stowbutton);
	$('#passages').append(container);
}	
	
//Opens CommandPrompt on each passage
$(document).on(':passagedisplay', function() {
	CommandPrompt()
});
	
//Lets you download localMemory as a file

	function ToFile() {

		let processedMemory = Object.entries(localMemory);
		processedMemory.forEach((item) => {item[0] = String(':: '+item[0])});
		processedMemory.forEach((item) => {
			if (item[1][0] === '['){//Tag array is there
				item[0] += ' '+item[1].slice(0, item[1].indexOf(']')+1),
				item[1] = item[1].splice(0,item[1].indexOf(']')+1);
			}
		});
		
		processedMemory = processedMemory.flat(1).join('\n\n'); //Array to string, elements separated by line breaks

		//BUILD A NICE NAME FOR THE FILE...
		if (!jQuery.isEmptyObject(localMemory)){
			saveAs(new Blob([String(processedMemory)], {type: 'text/plain;charset=UTF-8'}), 'Changes.twee');
		}
	}
}

scCommandWrapper();