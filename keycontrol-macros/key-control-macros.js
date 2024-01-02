/* Macro set for the Sugarcube story format */

Macro.add('bindkey', {
    tags: ['condition', 'special', 'desc'],
    handler() {
        if (!KeyControl) return this.error('This macro cannot be used without the KeyControl API.');
        if (this.args.length < 2) return this.error('Macro requires at least two arguments: an id and a input key.');

        let [id, keys] = this.args, def = {};

        if (typeof keys === 'object' && !Array.isArray(keys)) {//second arg is a plain object serving as a definition
            def = keys;
        }

        def.once ??= this.args.includes('once');
        def.key ??= keys;
        def.callback ??= _ => $.wiki(this.payload[0].contents.trim());

        //condition
        const cond = this.payload.find(p => p.name === 'condition');
        if (cond) def.condition ??= _ => Scripting.evalTwineScript(cond.args[0] ?? cond.contents.trim());

        //name + description
        const desc = this.payload.find(p => p.name === 'desc');
        if (desc) {
            def.desc ??= desc.contents;
            if (desc.args[0]) def.name ??= desc.args[0];
        }

        //special keys
        const specKeys = this.payload.find(p => p.name === 'special');
        if (specKeys) {
            def.special ??= specKeys.args.flat().map(k => k.trim().toLowerCase());
        }

        new KeyControl(id, def);
    }
});

Macro.add(['keysettings', 'keyinput'], {
    handler() {
        if (!KeyControl) return this.error('This macro cannot be used without the KeyControl API.');

        if (this.name === 'keysettings') return $(this.output).append(KeyControl.createInputPanel());

        if (!this.args.length) return this.error('No supplied ID!');
        const kb = KeyControl.get(this.args[0]);

        $(this.output).append(kb[this.args[1] ? 'createInput' : 'createInputContext']());
    }
});

Macro.add('keyedit', {
    handler() {
        if (!KeyControl) return this.error('This macro cannot be used without the KeyControl API.');
        if (this.args.length < 2) return this.error('Macro requires at least two arguments: a command and a listener id.');
        if (typeof this.args[0] !== 'string') return this.error('Command argument must be a string!');

        const valid = ['toggle', 'disable', 'enable', 'delete', 'reset'], command = this.args[0].trim().toLowerCase(), ids = [];

        if (!valid.includes(command)) return this.error(`Command not recognized, reading: ${command}`);

        this.args.slice(1).forEach(id => {
            if (Array.isArray(id)) {
                ids.push(...id);
            } else if (typeof id === 'string') {
                ids.push(id);
            } else {
                return this.error('IDs must be either strings or arrays of strings!');
            }
        });

        ids.forEach(id => KeyControl.get(id)[command]());
    }
});

/* End of Sugarcube macros */