Macro.add('checkvars', {
  	skipArgs : true,
  	tokens : {
      	arrow : '⇒',
    	space : '\t',
      	linkText : '🔎︎',
      	linkTitle : 'Check variables',
      	recurWarning : '<i>Dangerous recursion levels!</i>'
    },
  	sanitize : txt => '<i>'+txt.replaceAll('>','&gt;').replaceAll('<','&lt;')+'</i>',
  	wrapper : null,
  	omniPrinter : function(data, deepName, noInput) {
      	if (deepName.count(deepName[1]) > 1 || deepName.count(deepName[2]) > 1){return this.tokens.recurWarning}
      	const instance = data?.constructor.name;
      
      	if (instance === 'S') {
        	return this.sanitize(`<jQuery...${data.length} element${data.length>1?'s':''}...>`);
        } else if (instance?.startsWith('HTML')){
            return this.sanitize(data.outerHTML);
        } else if (typeof data === 'object' && instance && instance !== 'Date') {
          
          	const depth = deepName.length, spToken = this.tokens.space, spacing = spToken.repeat(depth),
            	noForEach = !['Set','Map','Array'].includes(instance);
          
          	let output = '', wrp = (data instanceof Array || data instanceof Set) ? ['[',']'] : ['{','}'], it = data;
          	if (!['Object','Set','Array'].includes(instance)) {wrp[0] = `<i>${instance}</i>`+wrp[0]}
          
           	(noForEach ? Object.keys(data) : it).forEach((v,k) => {
                if (noForEach) {k = v;v = data[k];}
              
              	const deeperName = clone(deepName);
                let key;
                switch (typeof k) {
                	case 'string': key = '"'+k+'"';break;
                    case 'object': key = this.omniPrinter.call(this,k,deeperName,true);break;
                    default : key = k;
                }
              	deeperName.push(key);

            	output += spacing;
            	output += `${key} ${this.tokens.arrow} ${this.omniPrinter.call(this,v,deeperName, noInput || ['Set','Map'].includes(instance))},\n`;
            });

          	//Loop didn't run, empty string
            output = !output ? '<i>No entries</i>' : '\n' + output;
          
        	return wrp[0] + output + spToken.repeat(depth-1) + wrp[1];
          
        } else if (noInput || instance === 'Symbol'){

          	return `<span>${stringFrom(data)}</span>`;
          
        } else {
          	let type = typeof data, elemtype = 'span', wrp = '',
                attr = {value: data, 'data-path' : deepName[0], 'data-type' : type, contenteditable : true, spellcheck : false};

          	if (deepName.length > 1){attr['data-path'] += '['+deepName.slice(1).join('][')+']'}
          
          	switch (type) {
              case 'boolean': elemtype = 'button';
                attr.contenteditable = false;
                attr['data-text'] = data;
                attr.value = '';
                break;
              case 'number': case 'bigint': attr.type = 'number'; break;
              case 'string' : wrp = '"'; break;
              case 'function': attr.value = data.toString(); attr['data-type'] = 'any';break;
              default : attr['data-type'] = 'any'; attr.value = stringFrom(data); break;
            }
          	if (data instanceof Date){attr['data-type'] = 'date'}
          	//Feels wasteful to create an element just for its text contents, but it's pretty fast...
          	return wrp+$(`<${elemtype}>`).attr(attr).text(attr.value)[0].outerHTML+wrp;
        }
    },
  	lastClosed : 0,
  	handler () {
      
      	const link = $('<button>').attr({id:'checkvars',title:this.self.tokens.linkTitle}).text(this.self.tokens.linkText),
        	varGroups = [
          	{name : 'State variables', data : State.variables, sigil : '$'},
          	{name : 'Temporary variables', data : State.temporary, sigil : '_'},
          	{name : 'Setup variables', data : setup, sigil : 'setup.'},
        	{name : 'Settings', data : settings, sigil: 'settings.'}
        ], createHead = () => {
        	const head = $('<div>').addClass('checkvarsHeader');
        	varGroups.forEach((gr,i) => {
            	const l = Object.keys(gr.data).length, button = $('<button>').text(gr.name+`(${l})`).appendTo(head);
              
              	if (l){
                    button.ariaClick(() => {
                        printData(gr);
                        this.self.lastClosed = i;
                    });
                } else {
                	button.ariaDisabled(true).attr('title','No variables.');
                }
            });
          	return head;
        }, createWrapper = () => {
        	const wrapper = $('<table>').addClass('variablesWrapper');
          
        	wrapper.on('click', (e) => {//Boolean button
            	const trg = $(e.target);
              	if (!trg.is('button')){ return;}
              
              	const newVal = !eval(trg.attr('data-text'));
            	State.setVar(trg.attr('data-path'), newVal);
              	$(trg).attr('data-text',newVal);
            }).on('keyup', (e) => {

        		const trg = $(e.target), path = trg.attr('data-path'), type = trg.attr('data-type');
          		let newVal = trg.text();
          		switch (type) {
              		case 'date': newVal = new Date(trg.text()); break;
              		case 'function': newVal = eval(trg.text()); break;
              		case 'number': newVal = Number(trg.text()); break;
                    case 'bigint': newVal = BigInt(Number(trg.text())); break;
              		case 'any' : 
                		let v = trg.text();
                		if (v === '{'){v = '('+v+')'}
                    	try {newVal = eval(v)} catch {newVal = eval('"'+v+'"')}
            	}
				
          		State.setVar(path, newVal);
        	});
          	this.self.wrapper = wrapper;
          	return wrapper;
        },
        printData = (gr, wrap) => {
          	const s = this.self, keys = Object.keys(gr.data).sort((a, b) => a.localeCompare(b));
          
          	if (keys.length === 0) {return this.self.wrapper.empty().append(`No variables in ${gr.name}`)}

          	let output = '';
          	keys.forEach(k => {
              	output += `<tr><td>${gr.sigil+k}</td><td>${s.omniPrinter.call(s, gr.data[k], [gr.sigil+k])}</td></tr>`;
            });
        	return this.self.wrapper.empty().append(`<tr><th>Name</th><th>Value</th></tr>`).append(output);
        };

      	link.ariaClick(()=> {
        	Dialog.setup('Game variables','checkvars');
          	Dialog.append(createHead(), createWrapper()).open();
          	printData(varGroups[this.self.lastClosed]);
        }).appendTo(this.output);
    }
});
