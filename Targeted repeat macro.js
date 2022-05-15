// Modified repeat macro: <<rep TimeSeconds '#TargetID'>>
 
    Macro.add('rep', {
        isAsync : true,
        tags    : null,
        timers  : new Set(),
 
        handler() {
            
            let delay;
            let i = 0;
            let dir = this.args[1];
            
            try {
                delay = Math.max(Engine.minDomActionDelay, Util.fromCssTime(this.args[0]));
            }
            catch (ex) {
                return this.error(ex.message);
            }
 
            // Register the timer.
            this.self.registerInterval(this.createShadowWrapper(() => {
 
                let $wrapper   = jQuery(document.createElement('span'))
                .addClass(`macro-${this.name}` + i)
                .appendTo(this.output);
                i++;
                
                const frag = document.createDocumentFragment();
                new Wikifier(frag, this.payload[0].contents);
                
                if (dir) {
                        $(dir).append($wrapper.append(frag));
                }
                else {
                    $('.passage').append($wrapper.append(frag));
                }
                
            }), delay);
        },
 
        registerInterval(callback, delay) {
            if (typeof callback !== 'function') {
                throw new TypeError('callback parameter must be a function');
            }
 
            // Cache info about the current turn.
            const passage = State.passage;
            const turn    = State.turns;
 
            // Timer info.
            const timers = this.timers;
            let timerId = null;
 
            // Set up the interval.
            timerId = setInterval(() => {
                // Terminate if we've navigated away.
                if (State.passage !== passage || State.turns !== turn) {
                    clearInterval(timerId);
                    timers.delete(timerId);
                    return;
                }
 
                let timerIdCache;
                /*
                    There's no catch clause because this try/finally is here simply to ensure that
                    proper cleanup is done in the event that an exception is thrown during the
                    `Wikifier` call.
                */
                try {
                    TempState.break = null;
 
                    // Set up the `repeatTimerId` value, caching the existing value, if necessary.
                    if (TempState.hasOwnProperty('repeatTimerId')) {
                        timerIdCache = TempState.repeatTimerId;
                    }
 
                    TempState.repeatTimerId = timerId;
 
                    // Execute the callback.
                    callback.call(this);
                }
                finally {
                    // Teardown the `repeatTimerId` property, restoring the cached value, if necessary.
                    if (typeof timerIdCache !== 'undefined') {
                        TempState.repeatTimerId = timerIdCache;
                    }
                    else {
                        delete TempState.repeatTimerId;
                    }
 
                    TempState.break = null;
                }
            }, delay);
            timers.add(timerId);
 
            // Set up a single-use `prehistory` task to remove pending timers.
            if (!prehistory.hasOwnProperty('#repeat-timers-cleanup')) {
                prehistory['#repeat-timers-cleanup'] = task => {
                    delete prehistory[task]; // single-use task
                    timers.forEach(timerId => clearInterval(timerId));
                    timers.clear();
                };
            }
        }
    });
 
// Acts like the <<stop>> macro for default repeat
 
    Macro.add('st', {
        skipArgs : true,
 
        handler() {
            if (!TempState.hasOwnProperty('repeatTimerId')) {
                return this.error('must only be used in conjunction with its parent macro <<rep>>');
            }
 
            const timers  = Macro.get('rep').timers;
            const timerId = TempState.repeatTimerId;
            clearInterval(timerId);
            timers.delete(timerId);
            TempState.break = 2;
 
            // Custom debug view setup.
            if (Config.debug) {
                this.debugView.modes({ hidden : true });
            }
        }
    });
 
