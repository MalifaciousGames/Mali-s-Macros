## The 'arrowbox' macro

This macro is a SugarCube wrapper for the `<arrow-box>` custom element.

See the [`<arrox-box>` documentation](https://github.com/MalifaciousGames/Mali-s-Scripts/tree/main/custom-elements/arrow-box) for more details.

The options can be cycled:
- by clicking the buttons on either side
- by using the arrow keys when the element is in focus
- by scrolling over the element

### Syntax

```html
<<arrowbox [...attributes...]>>

   ... code to run on change ...

   [<<option label [value] [selected]>>]
   [<<optionsfrom collection>>]
<</arrowbox>>
```

This macro accepts [HTML attributes](../htmlarguments.md) as well as a few custom ones. Check out possible types and attributes on [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input).

The `<<option>>` and `<<optionsfrom>>` tags behave exactly as they do in SugarCube's built-in macros, see the [listbox documentation](https://www.motoslave.net/sugarcube/2/docs/#macros-macro-listbox) for more details.

### Special attributes

| Attribute name | Usage | Default value 
|:------------:|:------------:|:------------:|
| `value` | Sets the element's starting value | `null` |
| `editable` | Lets the user type any value in the central box, similar to a text input | none |
| `type` | The expected variable type : `string`, `number`, `JSON` or `eval` | `string` |
| `variable` | A SugarCube variable to bind to the element : `$someVariable` | None |

### Example

**Name selection :**
```html
<<set _names = ['Josh', 'Joel', 'Jodie', 'Joris', 'Josephine']>>

Choose a name or type it in :
<<arrowbox variable '$name' editable true>>

   <<redo>>

   <<optionsfrom _names>>
<</arrowbox>>

Welcome <<do>>$name<</do>>!
```