/* Mali's <<a>> macro for Sugarcube */

; (() => {
    const keyListeners = [];

    $(document).on('keyup.macro-a', e => {
        keyListeners.filter(i => i.key === e.key || i.key === e.code).forEach(i => i.elem.trigger('click'));
    }).on(':passageinit', () => {
        keyListeners.forEach(i => {
            if (!$.contains(document.body, i.elem[0])) keyListeners.delete(i);
        });
    });

    const parseArgs = args => {
        let obj = {}, i = 0;

        while (i < args.length) {
            const arg = args[i];
            if (typeof arg === 'object') {
                Array.isArray(arg) ? args.splice(i--, 1, ...arg) : Object.assign(obj, arg);
            } else {
                const val = args[i += 1];
                if (val === undefined) {
                    throw new Error('Uneven number of arguments.');
                } else if (typeof arg !== 'string') {
                    throw new Error(`Attribute key must be a string, reading: '${arg}'.`);
                };
                obj[arg.toLowerCase()] = val;
            }
            i++;
        }
        return obj;
    };

    const getReturnValue = (exp, t = typeof exp) => {
        if (t === 'string') return Scripting.evalTwineScript(exp);
        if (t === 'function') return exp.call();
        return exp;
    }, processEvents = events => {
        if (typeof events === 'string') return events.split(',').map(v => v.trim());
        if (!Array.isArray(events)) return [events];
        return clone(events);
    }, makeInsert = (args, name, contents) => {
        const attr = args.find(a => typeof a === 'object') ?? {},
            t8n = args.includesAny('t8n', 'transition'),
            $insert = $('<span>').attr(attr).addClass(`a-${name}-insert`).wiki(contents);

        if (t8n) $insert.addClass('a-insert-in');

        return $insert;
    };

    //should return a callback
    // add error handling to those
    const specAttrs = {
        // setters
        to(el, $l, config) { config.output = $(el) },
        once(v, $l, config) { config.selfDelete = v },
        count(v, $l, config) { config.click.max = parseInt(v) },
        goto(psg, $link, config) {
            if (typeof psg === 'object') psg = psg.link;
            config.passage = psg;
        },
        key(keys, $l) {
            processEvents(keys).forEach(k => keyListeners.push({ key: k, elem: $l }));
        },

        // post click callbacks
        trigger: {
            type: 'post',
            getHandler(events) {
                events = processEvents(events);
                return () => events.forEach(ev => $(document).trigger(ev));
            }
        },
        choice: {
            type: 'post',
            getHandler(choiceGroups, $l) {
                choiceGroups = processEvents(choiceGroups);

                $l.attr('data-choice', true).on(':choiceCheck', (e, c) => {
                    if (choiceGroups.includes(c)) $l.remove();
                });

                return () => { choiceGroups.forEach(c => $('[data-choice]').not($l).trigger(':choiceCheck', c)) }
            }
        },

        // self checks
        condition: {
            type: 'check',
            getHandler(exp, $l) {
                if (typeof exp !== 'string') exp = clone(exp);

                return () => { $l[getReturnValue(exp) ? 'show' : 'hide']() };
            }
        },
        disabled: {
            type: 'check',
            getHandler(exp, $l) {
                if (typeof exp !== 'string') exp = clone(exp);

                return () => { $l.ariaDisabled(getReturnValue(exp)) };
            }
        },
        changer: {
            type: 'check',
            getHandler(exp, $l) {
                if (typeof exp !== 'string') exp = clone(exp);

                return () => { $l.empty().wiki(typeof exp === 'function' ? exp() : exp) };
            }
        }
    };

    const payloadProfiles = {
        diag(args, contents) {
            Dialog.setup(args[0] || '', args[1] || '');
            Dialog.wiki(contents).open();
        },
        rep(args, contents, $link) {
            $(args[0] || $link.parent()).empty().wiki(contents);
        },
        prep(args, contents, $link) {
            const [trg, ...rest] = args;
            $(trg || $link.parent()).prepend(makeInsert(rest, 'prepend', contents));
        },
        app(args, contents, $link) {
            const [trg, ...rest] = args;
            $(trg || $link.parent()).append(makeInsert(rest, 'append', contents));
        },
        after(args, contents, $link) {
            const [trg, ...rest] = args;
            $(trg || $link).after(makeInsert(rest, 'after', contents));
        },
        before(args, contents, $link) {
            const [trg, ...rest] = args;
            $(trg || $link).before(makeInsert(rest, 'before', contents));
        },
    };

    Macro.add(['a', 'adel', 'but', 'butdel'], {
        isAsync: true,
        tags: Object.keys(payloadProfiles),
        handler() {

            let [linkText, ...attributes] = this.args,
                [main, ...payloads] = this.payload;

            attributes = parseArgs(attributes);

            const config = {
                callbacks: {
                    click: [
                        () => $.wiki(main.contents)
                    ],
                    check: [],
                    post: []
                },
                click: {
                    count: 0,
                    max: Infinity
                },
                output: $(this.output),
                passage: null,
                type: this.name[0] === 'b' ? 'button' : 'link',
                text: linkText,
                selfDelete: this.name.includes('del')
            }, $link = $(`<${config.type === 'button' ? config.type : 'a'}>`);

            //Process bracket syntax
            if (typeof linkText === 'object') {
                config.text = linkText.text;
                config.passage = linkText.link;
                // image
                if (linkText.source) config.text = `<img src='${linkText.source}' class='link-image'>`;
            };

            // handle special attributes
            for (const k in specAttrs) {
                if (!attributes.hasOwnProperty(k)) continue;

                const def = specAttrs[k];

                // doesn't generate a callback
                if (typeof def === 'function') {
                    def.call(this, attributes[k], $link, config);
                } else {
                    // generates a callback
                    const cb = def.getHandler(attributes[k], $link, config);
                    config.callbacks[def.type].push(cb);
                }

                delete attributes[k];
            }

            $link
                .attr(attributes)
                .addClass(`macro-${this.name} link-${attributes.href ? 'external' : 'internal'}`)
                .wikiWithOptions({ profile: 'core' }, config.text);

            // add passage nav callback + special styling
            if (config.passage) {
                const psg = config.passage;
                config.callbacks.post.push(() => Engine.play(psg));

                $link.attr('data-passage', psg);

                if (Config.addVisitedLinkClass && State.hasPlayed(psg)) {
                    $link.addClass('link-visited');
                } else if (!Story.has(psg)) {
                    $link.addClass('link-broken');
                }
            };

            //Add payload callbacks
            payloads.forEach(p => {
                const cb = payloadProfiles[p.name].bind(null, p.args, p.contents, $link);
                config.callbacks.click.push(cb);
            });

            if (config.selfDelete) postClick.push(() => $link.remove());

            if (config.callbacks.check.length) {
                //initial check
                config.callbacks.check.forEach(c => c.call());

                $link.attr('data-checkself', true).on(':checkSelf', this.createShadowWrapper(
                    () => config.callbacks.check.forEach(c => c.call())
                ));
            }

            const clickHandler = this.createShadowWrapper(
                // main payload
                e => {
                    const oldThis = State.temporary.this;
                    State.temporary.this = { event: e, self: $link, count: config.click.count };
                    try {
                        config.callbacks.click.forEach(cb => cb());
                    } finally {
                        State.temporary.this = oldThis;
                    }
                },
                // post click payload
                () => {
                    config.click.count++;
                    config.callbacks.post.forEach(cb => cb());

                    if (config.click.count > config.click.max) $link.remove();

                    setTimeout(() => $('[data-checkself]').trigger(':checkSelf'), 40);
                }
            );

            $link
                .ariaClick({
                    namespace: '.macros',
                    role: config.type
                }, clickHandler)
                .appendTo(config.output);
        }
    });
})();

/* End of <<a>> macro */