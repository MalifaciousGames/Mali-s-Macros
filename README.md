<h2>The `<<a>>` macro </h2>

The `<<a>>` macro creates a link which takes html attributes as arguments, similar to the default <a> element.

`<<a "Link text" attribute value...>>
<</a>>`

Note that arguments do not need quotation marks, as such naked variables can be used as is:

`<<a "Link text" id $var class someClass>>
<</a>>`

Does not support Twine's default notation: [[passage]]/[img[URL]]. 

To forward a player use `<<goto>>` in the macro's body.
For clickable images, using the `<img src=URL>` syntax as link text is the preferred method.