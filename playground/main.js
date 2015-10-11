
var app;

window.addEventListener("load", function() {
	app = new Application();
	app.run();
});

var userInitScene = function(scene) {};

window.addEventListener("load", function() {
	function runCode(code) {
		try {
			var newInitScene = new Function("scene", code);
			if (newInitScene !== undefined) {
				userInitScene = newInitScene;
				try {
					app.mScene.clear();
					app.initScene();
					userInitScene(app.mScene);
					app.triggerResize();
				}
				catch (e) {
					alert("~ Runtime error ~\n"+e);
				}
			}
		}
		catch (e) {
			alert("~ Syntax error ~\n"+e);
		}
	}
	
	var run = document.getElementById("run");
	var newScene = document.getElementById("new");
	var save = document.getElementById("save");
	var load = document.getElementById("load");
	
	var editor = ace.edit("editor");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	
	run.addEventListener("click", function() {
		var code = editor.getValue();
		runCode(code);
	});
	newScene.addEventListener("click", function() {
		editor.setValue("");
		userInitScene = function(scene) {};
		app.mScene.clear();
	});
	save.addEventListener("click", function() {
		var code = editor.getValue();
		OE.Utils.ajaxRequest("save.php", "code="+code, function(response) {
			try {
				response = JSON.parse(response);
				if (response.status === "OK") {
					var link = response.link;
					console.log("Saved to "+link);
					alert("Saved to "+link);
				}
				else if (response.status === "error") {
					console.warn("Error saving code: "+response.message);
					alert("Error saving code: "+response.message);
				}
				else {
					console.warn("Unexpected server response:");
					console.warn(response);
					alert("Unexpected error saving code. Check console for details.");
				}
			}
			catch (e) {
				console.warn("Malformed server response:");
				console.warn(response);
				console.warn("Exception: "+e);
				alert("Unexpected error saving code. Check console for details.");
			}
		});
	});
	load.addEventListener("click", function() {
		var examples = document.getElementById("examples");
		var fileName = examples.options[examples.selectedIndex].value;
		OE.Utils.loadFile("examples/"+fileName+".js", function(content) {
			editor.setValue(content);
			runCode(content);
		});
	});
	
	if (typeof SAVE_ID !== "undefined") {
		OE.Utils.loadFile("saves/"+SAVE_ID+".js", function(content) {
			editor.setValue(content);
			runCode(content);
		});
	}
});
