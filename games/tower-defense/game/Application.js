
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
	camPos: undefined,
	camDist: 75.0,
	
	STATE_BUILDING: 0,
	STATE_DEFENDING: 1,
	state: 0,
	
	constructor: function() {
		OE.BaseApp3D.call(this);
		
		this.camPos = new OE.Vector3(0.0, 1.0, 0.0);
	},
	onRun: function() {
		var rs = this.mRenderSystem = new OE.RenderSystem();
		var rt = this.mSurface = new OE.WebGLSurface("appFrame");
		
		this.mScene = new OE.Scene();
		this.mScene.setRenderSystem(rs);
		this.mCamera = new OE.ForceCamera(this.mScene);
		this.mViewport = rt.createViewport(this.mCamera);
		
		declareResources(function() {
			preloadResources("textures", function() {
			preloadResources("shaders", function() {
			preloadResources("materials", function() {
			preloadResources("models", function() {
				app.initScene();
				app.loadLevel(0);
			});
			});
			});
			});
		});
	},
	onFinish: function() {},
	
	initScene: function() {
		this.mScene.addObject(this.mCamera);
		this.mCamera.setNearPlane(0.5);
		this.mCamera.setFarPlane(1000.0);
		
		var weather = this.mCamera.addChild(new WeatherSystem(750.0));
		weather.mBoundingBox = undefined;
	},
	resetScene: function() {
		this.mScene.mRoot.removeChild(this.mCamera);
		this.mScene.clear();
		this.initScene();
	},
	
	loadLevel: function(level) {
		this.resetScene();
		var scene = this.mScene;
		if (level === 0) {
			this.map = scene.addObject(new MapSystem());
			this.map.setGridSize(20, 20);
			this.map.build();
		}
	},
	
	onMouseWheel: function(delta) {
		delta = OE.Math.clamp(delta, -1.0, 1.0);
		this.camDist -= delta * 5.0;
		if (this.camDist < 0.0) this.camDist = 0.0;
	},
	
	xprev: 0, yprev: 0,
	rayPos: undefined,
	rayDir: undefined,
	xPos: undefined,
	onMouseDown: function(x, y, k) {
		this.xprev = x;
		this.yprev = y;
		
		if (k === 0 && !this.mKeyDown[16]) {
			if (this.rayPos === undefined) this.rayPos = new OE.Vector3();
			if (this.rayDir === undefined) this.rayDir = new OE.Vector3();
			if (this.xPos === undefined) this.xPos = new OE.Vector3();
			
			if (this.map) {
				this.mViewport.unproject(x, y, this.rayPos, this.rayDir);
				this.rayPos.addBy(this.rayDir);
				
				if (OE.Math.intersectRayPlane(this.xPos,
												this.rayPos, this.rayDir,
												OE.Vector3.ZERO, OE.Vector3.UP)) {
					var cx = this.map.worldToGridX(this.xPos.x);
					var cy = this.map.worldToGridY(this.xPos.z);
					this.map.setCursor(cx, cy);
				}
			}
		}
	},
	onMouseMove: function(x, y) {
		if (this.mKeyDown[16]) {
			if (this.mMouseDown[0]) {
				var dx = x - this.xprev;
				var dy = y - this.yprev;
				this.xprev = x;
				this.yprev = y;
				
				this.mCamera.mLockY = true;
				this.mCamera.mouseLook(dx, dy, -0.075);
			}
		}
	},
	onMouseUp: function(x, y, k) {},
	
	a: undefined,
	v: undefined,
	friction: 0.95,
	
	onUpdate: function() {
		if (this.a === undefined) this.a = new OE.Vector3();
		if (this.v === undefined) this.v = new OE.Vector3();
		var a = this.a;
		a.x = a.z = 0.0;
		if (this.mKeyDown[OE.Keys.W]) a.z -= 1.0;
		if (this.mKeyDown[OE.Keys.A]) a.x -= 1.0;
		if (this.mKeyDown[OE.Keys.S]) a.z += 1.0;
		if (this.mKeyDown[OE.Keys.D]) a.x += 1.0;
		
		var rot = this.mCamera.getRot();
		var pos = this.mCamera.getPos();
		
		rot.mulvBy(this.a);
		this.a.mulByf(0.125);
		this.a.y = 0.0;
		this.v.addBy(this.a);
		this.camPos.addBy(this.v);
		this.v.mulByf(this.friction);
		
		pos.set(OE.Vector3.BACKWARD);
		rot.mulvBy(pos);
		pos.mulByf(this.camDist);
		pos.addBy(this.camPos);
		pos.y += 1.0;
		
		if (pos.y < 5.0) pos.y = 5.0;
		
		this.mCamera.setPos(pos);
	}
});
