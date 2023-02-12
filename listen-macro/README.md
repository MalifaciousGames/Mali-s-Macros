## The listen macro ##

This macro is a container which acts as an event listener for its contents. By default, it listens for `change` events but the event type(s) can be supplied as a space or comma-separated list.

### Syntax ###

This macro supports HTML arguments ([Read more.](../htmlarguments.md)).

```html
<<listen [event type(s)] [element type] [html attributes...]>>

... inner contents ...

<<then>>

... code to run when the event is triggered ...

<</listen>>
```

### _event variable ###

The event object is passed as the `_event` temporary variable which can be used in the code payload.

#### Useful properties ####

| Key | Description |
|------------|------------|
| `_event.target` | A reference to the element which triggered the event |
| `_event.target.value` | The value of the target element mostly useful to get `<input>`'s value |
| `_event.type` | The type of event (`change`, `click`, `keypress`...), useful if multiple types are used |

**Beware!**

`<input>` element's values are always strings! If you want a number instead, use `Number(_event.target.value)`. For non-primitive values, you'll need to eval them back into objects.

### Uses and examples ###

Visually update values :

```html
<<listen>>

  Starting number : <<numberbox '_num' `_num ?? 5`>>
  Multiplier : <<numberbox '_multi' `_multi ?? 5`>>

<<then>>

  <<replace '#display'>><<= _num*_multi>><</replace>>

<</listen>>

Result : <span id='display'></span>
```

Color the relevant input field when enter is pressed :

```html
<<listen 'keypress'>>

  <<textbox '$fname' 'John'>>
  <<textbox '$name' 'Doe'>>
  <<textbox '$age' '?'>>

<<then>>

  <<if _event.code === 'Enter'>>
    <<run $(_event.target).css('background-color','red')>>
  <</if>>

<</listen>>
```

Make an element which cannot be right-clicked (and taunts you if you do) :

```html
<<listen 'contextmenu'>>

  <div>You cannot right click meeee!</div>

<<then>>

  <<run _event.preventDefault(),
    Dialog.wiki("Don't even try it!"),
    Dialog.open()>>

<</listen>>
```

The world's worst numpad :

```html
<div id='display'>You dialed : </div>

<<listen 'click' 'div' style 'display: grid; grid-template-columns: 1fr 1fr 1fr'>>

  <<for _i=1; _i lt 10;_i++>>
	  <div style='padding:1em'>_i</div>
  <</for>>

<<then>>
	
  <<append '#display'>><<= _event.target.innerHTML>><</append>>

<</listen>>
``` 
