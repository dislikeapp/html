


function iframePointerEvents(active) {
	var iframes = document.getElementsByTagName("iframe");
	for (var i=0; i<iframes.length; i++) {
		var e = iframes[i];
		e.style.pointerEvents = active ? "initial" : "none";
	}
}


var Utils = {};

Utils.splitLines = function(str) {
	return str.match(/[^\r\n]+/g);
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
Utils.splitFirstToken = function(str) {
	var m = str.match(/^\s*(\S+)\s+(.*)/);
	if (m) return m.slice(1);
	return undefined;
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
Utils.extend = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined) {
			child.prototype[key] = parent.prototype[key];
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined) {
			child[key] = parent[key];
		}
	}
};
Utils.implement = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined) {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined) {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented static property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
};
Utils.defClass = function(constr) {
	constr.constructor = constr;
	for (var i=1; i<arguments.length; i++) {
		Utils.extend(constr, arguments[i]);
	}
}
Utils.merge = function(dst, src) {
	for (var key in src) {
		if (dst[key] === undefined)
			dst[key] = src[key];
	}
};
Utils.clone = function(obj, shallow) {
	if (obj == undefined || obj == null || typeof(obj) != 'object')
		return obj;
	var temp = new obj.constructor();
	for (var key in obj) {
		temp[key] = shallow ? obj[key] : Utils.clone(obj[key]);
	}
	return temp;
};
Utils.isNode = function(o) {
	return (typeof Node === "object" ?
		o instanceof Node : o &&
			typeof o === "object" &&
			typeof o.nodeType === "number" &&
			typeof o.nodeName === "string");
}; 
Utils.isElement = function(o) {
	return (
	typeof HTMLElement === "object" ?
		o instanceof HTMLElement : o &&
			typeof o === "object" &&
			o !== null &&
			o.nodeType === 1 &&
			typeof o.nodeName==="string");
};
Utils.objectDataSize = function(object, includeDOM) {
	var objectList = [];
	var stack = [object];
	var bytes = 0;
	while (stack.length > 0) {
		var value = stack.pop();

		if (typeof value === "boolean") bytes += 4;
		else if (typeof value === "string") bytes += value.length * 2;
		else if (typeof value === "number") bytes += 8;
		else if (typeof value === "object") {
			if (Utils.isElement(value)) {
				if (includeDOM === true) {
					var nodes = [value];
					var counted = [];
					while (nodes.length > 0) {
						var n = nodes.pop();
						if (counted.indexOf(n) === -1) {
							bytes += 20;
							counted.push(n);
							for (var i=0; i<n.children.length; i++) {
								nodes.push(n.children[i]);
							}
						}
					}
				}
				else {
					bytes += 20;
				}
			}
			else if (objectList.indexOf(value) === -1) {
				objectList.push(value);
				for(var i in value)
					stack.push(value[i]);
			}
		}
	}
	return bytes;
};
Utils.ajax = function(url, params) {
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
				if (params.onError) params.onError("Http request is not supported.");
				return false;
			}
		}
	}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (params.onResponse) params.onResponse(request.responseText);
		}
	}
	
	if (params === undefined) params = {};
	if (params.method === undefined) params.method = "POST";
	if (params.body === undefined) params.body = "";
	if (params.contentType === undefined) params.contentType = "application/x-www-form-urlencoded";
	
	if (params.contentType === "application/json"
		&& typeof params.body === "object") {
		params.body = JSON.stringify(params.body);
	}
	
	request.open(params.method, url, true);
	request.setRequestHeader("Content-type", params.contentType);
	request.send(params.body);
};
Utils.ajaxRequest = function(url, params, onResponse, onError) {
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
Utils.ajaxStatic = function(url, onResponse, onError) {
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
Utils.loadFile = function(filePath, onLoaded, onError) {
	Utils.ajaxStatic(filePath,
		function(response) {
			if (onLoaded) onLoaded(response);
		},
		function(message) {
			if (onError) onError(message);
		}
	);
};
Utils.loadFiles = function(filePaths, onLoaded, onError, onFinished) {
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
		Utils.ajaxStatic(filePaths[index],
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
Utils.loadJSON = function(filePath, onLoaded, onError) {
	Utils.loadFile(filePath,
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
Utils.loadJSONFiles = function(filePaths, onLoaded, onError, onFinished) {
	var jsonArray = [];
	for (var i=0; i<filePaths.size; i++)
		jsonArray.push(undefined);
	
	Utils.loadFiles(filePaths,
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
