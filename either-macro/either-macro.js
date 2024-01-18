/* Mali's <<either>> macro */

Macro.add('either', {
    tags: ['or', 'after'],
    generateID: txt => new TextEncoder().encode(txt).reduce((a, b) => a + b, 0).toString(32),
    handler() {

        let mem = State.variables.eitherMacroMemory,
            p = passage(),
            uniqueID = this.self.generateID(this.payload.map(p => p.contents + p.arguments).join());

        if (!mem) mem = State.variables.eitherMacroMemory = {};
        if (!mem[p]) mem[p] = [];

        const options = [],
            after = this.payload.deleteWith(p => p.name === 'after')?.[0],
            config = { once: this.args.includes('once') || !!after };

        if (config.once) {
            if (mem[p].includes(uniqueID)) return after ? $(this.output).wiki(after.contents) : false;
            mem[p].push(uniqueID);
        }

        options.tot = 0;

        this.payload.forEach((p, i) => {
            const weight = typeof p.args[0] === 'number' ? Math.abs(p.args[0]) : 1;
            if (typeof weight !== 'number') { return this.error(`Weight parameter must be a number!`) }
            options.tot += weight;
            options.push({ contents: p.contents, weight: weight + (options[i - 1]?.weight ?? 0) })
        });

        const rand = randomFloat(options.tot);
        $(this.output).wiki(options.find(o => o.weight >= rand).contents);
    }
});