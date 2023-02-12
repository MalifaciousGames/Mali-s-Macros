## The 'toggle' macro ##

This macro creates a cycling interactive element used to set variables and run code.

Syntax:
```html
<<toggle '$variableName' [elementType] [property value]>>

<<case value1 ['Prompt 1'] [property value]>>
	...code...

<<case value2 ['Prompt 2'] [property value]>>
	...code...

[<<case...]

[<<all>>
	...code for every entry...]
<</toggle>>
```

### Example ###

```html
<<toggle 'settings.elementStowed'>>

<<case true 'Stow element.'>>
	<<addclass '#element' 'stowed'>>
<<case false 'Unstow element.'>>
	<<removeclass '#element' 'stowed'>>
<<all>>
	<<replace '#status'>>
		Element is stowed: <<= settings.elementStowed>> .
	<</replace>>
<</toggle>>

<span id='status'></span>
```

#### Remarks ####

The `toggle` macro runs the `Setting.save()` method if the given variable happens to be a `settings` object.

Code in the `all` block runs after the main payload, that's why it's being used to log the new value.

### Type ###

Toggle elements can be of any valid html type, by default they are links. Elements which are normally not interactive remain clickable.

```html
<<toggle '_var' 'link/button/span/p/div...'>>
```

Both 'a' and 'link' are valid syntaxes for links.

### HTML properties ###

Both the main toggle body and each `case` element accept HTML properties as arguments. Properties on `case` tags override the ones from their parent `toggle`.

```html
<<toggle '_color' 'button' id 'colorSelection' class 'normalButton'>>
<<case red 'Red' style 'color:red'>>
<<case blue 'Blue' style 'color:blue'>>
<<case green 'Green' style 'color:green'>>
<</toggle>>
```
