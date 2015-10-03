
OE.Utils = {};

OE.Utils.splitLines = function(str) {
	return str.match(/[^\r\n]+/g);
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
OE.Utils.splitFirstToken = function(str) {
	var m = str.match(/^\s*(\S+)\s+(.*)/);
	if (m) return m.slice(1);
	return undefined;
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
OE.Utils.isPathAbsolute = function(path) {
	var r = new RegExp('^(?:[a-z]+:)?//', 'i');
	return r.test(path);
}
OE.Utils.extend = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined && key !== "constructor") {
			child.prototype[key] = parent.prototype[key];
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined && key !== "constructor") {
			child[key] = parent[key];
		}
	}
};
OE.Utils.implement = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined && key !== "constructor") {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined && key !== "constructor") {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented static property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
};
OE.Utils.defClass = function(constr) {
	constr.prototype.constructor = constr;
	constr.constructor = constr;
	for (var i=1; i<arguments.length; i++) {
		OE.Utils.extend(constr, arguments[i]);
	}
}
OE.Utils.defClass2 = function() {
	if (arguments.length > 0) {
		var prot = arguments[arguments.length-1];
		if (prot !== undefined) {
			if (prot.constructor === undefined)
				prot.constructor = Object;
			var constr = prot.constructor;
			constr.prototype = prot;
			for (var i=0; i<arguments.length-1; i++) {
				OE.Utils.extend(constr, arguments[i]);
			}
			return constr;
		}
	}
	return undefined;
}

OE.Utils.merge = function(dst, src) {
	for (var key in src) {
		if (dst[key] === undefined)
			dst[key] = src[key];
	}
};
OE.Utils.clone = function(obj, shallow) {
	if (obj == undefined || obj == null || typeof(obj) != 'object')
		return obj;
	var temp = new obj.constructor();
	for (var key in obj) {
		temp[key] = shallow ? obj[key] : OE.Utils.clone(obj[key]);
	}
	return temp;
};
OE.Utils.ajaxRequest = function(url, params, onResponse, onError) {
	var request;
	try {
		request = new XMLHttpRequest();
	}
	catch (e) {
		try {
			request = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch (e) {
			try {
				request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch (e) {
				if (onError) onError("Http request is not supported.");
				return false;
			}
		}
	}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (onResponse) onResponse(request.responseText);
		}
	}
	request.open("POST", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send(params);
};
OE.Utils.ajaxStatic = function(url, onResponse, onError) {
	var request;
	try {
		request = new XMLHttpRequest();
	}
	catch (e) {
		try {
			request = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch (e) {
			try {
				request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch (e) {
				if (onError) onError("Http request is not supported.");
				return false;
			}
		}
	}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (onResponse) onResponse(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Cache-Control", "must-revalidate");
	request.send();
};
OE.Utils.loadFile = function(filePath, onLoaded, onError) {
	OE.Utils.ajaxStatic(filePath,
		function(response) {
			if (onLoaded) onLoaded(response);
		},
		function(message) {
			if (onError) onError(message);
		}
	);
};
OE.Utils.loadFiles = function(filePaths, onLoaded, onError, onFinished) {
	var states = [];
	for (var i=0; i<filePaths.length; i++)
		states.push(0);
	
	var checkStates = function() {
		var done = true;
		var numLoaded = 0;
		var numErrors = 0;
		for (var i=0; i<states.length; i++) {
			var j = i;
			if (states[j] == 0) {
				done = false;
				setTimeout(function() {
					if (states[j] == 0) {
						requestFile(j);
					}
				}, 1000);
			}
			else {
				if (states[j] == 1) numLoaded++;
				if (states[j] == 2) numErrors++;
			}
		}
		if (done) {
			if (onFinished) onFinished(numLoaded, numErrors);
		}
	};
	var requestFile = function(index) {
		OE.Utils.ajaxStatic(filePaths[index],
			function(response) {
				if (onLoaded) onLoaded(response, index);
				states[index] = 1;
				checkStates();
			},
			function(message) {
				if (onError) onError(message, index);
				states[index] = 2;
				checkStates();
			}
		);
	};
	for (var i=0; i<filePaths.length; i++) {
		requestFile(i);
	}
};
OE.Utils.loadJSON = function(filePath, onLoaded, onError) {
	OE.Utils.loadFile(filePath,
		function(response) {
			var json = undefined;
			try {
				json = JSON.parse(response);
			}
			catch (e) {
				if (onError) onError("JSON syntax error.");
			}
			if (json) {
				if (onLoaded) onLoaded(json);
			}
		},
		function(message) {
			if (onError)
				onError(message);
		}
	);
};
OE.Utils.loadJSONFiles = function(filePaths, onLoaded, onError, onFinished) {
	var jsonArray = [];
	for (var i=0; i<filePaths.size; i++)
		jsonArray.push(undefined);
	
	OE.Utils.loadFiles(filePaths,
		function(response, index) {
			var json = undefined;
			try {
				json = JSON.parse(response);
			}
			catch (e) {
				if (onError) onError("JSON syntax error.", index);
			}
			if (json) {
				if (onLoaded) onLoaded(json, index);
				jsonArray[index] = json;
			}
		},
		function(message, index) {
			if (onError)
				onError(message, index);
		},
		function(numLoaded, numErrors) {
			if (onFinished)
				onFinished(jsonArray, numLoaded, numErrors);
		}
	);
};
