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
		this.mCamera.setPosf(0.0, 1.5, 10.0);
		this.mCamera.setRotAxisAngle(OE.Vector3.RIGHT, -12.0);
		
		var diamond = new OE.Entity(
			OE.ModelManager.getLoaded("Diamond"),
			OE.MaterialManager.getLoaded("Diamond"));
		
		this.mScene.addObject(diamond);
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
