## The listen macro ##

This macro is a container which acts as an event listener for its contents. By default, it listens for `change` events but the event type(s) can be supplied as a space or comma-separated list.

### Syntax ###

This macro supports HTML arguments ([Read more.](../htmlarguments.md)).

```html
<<listen [attribute value...]>>

... inner contents ...

<<when [eventType] [init] [silent] [...any number of event types...]>>

... code to run when an event of the given type is triggered ...

[<<when ...>> ... another payload which may behave differently ... ]

<</listen>>
```

### `type` argument ###

The `type` argument decides on which element the `<<listen>>` wrapper will be, a `span` by default. `<<listen type "div" id "myID">>` generates the following HTML structure:
```html
<div id="myID" class="macro-listen">
   ...
</div>
```

### `when` tags ###

Each `<<when>>` tag accepts any number of event types as arguments, these can be:
- single strings : `<<when 'click' 'change' 'keydown'>>`
- space-separated : `<<when 'click change keydown'>>`
- comma-separated : `<<when 'click, change, keydown'>>`

If no event type is supplied to the `<<when>>` tag, it will trigger on `change` events by default. See JS events for an [exhaustive list](https://developer.mozilla.org/en-US/docs/Web/Events#event_listing).

By default, each `<<when>>` tag receives an output element in which to display its contents with the following structure : `<span class="macro-listen-output" data-event="...event types..."> ... </span>`.

`<<when>>` tags accept two special arguments which won't be processed as event types:
- `init` makes it so the tag will runs its contents once when the macro is first processed
- `silent` prevents the output element from being created making the callback silent

```html
<<listen >>

<<when 'click'>>
<<when silent>>
<</listen>>

generates the following HTML

<span class="macro-listen">
   <span class="macro-listen-output" data-event="click"></span>
</span>
```

The default values for `init`, `silent` and default event type can be changed in the macro's `config` object.

### _event variable ###

The event object is passed as the `_event` temporary variable which can be used in the code payload.

#### Useful properties ####

| Key | Description |
|------------|------------|
| `_event.target` | A reference to the element which triggered the event |
| `_event.target.value` | The value of the target element mostly useful to get `<input>`'s value |
| `_event.type` | The type of event (`change`, `click`, `keypress`...) |

**Beware!**

`<input>` element's values are always strings! If you want a number instead, use `Number(_event.target.value)`. For non-primitive values, you'll need to eval them back into objects.

### Uses and examples ###

Visually update values :

```html
<<listen >>
	You are...
   <<textbox '$fname' 'John'>>
   <<textbox '$name' 'Doe'>>

<<when init>>
   Welcome $fname $name, since we're friends I'll call you <<= ($fname[0] + '-' + $name[0]).toUpperCase()>>.
	
<</listen>>


<<listen>>

   Starting number : <<numberbox '_num' `_num ?? 5`>>
   Multiplier : <<numberbox '_multi' `_multi ?? 5`>>

<<when>>
   <<= _num*_multi>>
<</listen>>

```

<hr>

Color the relevant input field when enter is pressed :

```html
<<listen>>

   <<textbox '$fname' 'John'>>
   <<textbox '$name' 'Doe'>>
   <<textbox '$age' '?'>>

<<when 'keypress' silent>>

   <<if _event.code === 'Enter'>>
      <<run $(_event.target).css('background-color','red')>>
   <</if>>

<</listen>>
```

<hr>

Make an element which cannot be right-clicked (and taunts you if you do) :

```html
<<listen>>

  You cannot right click meeee!

<<when 'contextmenu' silent>>

   <<run _event.preventDefault(), UI.alert("Don't even try it!")>>

<<when 'click' silent>>

   <<run UI.alert("That's the good click!")>>
    
<</listen>>
```

<hr>

The world's worst numpad :

```html
<div id='display'>You dialed : </div>

<<nobr>>
<<listen type 'div' style 'display: grid; grid-template-columns: 1fr 1fr 1fr'>>

	<<for _i=1; _i lt 10;_i++>>
		<button>_i</button>
	<</for>>

<<when 'click' silent>>
	<<append '#display'>><<= _event.target.innerHTML>><</append>>
<</listen>>
<</nobr>>
``` 
