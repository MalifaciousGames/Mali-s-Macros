window.OmniCoder = {
    add(name, alphabet, split) {
        if (!name || typeof name !== 'string') throw new Error(`Invalid alphabet name, reading ${name}.`);
        if (typeof alphabet !== 'object') throw new Error('Alphabet definition must be either an array or a plain object!');

        const isMapper = !Array.isArray(alphabet),
            def = {
                name: name,
                encode: {},
                decode: {},
                isMapper
            };

        if (isMapper) {
            def.encode = alphabet;
            //invert the lookup
            for (const k in alphabet) {
                def.decode[alphabet[k]] = k;
            }
        } else { //a plain array, hopefully
            if (alphabet.length < 2) throw new Error('Alphabet array must have at least two characters!');
            if (alphabet.includes(split)) throw new Error('The separator character cannot be part of the supplied alphabet.');

            def.length = alphabet.length;
            alphabet.forEach((c, i) => {
                def.encode[i] = c;
                def.decode[c] = i;
            });
            def.split = split ?? ' ';
        }

        this.alphabets[name] = def;
    },
    alphabets: {},

    map(txt, lookup) {
        for (const k in lookup) {
            txt = txt.replaceAll(k, lookup[k]);
        }
        return txt;
    },

    letToChar(l, lookup, len) {
        let n = l.codePointAt(0),
            output = '';

        while (n) {
            const rem = n % len;
            output = lookup[rem] + output;
            n = (n - rem) / len;
        }
        return output;
    },

    charToLet(c, lookup, len) {
        let num = 0;
        Array.from(c).forEach((v, i, c) => {
            num += lookup[v] * Math.pow(len, c.length - i - 1);
        });
        try {
            return String.fromCodePoint(num);
        } catch {
            throw new Error(`Cannot decode. At least one character in "${c}" isn't part of the chosen alphabet.`);
        }
    },

    encode(txt, alpha) {
        alpha = this.alphabets[alpha];
        if (!alpha) return new Error('No such alphabet');

        return alpha.isMapper ? this.map(txt, alpha.encode) : Array.from(txt).map(c => this.letToChar(c, alpha.encode, alpha.length)).join(alpha.split);
    },

    decode(txt, alpha) {
        alpha = this.alphabets[alpha];
        if (!alpha) return new Error('No such alphabet');

        return alpha.isMapper ? this.map(txt, alpha.decode) : txt.split(alpha.split).map(ch => this.charToLet(ch, alpha.decode, alpha.length)).join('');
    }
};
