//'checkvars' macro, all credit goes to TME 
// Use in an interactive element (link/button)!


Macro.add("checkvars", {
    isAsync : true,
	skipArgs : true,

	handler() {

// toString function, processes the objects and indents them
		
		function toString(value, indent) {
			
			var baseType = typeof value;
			
      switch (baseType) {
      	case "number":
      		return isNaN(value) ? `NaN: ${String(value)}` : isFinite(value) ? String(value) : "Infinity";
    	  case "string":
					return JSON.stringify(value);
    	  default:
 		    	if ("object" !== baseType || null == value) 
						return String(value);
					
       		var objType = Object.prototype.toString.call(value);
					
      		if ("[object Date]" === objType) 
						return '(object: Date, value: "' + value.toISOString() + '")';
     			if ("[object RegExp]" === objType) 
						return "(object: RegExp, value: " + value.toString() + ")";
					
      	 	var opener, closer, result = [],indentText = "  ";
					
        	return indent || (indent = ""),
						("[object Set]" === objType || value instanceof Set) && (value = Array.from(value)), Array.isArray(value) ? (opener = "[\n", closer = "\n" + indent + "]", value.forEach(function(p, i) { result.push(indent + indentText + i + " ⇒ " + toString(value[i], indent + indentText))}), Object.keys(value).forEach(function(p) {/^\d+$/.test(p) || result.push(indent + indentText + toString(p) + " ⇒ " + toString(value[p], indent + indentText))})) : "[object Map]" === objType || value instanceof Map ? (opener = "{\n", closer = "\n" + indent + "}", Array.from(value).map(function(kv) { result.push(indent + indentText + toString(kv[0], indent + indentText) + " ⇒ " + toString(kv[1], indent + indentText))})) : (opener = "{\n", closer = "\n" + indent + "}", Object.keys(value).forEach(function(p) { result.push(indent + indentText + toString(p) + " ⇒ " + toString(value[p], indent + indentText))})), opener + result.join(",\n") + closer}
       }
		
// Var types setup

var dialog, storyvars = Object.keys(State.variables), 
		tempvars = Object.keys(State.temporary), 
		setupvars = Object.keys(setup), 
		settvars = Object.keys(settings);
		
const v = {
	type: [State.variables, State.temporary, setup, settings],
	keys: [storyvars, tempvars, setupvars, settvars],
	but: [`State variables (${storyvars.length})`,`Temporary variables (${tempvars.length})`,`Setup objects (${setupvars.length})`,`Setting objects (${settvars.length})`],
	name: [`State variables: ${storyvars.length}`,`Temporary variables: ${tempvars.length}`,`Setup objects: ${setupvars.length}`,`Setting objects: ${settvars.length}`],
	sigil: ['$','_','setup.','settings.']
};

// Display function
		
function displayVars(index){
	
		var tbody = dialog.querySelector('table tbody');
		$(tbody).empty();

	v.keys[index].sort(function(a, b) {
			return Util.isNumeric(a) && Util.isNumeric(b) ? Number(a) - Number(b) : a.localeCompare(b)
	});

	for (var i = -1; i < v.keys[index].length; i++) {
			if (i === -1) {
			var tr = document.createElement("tr"),
			td = document.createElement("td");

			$(td).attr('colspan', '2')
						.attr('text-align', 'center').attr('style', 'width:50em;');

			td.innerHTML = '<h3>'+v.name[index]+'</h3>', tr.appendChild(td), tbody.appendChild(tr);

		} else {
			var tr = document.createElement("tr"),
			tdName = document.createElement("td"),
			tdValue = document.createElement("td");

			tdName.textContent = v.sigil[index] + v.keys[index][i], tdValue.textContent = toString(v.type[index][v.keys[index][i]]), tr.appendChild(tdName), tr.appendChild(tdValue), tbody.appendChild(tr)
		}
	}
};
		
     if (dialog = UI.setup("Variables", "checkvars"), 0 === Object.keys(v.keys).length)
			 return dialog.innerHTML = "<p><em>No $variables currently set…</em></p>", void UI.open();

//Populates dialog with buttons + table
		let container = jQuery(document.createElement('div'));
		container.attr('id','macro-checkvars-buttons');
		$(dialog).append(container);
		
for (let i = 0; i < v.name.length; ++i) {
    jQuery(document.createElement('button'))
        .addClass(`macro-${this.name}-btn-${i}`)
        .ariaClick(
            {
                namespace : '.macros',
                role      : 'button'
            }, function () {
							displayVars(i); setup.activeNameSpace = i
				})
        .text(v.but[i])
        .appendTo(container);
}

    Dialog.append('<table><tbody></tbody></table>')
			+ (/applewebkit|chrome/.test(Browser.userAgent) ? "" : '<div class="scroll-pad">&nbsp;</div>');

//Dialog opens on state variables
		
displayVars(setup.activeNameSpace ?? 0);
UI.open();

	}
})
