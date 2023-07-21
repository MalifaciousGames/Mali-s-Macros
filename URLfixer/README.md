When launching a game from the Twine interface (via the `Test` or `Play` buttons), assets with relative URLs aren't loaded properly. This makes the testing and editing process very bothersome, requiring the user to either `publish to file` or hotlink assets to test them.

There are currently a few solutions that enable asset loading from Twine, the most popular of which boils down to concatenating a base path to the local media path to create the final URL (SugarCube example: `<img @src="setup.basePath + 'images/avatars/conan.png'">`).
Still, this approach is cumbersome as it needs to be applied to every media element.

## Solution ##

This short script aims to be a drop-in solution for games that use standard relative URLs (`<img src='myFolder/pic.png'`). 

To do so, you need to supply either a local directory (on your computer) or a remote one (hosted online), where the assets can be found and loaded from.

This script is designed to **only** work when launching from Twine (either the desktop application, or the web version), it does nothing if the game is distributed as files or hosted online. Authors might wish to remove it from the released version but it is not necessary.

**This code works for every story format.**

## Online directory ##

When using Twine from the Twinery webpage, you **must** use online hosting with this script (remote pages cannot automatically access local files for security reasons).

An online directory should look like this:
```js
window.defaultFilePath = { 
	remote : String.raw`https://myHostingSite.com/myAssets`
};
```

Be aware that hotlinking (fetching data from the web without visiting the page) is against the terms of service of most websites. You should choose the hosting platform accordingly.

## Local directory ##

When launching from the Twine desktop app, it is advised that you use the local directory where the game assets are stored. 

This requires a few steps:
1. Open the file explorer and navigate to the asset folder
2. Copy the file path (Windows example: `C:\Users\Name\Documents\firstgame\assets`)
3. Paste it into the script like so :
```js
window.defaultFilePath = { 
	local : String.raw`C:\Users\Name\Documents\firstgame\assets`
};
```


Note : An online directory can always be used (the code will default to it if no local path has been supplied), it is wasteful, however, to download remote files when they are/should be on your computer already.

Thank you to TheMadExile, Hituro and Raz for helping in the development and testing!
