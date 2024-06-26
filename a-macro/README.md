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
   [<<after [selector] [{attributes}] [t8n]>> ...content to add after the target...]
   [<<before [selector] [{attributes}] [t8n]>> ...content to add before the target...]
	[<<diag ['Title'] ['styles']>> ...content to display in dialog...]

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
| After | `<<after>>`| Selector | Attribute object | 'transition/t8n'
| Before | `<<before>>` | Selector |  Attribute object | 'transition/t8n'
| Dialog | `<<diag>>` | Dialog title | CSS styles for dialog body | 'transition/t8n'

If the selector's value is falsy (empty string, 0, false...):
- `replace`, `append` and `prepend` will default to the link's immediate parent
- `after` and `before` will add content before/after the link itself

```html
<div id='box'>Contents</div>

<<a "Change box contents">>
	...silent code...
<<rep '#box'>>
	Something different!
<</a>>
```

A single `<<a>>` element can support all of the output options at once.

```html
<<but 'Button'>>
	<<app>> ...something to append...
	<<prep>> ...something to prepend...
	<<rep>> ...new content!...
	<<after>> ...something to insert after...
	<<before>> ...something to insert before...
<</but>>
```

These run in the order they are supplied to the macro.

### Goto attribute ###
Accepts : `'string' / [[bracket link]]`

The `goto` attribute lets you specify a passage to forward the player to. It works in the exact same fashion as the default `<<link>>` syntax.

```html
<<a "Take me to some passage" goto 'somePassage'>>
<</a>>
```

### Key attribute ###
Accepts : `number / 'string'(comma-separated) / [array]`

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

### Condition/disabled attribute ###
Accepts : `'Twinescript expression' / function() / any`

The `condition` and `disabled` attributes are evaluated attributes which decide if a link is shown/hidden or enabled/disabled.

Whenever any link of this macro set is clicked, other links with a `condition/disabled` attribute re-evaluate their own conditions and behave accordingly.

Conditions can be of any type:
- strings are treated as Twinescript expressions
- functions are called for their return values
- other data types are just tested for truthiness

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
Accepts : `number / 'string'(comma-separated) / [array]`

The `choice` attribute creates groups of links, if one of them is clicked, all the others will be removed from the page. A single link can belong to multiple choice groups by supplying a comma-separated string or an array.

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
Accepts : `number / 'string'(comma-separated) / [array]`

The `trigger` attribute is used to trigger one or multiple events at document level. It is meant to be used in conjunction with the [`<<on>>` macro](../on-macro). Events can be supplied as a commas separated string, a valid event object or an array of strings or objects.

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
Accepts : `number`

The `count` attribute enables you to set a maximum amount of clicks before the link disappears. 

```html
<<but 'This button can only be clicked 3 times' count 3>>
	<<rep '#left'>> <<= 3-_this.count>>
<</but>>

Clicks left: <span id='left'/>
```

### _this variable ###

The temporary variable `_this` can be used in the link to reference its own context.

| Key | Value |
|:------------:|:------------:|
| `_this.self` | Reference to the link element
| `_this.event` | Reference to the click event
| `_this.count` | Number of times the link has been clicked
