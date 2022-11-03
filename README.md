# Overview #

## The 'a' Macro ##

Links and buttons that take any HTML attributes: [The 'a' macro](a-macro/a-macro.md)

***

## The 'input' and 'inputbox' macros ##

Two flavours of macros to generate highly customizable input elements: [Input macros](input-macros/sc-input.md)

***

## JS-free settings API ##

Lets you use the built-in Settings API without JavaScript knowledge: [The settings macros](sc-settings/sc-settings.md)

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

## The 'on' and 'trigger' macros ##

The `on` macro generates a customizable element which will update its contents when a given event happens. The `trigger` macro is used to trigger such events.

### Syntax ###

Both `on` and `trigger` require at least one event name to function.
```html
<<on 'event1[,event2,...]' [elementType] [attribute + value]>> ...content... <</on>>
<<trigger 'event1[,envent2,...]'>>
```

Example:

```html
<<on 'HPLoss'>>
	You have $health health left.
<</on>>

<<button 'Lose 5 HP'>>
	<<set $health -= 5>>
	<<trigger 'HPLoss'>>
<</button>>
```

###### Notes ######

On update, the inner contents of the `on` element are wikified from the code supplied in the passage. Any styling or modification of this content will be erased, however the `on` element itself will not change.

Event names are case-sensitives but blank spaces on ever side will be trimmed out.

The `on` block is a `<span>` by default. This can be changed by supplying the element type as a second argument.

## The 'app' and 'prep' macros ##

The `<<app>>` and `<<prep>>` macros are altered versions of the default `<<append/prepend>>` to take HTML attribute/value pairs as arguments (see the 'a' macro above).

If no target selector is given, they default to the `'.passage'` element instead.

```html
<<a "Append">>
	<<app '' style background-color:red;>>
		Contents, appended to '.passage' in a red-colored span.
	<</app>>
<</a>>
```

###### Notes ######
If you wish to add attributes but no target selector, the first field should be left blank like in the example.
