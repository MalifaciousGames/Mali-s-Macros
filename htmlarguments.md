## HTML formatting ##

Most of the macros in this repository take html attributes as arguments. This is done in an effort to make styling and targetting easier than it is in default Sugarcube.

Global attributes : https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes

### Syntax ###

HTML attributes can be supplied in two formats: 
- space-separated pairs (`property value`)
- Jquery-style objects (`{ property : value}`)

```html
Pair syntax:

<<a "Red link!" id 'myID' class 'class1 class2' style 'color:red'>>
  ...content...
<</a>>

Object syntax (note the backticks surrounding the object):

<<a "Red link!" `{id : 'myID', class : 'class1 class2', style : 'color:red'}`>>
  ...content...
<</a>>
```

### Using variables ###

Unquoted variables are automatically passed as their values:

```html
<<set _id = 'myLink'>>

<<a "Link!" id _id>>
  ...content...
<</a>>
```

### Element type ###

Some macros also support custom element types: `span`, `div`, `button`, `p`...
This argument comes before the HTML attributes, if its value is falsy (empty string, undefined, 0...) the macro will default to a preset element.

Element types : https://developer.mozilla.org/en-US/docs/Web/HTML/Element

```html
This outputs a button a toggling button instead of the default link (<a> element).

<<toggle '_var' button>>
  ...content...
<</toggle>>
```

Element type is always optional and written as `<<macro [elementType] [property value]>>`.

#### Notes ####

The purpose of this system is to offer creators more freedom when it comes to using the HTML toolbox, I feel it is a domain in which Sugarcube is still lacking.
However the HTML standard has a good deal of depreciated properties and element types, any feature you plan to use is, sadly, at the mercy of browser support.
The macros in this repository cannot operate sanity checks as the combinations of elements and properties are endless so users are encouraged to do their own research first.
