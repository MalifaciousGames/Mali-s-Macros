//Mali's URL path fixer

//EDIT PATHS HERE!
window.defaultFilePath = { 
	local : String.raw`...C:\Users\myName\Documents\myAssets...`,
	remote : String.raw`...https://myHostingSite.com/myAssets...`
};
//EDIT PATHS HERE!

(() => {
  	if (!defaultFilePath.remote && !defaultFilePath.local) {return false};
	
  	let path, tempPaths = [
		'AppData/Local', //Windows
		'var/folders', //mac OS
		'/tmp' //Linux
	];
	
	if (location.origin.includes('twinery')) {//Launched from browser Twine
        if (!defaultFilePath.remote) {
            return console.log(`No remote directory supplied, relative assets won't be available for testing.`);
        }
    	path = defaultFilePath.remote.trim();
    } else if (tempPaths.find(p => {return location.pathname.includes(p)})) {//Launched from desktop Twine
    	path = defaultFilePath.local ? 'file://' + defaultFilePath.local.trim() : defaultFilePath.remote.trim();
    } else {//Local path with relative assets
    	return false;
    }
	path = path.replaceAll('\\','/');
	if (path.at(-1) !== '/'){path += '/'}

  	const baseElem = document.createElement('base');
  	baseElem.setAttribute('href', path);
	document.head.append(baseElem);
})();
