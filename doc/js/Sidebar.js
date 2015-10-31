
function category(parent, name) {
	var e = document.createElement('div');
	e.setAttribute("class", "listCategory");
	e.innerHTML = '<br /><br />'+name;
	parent.appendChild(e);
	return e;
}
function link(parent, name, action) {
	var e = document.createElement('a');
	e.setAttribute("class", "listItem link");
	e.innerHTML = name;
	if (typeof action === "string") {
		e.href = action;
	}
	else {
		e.href = "javascript:void(0);";
		e.addEventListener("click", action);
	}
	parent.appendChild(e);
	return e;
}

function initSidebar() {
	var out = document.getElementById("sidebar");
	list = document.createElement('div');
	list.setAttribute("class", "vlist fullsize");
	out.appendChild(list);
	
	OE.Utils.loadJSON("data/index.json", function(json) {
		category(list, "LINKS");
		link(list, "Home", function() {loadPage("pages/home.php");});
		
		category(list, "MODULES");
		for (var moduleName in json) {
			var module = json[moduleName];
			link(list, moduleName.toUpperCase());
			for (var className in module) {
				var struct = {
					name: className,
					path: "data/"+module[className]
				};
				var e = link(list, className, function() {
					gotoDocPage(this.name);
				}.bind(struct));
				e.setAttribute("class", "listItem doc");
			}
		}
	});
}

window.addEventListener("load", function() {
	initSidebar();
});
