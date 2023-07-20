# Overview #

## The 'a' Macro ##

Links and buttons that take any HTML attributes, has built-in keybindings support and multiple output options.

[The 'a' macro](a-macro)

***

## The 'drag' and 'drop' macro set ##

The `drag` and `drop` macros let you create and manage draggable elements in Sugarcube.

[The 'drag' and 'drop' macro set](drag-drop-macro)

***

## The 'listen' macro ##

A configurable event listener in macro form. Mainly used to run code when an input element is modified.

[The 'listen' macro](listen-macro)

***

## JS-free settings API ##

Lets you use the built-in Settings API without JavaScript knowledge.

[The settings macro](sc-settings)

***

## The 'on' and 'trigger' macros ##

This pair of macros make up an event-based refresh system. They are useful as a way to update displays but also for running asynchronous code.

[The 'on' and 'trigger' macro set](on-macro)

***

## The 'vanish' macros ##

Creates custom containers that can be made to vanish/appear based on a timed delay or triggered events.

[The 'vanish' macro set](vanish-macro)

***

## The 'log' macro ##

Lets you easily log data to the console, set up time trackers to monitor code execution and measure byte sizes.

['Log' macro](log-macro)

***

## The 'checkvars' macro ##

This macro brings up a dialog window which displays State variables, settings objects and setup objects.

```html
<<button 'Check the variables!'>>
	<<checkvars>>
<</button>>
```

This in an expansion on TME's original code (available here: https://www.motoslave.net/sugarcube/2/). All credit goes to him.

***

## The 'times' macro ##

Sometimes you just want to run code x times without using the full loop syntax... this macro does exactly that.

### Syntax ###

```html
<<times number ['iterationVariable']>> ...code to run x times... <</times>>
```

By default, the iteration value is `_i`, this can be changed by supplying a quoted variable as second argument.

```html
<<times 5 '_var'>>
	_var : <<= setup.item.name>>
	<<set $inventory.push(setup.item)>>
<</times>>
```

***

## URL fixer for Twine ##

A quick script which fixes relative URLs when launching from Twine.

[The URL fixer](URLfixer)

***

## Style passages in Twine 2 ##

The Twine 2 version of Sugarcube doesn't natively allow for stylesheet passages, causing the main stylesheet to become extremely crowded, making it hard to navigate and edit.
Copying the code below in your story Javascript lets you use the `style` tag to create CSS passages. 

```js
$(document).ready(() => {
	const stylePassages = Story.lookup("tags", "style"), styleElem = $("<style id='style-passages' type='text/css'>");
	stylePassages.forEach(psg => {
		styleElem.append(Scripting.evalTwineScript('`'+psg.text+'`'));
	});
	styleElem.appendTo('head');
});
```

Template literals can be used to evaluate javascript variables like so : 

```css
:root {
  --mainColor: ${settings.mainColor ?? 'White'};
  --fontSize: ${settings.fontSize ?? '16'}px;
}
```

***

## Legacy macros ##

`<<input>>` and `<<inputbox>>` => Should use an `<input>` element inside the `<<listen>>` macro instead : [Input macros](input-macros).

The `<<toggle>>` macro, customizable counterpart to SC's `<<cycle>>`. Most of these functionalities can be acchieved with a `<<cycle>>` inside a `<<listen>>` container : [The 'toggle' macro](toggle-macro).
