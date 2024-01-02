## The KeyControl API and macros ##

This API and macro set lets you easily create and manage custom key bindings. While it comes with a set of SugarCube macros the API is usable in any story format that includes jQuery.

***

### Macro documentation ###

New key controls are defined using the `<<bindkey>>` macro, main shortcuts are ideally defined in the `StoryInit` special passage.

```html
<<bindkey 'ID' 'key1 key2...'/['key1','key2',...] ['once']>>
    ...Sugarcube code to call when the key is pressed...
    [<<condition 'Twinescript expression'>>]
    [<<special 'crtl/shift/alt'>>]
    [<<desc 'Display name'>> Description displayed in <<keyinput>>]
<</bindkey>>
```

#### Arguments ####

- The `ID` is a unique identifier used to access the shortcut object. Shortcuts are toggled, displayed and deleted based on this `ID`.
- One or multiple keys can be supplied as a space-separated string or an array. Both `event.code` and `event.key` are accepted as valid syntaxes values.
- The `once` optional keyword can be used to create a single use shortcut. 

#### `<<condition>>` ####

Any Twinescript expression supplied to `<<condition>>` is evaluated whenever the shortcut is pressed. If it is truthy, the code payload is executed.
This lets users create conditional shortcuts:

```html
Only let players fast travel if they aren't in a combat passage:
<<bindkey 'fastTravel' 't'>>
    <<goto 'fastTravelHub'>>
<<condition '!tags().includes("combat")'>>
<</bindkey>>
```

#### `<<special>>` ####

The `<<special>>` tag only three arguments : `ctrl`, `alt` and `shift`. 
Keep in mind that `shift` with change `e.key` values to their upper case version while it won't change the `e.code`.

#### `<<desc>>` ####

This tag is only useful if you consider using the `<<keyinput>>` macro and let player input their own key values.
Its first argument is a display name (`<<keyinput>>` will default to the `ID` if none is supplied).
The tag's contents will be displayed as an optional description.

***

### `<<keyedit>>` ###

The `<<keyedit>>` macro is used to modify existing shortcut objects. The first argument is a command, subsequent ones are the IDs of the affected shortcuts.

```html
<<keyedit 'toggle/disable/enable/delete/reset' 'id1'...>>
```

Most commands are self-explanatory. `reset` restores the shortcut's key value to its initialized default.

***

### `<<keyinput>>` ###

The `<<keyinput>>` provides the player with the ability to input their own key combinations for existing shortcuts.

```html
<<keyedit 'ID' inputOnly(boolean)>>
```

By default, this macro displays the shortcut's name, description, the setter input and a "Reset to default" button. If the second argument is truthy, it only displays the input element, leaving greater freedom to the creator to alter the presentation.

### `<<keysettings>>` ###

The `<<keysettings>>` macro displays an input elements for each registered shortcut. It is equivalent to calling `<<keyedit>>` for every registered shortcut:

***

### API documentation ###

While the macros only work in SugarCube, the `KeyControl` API will work for any story format that includes jQuery.

New shortcuts are added by using the `KeyControl` constructor. This creates a new shortcut object for the unique `ID` parameter and adds it to the active listener pool.

```js
new KeyControl('ID', {
    key : 'key'/['key'],
    special : 'ctrl shift'/['ctrl','shift'],
    condition : <function>,
    callback : <function>,
    active : <boolean>,
    once : <boolean>,
    name : 'Display name',
    desc : 'Description...'
});
```

#### Instance methods ####

- `<KeyControl>.invoke(keydownEvent)` : Run the `callback` if the keydown event fit the key parameters and the `condition` returns truthy.
- `<KeyControl>.setKey(keydownEvent [, specialKey])` : Set a shortcut's key parameter based on keydown event. The `specialKey` argument lets you force a special key.
- `<KeyControl>.reset()` : Reset a shortcut's key parameters to it initialized default.
- `<KeyControl>.setDisplay()` : Updates the shortcut's visual representation : `ctrl + a`.
- `<KeyControl>.createInput()` : Returns a special key-setting input element.
- `<KeyControl>.createInputContext()` : Returns the shortcut's key-setting context : Name, description, input and reset button.
- `<KeyControl>.disable/enable/toggle()` : Alters the shortcut's `active` property, letting users enable or disable shortcuts.
- `<KeyControl>.delete()` : Removes a shortcut altogether.
- `<KeyControl>.getMemoryId()` : Returns the shortcut's unique `localStorage` id.
- `<KeyControl>.keysFromMemory()` : Returns the shortcut's `key` and `special` properties as they are stored in `localStorage`.
- `<KeyControl>.keysToMemory()` : Saves the shortcut's current `key` and `special` properties to `localStorage`.

#### Static methods ####

- `KeyControl.active` : An array containing all registered shortcuts (active or paused).
- `KeyControl.run()` : Try to  `KeyControl.active`.
- `KeyControl.get(id)` : Returns the shortcut object for the given id. 
- `KeyControl.add(id, {definition})` : Register a new shortcut. Equivalent to `new KeyControl(id, {definition})`.
- `KeyControl.remove(id)` : Removes the shortcut with the given ID. Equivalent to `KeyControl.get(id).delete()`.
- `KeyControl.createInputPanel()` : Returns the element generated by the `<<keysettings>>` macro.
- `KeyControl.openInputDialog()` : Opens a special dialog where the shortcuts input panel is displayed.