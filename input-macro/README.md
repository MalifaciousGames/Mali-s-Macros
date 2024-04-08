## The 'input' macro set

This macro set lets user create custom input elements which can run arbitrary code when their value changes.

```html
<<input [...attributes...]>>
   ...code to run anytime the value changes...
   <<onvalue value [override]>> ...code to run when a given value is entered...
   [<<onvalue otherValue [override]>> ... ]
   [<<default>> ...code to run if no matching value is found... ]
   [<<optionsfrom collection>>]
<</input>>
```

This macro accepts [HTML attributes](../htmlarguments.md) as well as a few custom ones. Check out possible types and attributes on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

***

### Types

The desired input type can be set either by supplying a `type` attribute or by using one of the bespoke type aliases :

| Macro name | Return value | Accepts `<<optionsfrom>>` |
|:------------:|:------------:|:------------:|
| `input-area`[^1] | `string` | false
| `input-checkbox` | `boolean` | false
| `input-color` | `string` <br> (hexadecimal color code) | false
| `input-date` | [Date object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) | true
| `input-email` | `string` | true
| `input-file` | [File list](https://developer.mozilla.org/en-US/docs/Web/API/FileList) | false
| `input-number` | `number` | true
| `input-password` | `string` | true
| `input-range` | `number` | false
| `input-search` | `string` | true
| `input-select`[^1] | `string` | required
| `input-tel` | `string` | true
| `input-text` | `string` | true
| `input-time` | `string` | true
| `input-url` | `string` | true

When using `<<input>>` without a `type` attribute, it defaults to `text`.

Some valid input [types](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) are not part of the built-in presets, like `radio`, `button`... This is either because Sugarcube already offers better alternatives, or their use did not fit well into the macro's structure. You can still create them by using `<<input type 'desired type'>>`, but you will need to do the processing yourself to get the desired effect/data out of them.

[^1]: `input-area` and `input-select` are not real `input` types. They create, respectively, a `<textarea>` and a `<select>` element. They are still accessible via the `type` attribute however.

***

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

***

### Tags

#### `<<onvalue>>`
`<<onvalue>>` checks the input's current value against its first argument, if it matches, it executes the attached code. This first argument can be:
- a primitive whose type matches the input's return value
- a callback
- a regular expression for inputs that return strings
- a date object for `date` inputs
The second argument is an override which will be set as the input's value instead of the matched result.

```html
<<input>>

   <<replace '#result'>>_result<</replace>>

<<onvalue 'Mark'>>
   /* With a string */
   <<set _result = 'Oh, hi Mark!'>>
<<onvalue `name => name.toLowerCase().startsWith('z')`>>
   /* With a callback */
   <<set _result = 'Come on, your name can\'t start with a z!'>>
<<onvalue `/[jJ]+[oO]+[hH]+[nN]+/`>>
   /* With a regular expression */
   <<set _result = 'Hey, John! Welcome!'>>
<<default>>
   /* If the value wasn't matched, run this */
   <<set _result = 'Welcome '+ _this.value>>
<</input>>

<span id='result'/>
```

Code in the main macro call runs whenever the input changes, after `<<onvalue/default>>`. This is why we can afford to set `_result`, then use `<<replace>>` to print it to passage.

#### `<<optionsfrom>>`

`<<optionsfrom>>` is used to provide:
- auto-complete suggestions
- selectable options for `input-select`

It works in the exact same fashion as in [vanilla Sugarcube macros](https://www.motoslave.net/sugarcube/2/docs/#macros-macro-listbox).

```html
<<input-url>>
   /* Open url in new tab */
   <<run open(_this.value)>>
<<optionsfrom ['https://twinery.org','https://github.com/tmedwards/sugarcube-2/tree/master','https://developer.mozilla.org','https://github.com/MalifaciousGames/Mali-s-Macros']>>
<</input-url>>
```

***

### _this special variable

The `_this` variable is a shadowed variable available to all of the macro's callbacks. It is an object containing the following properties :
- value : input's current value
- input : the input element
- wrapper : the input's wrapping `<label>` element
- config : the input's inner `config` object

***

### HTML output

By default, all input elements are wrapped in a `<label>`. If the `<<optionsfrom>>` tag is used, it will add a `<datalist>` with the corresponding `<option>`.

```html
<label>
   <input>
   [<datalist>...</datalist>]
</label>
```

`input-select` is an exception, it generates a `<select>` element with the `<option>` added directly to it. See [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/select) for more details.

***

### Examples

**Setting a player character's name**

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

**A simple password check**

```html
<<input-password label 'Enter password : '>>
<<onvalue 'superPassword'>>
   <<goto [[nextPassage]]>>
<<default>>
   <<replace '#psw'>>INVALID PASSWORD!<</replace>>
<</input-password>>

<span id='psw'/>
```

**Pseudo messenger app**

```html
<div id='chat'></div>

<<input sanitize true placeholder 'Your message here.'>>
<<default>>
   /* On any input, append a new message to the chat element */
	<<append '#chat'>>
      <div class='message'>_this.value</div>
   <</append>>
   /* Empty the input field */
   <<run _this.input.value = ''>>
<</input>>
```

**Navigate to any story passage**

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