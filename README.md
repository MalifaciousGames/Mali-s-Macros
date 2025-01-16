# Macros #

## The 'a' macro ##

Create highly customizable links and buttons that take any HTML attributes, have built-in key bindings support and multiple output options.

[The 'a' macro](a-macro)

***

## The achievements API and macros ##

This API and associated macros let users create, display and save game achievements.

[Achievements API and macros](achievements-macros)

***

## The 'arrowbox' macro ##

A hybrid input element similar to SugarCube's `<<cycle>>` but which can be cycled in either directions by clicking, scrolling or using the arrow keys.

[The 'arrowbox' macro](arrowbox-macro)

***

## The 'checkvars' macro ##

This macro prints the active variables (State variables and temporary, `settings` and `setup`) to a dialog. The new version also lets you edit their values for testing.

[The 'checkvars' macro](checkvars-macro)

***

## The 'cooldown' macro ##

Disable clickable elements for a given time after click.

[The 'cooldown' macro](cooldown-macro)

***

## The 'details' macro ##

A macro wrapper for the `<details>` HTML element which acts as a drop-down display.

[The 'details' macro](details-macro)

***

## The 'hover' macro ##

Displays a tooltip, run code and/or replace content on hover.

[The 'hover' macro](hover-macro)

***

## The 'image-map' macro set

This macro set lets users create scalable, Sugarcube-compatible image maps.

[The 'image-map' macro set](image-map-macro)

***

## The 'input' macro set

Highly customizable input elements which can run code when a given value is entered, among other things.

[The 'input' macro set](input-macro)

***

## The 'KeyControl' API and macro set ##

The `KeyControl` API lets you create and handle custom shortcuts. The API itself is format-agnostic, a set of SugarCube macros is included to interact with it.

[KeyControl API and macro set](keycontrol-macros)

***

## The 'listen' macro ##

A configurable event listener in macro form. Mainly used to run code when an input element is modified.

[The 'listen' macro](listen-macro)

***

## The 'live' macro ##

This macros automatically updates its contents based on player interactions. Also available as a passage tag.

[The 'live' macro](live-macro)

***

## The 'on' and 'trigger' macros ##

This pair of macros make up an event-based refresh system. They are useful as a way to update displays but also for running asynchronous code.

[The 'on' and 'trigger' macro set](on-macro)

***

## JS-free settings API

This macro set lets you :
- create settings without JavaScript knowledge
- easily modify settings outside of the settings dialog

[The settings macros](settings-macros)

***

## Template macro ##

Create [Sugarcube templates](https://www.motoslave.net/sugarcube/2/docs/#template-api) with a macro rather than in JS.

#### Syntax
```html
<<template 'templateName' ['alternativeName' ...]>>
   ...contents to display when the template is called...
<</template>>
```

#### Code
```js
Macro.add('template', {
   tags : null,
   handler() {Template.add(this.args, this.payload[0].contents)}
});
```