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
		this.mCamera = new OE.ForceCamera(this.mScene);
		this.mViewport = this.mSurface.createViewport(this.mCamera);
		
		this.loadResources();
	},
	loadResources: function() {
		OE.ResourceManager.declareLibrary("data/MyLibrary.json",
			function() {
				this.initScene();
			}.bind(this)
		);
	},
	initScene: function() {
		this.mCamera.setPosf(0.0, 0.0, this.camDist);
		
		var obj = new OE.Entity(
			OE.ModelManager.getLoaded("TestScene"));
		
		obj.setScalef(0.01, 0.01, 0.01);
		obj.setPosf(0.0, -1.0, 0.0);
		
		this.mScene.addObject(this.mCamera);
		this.mScene.addObject(obj);
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
	
	camDist: 10.0,
	xprev: 0, yprev: 0,
	anglex: 0.0, angley: 0.0,
	rotx: new OE.Quaternion(), roty: new OE.Quaternion(),
	onMouseMove: function(x, y) {
		if (this.mMouseDown[0]) {
			var dx = x - this.xprev;
			var dy = y - this.yprev;
			this.xprev = x;
			this.yprev = y;
			this.angley += -dx * 0.25;
			this.anglex += -dy * 0.25;
			
			var rot = this.mCamera.getRot();
			this.rotx.fromAxisAngle(OE.Vector3.RIGHT, this.anglex);
			this.roty.fromAxisAngle(OE.Vector3.UP, this.angley);
			rot.set(this.roty);
			rot.mulBy(this.rotx);
			this.mCamera.setRot(rot);
		}
	},
	
	a: new OE.Vector3(),
	onUpdate: function() {
		var ax = 0.0, ay = 0.0, az = 0.0;
		if (this.mKeyDown[OE.Keys.A]) ax -= 1.0;
		if (this.mKeyDown[OE.Keys.D]) ax += 1.0;
		if (this.mKeyDown[OE.Keys.F]) ay -= 1.0;
		if (this.mKeyDown[OE.Keys.R]) ay += 1.0;
		if (this.mKeyDown[OE.Keys.W]) az -= 1.0;
		if (this.mKeyDown[OE.Keys.S]) az += 1.0;
		
		if (ax !== 0.0 || ay !== 0.0 || az !== 0.0) {
			this.a.setf(ax, ay, az);
			this.a.normalize();
			this.a.mulByf(0.05);
			this.mCamera.accel(this.a, true);
		}
		/*
		var left = this.mKeyDown[OE.Keys.Q];
		var right = this.mKeyDown[OE.Keys.E];
		if (left || right) {
			this.mCamera.rotAccel
		}*/
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
