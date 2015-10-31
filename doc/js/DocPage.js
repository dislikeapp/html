
function loadPage(page) {
	var out = document.getElementById("docOutput");
	OE.Utils.loadFile(page, function(response) {
		out.innerHTML = response;
	});
}

function autoDoc(entry, subject, subjectName, out) {
	var doc = new AutoDoc(entry, subject, subjectName);
	doc.setOutput(out);
	doc.setNamespace(OE, 'OE');
	doc.autoDoc();
}

function initDocPage(docFile, className) {
	var out = document.getElementById("docOutput");
	
	if (docFile === undefined && className === undefined) {
		out.innerHTML = '';
	}
	else if (docFile !== undefined) {
		OE.Utils.loadJSON(docFile, function(json) {
			className = json.name;
			var classObj = eval('OE.'+className);
			autoDoc(json, classObj, undefined, out);
		});
	}
	else if (className !== undefined) {
		var classObj = eval('OE.'+className);
		autoDoc(undefined, classObj, className, out);
	}
}

function getQueryString() {
	var url = document.location.href;
	var qpos = url.indexOf('?');
	if (qpos === -1) return undefined;
	var qstr = url.substring(qpos+1);
	if (qstr.charAt(qstr.length-1) === '/')
		qstr = qstr.substring(0, qstr.length-1);
	return qstr;
}
function setQueryString(value) {
	var url = document.location.href;
	var qpos = url.indexOf('?');
	if (qpos >= 0) {
		url = url.substring(0, qpos);
	}
	return url + '?' + value;
}

function gotoDocPage(className) {
	document.location = setQueryString(className);
}

function searchDocPage(index, searchStr) {
	for (var moduleName in index) {
		var module = index[moduleName];
		for (var className in module) {
			if (className === searchStr) {
				var path = "data/"+module[className];
				return path;
			}
		}
	}
	return undefined;
}

window.addEventListener("load", function() {
	var str = getQueryString();
	if (str !== undefined) {
		OE.Utils.loadJSON("data/index.json", function(json) {
			var path = searchDocPage(json, str);
			initDocPage(path, str);
		});
	}
	else {
		loadPage("pages/home.php");
	}
});
