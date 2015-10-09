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
		
		this.mViewport.mCompositor = new OE.DeferredCompositor(this.mViewport);
		
		this.loadResources();
	},
	loadResources: function() {
		var packs = "http://omniserver.no-ip.biz/main/projects/oe-js/resource_packs/";
		var a = this;
		OE.ResourceManager.declareLibrary("data/MyLibrary.json", function() {
		OE.ResourceManager.declareLibrary(packs+"Default/Library.json", function() {
		OE.ResourceManager.declareLibrary(packs+"TestScene/Lib_TestScene.json", function() {
				a.initScene();
		});
		});
		});
	},
	initScene: function() {
		this.mCamera.setPosf(0.0, 0.0, 10.0);
		
		var comp = this.mViewport.mCompositor;
		var G = comp.getRenderTarget("OE_Deferred_GBuffer");
		var F = comp.getRenderTarget("OE_Deferred_Final");
		var L = comp.getRenderTarget("OE_Deferred_Light");
		//OE.TextureManager.declareUnmanaged("OE_Deferred_Position", G.textures[0]);
		//OE.TextureManager.declareUnmanaged("OE_Deferred_Normal", G.textures[1]);
		//OE.TextureManager.declareUnmanaged("OE_Deferred_Albedo", G.textures[2]);
		//OE.TextureManager.declareUnmanaged("OE_Deferred_Final", F.textures[0]);
		G.mMaterial = OE.MaterialManager.getLoaded("Blit");
		L.mMaterial = OE.MaterialManager.getLoaded("Blit");
		F.mMaterial = OE.MaterialManager.getLoaded("Deferred");
		
		G.textures[0].mLoadState = 2;
		G.textures[1].mLoadState = 2;
		G.textures[2].mLoadState = 2;
		F.textures[0].mLoadState = 2;
		L.textures[0].mLoadState = 2;
		
		OE.MaterialManager.load("Glass", function(material) {
			var pass = material.mPasses[0];
			var shdr = pass.mShader;
			pass.mMtlParams.setUniform(shdr, "envImageSize", [G.width, G.height]);
		});
		
		var N = 1;
		for (var i=0; i<N*N; i++) {
			var x = (i%N - Math.floor(N/2)) * 20;
			var z = (Math.floor(i/N) - Math.floor(N/2)) * 20;
			var object = new OE.Entity(
				OE.ModelManager.getLoaded("Teapot_high"),
				OE.MaterialManager.getLoaded("Glass"));
			object.setPosf(x, -7.5, z);
			object.setPosf(x, 0.0, z);
			object.setScalef(0.05, 0.05, 0.05);
			this.mScene.addObject(object);
		}
		
		N = 3;
		for (var i=0; i<N*N; i++) {
			var x = (i%N - Math.floor(N/2)) * 20;
			var z = (Math.floor(i/N) - Math.floor(N/2)) * 20;
			var object = new OE.PointLight(10.0);
			object.setPosf(x, 5.0, z);
			this.mScene.addObject(object);
		}
		
		var obj = new OE.Entity(
			OE.ModelManager.getLoaded("TestScene"));
		
		obj.setScalef(0.01, 0.01, 0.01);
		obj.setPosf(0.0, -1.0, 0.0);
		
		this.mScene.addObject(this.mCamera);
		this.mScene.addObject(obj);
	},
	
	onKeyDown: function(k) {
		var comp = this.mViewport.mCompositor;
		var G = comp.getRenderTarget("OE_Deferred_GBuffer");
		switch (k) {
			case 48: G.setBlitTex(0); break;
			case 49: G.setBlitTex(1); break;
			case 50: G.setBlitTex(2); break;
			case 51: G.setBlitTex(3); break;
		}
	},
	onMouseDown: function(x, y, k) {
		this.xprev = x;
		this.yprev = y;
	},
	
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
