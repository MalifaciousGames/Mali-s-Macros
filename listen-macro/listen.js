/* Mali's <<listen>> macro for Sgarcube */

Macro.add('listen', {
	tags: ['when'],
	isAsync : true,
    argsToObj : function(args) {
        let argObject = {}, i = 0;
        while(i < args.length){
            const arg = args[i];
            if (Array.isArray(arg)) {//An array, splice into position
                args.splice(i--, 1, ...arg);
            } else if (typeof arg === 'object') {//Merge objects!
                Object.assign(argObject, arg);
            } else {//Following pairs
                const val = args[i+=1];
                if (val === undefined){throw new Error('Uneven number of arguments.')};
                argObject[arg.toLowerCase()] = val;
            }
            i++;
        }
        return argObject;
    },
	handler() {
	    const payloads = {}, events = [], wrapper = $(`<${this.args[0] || 'span'}>`).attr(this.self.argsToObj(this.args.slice(1))).addClass(`macro-${this.name}`);
        let oldEvent;
      	this.payload.slice(1).forEach(tag => {
          	const event = tag.args[0]?.toLowerCase() ?? 'change';
          	event.split(/\s|,/g).forEach(e => {
              	if (e) { //Not empty string
        			payloads[e] = tag.contents;
          			events.push(e);
                }
            });
        });

	wrapper.on(events.join(' '), this.createShadowWrapper((e) => {
        try {
            oldEvent = clone(State.temporary.event);
            State.temporary.event = e;

            $.wiki(payloads[e.type])
        } finally {
            oldEvent !== undefined ? State.temporary.event = oldEvent : delete State.temporary.event;
        }
    })).wiki(this.payload[0].contents).appendTo(this.output);
}});
