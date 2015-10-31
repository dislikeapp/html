OE.Math.intersectRayPlane = function(out, rayPos, rayDir, planePos, planeNorm) {
	var denom = planeNorm.dot(rayDir);
	if (Math.abs(denom) > OE.Math.EPSILON) {
		var diff = planePos.sub(rayPos);
		var t = diff.dot(planeNorm) / denom;
		if (t >= 0) {
			out.set(rayDir);
			out.mulByf(t);
			out.addBy(rayPos);
			return true;
		}
	}
	return false;
};

var Application = OE.Utils.defClass2(OE.BaseApp3D, {
	constructor: function() {
		OE.BaseApp3D.call(this);
	},
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
		OE.ResourceManager.declareLibrary("../../resource_libs/Default/Library.json", function() {
		OE.ResourceManager.declareLibrary("data/MyLibrary.json", function() {
			this.initScene();
		}.bind(this));
		}.bind(this));
	},
	initScene: function() {
		var scene = this.mScene;
		scene.addObject(this.mCamera);
		this.mCamera.setPosf(0.0, 0.0, this.camDist);
		
		var plane = scene.addObject(new OE.Plane(10, 10, 1, 1));
		plane.setMaterial("DefaultWhite");
		
		var box = scene.addObject(new OE.Box(2.0, 2.0, 2.0));
		box.setPosf(0.0, 1.0, 0.0);
		box.setMaterial("DefaultWhite");
		
		var sphere = scene.addObject(new OE.Sphere(1.0));
		sphere.setPosf(2.0, 1.0, 3.0);
		sphere.setMaterial("DefaultWhite");
		
		this.ball = sphere;
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
	onMouseMove: function(x, y) {
		if (this.mMouseDown[0]) {
			if (this.mKeyDown[16]) {
				var dx = x - this.xprev;
				var dy = y - this.yprev;
				this.xprev = x;
				this.yprev = y;
				
				this.mCamera.mLockY = true;
				this.mCamera.mouseLook(dx, dy, -0.075);
			}
			else {
				if (this.rayPos === undefined) this.rayPos = new OE.Vector3();
				if (this.rayDir === undefined) this.rayDir = new OE.Vector3();
				if (this.xPos === undefined) this.xPos = new OE.Vector3();
				
				this.mViewport.unproject(x, y, this.rayPos, this.rayDir);
				//this.rayPos.addBy(this.rayDir);
				
				if (OE.Math.intersectRayPlane(this.xPos,
												this.rayPos, this.rayDir,
												OE.Vector3.ZERO, OE.Vector3.UP)) {
					this.ball.setPosf(this.xPos.x, this.xPos.y+1.0, this.xPos.z);
				}
			}
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
	}
});
