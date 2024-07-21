## The 'on/once' and 'trigger' macros

The `<<on>>` macro generates a customizable element which refreshes its contents when the corresponding event is triggered. Events can be either standard JS events (click, contextmenu, keypress...) or custom ones, in which case the `<<trigger>>` macro can be used to trigger them.

The `<<once>>` variation works the same way as `<<on>>`, but only once.

### Syntax 

Both `<<on>>` and `<<trigger>>` require at least one event name to function.
```html
<<on 'event1[,event2,...]' [elementType] [{attribute object}] [transition/t8n] [startHidden/hidden]>> ...content... <</on>>

<<trigger 'event1[,envent2,...]' [selector]>>
```

The `<<on>>` block is a `<span>` by default.

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
<<on 'cannotEquip' hidden>>
	You cannot equip this item!
<</on>>
```

### 't8n/transition' argument ###

Similarly to other sugarcube macros, this causes a fade-in effect when the `<<on>>` container is refreshed.

### _event variable ###

The `_event` temporary variable lets you access and manipulate the event which triggered the refresh. This can be used to discriminate between custom events or interact with JS standard events.

Turn the clicked element red:
```html
<<on 'click'>>
	<<run $(_event.target).css('background-color','red')>>
<</on>>
```

### Trigger options ###

Updating `<<on>>` blocks relies on triggering the proper event type at `document` level (directly or through bubbling). This can be done with a simple `<<trigger 'eventType'>>`, however the `<<trigger>>` macro has broader syntax support.

```html
Comma-separated string : <<trigger 'event1, event2' [myElement]>>

Custom event object : <<trigger `{type : 'eventType', data : 'Data passed with the event object.'}` [myElement]>>

Array : <<trigger `['event1', {type : 'event2'}]` [myElement]>>
```

### On/trigger and do/redo

Sugarcube 2.37 version introduced the `<<do/redo>>` macros, whose purpose are extremely similar. I chose not to retire `<<on/trigger>>` for a few reasons:
- `<<on>>` can trigger on arbitrary events, whether native (`click, keydown, input...`) or custom (`:typingstop, :dialogopened`) at document level, which neither `<<do>>` or [`<<listen>>`](../listen-macro) are capable of.
- `<<do>>` does not cover `<<once>>`'s functionality.
- `<<trigger>>` can trigger native or custom events on arbitrary targets, such as clicking a given element.

If you are using the macro for simple updating, `<<do/redo>>` are the way to go, especially since they can be used without tags.

### Trigger condition and event cleanup

While the listeners are attached to the `document`, they will only trigger if their corresponding element is in the DOM. On passage navigation, listeners whose elements have been removed are also unbound from the `document`. Conversely, wrappers in static containers (likely `data-init-passage` elements of the `StoryInterface`) will remain active.