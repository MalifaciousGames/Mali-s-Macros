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

### Appending to the inner container or tooltip ###

On hover, both `macro-hover-inner` and `macro-hover-tip` are emptied and their content is generated from the code supplied to their respective tags. As such, content appended to these elements is lost.

To add content dynamically to `macro-hover-inner` and `macro-hover-tip`, use the `data-extra` property the content of which gets added to the code payload.

```html
<<hover>>
  ...stuff...
  <<tip id 'myTip'>> ...tooltip content...
<</hover>>

<<button 'Expand tooltip!'>>
  <<run $('#myTip').attr('data-extra','more content...').trigger('mouseover')>>
<</button>>
```

#### Notes ####

The macro's main container accepts an `elementType` argument, it is however `display: inline-flex` by default. This property can easily be overwritten but keep in mind that the centering of the tooltip relies on the container being some flavor of `flex`.