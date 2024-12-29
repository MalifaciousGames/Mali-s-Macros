## The 'image-map' macro set

This macro set lets user create scalable, Sugarcube-compatible image maps.

### Creating a new image map

```html
<<image-map 'imageURL' [...attribute pairs...]>>

  ...contents of the image map, where you call <<area>> child macros...

[<<onClick>>
   ...code to run when any child area is clicked...]

[<<layers>>
   ...code containing images that will be used as transparent layers...
   ...sugarcube code will run here (meaning you can use conditionals to decide which image to display) but only the resulting <img> elements will be displayed...]

<</image-map>>
```

This macro set supports HTML argument pairs, wherever `[...attribute pairs...]` appears. ([Read more.](../htmlarguments.md)).

### Defining clickable areas

```html
<<area coordinates [...attribute pairs...]>>

  ...code to run when the area is clicked...

[<<hover [...attribute pairs...]>> ...contents to put in the hover element... ]
[<<overlay [...attribute pairs...]>> ...contents of an optional overlay that sits on top of the clickable <area>...]
<</area>>
```

The `coordinates` argument must either be a string of comma-separated numbers or an array. See the [MDN entry on image maps](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/map) for more details. Using a `shape` argument is not necessary, it is implied from the number of coordinates :

| Number of coordinates | Syntax | Shape |
|:------------:|:------------:|:------------:|
| 2 | `x, y`| Special `point` element
| 3 | `x, y, radius` | Circle
| 4 | `x1, y1, x2, y2` | Rectangle
| 2xn | `x1, y1, x2, y2... xn, yn` | A polygon, where each `x, y` pair represents a corner point.

While the maps generated by this macro are scalable the coordinates should always be pixel values relative to the image's natural size. These set the values that are then scaled dynamically.

**The point area**

An area defined by only two coordinates `x, y` is treated as a point element. It cannot use `<<hover/overlay>>`.

Instead it receives `<div class="point-marker"></div>` overlay, the appearance of which can be altered in the linked CSS file.

### HTML output

A macro structure like :
```html
<<image-map 'imageURL'>>

   <<area '...'>>
      <<hover>>
      <<overlay>>
   <</area>>

<<layers>>
   <img src='layerUrl'>

<</image-map>>
```

Will output this HTML structure:
```html
<div class="image-map-wrapper">
   <img src='imageURL' usemap="#image-map0">

   <map name="image-map0">
      <area shape='...' coords='...' role="button" tabindex="0">
   </map>

   <div class="area-hover shape"></div>
   <div class="area-overlay shape"></div>

   <img src='layerUrl' class='image-map-layer'>
</div>
```

The `area-hover` and `area-overlay` elements are always bound to an `<area>` and receive its `shape` attribute as a class.

The `image-map-layer` class is added to `<<layers>>` images to ensure they:
- are sized to the map
- don't interfere with click events

### _this variable

Code in the `<<area>>` macro has access to a shadowed `_this` variable which holds references to:
- the area itself : `_this.area`
- the element displayed on hover : `_this.hover`
- the static overlay : `_this.overlay`
The elements are all wrapped in a jQuery instance.

### Special arguments

The `<<image-map>>` macro supports `width` and `height` arguments which decide on the `image-map-wrapper` size.

Both `<<hover>>` and `<<overlay>>` accept a `live` argument. If truthy, those tags will re-run their contents when hovered and when clicked, respectively.