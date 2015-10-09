
var app;

window.addEventListener("load", function() {
	app = new Application();
	app.run();
});

var userInitScene = function(scene) {};

window.addEventListener("load", function() {
	editor = ace.edit("editor");
	editor.setTheme("ace/theme/monokai");
	editor.getSession().setMode("ace/mode/javascript");
	
	var run = document.getElementById("run");
	var newScene = document.getElementById("new");
	var load = document.getElementById("load");
	
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
	
	newScene.addEventListener("click", function() {
		editor.setValue("");
		userInitScene = function(scene) {};
		app.mScene.clear();
	});
	load.addEventListener("click", function() {
		var examples = document.getElementById("examples");
		var fileName = examples.options[examples.selectedIndex].value;
		OE.Utils.loadFile("examples/"+fileName+".js", function(content) {
			editor.setValue(content);
			runCode(content);
		});
	});
	run.addEventListener("click", function() {
		var code = editor.getValue();
		runCode(code);
	});
});
