
/*! <<checkvars>> macro for SugarCube 2.x */
// version check
! function() {
    "use strict";
    if ("undefined" == typeof version || "undefined" == typeof version.title || "SugarCube" !== version.title || "undefined" == typeof version.major || version.major < 2) throw new Error("<<checkvars>> macro requires SugarCube 2.0 or greater, aborting load");

Macro.add("checkvars", {
	handler:

	function() {
		function toString(value, indent) {
			var baseType = typeof value;
      switch (baseType) {
      case "number":
      	return isNaN(value) ? "NaN" : isFinite(value) ? String(value) : "Infinity";
      case "string":
				return JSON.stringify(value);
      case "function":
        return "(function)";
      default:
      if ("object" !== baseType || null == value) 
				return String(value);
        var objType = Object.prototype.toString.call(value);
      if ("[object Date]" === objType) 
				return '(object: Date, value: "' + value.toISOString() + '")';
      if ("[object RegExp]" === objType) 
				return "(object: RegExp, value: " + value.toString() + ")";
					
        var opener, closer, result = [],indentText = "  ";
					
        return indent || (indent = ""), ("[object Set]" === objType || value instanceof Set) && (value = Array.from(value)), Array.isArray(value) ? (opener = "[\n", closer = "\n" + indent + "]", value.forEach(function(p, i) {
        result.push(indent + indentText + i + " ⇒ " + toString(value[i], indent + indentText))
    }), Object.keys(value).forEach(function(p) {
     /^\d+$/.test(p) || result.push(indent + indentText + toString(p) + " ⇒ " + toString(value[p], indent + indentText))
    })) : "[object Map]" === objType || value instanceof Map ? (opener = "{\n", closer = "\n" + indent + "}", Array.from(value).map(function(kv) {
                                result.push(indent + indentText + toString(kv[0], indent + indentText) + " ⇒ " + toString(kv[1], indent + indentText))
                            })) : (opener = "{\n", closer = "\n" + indent + "}", Object.keys(value).forEach(function(p) {
                                result.push(indent + indentText + toString(p) + " ⇒ " + toString(value[p], indent + indentText))
                            })), opener + result.join(",\n") + closer
                    }
                }
var dialog, sv = State.variables, tv = State.temporary;
var names = Object.keys(sv), tempvars = Object.keys(tv);
		
     if (dialog = UI.setup("Story $variables", "checkvars"), 0 === tempvars.length + names.length)
			 return dialog.innerHTML = "<p><em>No $variables currently set…</em></p>", void UI.open();
		
    $(dialog).html("<div id=table1><table><tbody></tbody></table></div><div id=table2><table><tbody></tbody></table></div>")
			+ (/applewebkit|chrome/.test(Browser.userAgent) ? "" : '<div class="scroll-pad">&nbsp;</div>');
		
		var tbody = dialog.querySelector("#table1 tbody");

names.sort(function(a, b) {
		return Util.isNumeric(a) && Util.isNumeric(b) ? Number(a) - Number(b) : a.localeCompare(b)
});

for (var i = -1; i < names.length; i++) {
		if (i === -1) {
		var tr = document.createElement("tr"),
    td = document.createElement("td");
			
		$(td).attr('colspan', '2')
					.attr('text-align', 'center').attr('style', 'width:50em;');
	
    td.innerHTML = "<h3>State variables</h3>", tr.appendChild(td), tbody.appendChild(tr);
		
	} else {
		var tr = document.createElement("tr"),
    tdName = document.createElement("td"),
    tdValue = document.createElement("td");
	
    tdName.textContent = "$" + names[i], tdValue.textContent = toString(sv[names[i]]), tr.appendChild(tdName), tr.appendChild(tdValue), tbody.appendChild(tr)
	}
}

var tbody = dialog.querySelector("#table2 tbody");
		
tempvars.sort(function(a, b) {
		return Util.isNumeric(a) && Util.isNumeric(b) ? Number(a) - Number(b) : a.localeCompare(b)
});
		
for (var i = -1; i < tempvars.length; i++) {
	if (i === -1) {
		var tr = document.createElement("tr"),
    td = document.createElement("td");
		$(td).attr('colspan', '2').attr('style', 'width:50em;');
	
    td.innerHTML = "<h3>Temporary variables</h3>", tr.appendChild(td), tbody.appendChild(tr);
		
	} else {
		var tr = document.createElement("tr"),
    tdName = document.createElement("td"),
    tdValue = document.createElement("td");
	
    tdName.textContent = "_" + tempvars[i], tdValue.textContent = toString(tv[tempvars[i]]), tr.appendChild(tdName), tr.appendChild(tdValue), tbody.appendChild(tr)
	}
}

UI.open()
}
})
}();