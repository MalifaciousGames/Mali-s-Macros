## The drag and drop macros ##

This macro set lets you create configurable draggable elements and assorted drop containers.

These macros come with an associated css file!

### Syntax ###

These macros support HTML arguments ([Read more.](../htmlarguments.md)).

```html
Draggable element:

<<drag [elementType] [property value...]>>

  [...inner contents...]

  [<<data someData>>]
  [<<onStart>> ...code to run when the dragging operation starts...]
<</drag>>

Drop container:

<<drop [elementType] [property value...]>>

  [...inner contents...]

  [<<onDrop dropMode>> ...code to run when an item is dropped in this container...]
  [<<onRemove>> ...code to run when an item is removed...]
  [<<onEnter>> ...code to run when a draggable element enters the container...]
  [<<onLeave>> ...code to run when a draggable element leaves the container...]
  [<<onAny>>...code to run on any of the above events...]
<</drop>>
```

### Drop modes ###

The `drop` container comes with multiple presets that affect the way elements are added to it, drop modes are supplied to the `<<onDrop [dropMode]>>` tag.
They can be a string, a quoted expression which evaluates to a preset or a function which returns a preset.

| Preset | Effect | Removes target element |
|---|:---:|---|
| 'anywhere'(default) | Place element anywhere in the container. | False |
| 'append' | Append to the container. |  False |
| 'prepend' | Prepend to the container. |  False |
| 'replace' | Replace the closest element. |  True |
| 'replaceall' | Replace any container content. | False |
| 'swap' | Switch place with the closest element. |  True |
| 'fillswap' | Add element in the default fashion until the container is full, at which point follow the 'swap' behaviour. |  False then true. |
| 'remove' | Delete element (think incinerator). |  False |
| 'none' | Does nothing. The container appears unresponsive (code payloads still run). |  False |

### Item type ###

The special `type` property lets you specify compatibility between `drag` and `drop` elements. Draggable elements can only be dropped in containers which share their own type.
Type-less (not supplied, or empty string) containers accept any draggable, type-less draggables can be dropped anywhere.

```html
Weapons:
<<drop '' type 'weapon'>>
<</drop>>

Crafting ingredients:
<<drop '' type 'crafting'>>
<</drop>>

<<drag '' type 'weapon'>>
9MM pistol
<</drag>>
```

### Drag object and 'data' tag ###

The `data` tag lets you pass data through draggable objects. As soon as dragging begins, the `_drag` temporary variable is set to represent the currently dragged object.

Structure:
```
{ type : Item type (string),
	self : Reference to the draggable element (jQuery object),
	size : Item size (1 by default),
	data : The data passed from the <<data>> tag (null if none was supplied),
	contents : The element's inner contents,
	origin : The element's parent (likely a drop container) when the drag operation started,
	originIndex : The element's original index in its parent element
}
```

Using `_drag.data` in a simple inventory system:
```html
<<set $storage = [
	{name: 'Knife'},
	{name: 'Crowbar'},
	{name: 'Key'}
], $inventory = []>>

<p>Inventory:</p>

<<drop>>

<<onDrop>>
	  <<set $inventory.push(_drag.data)>>
<<onRemove>>
	<<set $inventory.delete(_drag.data)>>
<</drop>>

<p>Storage:</p>
<<drop>>

	<<for _item range $storage>>
		<<drag '' div class 'item'>>
			<<= _item.name>>
		<<data _item>>
		<</drag>>
	<</for>>

<<onDrop>>
	<<set $storage.push(_drag.data)>>
<<onRemove>>
	<<set $storage.delete(_drag.data)>>
<</drop>>
```

### Slots attribute ###

The `slots` property on drop container together with `size` on draggable elements let you define specific item capacities and sizes.
Slots can be supplied as a single number value, or in the `'currently filled / total slots'` format.

This container has two slots:
```html
<<drop '' slots 2>>
<</drop>>
```
As such it can accept either the large item, or the two small ones:
```html
<<drag '' size 2>>
Large item!
<</drag>>

<<drag '' size 1>>
Small item!
<</drag>>

<<drag '' size 1>>
Another small item!
<</drag>>
```

### Special events ###

| Reference | Description | Target |
|---|---|---|
| :typemismatch | Item type mismatch between draggable element and drop container, drop aborted. | Drop container |
| :noslots | Drop container doesn't have the slots capacity to accept draggable item, drop aborted. | Drop container |
| :predrop | Happens right before a valid drop, used to confirm the removal process. | Drop container |

Default events related to drag and drop operations can be found here: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API .
