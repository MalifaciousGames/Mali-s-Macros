## Settings in Sugarcube language ##

These three macros let you use Sugarcube's Settings API without requiring Javascript knowledge. They cover the three built-in input types: toggle, list and range.

This macro should only be used in `StoryInit` otherwise the attached settings won't load properly on startup!

### Syntax ###

The three available types only difer slightly in their syntax:

Toggle:

```html
<<addtoggle 'NewToggle' [defaultValue]>>
	<<label 'Some sort of toggle.'>>
	<<payload>>
	...code in Sugarcube syntax...
	[<<desc 'Verbose description of the setting.(optional)'>>]
<</addtoggle>>
```

List:

```html
<<addlist 'NewList' [defaultValue]>>
	<<label 'A list of options.'>>
	<<list `['array','members']`>>
	<<payload>>
	...code in Sugarcube syntax...
	[<<desc 'Verbose description of the setting.(optional)'>>]
<</addlist>>
```

Range:

```html
<<addrange 'NewRange' [defaultValue]>>
	<<label 'Tweak a value.'>>
	<<range min max step>>
	<<payload>>
	...code in Sugarcube syntax...
	[<<desc 'Verbose description of the setting.(optional)'>>]
<</addlist>>
```

### _this ###

The temporary variable `_this` can be used in the payload section to refer to the current settings object.

```html
<<addtoggle 'NewToggle'>>
	<<label 'A new toggle!'>>
	<<payload>>
		<<if _this>>
			<<addclass 'html' 'light'>>
			<<removeclass 'html' 'dark'>>
		<<else>>
			<<removeclass 'html' 'light'>>
			<<addclass 'html' 'dark'>>
		<</if>>
<</addtoggle>>

Here, _this replaces settings.NewToggle ...

```

Note: 
`_this` is not a true temporary variable as the State isn't loaded when Storyinit runs. 

More on the settings API: https://www.motoslave.net/sugarcube/2/docs/#setting-api 
