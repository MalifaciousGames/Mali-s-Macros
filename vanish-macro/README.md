## The 'vanish' macro ##

As its name implies, this macro creates a vanishing html element. The effect can be based on a set delay or on an event triggered on the element.

### Utility bundle ###

This macro comes with a minified copy of the utility bundle, if you already have one in your story JS, you can freely delete this one!

### Syntax ###

This macro supports HTML arguments ([Read more.](../htmlarguments.md)).

```html
<<vanish [delay/eventType] [elementType] [attribute value...]>>
	...contents...
<</vanish>>
```

### Delay ###

The argument argument takes the same syntax as Sugarcube's `<<timed/repeat>>` macros : `seconds + 's'` or `milliseconds + 'ms'`.

```html
<<vanish '3.5s' 'p' style 'color:red'>>
	This red paragraph will disappear after 3.5 seconds...
<</vanish>>
```
