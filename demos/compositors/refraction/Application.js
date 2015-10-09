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
		
		this.mViewport.mCompositor = new OE.ForwardCompositor(this.mViewport);
		
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
		
		var comp = this.mViewport.mCompositor;
		var rt1 = comp.getRenderTarget("OE_Forward_Opaque");
		var rt2 = comp.getRenderTarget("OE_Forward_Final");
		var rt3 = comp.getRenderTarget("OE_Forward_HDR");
		OE.TextureManager.declareUnmanaged("OE_Forward_Opaque", rt1.texture);
		OE.TextureManager.declareUnmanaged("OE_Forward_Final", rt2.texture);
		OE.TextureManager.declareUnmanaged("OE_Forward_HDR", rt3.texture);
		rt1.mMaterial = OE.MaterialManager.getLoaded("Blit");
		rt2.mMaterial = OE.MaterialManager.getLoaded("Blit");
		rt3.mMaterial = OE.MaterialManager.getLoaded("HDR");
		
		OE.MaterialManager.load("Glass", function(material) {
			var pass = material.mPasses[0];
			var shdr = pass.mShader;
			pass.mMtlParams.setUniform(shdr, "envImageSize", [rt1.width, rt1.height]);
		});
		OE.MaterialManager.load("Diamond", function(material) {
			var pass = material.mPasses[0];
			var shdr = pass.mShader;
			pass.mMtlParams.setUniform(shdr, "envImageSize", [rt1.width, rt1.height]);
		});
		
		/*var object = new OE.Entity(
			OE.ModelManager.getLoaded("Bunny_low"),
			OE.MaterialManager.getLoaded("Glass"));
		object.setPosf(0.0, -7.5, 0.0);
		this.mScene.addObject(object);*/
		
		var N = 1;
		for (var i=0; i<N*N; i++) {
			var x = (i%N - Math.floor(N/2)) * 20;
			var z = (Math.floor(i/N) - Math.floor(N/2)) * 20;
			var object = new OE.Entity(
				OE.ModelManager.getLoaded("Teapot_high"),
				OE.MaterialManager.getLoaded("Glass"));
			object.setPosf(x, -7.5, z);
			object.setPosf(x, 0.0, z);
			this.mScene.addObject(object);
		}
		
		var container = this.mScene.addObject(new OE.GameObject());
		var obj = container.addChild(new OE.Sphere(10.0, 32, 32));
		obj.mMaterial = OE.MaterialManager.getLoaded("Reflective");
		/*var obj = container.addChild(new OE.Emitter({
			emitClass: OE.Sphere,
			classArgs: [4.0, 16, 16],
			material: OE.MaterialManager.getLoaded("Reflective"),
			emitsPerBurst: 4,
			speedMin: 0.25,
			speedMax: 1.0
		}));*/
		obj.setPosf(0.0, 0.0, -50.0);
		var angle = 0.0;
		container.onUpdate = function() {
			angle += 0.125;
			this.setRotAxisAngle(OE.Vector3.UP, angle);
			var pos = obj.getPos();
			pos.y = Math.sin(angle * 0.1) * 10;
			obj.setPos(pos);
		};
		
		/*sphere = this.mScene.addObject(new OE.Sphere(10.0, 32, 32));
		sphere.mMaterial = OE.MaterialManager.getLoaded("Glass");
		sphere.setPosf(0.0, 0.0, 0.0);*/
		
		var envMap = new OE.Sphere(-500.0, 64, 64);
		envMap.mMaterial = OE.MaterialManager.getLoaded("EnvMap");
		
		this.mScene.addObject(envMap);
	},
	onResize: function(width, height) {
		this.mCamera.setPerspective(45.0, width / height, 0.001, 1000.0);
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
	
	camDist: 25.0,
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
			
			this.updateCamera();
		}
	}
};
OE.Utils.defClass(Application, OE.BaseApp3D);
