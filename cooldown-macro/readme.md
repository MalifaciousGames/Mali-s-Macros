## The 'cooldown' macro ##

This macro is used to disable one or multiple elements for a given period of time after they've been clicked. 

### Syntax 

```html
<<cooldown [time] [disable all]>>
  ...contents...
<</cooldown>>
```

The first argument sets the cooldown duration, it accepts numbers in milliseconds or a time string like : `2s`, `.5min`, `500ms`. The shortest possible time is 40ms, it also serves as a default if no value is supplied.

By default, the cooldown is applied only to the element that has been clicked. If the second argument is truthy, every element inside the macro's body will be affected.

### Valid click targets

Elements that receive the cooldown and trigger it are:
- `<a>` elements
- `<button>` elements
- `<input>` elements that have `button` or `submit` as a `type`
- `<area>` elements (this interactive part of image maps)

### Uses and examples

Give time for a sound effect to play:
```html
<<cooldown .3s>>

   <<button 'Hit the enemy.'>>
      <<audio 'hitSound' play>>
      <<set $enemy.hp -= 5>>
   <</button>>

<</cooldown>>
```
