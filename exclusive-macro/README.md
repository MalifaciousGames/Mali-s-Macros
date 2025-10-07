## The exclusive links macro

This wrapper macro makes clickable elements mutually exclusive, by either disabling or deleting such elements.

### Syntax

This macro's name can be used in its shortened form : `<<exc>>`.

```html
<<exclusive [mode] [selector]>>
   ...contents...
[<<onclick>> ...code to run when any element is clicked...]
<</exclusive>>
```

### `mode` argument ###

The first optional argument has 3 allowed values:
- `'delete'` : clickable elements are removed, default behavior.
- `'disable'` or `'dis'` : clickable elements are disabled using SugarCube's `ariaDisabled()` function.
- `'empty'` : the wrapper's contents are emptied entirely, including non-clickable nodes.

### `selector` argument ###

The second optional argument is a CSS selector used to decide which element type can trigger and be affected by the macro. The macro's built-in selector is the following : `'a, button, [onclick], [role="link"]'`.

```html
<<exclusive disable "button">>

   Clicking the link below does nothing.
   <<link "Link 1">><</link>>

   Clicking the buttons below will disable all button elements.
   <<button "Button 1">><</button>>
   <<button "Button 2">><</button>>
<</exclusive>>
```


### `onclick` tag ###

The optional `<<onclick>>` tag is used to execute code when any of the clickable elements is clicked.

```html
Choose a pet:
<<do>> You selected <<= $selected ?? 'nothing'>>. <</do>>

<<exclusive>>

   <<link "Dog">>
      <<set $selected = 'dog'>>
   <</link>>

   <<link "Cat">>
      <<set $selected = 'cat'>>
   <</link>>

   <<link "Snake">>
      <<set $selected = 'snake'>>
   <</link>>

<<onclick>> 
   <<redo>>
<</exclusive>>
```

Here it is used as an alternative to including `<<redo>>` inside every single link.

### Timing

Only the elements present inside the `<<exclusive>>` payload when the click happens are affected. Clickable elements added after the fact, notably by `<<linkreplace>>`, will never be disabled or deleted, unless the `'empty'` mode is used.

```html
"So, what will you do?"

<<exclusive 'disable'>>

   <<linkreplace "I'd rather go right.">>
      The woman sighs with disappointment.
      [[Go right.|right]]
   <</linkreplace>>

   <<linkreplace "I will go left.">>
      "Wise choice."
      [[Go left.|left]]
   <</linkreplace>>

<</exclusive>>
```