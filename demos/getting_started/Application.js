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
		
		OE.ShaderManager.declare("Solid", "data/Shaders/Solid.json");
		OE.MaterialManager.declare("White", "data/Materials/White.json");
		
		this.initScene();
	},
	initScene: function() {
		this.mCamera.setPosf(0.0, 0.0, 15.0);
		
		var radius = 5.0;
		var sphere = this.mScene.addObject(new OE.Sphere(radius, 31));
		sphere.mMaterial = OE.MaterialManager.getLoaded("White");
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
