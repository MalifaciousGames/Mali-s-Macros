(/*SCedit*/function SCeditWrapper(){
	//SCedit object + global methods
window.SCedit = {
	localMemory : {}, //Passage memory
	activePassage : null,
//-----------
	fetchPassage : (pas) => {
		const pasTitle = typeof pas === 'string' ? pas : pas.title;
		if (SCedit.localMemory?.[pasTitle]){ //In memory
			return SCedit.localMemory[pasTitle];
		} else if (Story.has(pasTitle)){ //In story
			return Story.get(pasTitle);
		} else { //Newly created!
			return {title : pasTitle, tags : [], text : 'Empty passage'};
		}
	},
//-----------
	memoryCommit : (pas, tags, text) => {
		//Commits a passage object to memory, supplied or created from args
		const pasObject = typeof pas === 'object' ? pas : {title : pas, tags : tags, text : text};
		SCedit.localMemory[pasObject.title] = pasObject;
      	memorize('unsavedMem', SCedit.localMemory);
	},
//-----------
	toFile : () => {
		let pMem = ''
		for (const pas in SCedit.localMemory) {
			const p = SCedit.localMemory[pas], tags = p.tags.filter(t => t);
			pMem += ':: ' + p.title;
			if (p?.type === 'CSS'){
				pMem += '[stylesheet]';
			} else if (p?.type === 'JS'){
				pMem += '[script]';
			} else {
				pMem += tags.length ? ' ['+tags.join(' ')+']' : '';
			}
			pMem += '\n\n' + p.text;
			pMem += '\n\n';
		};
		if (pMem){
			saveAs(new Blob([String(pMem)], {type: 'text/plain;charset=UTF-8'}), 'Changes.twee');
          	forget('unsavedMem');
		} else {
			Dialog.wiki('No data committed to memory!'),Dialog.open();
		}
	}
}
//----------------------------------------------------------
//Copy new passage's relevant content to activePassage
const loadPassage = (e) => {
	const ref = SCedit.fetchPassage(e.passage);
	const pasObject = {title : ref.title, tags : ref.tags, text : ref.text};		
			
	SCedit.activePassage = clone(pasObject);
	codeFill(SCedit.activePassage);
  	return SCedit.activePassage;
};
  
$(document).on(':passagestart', (e) => loadPassage(e))	

$(document).one(':passageinit', (e) => {
  	if (recall('unsavedMem')){
    	Dialog.wiki(`This projects comports modifications which were not saved to file last time. 
        <br>
        <button id='loadBut'>Load them.</button>
        <br>
        <<button 'Ignore.'>><<run Dialog.close()>><</button>>`);
    	$('#loadBut').ariaClick(() => {
          
        	SCedit.localMemory = recall('unsavedMem');
          	outputPassage(loadPassage(e));

          	let inStory = Story.lookupWith(x => true);
          	inStory = inStory.map(p => p.title);

          	//Add entries to data for passages that exist in the loaded memory
          	for (const key in SCedit.localMemory){
            	if (SCedit.localMemory[key].type === undefined && !inStory.includes(key)) {
            		$('#passageList').append(`<option value='${key}'>`);
                }
            }
          	Dialog.close();
        });
      	Dialog.open();
    }
});
  
//Unsaved progress warning!
$(window).on("beforeunload", () => {
  	memorize('unsavedMem',SCedit.localMemory);
});
  
//Fill fields with passage data
const codeFill = (pas) => {
	pasTitle.empty().append(pas.title);
	tagInput.val(pas.tags.join(' '));
	codeBox.val(pas.text);
};

//Modify passage 
const outputPassage = (pas) => {
	//Tags
	$('html, body, .passage').attr({'data-tags' : pas.tags.join(' ')});
	$('body').attr('class', pas.tags.join(' '));
	$('.passage').attr('class', pas.tags.join(' ')+' passage');
	//Main content
	const text = pas.tags.includes('nobr') ? pas.text.replace(/^\n+|\n+$/g, '').replace(/\n+/g, ' ') : pas.text;
	$('.passage').empty().wiki(text);
	
};
		
//Build elements
const mainCont = $('<div>').attr('id','sc-edit'),
			rightCont = $('<div>').attr('id','sc-edit-right'),
			leftCont = $('<div>').attr('id','sc-edit-left');

//--------------------Title-------------------------------
const pasTitle = $('<h3>').attr('id', 'sc-edit-title').appendTo(rightCont);
//---------------------Tags----------------------------
$('<label for="sc-edit-tags">Passage tags :</label>').appendTo(rightCont);

const tagInput = $('<input type=text>')
	.attr({id : 'sc-edit-tags', placeholder : 'Tags'})
	.on('change', (e) => {
		SCedit.activePassage.tags = e.target.value.split(' ');
	}).appendTo(rightCont);
//-----------------------Content----------------------------
$('<label for="sc-edit-input">Content :</label>').appendTo(rightCont);

const codeBox = $('<textarea>')
	.attr({type : 'text',
		id : 'sc-edit-input',
		spellcheck : 'false',
		placeholder : 'Passage contents'
	})
	.on('change', (e) => {
	SCedit.activePassage.text = e.target.value;
}).appendTo(rightCont);
//-------------------------Commit---------------------
const commitButton = $('<button>Commit</button>').attr('id','sc-edit-commit').ariaClick(()=>{
	try {
		if (SCedit.activePassage.type === undefined) {//Normal passage
			outputPassage(SCedit.activePassage);
		} else if (SCedit.activePassage.type === 'CSS') {
			$('#style-story').html(SCedit.activePassage.text);
		} else if (SCedit.activePassage.type === 'JS') {
			eval(SCedit.activePassage.text);
		}
	} finally {
		SCedit.memoryCommit(SCedit.activePassage);
	}
});
//--------------------------ToFile---------------------------
const toFileButton = $('<button>To file</button>').attr('id','sc-edit-tofile').ariaClick(()=>{
	SCedit.toFile();
});		
$('<div>').append(commitButton).append(toFileButton).appendTo(rightCont);
//-------------------------Passage nav----------------------
//Navigate/create by title
const newTitle = $('<input list="passageList">')
	.attr({id : 'sc-edit-new-title', placeholder : 'Passage title'})
	.on('keypress', (e) => {//Pressing enter takes you to the passage
    	if (e.key === 'Enter') {
          e.preventDefault();
          $('#sc-edit-new').click()
        }
    })
	.appendTo(leftCont);

//Passage options
const pasChoice = $('<datalist id="passageList">').appendTo('body');
Story.lookupWith(x => true).forEach(pas => {
	pasChoice.append(`<option value='${pas.title}'>`);
});

//Confirm navigation
const newButton = $(`<button>Go to</button>`).attr('id','sc-edit-new').ariaClick(()=>{
	const title = newTitle[0].value;
	if (!title) {
		Dialog.wiki('New passages need a title!'), Dialog.open();
		return false;
	}
	//Doesn't already exist, add to option list
	if (SCedit.localMemory[title] === undefined && !Story.has(title)) {
		pasChoice.append(`<option value=${title}>`);
	}
	//Clean error with passage object create on process
	$(document).one(':passageend', () => {
		outputPassage(SCedit.activePassage);
	});
	
	Engine.play(title);
}).appendTo(leftCont);		
//-------------------------Stylesheet manager----------------------
const styleButton = $('<button>Stylesheet</button>').attr('id','sc-edit-style').ariaClick(()=>{
	SCedit.activePassage = {
		title : 'Stylesheet',
		tags : [],
		text : SCedit.localMemory?.Stylesheet?.text ??
			$('#style-story').html(),
		type : 'CSS'
	};
	codeFill(SCedit.activePassage);
}).appendTo(leftCont);

//---------------------------JS manager------------------------
const JSbutton = $('<button>JavaScript</button>').attr('id','sc-edit-script').ariaClick(()=>{
	//Remove the script from JS
	let JStab = $('#twine-user-script').html();
  	JStab = JStab.split("(/*SCedit*/")[0] + JStab.split("/*SCedit*/);")[2];
  
	SCedit.activePassage = {
		title : 'JavaScript',
		tags : [],
		text : SCedit.localMemory?.JavaScript?.text ?? JStab,
		type : 'JS'
	};
	codeFill(SCedit.activePassage);
}).appendTo(leftCont);
		
$('body').append(mainCont.append(leftCont).append(rightCont));

})(/*SCedit*/);

/*More stuff*/

Config.passages.onProcess = function (p) {
	p = SCedit.fetchPassage(p);
	return p.text;
}