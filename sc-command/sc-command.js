$(document).on(':passagedisplay', function() {
			
	let payload, mode = 'sc', i = 0;
	const modes = ['sc','run','js'], desc = ['Sugarcube code','Processed JS','Pure JS'];

	function wikiTry() {
		try {
			switch (mode){
				case 'sc':
					$.wiki(payload);
					break;
				case 'run':
					$.wiki(`<<run ${payload}>>`);
					break;
				case 'js':
					eval(payload);
					break;
			}
			console.log('Code ran without errors');
			$("#sc-command-button").removeClass().addClass('sc-command-success');
		} catch (error) {
			console.log(error);
			$("#sc-command-button").removeClass().addClass('sc-command-error');
		};
	}
	
//Textarea 
		
	const codebox = jQuery(document.createElement('textarea'));
	codebox.attr({'type' : 'text',
								'class' : 'sc-command-input',
								'id' : 'sc-command-input'
	});
		
//Run button
	const button = jQuery('<button>Run</button>');
	button.attr({'id' : 'sc-command-button',
							 'value' : 'run'
	})
	.ariaClick({
		namespace : '.macros',
		role      : 'button'},
		function (event) {
			payload != null? wikiTry() : '' ;
		});
	
//Mode toggle
	const toggle = jQuery('<button>Sugarcube code</button>');
	toggle.attr({'id' : 'sc-command-toggle'})
		.ariaClick({
			namespace : '.macros',
			role      : 'button'},
			function (event) {
				i++
				mode = modes[i%3]
				toggle.text(desc[i%3]);
		});
		
//Container
	const container = jQuery(document.createElement('div'));
	container.attr({'class' : 'sc-command-container',
									'id' : 'sc-command-container'
	});

//Codebox creates the payload:
		
	codebox.on('input', function() {
	//Payload is trimmed, nobr is applied
		payload = this.value.trim().replace(/^\n+|\n+$/g, '').replace(/\n+/g, ' ');
	})
		.on('keypress.macros', function(e) {
			//Crtl + enter runs the content
			if (e.ctrlKey && e.keyCode == 13) {
				e.preventDefault();
				wikiTry()
			}
		})
		
	container.append(codebox,button,toggle);		
	container.appendTo('.passage');
});