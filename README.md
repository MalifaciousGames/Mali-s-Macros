## The 'a' macro ##

The 'a' macro adds four interactive elements, two links and two buttons, all of which take html attribute/value pairs as arguments.

| Use | Links | Buttons |
|------------|------------|------------|
| Standard | `<<a>>` | `<<but>>` |
| Single use | `<<adel>>` | `<<butdel>>` |

### HTML attributes ###

```html
<<a "Link text" attribute value...>>
Contents
<</a>>
```

Note that arguments do not need quotation marks, as such naked variables can be used as is:

```html
<<a "Link text" id $id class $someClassName style color:red;>>
        <<append '.passage'>>You clicked a red link!<</append>>
<</a>>
```

### Custom attributes ###

The `goto` attribute lets you specify a passage to forward the player to. It works in the exact same fashion as the default `<<link>>` syntax.

```html
<<a "Take me to some passage" goto 'somePassage'>>
<</a>>
```

### Variations ###

Both `<<adel>>` and `<<butdel>>` are single use interactive elements. Once clicked they remove themselves.
Unlike `<<linkreplace>>` they do not append their content to the page.

```html
<<butdel "Click me!>>"
        <<append '.passage'>>Won't click me again!<</append>>
<</butdel>>
```

###### Notes ######

This macro set does not support Twine's bracket notation ([[passage]]/[img[URL]]). For clickable images, using `<img src=URL>` is the preferred method.

***

## The 'app' and 'prep' macros ##

The `<<app>>` and `<<prep>>` macros are altered versions of the default `<<append/prepend>>` to take HTML attribute/value pairs as arguments (see the 'a' macro above).

If no target selector is given, they default to the `'.passage'` element instead.

```html
<<a "Append">>
	<<app '' style background-color:red;>>
		Contents, appended to '.passage' in a red-colored span.
	<</app>>
<</a>>
```

###### Notes ######
If you wish to add attributes but no target selector, the first field should be left blank like in the example.

***

## The 'input' macro ##

The `<<input>>` macro creates a HTML input element which takes HTML attribute/value pairs as arguments (see the 'a' macro above). It is meant as a replacement for Sugarcube's `<<textbox>>` and `<<numberbox>>`.

It uses the following syntax:
`<<input type '$variableName' (attribute value)>>`

Supported types can be found here: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input

Examples:

```html
<<input text '$name' placeholder 'Your name here'>>

<<input color '$customTheme'>>
```

***

