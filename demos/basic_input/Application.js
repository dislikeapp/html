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
		OE.ResourceManager.declareLibrary("data/MyLibrary.json",
			function() {
				this.initScene();
			}.bind(this)
		);
	},
	initScene: function() {
		this.mCamera.setPosf(0.0, 0.0, this.camDist);
		
		var diamond = new OE.Entity(
			OE.ModelManager.getLoaded("Diamond"),
			OE.MaterialManager.getLoaded("Diamond"));
		
		this.mScene.addObject(diamond);
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
	
	xprev: 0, yprev: 0,
	camDist: 10.0,
	onMouseMove: function(x, y) {
		if (this.mMouseDown[0]) {
			var dx = x - this.xprev;
			var dy = y - this.yprev;
			this.xprev = x;
			this.yprev = y;
			
			this.mCamera.mouseLook(-dx, -dy, 0.25);
			this.updateCamera();
		}
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
