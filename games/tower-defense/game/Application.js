
var Timer = OE.Utils.defClass2({
	callback: undefined,
	handler: undefined,
	delay: undefined,
	
	timeout: undefined,
	timeStarted: undefined,
	timeFinished: undefined,
	
	constructor: function(callback, delay) {
		this.callback = callback;
		this.delay = delay;
		this.handler = this.handler.bind(this);
	},
	start: function() {
		if (this.isRunning()) {
			this.stop();
		}
		this.timeStarted = Date.now();
		this.timeout = setTimeout(this.handler, this.delay);
	},
	stop: function() {
		if (this.isRunning()) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
		}
	},
	skipToEnd: function() {
		if (this.isRunning()) {
			clearTimeout(this.timeout);
			this.timeout = undefined;
			this.handler();
		}
	},
	handler: function() {
		this.callback();
		this.timeFinished = Date.now();
		clearTimeout(this.timeout);
		this.timeout = undefined;
	},
	
	isRunning: function() {
		return (this.timeout !== undefined);
	},
	getTimeLeft: function() {
		var ms = (this.timeStarted - Date.now()) + this.delay;
		return ms / 1000;
	}
});

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
	camDist: 100.0,
	
	STATE_CALM: 0,
	STATE_RAID: 1,
	state: 0,
	
	gridSizeX: 15,
	gridSizeY: 15,
	
	calmStateTime: 25000, // 25 seconds
	raidStateTime: 45000, // 45 seconds
	calmTimer: undefined,
	raidTimer: undefined,
	difficultyStep: 0.02, // 2% harder, 50 waves until max difficulty.
	
	constructor: function() {
		OE.BaseApp3D.call(this);
		
	},
	onRun: function() {
		var rs = this.mRenderSystem = new OE.RenderSystem();
		var rt = this.mSurface = new OE.WebGLSurface("appFrame");
		
		this.mScene = new OE.Scene();
		this.mScene.setRenderSystem(rs);
		this.mCamera = new OE.ForceCamera(this.mScene);
		this.mViewport = rt.createViewport(this.mCamera);
		
		this.camPos = new OE.Vector3(0.0, 1.0, 1.0);
		this.userData = new UserData();
		this.gui = new GUI();
		this.gui.setUserData(this.userData);
		
		this.calmTimer = new Timer(function() {
			this.changeState(this.STATE_RAID);
		}.bind(this), this.calmStateTime);
		
		this.raidTimer = new Timer(function() {
			this.changeState(this.STATE_CALM);
		}.bind(this), this.raidStateTime);
		
		OE.Utils.loadJSON("data/towers.json", function(json) {
			this.towerData = json;
			this.gui.createShop(json);
		}.bind(this));
		
		OE.Utils.loadJSON("data/enemies.json", function(json) {
			this.actorData = json;
		}.bind(this));
		
		//rot.fromAxisAngle(OE.Vector3.RIGHT, -30.0);

		// TODO: Im setting this camera Rotation so it starts in a reasonable place
		// The MouseMove function makes a call to mouseLook which seems to think the camera is still at
		// 0, 0
		//this.mCamera.setRot(rot);
		//this.mCamera.mouseLook(0, -10, 1);
		//this.mCamera.mMLookX = -0.075;
		var i;
		for (i = 0; i < 225; ++i) {
			this.haxCode(1, i); // Lol brad this is genius
		}
	},
	onFinish: function() {},
	
	initMenu: function() {
		OE.SoundManager.load("Menu", function(sound) {
			sound.setLoop(true);
			sound.play();
		});
	},
	initScene: function() {
		this.mScene.addObject(this.mCamera);
		this.mCamera.setNearPlane(0.5);
		this.mCamera.setFarPlane(1000.0);
		
		var weather = this.mCamera.addChild(new WeatherSystem(750.0));
		weather.mBoundingBox = undefined;
		
		OE.SoundManager.load("Menu", function(sound) {
			sound.stop();
		});
		OE.SoundManager.load("BGM", function(sound) {
			sound.setLoop(true);
			sound.play();
		});
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
			this.map = scene.addObject(new MapSystem(this.gridSizeX, this.gridSizeY));
			this.map.init();
			this.map.setLoader(new ForestLoader(this.map));
			this.map.generateNavMesh();
			this.map.generateLevel();
			this.map.generateBestPath();
			
			this.changeState(this.STATE_CALM);
		}
	},
	
	comeAtMe: function() {
		if (this.state === this.STATE_CALM) {
			this.calmTimer.skipToEnd();
		}
	},
	
	changeState: function(state) {
		this.exitState();
		this.state = state;
		this.enterState();
	},
	enterState: function() {
		switch (this.state) {
			case this.STATE_CALM: {
				this.calmTimer.start();
				this.map.stopRaid();
				this.gui.setGameState(this.state);
				break;
			};
			case this.STATE_RAID: {
				this.map.generateBestPath();
				this.raidTimer.start();
				this.map.startRaid();
				this.gui.setGameState(this.state);
				break;
			};
		}
	},
	exitState: function() {
		switch (this.state) {
			case this.STATE_CALM: {
				break;
			};
			case this.STATE_RAID: {
				this.map.getHarder(this.difficultyStep);
				break;
			};
		}
	},
	
	onKeyDown: function(k) {
		if (k === OE.Keys.B) {
			this.gui.buySelected();
		}
		else if (k === OE.Keys.L) {
			this.gui.sellSelected();
		}
		else if (k === OE.Keys.U) {
			this.gui.upgradeSelected();
		}
		else if (k === OE.Keys.R) {
			var x = this.map.cursorX;
			var y = this.map.cursorY;
			if (this.map.cursor && this.map.cursor.mActive) {
				if (this.map.getObject(x, y) instanceof Wall) {
					this.map.setObject(x, y, undefined);
				}
				else {
					this.map.addWall(x, y);
				}
			}
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
		// Retain both the shift-click zoom from before and try out right-click zoom
		if ((this.mKeyDown[16] && this.mMouseDown[0]) || this.mMouseDown[2] ) {
			this.haxCode(x, y);
//            var dx = x - this.xprev;
//            var dy = y - this.yprev;
//            this.xprev = x;
//            this.yprev = y;
//				
//            this.mCamera.mLockY = true;
//            this.mCamera.mouseLook(dx, dy, -0.075);
		}
	},
	
	haxCode: function(x, y) {
		var dx = x - this.xprev;
		var dy = y - this.yprev;
		this.xprev = x;
		this.yprev = y;
		
		this.mCamera.mLockY = true;
		this.mCamera.mouseLook(dx, dy, -0.075);
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
