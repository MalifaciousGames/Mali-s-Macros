## The 'a' macro ##

The 'a' macro adds four interactive elements, two links and two buttons, all of which take html attributes as arguments.

| Use | Links | Buttons |
|------------|------------|------------|
| Standard | `<<a>>` | `<<but>>` |
| Single use | `<<adel>>` | `<<butdel>>` |

`adel` and `butdel` are single use.

### Syntax ###

This macro supports HTML arguments ([Read more.](main/htmlarguments.md)).

```html
<<a "Link text" [attribute value...]>>

	[...content to run silently...]
	[<<rep [selector]>> ...new content...]
	[<<prep [selector]>> ...content to prepend...]
	[<<app [selector]>> ...content to append...]

<</a>>
```

### Output options ###

The 'a' macro comes with three built-in output options:

| Effect | Syntax |
|------------|------------|
| Replace | `<<rep>>` |
| Prepend | `<<prep>>`|
| Append | `<<app>>` |

These can be supplied with one or multiple comma-separated selectors. If none is given, the link's immediate parent will serve as a target.

```html
<div id='box'>Contents</div>

<<a "Change box contents">>
	...silent code...
<<rep '#box'>>
	Something different!
<</a>>
```

A single `<<a>>` element can support all of the output options, these always run in the order described above, `<<rep>>` being first.

```html
<<but 'Button'>>
	<<rep '#id1, #id2'>> ...new content!...
	<<prep '.someClass'>> ...something to prepend...
	<<app '#someID'>> ...something to append...
<</but>>
```

### Goto attribute ###

The `goto` attribute lets you specify a passage to forward the player to. It works in the exact same fashion as the default `<<link>>` syntax.

```html
<<a "Take me to some passage" goto 'somePassage'>>
<</a>>
```

### Key attribute ###

The `key` attribute is used to bind one or more keys to an element. When one of the given keys is pressed, the element behaves as if it had been clicked.

The `key` attribute accepts both keyCode numbers (see: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode) and key values (see: https://developer.mozilla.org/en-US/docs/web/api/ui_events/keyboard_event_key_values).

```html
/* Supports both QWERTY and AZERTY keyboards */
<<a "Push forward." key 'w,z' goto 'NextPassage'>>
<</a>>

<<a "Go back." key 's' goto 'PreviousPassage'>>
<</a>>
```

Generating buttons bound to number keys:

```html
<<set $inventory = ['Potion','Knife','Flint','Bandage']>>

<<for _i, _item range $inventory>>
	<<capture _item>>
		<<but `'Use _item (press '+(_i+1)+')'` key `49+_i`>>
			<<rep '#id'>>...used _item...
		<</but>>
	<</capture>>
<</for>>

<span id='id'></span>
```

###### Notes ######

This macro set does not support Twine's bracket notation (`[[passage]]/[img[URL]]`). For clickable images, using `<img src=URL>` is the preferred method.
