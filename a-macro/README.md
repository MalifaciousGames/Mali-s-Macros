## The 'a' macro ##

The 'a' macro adds four interactive elements, two links and two buttons, all of which take html attributes as arguments.

| Use | Links | Buttons |
|------------|------------|------------|
| Standard | `<<a>>` | `<<but>>` |
| Single use | `<<adel>>` | `<<butdel>>` |

`adel` and `butdel` are single use.

### Syntax ###

This macro supports HTML arguments as objects, arrays or simple pairs. ([Read more.](../htmlarguments.md)).

```html
<<a "Link text" [attribute value...]>>

	[...content to run silently...]
	[<<rep [selector] [{attributes}] [t8n]>> ...new content...]
	[<<prep [selector] [{attributes}] [t8n]>> ...content to prepend...]
	[<<app [selector] [{attributes}] [t8n]>> ...content to append...]
	[<<diag ['Title'] ['styles'] [t8n]>> ...content to display in dialog...]

<</a>>
```

With bracket syntax :

```html
<<a [[Link text|passage]]>><</a>>
<<a [img[...url...][passage]]>><</a>>
<<a 'Text!' goto [[passage]]>><</a>>
```

### Output options ###

The 'a' macro comes with three built-in output options:

| Effect | Syntax | First argument | Second argument | Third argument |
|:------------:|:------------:|:------------:|:------------:|:------------:|
| Replace | `<<rep>>` | Selector | Attribute object | 'transition/t8n'
| Prepend | `<<prep>>`| Selector | Attribute object | 'transition/t8n'
| Append | `<<app>>` | Selector |  Attribute object | 'transition/t8n'
| Dialog | `<<diag>>` | Dialog title | CSS styles for dialog body | 'transition/t8n'

If the selector's value is falsy (empty string, 0, false...), the link will default to its immediate parent and append to/prepend to/replace that instead.

```html
<div id='box'>Contents</div>

<<a "Change box contents">>
	...silent code...
<<rep '#box'>>
	Something different!
<</a>>
```

A single `<<a>>` element can support all of the output options, these run in alphabetical order: `app => diag => prep => rep`.

```html
<<but 'Button'>>
	<<app '#someID'>> ...something to append...
	<<prep '.someClass'>> ...something to prepend...
	<<rep '#id1, #id2'>> ...new content!...
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

The `key` attribute accepts both `e.code` and `e.key`.


`e.code` values: https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values .

`e.key` values : https://developer.mozilla.org/en-US/docs/web/api/ui_events/keyboard_event_key_values .

```html
/* Supports both QWERTY and AZERTY keyboards using e.key*/
<<a "Push forward." key 'w,z' goto 'NextPassage'>>
<</a>>
```

Generating buttons bound to number keys using the `e.code` syntax:

```html
<<set $inventory = ['Potion','Knife','Flint','Bandage']>>

<<for _i, _item range $inventory>>
	<<capture _item>>
		<<but `'Use _item (press '+(_i+1)+')'` key `'Digit'+(_i+1)`>>
			<<rep '#id'>>...used _item...
		<</but>>
	<</capture>>
<</for>>

<span id='id'></span>
```

### Condition attribute ###

The `condition` attribute is supplied as a quoted expression, the link appears only if it evaluates to a truthy value. When the link is clicked, this condition is evaluated again, if it has changed to a falsy value, the link is removed.
This is a shortcut to wrapping the link in an `<<if>>` macro.

```html
<<set $hasItem = true>>

<<a 'Grab the item!' condition '!$hasItem'>>
<<set $hasItem = true>>
<</a>>

<<a 'Drop the item!' condition '$hasItem'>>
<<set $hasItem = false>>
<</a>>
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

This feature doesn't have its own memory so it should be used in conjunction with the condition attribute if you want choices to remain hidden after navigating back to a passage.

### Trigger attribute ###

The `trigger` attribute is used to trigger events at document level. It is meant to be used in conjunction with the [`<<on>>` macro](../on-macro). Events can be supplied as a commas separated string, a valid event object or an array of strings or objects.

```html
<<set $var = 45>>

<<a "Refresh cotnent!" trigger 'refresh'>>
	<<set $var ++>>
<</a>>

<<on 'refresh'>>
	$var
<</on>>
```

### Count attribute ###

The `count` attribute enables you to set a maximum amount of clicks before the link disappears. 

```html
<<but 'This button can only be clicked 3 times' count 3>>
	<<rep '#left'>> <<= 3-_this.count>>
<</but>>

Clicks left: <span id='left'>3</span>
```

### _this variable ###

The temporary variable `_this` can be used in the link to reference its own context.

| Key | Value |
|:------------:|:------------:|
| `_this.self` | Reference to the link element
| `_this.event` | Reference to the click event
| `_this.count` | Number of times the link has been clicked
