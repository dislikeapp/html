
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
	
	userData: undefined,
	gui: undefined,
	
	camPos: undefined,
	camDist: 75.0,
	
	STATE_BUILDING: 0,
	STATE_DEFENDING: 1,
	state: 0,
	
	constructor: function() {
		OE.BaseApp3D.call(this);
		
		this.camPos = new OE.Vector3(0.0, 1.0, 0.0);
		
		this.userData = new UserData();
		this.gui = new GUI();
		
		this.gui.setUserData(this.userData);
		
		OE.Utils.loadJSON("data/towers.json", function(json) {
			this.towerData = json;
			this.gui.createShop(json);
		}.bind(this));
		
		OE.Utils.loadJSON("data/enemies.json", function(json) {
			this.actorData = json;
		}.bind(this));
		
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
	//			app.initScene();
//				app.loadLevel(0);
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
		this.camPos.setf(0.0, 1.0, 0.0);
		
		var weather = this.mCamera.addChild(new WeatherSystem(750.0));
		weather.mBoundingBox = undefined;
		
		this.enemies = new Map();
		this.waypoints = new Array();
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
			
			this.addWaypoint(10, 10, true);
		}
	},
	
	addTower: function(x, y, type) {
		if (this.towerData) {
			return this.map.setObject(x, y, new Tower(type));
		}
		return undefined;
	},
	addWaypoint: function(x, y, isEmitter) {
		var wp = this.map.setObject(x, y, new Waypoint());
		wp.isEmitter = isEmitter;
		this.waypoints.push(wp);
		return wp;
	},
	addActor: function(x, y, type) {
		if (this.actorData) {
			var actor = this.mScene.addObject(new Actor(type));
			this.map.setObjectPos(actor, x, y);
			
			var key = this.enemies.insertNext(actor);
			
			actor.addEventListener("destroyed", function() {
				this.enemies.removeKey(key);
				this.userData.receive(actor.bounty);
				this.gui.updateUserInfo();
			}.bind(this));
			return actor;
		}
		return undefined;
	},
	
	onKeyDown: function(k) {
		if (k === OE.Keys.B) {
			// Hotkey for buying at shop.
		}
		else if (k === OE.Keys.L) {
			// Hotkey for selling at shop.
		}
		else if (k === OE.Keys.U) {
			// Hotkey for upgrading at shop.
		}
	},
	
	camDistVel: 0.0,
	onMouseWheel: function(delta) {
		delta = OE.Math.clamp(delta, -1.0, 1.0);
		this.camDistVel -= delta * 1.0;
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
					
					var object = this.map.getObject(cx, cy);
					this.gui.setSelection(object);
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
		this.camDist += this.camDistVel;
		this.camDistVel *= 0.875;
		if (this.camDist < 5.0) this.camDist = 5.0;
		
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
		
		// Do camera physics.
		rot.mulvBy(this.a);
		this.a.y = 0.0;
		this.a.normalize();
		this.a.mulByf(0.125);
		this.v.addBy(this.a);
		this.camPos.addBy(this.v);
		this.v.mulByf(this.friction);
		
		// Update camera constraints.
		pos.set(OE.Vector3.BACKWARD);
		rot.mulvBy(pos);
		pos.mulByf(this.camDist);
		pos.addBy(this.camPos);
		pos.y += 1.0;
		
		if (pos.y < 6.0) pos.y = 6.0;
		
		this.mCamera.setPos(pos);
	}
});
