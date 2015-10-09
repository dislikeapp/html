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
		this.mCamera1 = new OE.Camera(this.mScene);
		this.mCamera2 = new OE.Camera(this.mScene);
		this.mViewport1 = this.mSurface.createViewport(this.mCamera1);
		this.mViewport2 = this.mSurface.createViewport(this.mCamera2);
		this.mViewport1.setExtents(0, 0, 0.5, 1);
		this.mViewport2.setExtents(0.5, 0, 1, 1);
		this.mCamera = this.mCamera1;
		
		this.loadResources();
	},
	onResize: function(width, height) {
		var rect1 = this.mViewport1.getScreenRect();
		var rect2 = this.mViewport1.getScreenRect();
		var ratio1 = rect1.width / rect1.height;
		var ratio2 = rect2.width / rect2.height;
		this.mCamera1.setPerspective(45.0, ratio1, this.mClipNear, this.mClipFar);
		this.mCamera2.setPerspective(45.0, ratio2, this.mClipNear, this.mClipFar);
	},
	loadResources: function() {
		OE.ResourceManager.declareLibrary("data/MyLibrary.json",
			function() {
				this.initScene();
			}.bind(this)
		);
	},
	eyeSpacing: 1.0,
	initScene: function() {
		this.mEyes = this.mScene.addObject(new OE.GameObject());
		this.mEyes.addChild(this.mCamera1);
		this.mEyes.addChild(this.mCamera2);
		this.mCamera1.setPosf(-this.eyeSpacing, 0.0, 0.0);
		this.mCamera2.setPosf(this.eyeSpacing, 0.0, 0.0);
		
		this.mEyes.setPosf(0.0, 0.0, this.camDist);
		
		var diamond = new OE.Entity(
			OE.ModelManager.getLoaded("Tifa"),
			OE.MaterialManager.getLoaded("Solid"));
		
		this.mScene.addObject(diamond);
	},
	
	updateCamera: function() {
		var rot = this.mEyes.getRot();
		var pos = rot.getConjugate().getForward();
		pos.mulByf(this.camDist);
		this.mEyes.setPos(pos);
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
	
	camDist: 200.0,
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
			
			var rot = this.mEyes.getRot();
			this.rotx.fromAxisAngle(OE.Vector3.RIGHT, this.anglex);
			this.roty.fromAxisAngle(OE.Vector3.UP, this.angley);
			rot.set(this.roty);
			rot.mulBy(this.rotx);
			this.mEyes.setRot(rot);
			
			this.updateCamera();
		}
	}
};
OE.Utils.extend(Application, OE.BaseApp3D);
Application.prototype.constructor = Application;