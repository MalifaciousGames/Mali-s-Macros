## The 'input' macro ##

The `<<input>>` macro lets you create highly customizable input elements.

```html
<<input type 'variable' attribute value...>>
```

### Variable syntax ###

Input elements edit the value of the supplied variable which can be `State`, `setup` or `settings`.

```html
Single variable:
<<input range '$variable'>> -> Outputs a single range slider which modifies '$variable'

Array syntax:
<<input number `['$height','$weight']` placeholder `['Your height','Your weight']`>>
-> Outputs two number boxes, each one edits the corresponding variable.
-> Notice the array syntax also applies to property values.
```

### HTML attributes ###

```html
Pair syntax:
<<input text '$name' placeholder 'Name' value $name class 'specialInput'>>

Object syntax:
<<input color '$highlightColor' `{style : 'height: 2em; border-radius: 1em', id : 'colorSelection'}`>>
```

### Goto attribute ###

The goto attribute forwards the player to the given passage when them press enter on the input element.
This works on any focused element but feels most natural on typing inputs.
