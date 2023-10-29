## The 'hover' macro ##

This macro is used to display extra information on hover by using a tooltip and/or by replacing the hovered content.
It can handle html elements, macros, markup and anything that would print in a standard passage.

### Syntax and HTML output ###

This macro supports html arguments ([Read more.](../htmlarguments.md))

```html
<<hover [attribute object]>>
  ...default content...
[<<swap>> ...replaces default content...]
[<<tip [direction]>> ...tooltip content...]
<</hover>>
```

