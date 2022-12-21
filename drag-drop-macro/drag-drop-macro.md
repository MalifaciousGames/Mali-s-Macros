## The drag and drop macros ##

This macro set lets you create configurable draggable elements and assorted drop containers.

### Syntax ###

````html
/* Draggable element */

<<drag ['itemType'] [elementType] [property value...]>>

  [...inner contents...]

  [<<data someData>>]
  [<<onStart>> ...code to run when the dragging operation starts...]
<</drag>>

/* Drop container */

<<drop ['itemType'] [elementType] [property value...]>>

  [...inner contents...]

  [<<onDrop dropMode>> ...code to run when an item is dropped in this container...]
  [<<onRemove>> ...code to run when an item is removed...]
  [<<onEnter>> ...code to run when a draggable element enters the container...]
  [<<onLeave>> ...code to run when a draggable element leaves the container...]
<</drop>>
```

### Drop modes ###

The `drop` container comes with multiple presets that affect the way elements are added to it.

| Preset | Effect | Runs 'onRemove' code |
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
