## The 'log' macro ##

The `'log'` macro lets you log data to the console for debugging. It comes with three presets : source, data and time.

### Logging source ###

Using a simple `<<log>>` displays the code which called the `<<log>>` macro, it is mostly useful as a way to check if code is executing properly.

### Logging data ###

Supplying variables to `<<log>>` displays them in the console.
If multiple are given, they will form a collapsible group under a label, this label can be supplied like so: `<<log ... '(My custom label!)'>>`.

```html
<<set _var = 12, _object = {name : 'object', size : 3}, _array = ['1', 'hi!', null]>> 
<<log _var _object _array>>
```

This syntax can also be used to track code execution in a verbose way.

```html
<<if $var>> 
  <<log '$var is truthy, proceed...'>>
<</if>>
```


### Logging byte size ###

`<<logsize>>` logs the approximate size, in bytes, of the supplied variable.

The syntax is as follows: `<<logsize $variable ['Custom name'] ['Custom styling']>>`.

```html
<<set _arr = [ 'First','Second','Third']>>
<<logsize _arr 'Array'>> => Array's size is 38 bytes.

<<set _num = 455>>
<<logsize _num 'Number'>> => Number's size is 8 bytes.
```

<b>Disclaimer</b> : This setting doesn't claim to provide a perfectly accurate byte size, the value is mostly useful when comparing variables to each others.

### Logging time ###

Calling the `<<logtime>>` macro lets you create time trackers, then log the elapsed time since their creation. These trackers can be cleared using `<<logstop>>`.

```html
<<logtime>> => Creates a default tracker.
<<logtime>> => Logs the time elapsed since creation.
<<logstop>> => Deletes tracker and logs time elapsed.
```

<b> Custom trackers </b>

You can declare custom trackers by suppling an id and an optional css styles like so: `<<logtime 'myTimer' 'color:red;text-decoration:underline'>>`. Any call to this id will be styled accordingly.

Comparing Sugarcube's macros to native JS in terms of speed:

```html
<<silently>>
/* ---------------------------------- Sugarcube --------------------------------- */
  <<set _i = 0, _acc = 0>>

  <<logtime 'SCloop' 'color:lightblue'>>
  
  <<for ;_i lt 1000;_i++>>
    <<set _acc += _i>>
  <</for>>
  
  <<log `'_i value : '+_i` `'Accumulator value : '+_acc`>>
  <<logstop 'SCloop'>>

/* ---------------------------------- JavaScript --------------------------------- */

  <<logtime 'JSloop'  'color:red'>>
  
  <<run let i = 0, acc = 0;
    for (;i < 1000;i++){
      acc += i;
    };
    console.log(`i value : ${i}`);
    console.log(`Accumulator value : ${acc}`);>>
    
  <<logstop 'JSloop'>>
<</silently>>
```

<b> About time trackers </b>

Time trackers do not tick in the background, this is why I try not to call them 'timers'. They consist in a date object bound to an ID, whenever they are called, this date object is compared to current time to return an offset.
As such, active trackers do not consumme any resources, don't fret.

