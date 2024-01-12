/* Mali's <<listen>> macro for Sgarcube */

Macro.add('listen', {
    tags: ['when'],
    isAsync: true,
    argsToObj: function(args) {
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
        const payloads = {},
            events = [],
            attr = this.self.argsToObj(this.args),
            st = State.temporary,
            $wr = $(`<${attr.type || 'span'}>`).wiki(this.payload[0].contents);
        delete attr.type;

        let oldEvent, $trg = $wr;

        if (attr.hasOwnProperty('filter')) {
            $trg = $wr.find(attr.filter);
            delete attr.filter;
        }

        this.payload.slice(1).forEach(tag => {
            let ev = ['change'];
            if (tag.args.length) {
                ev = tag.args.flat(Infinity).map(t => t.split(/\s|,/g)).flat().filter(t => t);
            }
            ev.forEach(e => {
                payloads[e] = tag.contents;
                events.push(e);
            });

        });

        $trg.on(events.join(' '), this.createShadowWrapper(e => {
            try {
                oldEvent = st.event;
                st.event = e.originalEvent ?? e;

                $.wiki(payloads[e.type]);
            } finally {
                oldEvent !== undefined ? st.event = oldEvent : delete st.event;
            }
        }));
        $wr.attr(attr).addClass(`macro-${this.name}`).appendTo(this.output);
    }
});
