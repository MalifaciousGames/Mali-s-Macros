## Automated variable refresh ##

This script enables you to refresh displayed variables whenever they are modified. It is done by wrapping naked variables in two sets of curly brackets : `{{$myVar}}`.

### Syntax ###

```html
<<set $num = 0, $array = ['One','Two','Three','Four','Five']>>

Item at index {{$num}} is {{$array[$num]}} 

<<button 'Next item!'>>
  <<set $num++>>
<</button>>
```

### Values ###

This can display any variable that can be fetched by the `State.getVar()` method.
Consequently, variables that don't normally work with sugarcube's naked variables markup, such as `setup` variables, can be displayed using this syntax.

### Input-less updating ###

The current script relies on `click` and `change` events to check for value changes. This handles most of the common means of variables modification (clicking a link, using an input element).
However, there may be situations in which you want variables to change (and update) without player input. In this case, the `refreshUpdateContainers` custom event should be triggered to visually update the passage.

```html
<<set $time = 0>>

Time passes, it is now {{$time}} .

<<silently>>
  <<repeat 2s>>
    <<set $time++, $(document).trigger('refreshUpdateContainers')>>
  <</repeat>>
<</silently>>
```

### HTML ###

The generate update wrappers are `span` elements with the `updateWrapper` class applied to them. Each bears a custom ID generated on passage load.
