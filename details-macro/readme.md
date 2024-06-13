## The 'details' macro ##

This macro is a simple wrapper for the [`<details>` html element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details) which lets user display or hide information.

The [attached CSS](smooth-details.css) aims to make the animation smoother and apply an opacity transition to the inner container. Both the macro and CSS can be used without the other.

### Syntax and HTML output ###

```html
<<details 'Summary' ['open'] [name]>>
   ...contents...
<</details>>
```

The generated HTML structure looks like so:

```html
<details class="macro-details">
   <summary>Summary</summary>
   <span class="inner-details">...contents...</span>
</details>
```

### Open argument ###

If `'open'` is passed as an argument, the `<details>` elements starts in the open mode.
If this is not the case, the macro will try to infer its state based on its summary text, this is done so elements in the UI bar remain consistent through passage navigation.

### Name argument ###

The first argument that is not `'open'` is treated as `<details>`'s `name` attribute. This is used to group multiple elements together so that opening one closes all the others, see more on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/details#name).

This feature will work in any browser despite being [bugged in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1856460).