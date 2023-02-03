## The listen macro ##

This macro is a container which acts as an event listener for its contents. By default, it listens for `change` events but the event type(s) can be supplied as a space or comma-separated list.

### Syntax ###

```html
<<listen [event type] [element type]>>

... contents ...

<<payload>>

... code to run when the event is triggered ...

<</listen>>
```

### _event variable ###

The event object is passed as the `_event` temporary variable which can be used in the code payload. As such, `_event.target` returns the element which triggered the event.

### Uses and examples ###

Visually update values :

```html
<<listen>>
  Starting number : <<numberbox '_num' `_num ?? 5`>>
  Multiplier : <<numberbox '_multi' `_multi ?? 5`>>
<<payload>>
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

<<payload>>
  <<if _event.code === 'Enter'>>
    <<run $(_event.target).css('background-color','red')>>
  <</if>>
<</listen>>
```

Make an element which cannot be right-clicked (and taunts you if you do) :

```html
<<listen 'contextmenu'>>
  <div>You cannot right click meeee!</div>
<<payload>>
  <<run _event.preventDefault(),
    Dialog.wiki("Don't even try it!"),
    Dialog.open()>>
<</listen>>
```
