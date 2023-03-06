## The 'a' macro ##

The 'a' macro adds four interactive elements, two links and two buttons, all of which take html attributes as arguments.

| Use | Links | Buttons |
|------------|------------|------------|
| Standard | `<<a>>` | `<<but>>` |
| Single use | `<<adel>>` | `<<butdel>>` |

`adel` and `butdel` are single use.

### Utility bundle ###

This macro comes with a minified copy of the utility bundle, if you already have one in your story JS, you can freely delete this one!

### Syntax ###

This macro supports HTML arguments ([Read more.](../htmlarguments.md)).

```html
<<a "Link text" [attribute value...]>>

	[...content to run silently...]
	[<<rep [selector]>> ...new content...]
	[<<prep [selector]>> ...content to prepend...]
	[<<app [selector]>> ...content to append...]
	[<<diag ['Title'] ['styles']>> ...content to display in dialog...]

<</a>>
```

With bracket syntax :

```html
<<a [[Link text|passage]]>><</a>>
<<a [img[...url...][passage][$var = 10]]>><</a>>
<<a 'Text!' goto [[passage]]>><</a>>
```

### Output options ###

The 'a' macro comes with three built-in output options:

| Effect | Syntax | First argument | Second argument |
|:------------:|:------------:|:------------:|:------------:|
| Replace | `<<rep>>` | Valid selector | N/A |
| Prepend | `<<prep>>`| Valid selector | N/A |
| Append | `<<app>>` | Valid selector |  N/A |
| Dialog | `<<diag>>` | Dialog title | CSS styles for dialog body|


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

### Choice attribute ###

The `choice` attribute creates groups of links, if one of them is clicked, all the others will be removed from the page. 

```html
<<adel "Option 1" choice 'opt'>>
	<<rep '#opt'>>You chose n°1.
<</adel>>

<<adel "Option 2" choice 'opt'>>
	<<rep '#opt'>>You chose n°2.
<</adel>>

<span id='opt'/>
```

<b>This feature doesn't have any form of memory, navigating back and forth will cause previously deleted choices to appear again.</b>

### Trigger attribute ###

The `trigger` attribute is used to trigger events at document level. It is meant to be used in conjunction with the [`<<on>>` macro](../on-macro).

```html
<<set $var = 45>>

<<a "Refresh cotnent!" trigger 'refresh'>>
	<<set $var ++>>
<</a>>

<<on 'refresh'>>
	$var
<</on>>
```
