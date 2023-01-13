## The 'input' macro ##

The `<<input>>` macro lets you create highly customizable input elements.

```html
<<input type 'variable' attribute value...>>
```

Check out possible types and attributes: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input

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

### Label attribute ###

The `label` special attribute lets you create a label for the generated input elements, this is mostly meant for radio-buttons, checkboxes and the like...

```html
Difficulty:
<<input radio '_diff' label 'Easy' name 'diff' value 'easy'>>
<<input radio '_diff' label 'Medium' name 'diff' value 'medium'>>
<<input radio '_diff' label 'Hard' name 'diff' value 'hard'>>
```

### Goto attribute ###

The goto attribute forwards the player to the given passage when them press enter on the input element.
This works on any focused element but feels most natural on typing inputs.

## The 'inputbox' macro ##

`<<inputbox>>` acts like `<<input>>` except it is a container macro that runs its code on certain triggers.

```html
<<inputbox type '$var' attribute value...>>
  ...code that runs when the player presses enter...
<<onchange>>
  ...code that runs whenever '$var' is modified...
<</inputbox>>
```

This can be use to conduct input checks or display informations responsively.

```html
Code:
<<inputbox number '$code' maxlength 4 size 4>>
<<onchange>>
  <<if $code === 5542>> /* Code is right*/
    <<goto 'NextPassage'>>
  <</if>>
<</inputbox>>
```

###### Notes ######

Automatic setting: Sugarcube's `<<textbox/numberbox>>` require a default value and set their variable accordingly. These do not. Receiver variables are not defined nor modified without player input.

Type coercion: By default input elements produce string values, these macros convert values to numbers when possible, expect for when type is 'text'.

