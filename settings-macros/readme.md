## Settings macros ##

This macro set let you use Sugarcube's Settings API without requiring Javascript knowledge. It supports all three types and the upcoming `value` setting type.

***

### Defining settings

There are four valid defining macros:
- `<<addToggle>>`
- `<<addList>>`
- `<<addRange>>`
- `<<addValue>>` : Version 2.37.0 and up.

These macros should only be used in `StoryInit` or in `init`-tagged passages.

**Broad syntax :**

```html
<<add... 'Name' [default value]>>
	[<<label>> ...label text...]

	[<<onInit>> ...code to run on load...]
	[<<onChange>> ...code to run on change...]

	[<<onAny>> ...code to run on load or change, a shorthand for defining both at once...]

	[<<desc>> ...extra description...]
<</add...>>
```

**Special child tags :**

`<<addList>>` requires a special `<<list>>` child tag whose argument must be parsable into an array.
`<<addRange>>` requires a special `<<range min max step>>` child tag.

**_this variable :**

`<<onAny/onInit/onChange>>` have access to the `_this` temporary variable which references the setting's definition object with an added `value` property. Using `_this.value` is the recommended way to access the setting's value.

**Examples :**

```html
<<addList 'Themes'>>
	<<list ['golden','dark','seashell','leather']>>
	<<label>> Game theme : 
	<<onAny>>
		<<addclass 'html' _this.value>>
<</addList>>
```

```html
<<addRange 'Font-size'>>
	<<range 10 25 1>>
	<<label>> Font size (in px) : 
	<<onAny>>
		<<run $('html').css('font-size', _this.value + 'px')>>
<</addRange>>
```

***

### Changing settings

The `<<setting>>` macro creates a control element for each of its supplied settings ids. These controls are similar to what appears in the settings dialog (`UI.settings()`). 
If no argument is passed, `<<setting>>` will create an element for every registered setting.

```html
/* Font size setter */
<<setting 'Font-size'>>

/* All registered settings */
<<setting>>
```

The `setup.printSetting` function behaves the same way, it returns a jQuery collection containing a control element for each id passed as argument.

The attached [CSS file](./settings-macros.css) is used to make presentation consistent between the dialog and those "loose" setters.

**Value setters :**

SugarCube 2.37.0 introduces value-type settings designed to hold arbitrary data. These don't receive setters in the settings dialog however they can still be changed using `<<setting>>`.
The generated input is a textbox that will try to evaluate its contents to set the new value. If this fails, it will default to its string value instead.