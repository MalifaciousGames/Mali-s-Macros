Macro.add('key', {
	tags : null,
        handler : function (key) {
			
		var payload = this.payload;
		var key = this.args[0]
		var link, i;
			
            	$(document).on('keyup', function (e) {
			if ((e.keyCode) === key||(e.keyCode - 48) === key) {
				event.preventDefault();
				new Wikifier(this.output, payload[0].contents);
      				return false;
			}
		});      
	}
});

