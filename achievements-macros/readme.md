## The Achievement API and macro set

This script and macro set handles creating, unlocking and displaying achievements that persist across game saves. 

### Defining new achievements

Achievements should be defined in `StoryInit` or in an `init`-tagged passage using the `<<new-achievement>>` macro:

```html
<<new-achievement id [displayName] [css classes]>>
   ...contents displayed when unlocked...
[<<locked 'Locked name'>>
   ...contents displayed when locked...]
[<<message>>
   ...notification message shown on unlock...]
<</new-achievement>>
```

### Achievement interactions

The `<<achievement>>` macro lets you interact with a given achievement instance based on its id: `<<achievement id command>>`.

Valid commands are:
- `dialog` : Displays the achievement in a `Dialog` element.
- `display` (default) : Prints an element representing the achievement's current state.
- `unlock` : Unlocks the achievement, the third argument decides whether a notification is displayed or not, `true` by default. 
- `lock` : Locks the achievement, only useful to revert a previous unlock.

Unlock an achievement silently with `<<achievement id unlock false>>`.

The display element generates the following `html` structure:
```html
<div class="achievement (id) (locked) (css classes)" id="achiev-(id)">
   <span class="achiev-name">Achievement name.</span>
   <span class="achiev-inner">
      Displayed content, will vary based on the achievement's state.
   </span>
</div>
```

### Achievements screen

The `<<achievements-display [asDialog]>>` macro prints all of the defined achievements side by side, if its first argument is true it will output them in a `Dialog` instead of printing to passage.


### Example

Defining the achievement in `StoryInit` :
```html
<<set $steps = 0>>

<<new-achievement steps '10k steps'>>
   You have walked 10 000 total steps!
<<locked '10k steps'>>
   <<= 10000-$steps>> steps left.
<</new-achievement>>
```

Interactive element in a passage:
```html
<<link 'Walk...'>>
   <<set $steps += 100>>

   <<if $steps > 9999>>
      /* unlock only works on previously locked achievements, no need to check in the if statement */
      <<achievement steps unlock>>
   <</if>>
<</link>>
```

### API documentation

Achievements can be defined in JavaScript by calling their constructor:
```js
new Achievement(id, {
   name : {
      locked : 'Locked name',
      unlocked : 'Unlocked name'
   },
   class : 'css-classes',
   message : 'Unlock message.',
   view : {
      locked : 'Achievement locked.',
      unlocked : 'Achievement unlocked.' 
   }
});
```

#### Instance methods

- `<Achievement>.unlock(hasPopup)` : Unlocks a given achievement, `hasPopup` is `true` by default.
- `<Achievement>.lock()` : Locks a given achievement.
- `<Achievement>.display()` : Returns an achievement's display element in a jQuery wrapper.
- `<Achievement>.notify()` : Displays the unlock notification for a given achievement.
- `<Achievement>.toDialog()` : Opens a `Dialog` element containing the displayed achievement.

#### Static methods

- `Achievement.check(...ids)` : Checks if any of the supplied `ids` correspond to an unlocked achievement.
- `Achievement.clearAll()` : Erase the state of every achievement.
- `Achievement.displayAll(asDialog)` : Returns a display element containing every registered achievement. If `asDialog` is truthy, display them in a `Dialog` instead.
- `Achievement.each(callback)` : A function which iterates over each registered achievement, the callback is called with the achievement's instance and state as arguments.
- `Achievement.get(id)` : Returns the achievement instance for a given `id`.
- `Achievement.unlockAll()` : Unlocks every registered achievement.

#### Getters

- `Achievement.unlocked` : Returns an array containing the `ids` of all currently unlocked achievements.
- `Achievement.defined` : Returns an array containing the `ids` of all achievements definitions.

#### Exporting saves and achievements

Saves that are imported to disk save a copy of the achievements object in their metadata, under the assumption that they might be loaded from another URL which will not have access to the same `localStorage`. When a save is loaded, it will restore the achievements if no competing object exists in memory.
As such, while achievements are not State-dependent the action of transferring save files should also transfer previously earned achievements.