## The 'log' macro ##

The `'log'` macro lets you log data to the console for debugging. It comes with three presets : time, data and source.

### Source log ###

Using a simple `<<log>>` displays the code which called the `<<log>>` macro, it is mostly useful as a way to check if things are running properly.

***

### Logging variables ###

Supplying variables to `<<log>>` displays them in the console.
If multiple are given, they will form a collapsible group under a label, this label can be supplied like so: `<<log ... '(My custom label!)'>>`.

```html
<<set _var = 12, _object = {name : 'object', size : 3}, _array = ['1', 'hi!', null]>> 
<<log _var _object _array>>
```

***

### Logging time ###

Calling the `<<logtime>>` macro lets you create time trackers, then log the elapsed time since their creation. These trackers can be cleared using `<<logstop>>`.

```html
<<logtime>> => Creates a default tracker.
<<logtime>> => Logs the time elapsed since creation.
<<logstop>> => Deletes tracker and logs time elapsed.
```

#### Custom trackers ####

You can declare custom trackers by suppling an id and an optional css styles like so: `<<logtime 'myTimer' 'color:red;text-decoration:underline'>>`. Any call to this id will be styled accordingly.

