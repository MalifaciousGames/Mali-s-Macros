## The 'hover' macro ##

This macro is used to display extra information on hover by using a tooltip and/or by replacing the hovered content.
It can handle html elements, macros, markup and anything that would print in a standard passage.

### Syntax and HTML output ###


```html
<<hover [elementType] [property value...]>>
  ...default content...
[<<swap [property value...]>> ...replaces default content...]
[<<tip [property value...]>> ...tooltip content...]
<</hover>>
```


```html
<span class='macro-hover'>
  
  <span class='macro-hover-inner'>
	  ...default content (gets replaced on swap)...
  </span>
  
  <span class='macro-hover-tip'>
	  ...tooltip content...
  </span>
  
</span>
```

### Running code ###

As this macro relies on wikifier calls to display its contents, any code supplied to the tags will run on hover.

Simple hover counter:
```html
<<set _var = 0>>

<<hover>>
  _var
  <<swap>> <<set _var++>> _var
<</hover>>
```

### Capture mode ###

By default, the `hover` macro's contents update to on hover. When this behaviour isn't desirable you can use the `capture` argument so hovering will only ever display the content as it was when the macro was added to the page.

```html
<<set _hour = 2, _min = 42>>

<<hover '' capture true>>
  Look at your watch.
<<swap>>
  Time is _hour : _min
<</hover>>

<<set _hour += 3, _min += 10>>
```

#### Notes ####

The macro's main container accepts an `elementType` argument, it is however `display: inline-flex` by default. This property can easily be overwritten but keep in mind that the centering of the tooltip relies on the container being some flavor of `flex`.
