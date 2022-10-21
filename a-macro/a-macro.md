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

### Goto attribute ###

The `goto` attribute lets you specify a passage to forward the player to. It works in the exact same fashion as the default `<<link>>` syntax.

```html
<<a "Take me to some passage" goto 'somePassage'>>
<</a>>
```

### Output attributes ###

Three output options are also available:

| Effect | Syntax |
|------------|------------|
| Replace | `replace/rep` |
| Prepend | `prepend/prep`|
| Append | `append/app` |

These need to be supplied with a valid selector.

```html
<div id='box'>Contents</div>

<<a "Change box contents" rep '#box'>>
	Something different!
<</a>>

<<a "Add content to the box" app '#box'>>
	and some extra!
<</a>>
```

`<<a>>` macro elements can have any number or combination of the `replace/prepend/append` attributes, together with any number of selectors. These always run in the order described above, `replace` being first.

```
<<but 'Button' app '#id, .className' prep '#id, #someOtherId' rep '.someOtherClass'>>
```

Warning: The macro's payload will run once for each instance of `replace/prepend/append`.

###### Notes ######

This macro set does not support Twine's bracket notation (`[[passage]]/[img[URL]]`). For clickable images, using `<img src=URL>` is the preferred method.