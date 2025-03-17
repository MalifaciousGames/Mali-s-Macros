## The 'live' macro

The `<<live>>` macro is a container that automatically refreshes its contents:
- when a link or button is clicked
- when an input value changes

Its use case is very similar to that of `<<do>>` without the need for the user to include `<<redo>>` in their code.

### The 'live' passage tag

This script also adds a special `live` tag which acts exactly as wrapping the whole passage in a `<<live>>` macro. It is only applied to navigable passages and does nothing to those displayed as UI elements (`StoryCaption`...).

Do keep in mind that having a `live` passage means that `<<set... >>` assignments will be re-run on each refresh. Similarly, input macros that do not use `autoselect` will reset.

### Example

Update content dynamically based on player input:
```html
<<live>>
   Age : <<numberbox '_age' `_age ?? 0`>>

   <<if _age < 18>>
   	You cannot play this game!
   <<else>>
   	[[Welcome home.]]
   <</if>>

<</live>>
```

Display choice results:
```html
<<set _desc = [
   'The forest ahead is dense and threatening...',
   'The cave ahead is deep, dark and ominous...',
   'The village seems welcoming at first glance, who knows the horrors it might hide...'
]>>

<<live>>

   Go to
   <<cycle '_direction' autoselect>>
	<<option 'the Forest' 0>>
	<<option 'the Cave' 1>>
	<<option 'the Village' 2>>
   <</cycle>>

   <<= _desc[_direction]>>
   <<link 'Time to go.' `"dir"+_direction`>>
   <</link>>

<</live>>
```
