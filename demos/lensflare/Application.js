var Application = function() {
	OE.BaseApp3D.call(this);
};
Application.prototype = {
	onRun: function() {
		this.mRenderSystem = new OE.RenderSystem();
		
		var container = document.getElementById("appFrame");
		this.mSurface = this.mRenderSystem.createRenderSurface(container);
		
		this.mScene = new OE.Scene();
		this.mScene.setRenderSystem(this.mRenderSystem);
		this.mCamera = new OE.Camera(this.mScene);
		this.mViewport = this.mSurface.createViewport(this.mCamera);
		
		this.loadResources();
	},
	loadResources: function() {
		OE.ResourceManager.declareLibrary("../../resource_libs/Default/library.json", function() {
		OE.ResourceManager.declareLibrary("data/MyLibrary.json", function() {
			this.initScene();
		}.bind(this));
		}.bind(this));
	},
	initScene: function() {
		this.mCamera.setPosf(0.0, 0.0, this.camDist);
		this.mCamera.setNearPlane(0.1);
		this.mCamera.setFarPlane(600.0);
		this.mScene.addObject(this.mCamera);
		
		var N = 1;
		for (var i=0; i<N*N; i++) {
			var x = (i%N - Math.floor(N/2)) * 20;
			var z = (Math.floor(i/N) - Math.floor(N/2)) * 20;
			var object = new OE.Entity(
				OE.ModelManager.getLoaded("Teapot_high"),
				OE.MaterialManager.getLoaded("Reflective"));
			object.setPosf(x, -7.5, z);
			object.setPosf(x, 0.0, z);
			this.mScene.addObject(object);
		}
		
		var flare = this.mScene.addObject(new OE.LensFlare());
		flare.setPosf(300.0, 0.0, 300.0);
		flare.setMaterial("LensFlare");
		
		var container = this.mScene.addObject(new OE.GameObject());
		var obj = container.addChild(new OE.Sphere(10.0, 32, 32));
		obj.mMaterial = OE.MaterialManager.getLoaded("Reflective");
		/*var obj = container.addChild(new OE.Emitter({
			emitClass: OE.Sphere,
			classArgs: [4.0, 16, 16],
			material: OE.MaterialManager.getLoaded("Reflective"),
			emitsPerBurst: 4,
			speedMin: 0.25,
			speedMax: 1.0
		}));*/
		obj.setPosf(0.0, 0.0, -50.0);
		var angle = 0.0;
		container.onUpdate = function() {
			angle += 0.125;
			this.setRotAxisAngle(OE.Vector3.UP, angle);
			var pos = obj.getPos();
			pos.y = Math.sin(angle * 0.1) * 10;
			obj.setPos(pos);
		};
		
		var envMap = new OE.Sphere(-500.0, 64, 64);
		envMap.mMaterial = OE.MaterialManager.getLoaded("EnvMap");
		this.mScene.addObject(envMap);
	},
	updateCamera: function() {
		var rot = this.mCamera.getRot();
		var pos = rot.getConjugate().getForward();
		pos.mulByf(this.camDist);
		this.mCamera.setPos(pos);
	},
	
	onMouseWheel: function(delta) {
		delta = OE.Math.clamp(delta, -1.0, 1.0);
		this.camDist -= delta * 2.0;
		this.updateCamera();
	},
	onMouseDown: function(x, y, k) {
		this.xprev = x;
		this.yprev = y;
	},
	
	camDist: 25.0,
	xprev: 0, yprev: 0,
	onMouseMove: function(x, y) {
		if (this.mMouseDown[0]) {
			var dx = x - this.xprev;
			var dy = y - this.yprev;
			this.xprev = x;
			this.yprev = y;
			
			this.mCamera.mouseLook(dx, dy, -0.125);
			
			this.updateCamera();
		}
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
