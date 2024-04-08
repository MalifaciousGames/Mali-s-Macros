## The 'reveal' macro

The macro reveals its contents when clicked or hovered (optional), it utilizes the `<details>` and `<summary>` elements with a few added features.

Unlike `<<linkreplace>>` this macro doesn't run its contents when triggered but when the passage first load, the resulting content is merely shown/hidden.

### Syntax

```html
<<reveal 'Preview text' [groupID] [transition/t8n] [hover/onHover] [open/startsOpen]>>
   Text to reveal.
<</reveal>>
```

### Arguments

| Name | Effect | Default |
|:------------:|:------------:|:------------:|
| 'transition/t8n' | Inner element receives a transition effect when revealed. | `true`
| 'hover/onHover' | Moving the mouse over the element opens it, moving it out closes it. | `false`
| 'open/startsOpen' | Inner contents are visible from the start. | `false`

The first argument that does not fit the above naming scheme is treated as `groupID` name. `<<reveal>>` elements with the same `groupID` are mutually exclusive, only one of them can be opened at a given time. Opening one closes the others.
This behaviour is inspired from the [`name` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#name) but uses a custom implementation as it doesn't work in Firefox by default. 

### HTML output

```html
<details class='macro-reveal'>
   <summary class='macro-reveal-title'>Preview text<summary>
   <div class='macro-reveal-inner'>Text to reveal.</div>
<details>
```