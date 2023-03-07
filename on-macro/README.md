## The 'on' and 'trigger' macros ##

The `<<on>>` macro generates a customizable element which refreshes its contents when a special event is triggered. The `<<trigger>>` macro is used to trigger such events.

### Utility bundle ###

This macro comes with a minified copy of the utility bundle, if you already have one in your story JS, you can freely delete this one!

### Syntax ###

The `<<on>>` container supports html arguments ([Read more.](../htmlarguments.md)).

Both `<<on>>` and `<<trigger>>` require at least one event name to function.
```html
<<on 'event1[,event2,...]' [elementType] [attribute + value]>> ...content... <</on>>
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

### 'onInit' special attribute ###

By default, the `<<on>>` macro runs once as the current passage is loaded, setting the `onInit` property to a falsy value makes it so it only runs when triggered.

```html
<<on 'cannotEquip' p onInit false>>
	You cannot equip this item!
<</on>>
```

### Trigger options ###

Updating `<<on>>` blocks relies on triggering the proper event type at `document` level (directly or through bubbling). This can be done with a simple `<<trigger 'eventType'>>`, however the `<<trigger>>` macro has broader syntax support.

```html
Comma-separated string : <<trigger 'event1, event2' [myElement]>>

Custom event object : <<trigger `{type : 'eventType', data : 'Data passed with the event object.'}` [myElement]>>

Array : <<trigger `['event1',{type : 'event2'}]` [myElement]>>
```

