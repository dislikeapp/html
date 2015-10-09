var Application = function() {
	OE.BaseApp3D.call(this);
};
Application.prototype = {
	onRun: function() {
		this.mRenderSystem = new OE.RenderSystem();
		
		var container = document.getElementById("appFrame");
		this.mSurface = this.mRenderSystem.createRenderSurface(container);
		
		var gl = OE.getActiveContext();
		gl.getExtension("OES_element_index_uint");
		
		this.mScene = new OE.Scene();
		this.mScene.setRenderSystem(this.mRenderSystem);
		
		this.loadResources();
	},
	loadResources: function() {
		OE.ResourceManager.declareLibrary("data/MyLibrary.json", function() {
		OE.ResourceManager.declareLibrary("../resource_libs/Default/Library.json", function() {
			this.initScene();
		}.bind(this));
		}.bind(this));
	},
	initScene: function() {
		this.mCamera = new OE.ForceCamera(this.mScene);
		this.mViewport = this.mSurface.createViewport(this.mCamera);
		this.mScene.addObject(this.mCamera);
		this.mCamera.setPosf(0,0,10);
		this.mCamera.mLockY = true;
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
	
	xprev: 0, yprev: 0,
	onMouseMove: function(x, y) {
		if (this.mMouseDown[0]) {
			var k = 0.1;
			
			var dx = x - this.xprev;
			var dy = y - this.yprev;
			this.xprev = x;
			this.yprev = y;
			
			this.mCamera.mouseLook(-dx, -dy, k);
		}
	},
	
	rota: new OE.Quaternion(),
	a: new OE.Vector3(),
	onUpdate: function() {
		var ax = 0.0, ay = 0.0, az = 0.0, aRot = 0.0;
		if (this.mKeyDown[OE.Keys.A]) ax -= 1.0;
		if (this.mKeyDown[OE.Keys.D]) ax += 1.0;
		if (this.mKeyDown[OE.Keys.F]) ay -= 1.0;
		if (this.mKeyDown[OE.Keys.R]) ay += 1.0;
		if (this.mKeyDown[OE.Keys.W]) az -= 1.0;
		if (this.mKeyDown[OE.Keys.S]) az += 1.0;
		
		if (this.mKeyDown[OE.Keys.Q]) aRot -= 1.0;
		if (this.mKeyDown[OE.Keys.E]) aRot += 1.0;
		
		if (ax !== 0.0 || ay !== 0.0 || az !== 0.0) {
			this.a.setf(ax, ay, az);
			this.a.normalize();
			this.a.mulByf(0.125);
			this.mCamera.accel(this.a, true);
		}
		
		if (aRot !== 0.0) {
			this.rota.fromAxisAngle(OE.Vector3.FORWARD, aRot);
			this.mCamera.rotAccel(this.rota);
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
