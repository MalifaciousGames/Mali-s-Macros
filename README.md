# Macros #

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


## The 'hover' macro ##

Displays a tooltip on mouse hover, among other things.

[The 'hover' macro](hover-macro)

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

This macro prints the active variables (State variables and temporary, `settings` and `setup`) to a dialog. The new version also lets you edit their values for testing.

['checkvars' macro](checkvars)

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

# Scripts #

## The update markup ##

This special syntax lets you automatically display variable changes : `{{$myVar}}`.

[Update markup](update-markup)

***

## URL fixer for Twine ##

A quick script which fixes relative URLs when launching from Twine.

[The URL fixer](URLfixer)

***

## `style` and `script` passages in Twine 2 ##

Two short scripts that let you use `script` and `style` tags as the default JS and CSS tab tend to become very crowded in Twine 2.

[Special tags](special-tags.md)

***

## Legacy macros ##

`<<input>>` and `<<inputbox>>` => Should use an `<input>` element inside the `<<listen>>` macro instead : [Input macros](input-macros).

The `<<toggle>>` macro, customizable counterpart to SC's `<<cycle>>`. Most of these functionalities can be acchieved with a `<<cycle>>` inside a `<<listen>>` container : [The 'toggle' macro](toggle-macro).
