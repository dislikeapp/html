
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

function showMenu() {
    var overlay = document.getElementById("menuOverlay");
    overlay.style.display = "inline-block";
}

function clickBegin() {
    app.initScene();
    app.loadLevel(0);
    document.getElementById("menuOverlay").style.display = "none";
    document.getElementById("ingameOverlay").style.display = "inline-block";
}

function showControls() {
	if (document.getElementById("controls_display").style.display === "none")
		document.getElementById("controls_display").style.display = "initial";
	else
		document.getElementById("controls_display").style.display = "none"	
}

function declareResources(callback) {
	loadStart();
	loadStatus("0");
	var count = 0;
	var onDeclared = function() {
		count++;
		loadStatus(count);
		if (count == 3) {
			loadFinish(0, callback);
		}
	};
	
	OE.ResourceManager.declareLibrary("Assets/Library.json", onDeclared);
	OE.ResourceManager.declareLibrary("Assets/Default/Library.json", onDeclared);
	OE.ResourceManager.declareLibrary("Assets/Turret/Library.json", onDeclared);
}

function preloadResources(type, callback) {
	var resources = {
		textures: [
			"White", "Black", "Flat_norm",
			"concrete",
			"bricks",
			"MetalWall1",
			"Turret",
			"TurretColor"
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
			"Turret"
		],
		models: [
			"Turret"
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
	if (mgr) {
		for (var i=0; i<num; i++) {
			mgr.load(list[i], onLoaded);
		}
	}
}

var app;
var io;
var menuBar;

function init() {
	app = new Application();
	app.run();
	declareResources(function() {
		preloadResources("textures", function() {
		preloadResources("shaders", function() {
		preloadResources("materials", function() {
		preloadResources("models", function() {
			showMenu();
		});
		});
		});
		});
	});
}
function finish() {
	if (app)
		app.finish();
}

window.addEventListener("load", init);
window.addEventListener("unload", finish);