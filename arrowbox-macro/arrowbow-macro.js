/* Mali's <<arrowbox>> macro */

Macro.add('arrowbox', {

  //CONFIG OPTIONS
  arrows: {
    up: { symbol: '🞁', key: 'ArrowUp' },
    down: { symbol: '🞃', key: 'ArrowDown' },
    left: { symbol: '🞀', key: 'ArrowLeft' },
    right: { symbol: '🞂', key: 'ArrowRight' }
  },
  arrowElementType: 'button',
  wrapperDesc: 'Arrow keys or scroll to cycle',
  cycleCooldown: 400,
  //END OF THE CONFIG OPTIONS, HERE BE DRAGONS

  tags: ['option', 'optionsfrom'],
  skipArgs: ['optionsfrom'],
  isAsync: true,
  addOptions: function (a, b, selected) {
    if (selected) { this.selected = this.length }
    const entry = { label: a, value: b ?? a };
    this.push(entry);
  },
  runAnimation: function (elem, animClass, callback) {
    elem.addClass(animClass).one('animationend', () => {
      elem.removeClass(animClass);
      if (callback) { callback() };
    });
  },
  handler() {
    const varName = this.args[0].trim(), options = [], addOp = this.self.addOptions.bind(options), runAnim = this.self.runAnimation,
      config = {
        direction: this.args.find(a => a === 'horizontal' || a === 'vertical') ?? 'horizontal',
        cycleWrap: this.args.includes('wrap'),
        autofocus: this.args.includes('autofocus'),
        animations: !this.args.includes('no-animations') || true,
        centerInput: this.args.includes('type-in')
      };

    //Process tags
    this.payload.filter(p => p.name === 'option').forEach(pay => addOp(pay.args[0], pay.args[1], pay.args.includes('selected')));
    this.payload.filter(p => p.name === 'optionsfrom').forEach(p => {
      const strform = p.arguments.trim(), col = Scripting.evalTwineScript(strform[0] === '{' ? `(${strform})` : strform);
      if (Array.isArray(col) || col instanceof Set) {
        col.forEach(e => addOp(e));
      } else if (col instanceof Map) {
        col.forEach((v, k) => addOp(k, v));
      } else if (typeof col === 'object') {
        $.each(col, (k, v) => addOp(k, v));
      } else {
        return this.error(`The contents of the 'optionsfrom' tag should evaluate to a valid collection.`);
      }
    });

    switch (options.length) {
      case 0: return this.error(`The ${this.name} macro cannot be called without any options.`);
      case 1: config.cycleWrap = false;
    }

    let selectIndex = 0, coolDownOk = true;

    //Decide on default value and set it
    if (options.hasOwnProperty('selected')) {
      config.startValue = options[options.selected];
      selectIndex = options.selected;
    } else {
      //Try to get current value
      const curVal = State.getVar(varName);
      if (curVal !== undefined && options.find(o => o.value === curVal)) {
        config.startValue = options.find(o => o.value === curVal);
        selectIndex = options.indexOf(config.startValue);
      } else {
        config.startValue = options[0];
      }
    }

    State.setVar(varName, config.startValue.value);

    const dir = { horizontal: ['left', 'right'], vertical: ['up', 'down'] }, arrows = [],
      wrapper = $('<form>').attr({
        id: `${this.name}-${Util.slugify(varName)}`,
        class: `macro-${this.name} ${config.direction}`,
        title: (config.centerInput ? 'Crtl + ' : '') + this.self.wrapperDesc,
        role: 'group',
        tabindex: config.centerInput ? '-1' : '0'
      }),
      preview = $(`<${config.centerInput ? "input type='text'" : 'div'}>`).attr({
        class: `${this.name}-value`,
      }).appendTo(wrapper),
      animWrapper = $('<div>').addClass('anim-wrapper').attr('aria-live', 'polite').appendTo(preview);


    //Make sure the arrows are disabled or the values wrap properly
    function arrowSanity() {
      if (!config.cycleWrap) {
        if (!selectIndex) {
          arrows[0].ariaDisabled(true)
        } else if (arrows[0].is(':disabled')) {
          arrows[0].ariaDisabled(false)
        }
        if (selectIndex === options.length - 1) {
          arrows[1].ariaDisabled(true)
        } else if (arrows[1].is(':disabled')) {
          arrows[1].ariaDisabled(false)
        }
      } else {
        selectIndex %= options.length;
        if (selectIndex < 0) { selectIndex = options.length - 1 }
      }
    };

    //Set variable and update display
    const changeValue = (newVal, isClick, dir) => {
      //Cooldown
      coolDownOk = false;
      setTimeout(() => { coolDownOk = true }, this.self.cycleCooldown);

      if (config.centerInput) {
        preview.val(newVal.label);
        preview[0].style.width = String(newVal.label).length * .9 + 'ch';
        if (isClick) { preview.focus() }
      } else {
        if (config.animations && dir) {
          const animClass = `slide${dir}`;
          runAnim(animWrapper, animClass, () => { animWrapper.empty().wiki(newVal.label) });
        } else {
          animWrapper.empty().wiki(newVal.label);
        }
      }
      State.setVar(varName, newVal.value);
    }

    //Create the arrow buttons
    dir[config.direction].forEach((d, i) => {
      const configDir = this.self.arrows[d],
        arrow = $(`<${this.self.arrowElementType}>`).append(configDir.symbol).attr({
          class: `${this.name}-arrow-${d}`,
          'data-key': configDir.key
        }),
        receiver = config.centerInput ? preview : wrapper;

      arrow.ariaClick({ namespace: '.macros', label: (i ? 'Next' : 'Previous'), 'aria-label': (i ? 'Next' : 'Previous'), role: 'button' }, () => {
        receiver.focus();
        selectIndex += i ? 1 : -1;
        arrowSanity();
        changeValue(options[selectIndex], true, d);
      }).attr('tabindex', config.centerInput ? '0' : '-1');

      receiver.on('keydown', (e) => {
        const fittinScheme = config.centerInput ? e.ctrlKey : true;
        if (coolDownOk && fittinScheme && e.key === configDir.key) {
          //Trigger a click event on the button so any modification can be listener for using 'click'
          arrow.click();
          e.preventDefault();
          return false;
        }
      });

      arrows.push(arrow);
      wrapper[i ? 'append' : 'prepend'](arrow);
    });

    //Add proper listener to the inner input
    if (config.centerInput) {
      preview.on('input', (e) => {
        options[selectIndex] = { label: preview.val(), value: preview.val() };
        changeValue(options[selectIndex]);
      });
    }

    //Scroll cycle on the wrapper (mode doesn't matter)
    wrapper.on('wheel', (e) => {
      if (coolDownOk) { arrows[e.originalEvent.deltaY < 0 ? 1 : 0].click() }
    });

    changeValue(config.startValue);
    arrowSanity();
    if (config.autofocus) { setTimeout(() => wrapper.focus(), 200) }
    $(this.output).append(wrapper);
  }
});
