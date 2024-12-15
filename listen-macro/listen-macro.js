/* Mali's <<listen>> macro for Sgarcube */

Macro.add('listen', {
    tags: ['when'],
    isAsync: true,

    argsToObj: function (args) {
        let argObject = {},
            i = 0;
        while (i < args.length) {
            const arg = args[i];
            if (Array.isArray(arg)) { //An array, splice into position
                args.splice(i--, 1, ...arg);
            } else if (typeof arg === 'object') { //Merge objects!
                Object.assign(argObject, arg);
            } else { //Following pairs
                const val = args[i += 1];
                if (val === undefined) {
                    throw new Error('Uneven number of arguments.')
                };
                argObject[arg.toLowerCase()] = val;
            }
            i++;
        }
        return argObject;
    },

    handler() {

        const payloads = {}, attr = this.self.argsToObj(this.args);

        // special arguments
        const type = attr.type || 'span';
        delete attr.type;

        const target = attr.filter || null;
        delete attr.filter;

        const initial = attr.initial;
        delete attr.initial;

        // process <<when>> tags into payload object
        for (const tag of this.payload.slice(1)) {

            let events = ['change'];

            if (tag.args.length) {
                events = tag.args.flat(Infinity).map(t => t.split(/\s|,/g)).flat().filter(t => t);
            }

            for (const ev of events) payloads[ev] = tag.contents;
        }

        const callback = this.createShadowWrapper(e => {
            try {
                State.temporary.event = e.originalEvent ?? e;

                $.wiki(payloads[e.type]);

            } finally {
                delete State.temporary.event;
            }
        });

        // output wrapper element
        $(`<${type}>`, attr)
            .addClass(`macro-${this.name}`)
            .wiki(this.payload[0].contents)
            .on(Object.keys(payloads).join(' '), target, callback)
            .appendTo(this.output);

        // run the handlers on macro processing if desired 
        if (typeof initial === 'string') {

            // an event name
            $.wiki(payloads[initial]);

        } else if (initial === true) {

            // a truthy value, run all
            for (const tag of this.payload.slice(1)) $.wiki(tag.contents);

        }

    }
});
