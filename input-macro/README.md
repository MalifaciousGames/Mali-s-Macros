## The 'input' macro set

This macro set creates custom input elements.

```html
<<input [...attributes...]>>
   ...code to run anytime the value changes...
   <<onvalue value [override]>> ...code to run when a given value is entered...
   [<<onvalue otherValue [override]>> ... ]
   [<<default>> ...code to run if no matching value is found... ]
   [<<optionsfrom collection>>]
<</input>>
```

This macro accepts HTML attributes as well as a few custom ones. Check out possible types and attributes on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

### Types

The desired input type can be set either by supplying a `type` attribute or by using one of the bespoke type aliases :

| Macro name | Return value | Accepts `<<optionsfrom>>` |
|:------------:|:------------:|:------------:|
| `input-color` | `string` <br> (hexadecimal color code) | false
| `input-date` | [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | true
| `input-email` | `string` | true
| `input-file` | [File list](https://developer.mozilla.org/en-US/docs/Web/API/FileList) | false
| `input-number` | `number` | true
| `input-password` | `string` | true
| `input-range` | `number` | false
| `input-search` | `string` | true
| `input-tel` | `string` | true
| `input-text` | `string` | true
| `input-time` | `string` | true
| `input-url` | `string` | true

When using `<<input>>` without a bespoke `type`, it defaults to `text`.

### Special attributes

| Attribute name | Usage | Default value | Input type
|:------------:|:------------:|:------------:|:------------:|
| `goto` | Sets a passage to navigate to when pressing `enter`. <br> Accepts link markup or a passage name string | None | any input you can type in
| `label` | Sets the input's label text | Empty string | all
| `max` | Sets a number input's max value | Number.MAX_SAFE_INTEGER | number, range
| `min` | Sets a number input's min value | Number.MIN_SAFE_INTEGER | number, range
| `sanitize` | Disables Sugarcube markup in the return string | false | all that return strings 
| `type` | Sets `<<input>>`'s type. Does nothing for the `<<input-type>>` variations | `text` | -
| `value` | The input's starting value. <br> If `variable` is used, the bound variable is set accordingly | None | all but `file`
| `variable` | Binds an input to a variable, similar to what Sugarcube's macros do by default | None | all

Any non-special attribute is added to the resulting input element.

Unlike their Sugarcube counterparts, these macros only initialize their attached variable if a `value` attribute is provided.

### Tags

`<<onvalue>>` checks the input's current value against its first argument, if it matches, it executes the attached code. This first argument can be:
- a primitive whose type matches the input's return value
- a callback
- a regular expression for inputs that return strings
- a date object for `date` inputs
The second argument is an override which will be set as the input's value instead of the matched result.

`<<default>>` lets you supply code to run when no matching `<<onvalue>>` has been found.

Code in the main macro call runs whenever the input changes, after the `<<onvalue/default>>` payload if there is one.

`<<optionsfrom>>` is used to provide auto-complete suggestions. It accepts any iterate object.

### _this special variable

The `_this` variable is a shadowed variable available to all of the macro's callbacks. It is an object containing the following properties :
- value : input's current value
- input : the input element
- wrapper : the input's wrapping `<label>` element
- config : the input's inner `config` object

### HTML output

By default, all input elements are wrapped in a `<label>`. If the `<<optionsfrom>>` tag is used, it will add a `<datalist>` with the corresponding `<option>`.

```html
<label>
   <input>
   [<datalist>...</datalist>]
</label>
```

### Examples

- Setting a player character's name :
```html
<<input-text variable '$name' label 'Player name : ' sanitize true>>
   <<replace '#proceed'>>
      Welcome $name !
      [[Proceed|nextPassage]]
   <</replace>>
<</input-text>>

<span id='proceed'/>
```
Here, we use `sanitize` so the player cannot input Sugarcube code that would run whenever their name is printed.

- A simple password check :
```html
<<input-password label 'Enter password : '>>
<<onvalue 'valid'>>
   <<goto [[nextPassage]]>>
<<default>>
   <<replace '#psw'>>INVALID PASSWORD!<</replace>>
<</input-password>>

<span id='psw'/>
```

- Navigate to any story passage :
```html
<<input-text label 'Desired passage : '>>

   <<if Story.has(_this.value)>>
      /* Passage exists */
      <<goto _this.value>>
   <<else>>
      <<run UI.alert(`No passage found for ${_this.value} !`)>>
   <</if>>

<<optionsfrom Story.lookup(p => p).map(p => p.title)>>
<</input-text>>
```
This is more of a debugging tool but we could use an array of fast-travel locations which the player gradually unlocks.