
function loadStart() {
	var overlay = document.getElementById("loadingOverlay");
	if (overlay.mTimer) {
		clearTimeout(overlay.mTimer);
		overlay.mTimer = undefined;
	}
	var status = overlay.findByName("status");
	status.innerHTML = "";
	overlay.style.display = "inline-block";
}
function loadStatus(statusText) {
	var overlay = document.getElementById("loadingOverlay");
	var status = overlay.findByName("status");
	status.innerHTML = statusText;
}
function loadFinish(timeout, callback) {
	loadStatus("Done!");
	var overlay = document.getElementById("loadingOverlay");
	overlay.mTimer = setTimeout(function() {
		overlay.mTimer = undefined;
		var status = overlay.findByName("status");
		status.innerHTML = "";
		overlay.style.display = "none";
		if (callback !== undefined)
			callback();
	}, timeout);
}

function declareAll(callback) {
	loadStart();
	loadStatus("0");
	OE.Utils.loadJSON("Project.json", function(json) {
		var count = 0;
		var onDeclared = function() {
			count++;
			loadStatus(count);
			if (count == json.libs.length) {
				loadFinish(0, callback);
			}
		};
		for (var i=0; i<json.libs.length; i++) {
			OE.ResourceManager.declareLibrary("Assets/"+json.libs[i], onDeclared);
		}
	});
}
function preloadResources(type, callback) {
	var resources = {
		textures: [
			"White", "Black", "Flat_norm",
			"concrete", "bricks",
			"MetalWall1",
			"Sentry",
			"Mantis"
		],
		shaders: [
			"Solid",
			"Atmosphere",
			"ColorMask"
		],
		materials: [
			"DefaultWhite",
			"Atmosphere",
			"Concrete",
			"Wall",
			"Sentry",
			"Mantis"
		],
		models: [
			"Sentry",
			"Mantis"
		],
		sounds: [
			"Menu",
			"BGM"
		]
	}
	var list = resources[type];
	var num = list.length;
	
	loadStart();
	loadStatus("0 of "+num+" "+type);
	var count = 0;
	var onLoaded = function() {
		count++;
		loadStatus(count+" of "+num+" "+type);
		if (count == num) {
			loadFinish();
			callback();
		}
	};
	
	var mgr;
	if (type == "textures") mgr = OE.TextureManager;
	if (type == "shaders") mgr = OE.ShaderManager;
	if (type == "materials") mgr = OE.MaterialManager;
	if (type == "models") mgr = OE.ModelManager;
	if (type == "sounds") mgr = OE.SoundManager;
	if (mgr) {
		for (var i=0; i<num; i++) {
			mgr.load(list[i], onLoaded);
		}
	}
}
function preloadAll(callback) {
	preloadResources("textures", function() {
	preloadResources("shaders", function() {
	preloadResources("materials", function() {
	preloadResources("models", function() {
	preloadResources("sounds", function() {
		callback();
	});
	});
	});
	});
	});
}

var app;

function showMenu() {
	var overlay = document.getElementById("menuOverlay");
	overlay.style.display = "inline-block";
}
function clickBegin() {
	app.initScene();
	app.loadLevel(0);
	document.getElementById("menuOverlay").style.display = "none";
	document.getElementById("ingameOverlay").style.display = "inline-block";
	app.mSurface.mCanvas.focus();
}
function showControls() {
	if (document.getElementById("controls_display").style.display === "none")
		document.getElementById("controls_display").style.display = "initial";
	else
		document.getElementById("controls_display").style.display = "none"	
}

function init() {
	app = new Application();
	app.run();
	declareAll(function() {
		preloadAll(function() {
			app.initMenu();
			showMenu();
		});
	});
}
function finish() {
	if (app)
		app.finish();
}

window.addEventListener("load", init);
window.addEventListener("unload", finish);