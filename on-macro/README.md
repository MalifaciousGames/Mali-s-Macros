## The 'on' and 'trigger' macros ##

The `<<on>>` macro generates a customizable element which refreshes its contents when the corresponding event is triggered. Events can be either standard JS events (click, contextmenu, keypress...) or custom ones, in which case the `<<trigger>>` macro can be used to trigger them.

### Syntax ###

Both `<<on>>` and `<<trigger>>` require at least one event name to function.
```html
<<on 'event1[,event2,...]' [elementType] [{attribute object}] [t8n] [startHidden/hidden]>> ...content... <</on>>
<<trigger 'event1[,envent2,...]'>>
```

The `<<on>>` block is a `<span>` by default. This can be changed by supplying the element type as a second argument.

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

### 'hidden/startHidden' argument ###

By default, the `<<on>>` macro executes its contents when the page is loaded, the `hidden/startHidden` special argument makes it waits for an event before doing so.

```html
<<on 'cannotEquip' p hidden>>
	You cannot equip this item!
<</on>>
```

### 't8n/transition' argument ###

Similarly to other sugarcube macros, this causes a fade-in effect when the `<<on>>` container is refreshed.

### Trigger options ###

Updating `<<on>>` blocks relies on triggering the proper event type at `document` level (directly or through bubbling). This can be done with a simple `<<trigger 'eventType'>>`, however the `<<trigger>>` macro has broader syntax support.

```html
Comma-separated string : <<trigger 'event1, event2' [myElement]>>

Custom event object : <<trigger `{type : 'eventType', data : 'Data passed with the event object.'}` [myElement]>>

Array : <<trigger `['event1',{type : 'event2'}]` [myElement]>>
```

