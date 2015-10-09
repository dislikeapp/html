
function loadContent(href) {
	var content = document.getElementById("content");
	content.src = href;
}

function initSidebar(data) {
	var e;
	var sidebar = document.getElementById("sidebar");
	sidebar.innerHTML = '';
	
	for (var category in data) {
		e = document.createElement("div");
		e.setAttribute("class", "listCategory");
		e.innerHTML = '<br />'+category;
		sidebar.appendChild(e);
		
		var links = data[category];
		for (var i=0; i<links.length; i++) {
			(function() {
				var link = links[i];
				var name = Object.keys(link)[0];
				e = document.createElement("a");
				e.setAttribute("class", "listItem doc");
				e.innerHTML = name;
				if (link.newWindow === "true") {
					e.href = link[name];
				}
				else {
					e.href = "javascript:void(0);";
					e.addEventListener("click", function() {
						loadContent(link[name]);
					});
				}
				sidebar.appendChild(e);
			})();
		}
	}
}

window.addEventListener("load", function() {
	Utils.loadJSON("demos.json", function(json) {
		initSidebar(json);
	});
});