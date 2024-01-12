;(() => {
    const keyListeners = [];

    $(document).on('keyup.macro-a', e => {
        keyListeners.filter(i => i.key === e.key || i.key === e.code).forEach(i => i.elem.trigger('click'));
    }).on(':passageinit', e => {
        keyListeners.forEach(i => {
            if (!$.contains(document.body, i.elem[0])) keyListeners.delete(i);
        });
    });

    const sugEquivalents = {
        prep: 'prepend',
        app: 'append',
        rep: 'replace'
    };
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

    const getReturnValue = exp => {
        const ty = typeof exp;
        if (ty === 'string') return Scripting.evalTwineScript(exp);
        if (ty === 'function') return exp.call();
        return exp;
    };

    const processEvents = events => {
        if (typeof events === 'string') return events.split(',').map(v => v.trim());
        if (!Array.isArray(events)) return [events];
        return clone(events);
    };

    Macro.add(['a', 'adel', 'but', 'butdel'], {
        isAsync: true,
        tags: ['rep', 'prep', 'app', 'diag'],
        handler() {

            let [linkText, ...attributes] = this.args, [main, ...payloads] = this.payload,
                passage, img,
                onClick = [e => $.wiki(main.contents)], postClick = [], selfCheck = [],
                deleteSelf = this.name.includes('del'),
                count = 0;
		
            attributes = parseArgs(attributes);

            const type = this.name[0] === 'b' ? 'button' : 'link', $link = $(`<${type === 'button'? type : 'a'}>`);

            //Process bracket syntax
            if (typeof linkText === 'object') ({text: linkText, link: passage, source: img} = linkText);

            //Handle passage argument
            if (attributes.hasOwnProperty('goto')) {
                passage = typeof attributes.goto === 'object' ? attributes.goto.link : attributes.goto;
                delete attributes.goto;
            }

            if (passage) {
                postClick.push(e => Engine.play(passage));

                $link.attr('data-passage', passage);

                if (Config.addVisitedLinkClass && State.hasPlayed(passage)) {
                    $link.addClass('link-visited');
                } else if (!Story.has(passage)) {
                    $link.addClass('link-broken');
                }
            };

            //Trigger callback
            if (attributes.hasOwnProperty('trigger')) {
                const events = processEvents(attributes.trigger);

                postClick.push(e => events.forEach(ev => $(document).trigger(ev)));

                delete attributes.trigger;
            };

            //Max clicks
            if (attributes.hasOwnProperty('count')) {
                const max = attributes.count - 1;

                postClick.push(e => count === max ? $link.remove() : $link.attr('data-count', count += 1));
                $link.attr('data-count', count);

                delete attributes.count;
            };

            //Exclusive choices
            if (attributes.hasOwnProperty('choice')) {
                const choiceGroups = processEvents(attributes.choice);
                postClick.push(e => choiceGroups.forEach(c => $('[data-choice]').not($link).trigger(':choiceCheck', c)));
                $link.attr('data-choice', true).on(':choiceCheck', (e,c) => {
                	if (choiceGroups.includes(c)) $link.remove();
                });

                delete attributes.choice;
            };

            //Key bindings
            if (attributes.hasOwnProperty('key')) {
                const keys = processEvents(attributes.key);
                keys.forEach(k => keyListeners.push({
                    key: k,
                    elem: $link
                }));

                delete attributes.key;
            };

            //The 2 selfCheck attributes
            if (attributes.hasOwnProperty('condition')) {
                const exp = clone(attributes.condition);
                delete attributes.condition;

                selfCheck.push(e => $link[getReturnValue(exp) ? 'show' : 'hide']());
            }

            if (attributes.hasOwnProperty('disabled')) {
                const exp = clone(attributes.disabled);
                delete attributes.disabled;

                selfCheck.push(e => $link.ariaDisabled(getReturnValue(exp)));
            }

            if (selfCheck.length) {
                selfCheck.forEach(c => c.call());
                $link.attr('data-checkself', true).on(':checkSelf', e => selfCheck.forEach(c => c.call()));
            }

            //Add payload callbacks
            payloads.forEach(pay => {
                let callback;

                if (pay.name === 'diag') {
                    callback = e => {
                        Dialog.setup(pay.args[0] || '', pay.args[1] || '');
                        Dialog.wiki(pay.contents).open();
                    }
                    onClick.push(callback);
                    return;
                }

                const attr = pay.args.find(a => typeof a === 'object' && !(a instanceof jQuery)) || {},
                    t8n = pay.args.includesAny('transition', 't8n');

                callback = e => {
                    const $trg = pay.args[0] ? $(pay.args[0]) : $link.parent(), cName = sugEquivalents[pay.name];

                    if (pay.name === 'rep') $trg.empty();
                    const $insert = $('<span>').attr(attr).addClass(`macro-${cName}-insert`).wiki(pay.contents);
                    $trg[pay.name === 'prep' ? 'prepend' : 'append']($insert);

                    if (t8n) { //Rely on built-in t8n classes for consistency
                        $insert.addClass(`macro-${cName}-in`);
                        setTimeout(() => $insert.removeClass(`macro-${cName}-in`), 40);
                    };
                };
                onClick.push(callback)
            });

            if (deleteSelf) postClick.push(e => $link.remove());

            $link
                .wikiWithOptions({
                    profile: 'core'
                }, img ? `<img src='${img}' class='link-image'>` : linkText)
                .attr(attributes)
                .addClass(`macro-${this.name} link-${attributes.href ? 'external' : 'internal'}`);

            $link.ariaClick({
                    namespace: '.macros',
                    role: type,
                    one: !!passage || deleteSelf
                },
                this.createShadowWrapper(
                    e => {
                        const oldThis = State.temporary.this;
                        State.temporary.this = {event: e, self: $link, count};
                        try {
                            onClick.forEach(callback => callback.call(null, e));
                        } finally {
                            State.temporary.this = oldThis;
                        }
                    },
                    e => {
                        postClick.forEach(callback => callback.call(null, e));
                        setTimeout(() => $('[data-checkself]').trigger(':checkSelf', 40));
                    }
                )
            );
            this.output.appendChild($link.get(0));
        }
    });
})();
