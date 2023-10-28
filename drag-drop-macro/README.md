Interactive demo on my [website](https://malifaciousgames.neocities.org/#drag-and-drop-set)

Both `<<drag>>` and `<<drop>>` support [HTML arguments](../htmlarguments.md).

## The `<<drag>>` macro ##

This container macro is used to create the draggable element itself, it acts as a movable wrapper.

```html
<<drag [attribute value]>>
  ...inner contents...
  [<<data data>>]
  [<<onStart>> ...runs when the drag event begins...]
  [<<onEnd>> ...runs when the drag event ends...]
  [<<onAny>> ...runs on both occasions...]
<</drag>>
```

### `<<data>>` tag ###

The `<<data>>` tag is used to bind a `<<drag>>` element to a piece of data, this data can be anything, from primitives to complex objects. 
This data can be accessed in the `_drag` special object, under `_drag.data`. `<<drop>>` containers which use a `<<fromSource>>` tag will treat that data as the element's contents when it comes to setting variables.

```html
Primitive (number):
<<drag>>
  Value : 5
  <<data 5>>
<</drag>> 

Object:
<<drag>>
  Handgun
  <<data `{name : 'Handgun', weight : 2, size : 1, ammo : 18}`>>
<</drag>> 
```

If the data is supplied as a variable (<<data $myData>>), this variable will be shadowed, both in the wikifier instance and associated onStart/onEnd callbacks.

### Special arguments ###

- `type(string)` : the item's type, decides on compatibility with drop containers
- `size(number)` : the item's size, decides how many `slots` it takes up in containers
- `quantity(any)` : the amount of times an item can be retreived, if it is a number, it will decrease with each removal, other data types make it into an infinite source.

### `_drag` special variable ###

Whenever a drag event starts, the `_drag` temporary variable is set reflect the entity being dragged. This variable is used to pass informations from the `<<drag>>` element to the `<<drop>>` containers.
This variable is first set on `dragstart` and unset a short delay after the `dragend` event, it is accessible to every callback tag from this macro set.

```js
{
  self : the element being dragged (jQuery selection),
  parent : the parent container (jQuery selection),
  index : the element's position in its original parent (Number),
  contents : the element's inner text content (String),
  touch : whether the drag event was started on a touch device (Boolean),
  dropped : set to true if the item was dropped in a container, undefined otherwise,
  data : data passed through the data tag (any),
  size : the item's size (Number),
  type : the item's type (String),
  quantity : the item's quantity (any),
}
```

***

## The `<<drop>>` macro ##

```html
<<drop [attribute value]>>
  ...contents...
  [<<fromSource '$variable' ['_alias'] [attributes]>>
    ...pattern, using _alias to print values in $variable...
  ]
  [<<onDrop [dropMode]>> ...runs when the element is dropped...]
  [<<onRemove [removeType]>> ...runs when an element is removed...]
  [<<onAny>> ...runs on both occasions...]
<</drop>>
```

### Drop modes ###

Supplied as `<<onDrop 'dropmode'>>`. Drop mode can be a callback which returns a valid mode, if so, it will be evaluated on every drop event.

- `anywhere`(default) : `<<drag>>` item can be placed anywhere in the container.
- `append` : Appends item to container.
- `prepend` : Prepends item to container.
- `replace` : `<<drag>>` item replaces the closest item in the drop container, if any.
- `replaceAll` : The container is cleared, then the item it added to it.
- `none` : Nothing happens, but `<<onDrop>>` runs nonetheless.
- `remove` : `<<drag>>` item is destroyed.
- `swap` : `<<drag>>` item can be placed anywhere, then the closest item in the container (if any) is sent back the the item's parent.
- `fillswap` : Place anywhere as long as the drop container has empty slots, when it is full, switch to swap mode.

### Remove modes ###

Supplied as `<<onRemove 'removeMode'>>`. Containers with a remove mode cannot have elements dropped into them.

- `destroy` : When an item is removed, its parent container is destroyed with any remaining content. This forces players to choose one item out of a selection for example.

### Special arguments ###

- `slots` : Interacts with `<<drag>>`'s `size` attribute. A container with 6 `slots` can hold 6 `size` 1 items.
- `type` : Defines item compatibility. `<<drag>>` items of a given `type` can only be dropped in a container of that same `type`. Type-less containers accept any item, type-less items can be dropped anywhere.
- `condition` : A callback, evaluated every time a `<<drag>>` item enters the container. If it returns a `falsy` value, the drop is forbidden.

### fromSource tag ###

The `<<fromSource>>` tag binds a `<<drop>>` container to a variable.

If the variable is an array: 
- each item in the array is made into a `<<drag>>` element
- removing `<<drag>>` elements removes the corresponding item from the array
- adding `<<drag>>` elements adds the element's `<<data>>` content at the proper index

If the variable is not an array:
- the value is printed to a single `<<drag>>` element
- whenever an element is added or removed, the variable's value is set to the first element's `<<data>>` value
- if the container is empty, or the first element doesn't have a `<<data>>` value, the variable is set to `undefined`

<b>Syntax</b>

```html
<<fromSource '$variableName' '_alias' {attributes object}>>
```

<b>Example</b>

```html
<<set $array = [1,2,3]>>

<<drop>>
<<fromSource '$array' '_n' `{class:'item', type:'number'}`>>
<</drop>>

The output of the code above would be the same as:

<<drag class 'item' type 'number'>>
  1
  <<data 1>>
<</drag>>
<<drag class 'item' type 'number'>>
  2
  <<data 2>>
<</drag>>
<<drag class 'item' type 'number'>>
  3
  <<data 3>>
<</drag>>
```

If no alias is supplied, `_item` is used to represent to current item.
The alias variable is supplied as a `<<data>>` value, thus it is localized to each `<<drag>>` element and its child macros.
If the `<<fromSource>>` tag is left empty, the item's value will be printed instead. This works for primitives but outputs `[object Object]` for objects.
