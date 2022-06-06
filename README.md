<h2 style='color:FireBrick;'>The anchor macro </h2>

The `<<a>>` macro creates a link which takes html attribute/value pairs as arguments.

```
<<a "Link text" attribute value...>>
<</a>>
```

Note that arguments do not need quotation marks, as such naked variables can be used as is:

```
<<a "Link text" id $var class someClass style color:red;>>
<</a>>
```

Notes:
Does not support Twine's default notation: [[passage]]/[img[URL]]. 

For clickable images, using the `<img src=URL>` syntax as link text is the preferred method.

<h2>The Rep macro </h2>

The `<<rep>>` macro is a version of the default `<<repeat>>`, altered to take two optional arguments.
	
<b> Target selector </b>

If supplied with a valid html selector `<<rep>>` will append its content to it:

```
<<rep 0.2s #target>>
Contents
<</rep>>
```

<b>Max iterations </b>

`<<rep>>` also takes a max iterations number after which the repeat will stop:

```
<<rep 0.2s 20>>
This will be printed 20 times.
<</rep>>
```

This reduces the need for the `<<st>>` macro (which is supplied nonetheless), equivalent of the the default `<<stop>>`.

<h3> Custom event </h3>

When `<<rep>>` stops (due to reaching the iteration number, being stopped with `<<st>>` or on passage navigation), it triggers the `:repeatEnd` custom event.

Notes:
There is no set order between the target selector and the max iterations, only the delay needs to be first.

Unlike in the default `<<repeat>>`, a delay missing the 's' will be converted in seconds instead of throwing an error.

