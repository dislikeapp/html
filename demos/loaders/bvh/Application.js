OE.DrawShapes = function() {
	OE.GameObject.call(this);
	this.mPoints = new Array();
	this.mLines = new Array();
	this.mRenderables = new Array();
};
OE.DrawShapes.prototype = {
	mPoints: undefined,
	mLines: undefined,
	mRenderables: undefined,
	
	clearBuffers: function() {
		for (var i=0; i<this.mRenderables.length; i++) {
			this.mRenderables[i].mVertexData.clear();
		}
		this.mRenderables = new Array();
	},
	clear: function() {
		this.mPoints = new Array();
		this.mLines = new Array();
		this.clearBuffers();
	},
	point: function(pos, color, size) {
		if (color === undefined) color = OE.Color.WHITE;
		if (size === undefined) size = 4.0;
		this.mPoints.push({
			pos: pos,
			color: color,
			size: size});
	},
	line: function(x1, y1, z1, x2, y2, z2, color, size) {
		this.mLines.push({
			src: new OE.Vector3(x1, y1, z1),
			dst: new OE.Vector3(x2, y2, z2),
			color: color,
			size: size});
	},
	updateBuffer: function() {
		var obj = this;
		
		this.clearBuffers();
		
		if (this.mPoints.length > 0) {
			var vertexData = new OE.VertexData();
			vertexData.addAttribute(OE.VertexAttribute.POSITION);
			vertexData.addAttribute(OE.VertexAttribute.COLOR);
			vertexData.addCustomAttribute(0, OE.VertexAttribute.Type.FLOAT, 1);
			vertexData.setNumVertices(this.mPoints.length);
			var vbo = vertexData.createBuffer();
			var buffer = vbo.map(vertexData.getByteSize());
			for (var i=0; i<this.mPoints.length; i++) {
				var p = this.mPoints[i];
				buffer.putVec3(p.pos);
				buffer.putColor4f(p.color);
				buffer.putFloat(p.size);
			}
			vbo.unmap();
			
			var r = new OE.Renderable();
			r.mVertexData = vertexData;
			r.getRenderOperation = function(op) {
				op.mType = OE.RenderOperation.Type.POINTS;
				op.mModelMatrix = obj.mWorldTransform.getMatrix();
				op.mVertexData = vertexData;
				op.mMaterial = obj.mMaterial;
			};
			this.mRenderables.push(r);
		}
		if (this.mLines.length > 0) {
			var vertexData = new OE.VertexData();
			vertexData.addAttribute(OE.VertexAttribute.POSITION);
			vertexData.addAttribute(OE.VertexAttribute.COLOR);
			vertexData.addCustomAttribute(0, OE.VertexAttribute.Type.FLOAT, 1);
			vertexData.setNumVertices(this.mLines.length*2);
			var vbo = vertexData.createBuffer();
			var buffer = vbo.map(vertexData.getByteSize());
			for (var i=0; i<this.mLines.length; i++) {
				var line = this.mLines[i];
				buffer.putVec3(line.src);
				buffer.putColor4f(line.color);
				buffer.putFloat(line.size);
				
				buffer.putVec3(line.dst);
				buffer.putColor4f(line.color);
				buffer.putFloat(line.size);
			}
			vbo.unmap();
			
			var r = new OE.Renderable();
			r.mVertexData = vertexData;
			r.getRenderOperation = function(op) {
				op.mType = OE.RenderOperation.Type.LINES;
				op.mModelMatrix = obj.mWorldTransform.getMatrix();
				op.mVertexData = vertexData;
				op.mMaterial = obj.mMaterial;
			};
			this.mRenderables.push(r);
			
		}
	},
	queueRenderables: function(rq) {
		for (var i=0; i<this.mRenderables.length; i++) {
			rq.queueRenderable(this.mRenderables[i]);
		}
	}
};
OE.Utils.defClass(OE.DrawShapes, OE.GameObject);


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
		
		var hsvRoot = this.mScene.addObject(new OE.DrawShapes());
		hsvRoot.mMaterial = OE.MaterialManager.getLoaded("Shapes");
		
		hsvRoot.point(new OE.Vector3(0,0,0), OE.Color.WHITE, 10.0);
		hsvRoot.point(new OE.Vector3(1,0,0), OE.Color.RED, 10.0);
		hsvRoot.point(new OE.Vector3(0,1,0), OE.Color.GREEN, 10.0);
		hsvRoot.point(new OE.Vector3(0,0,1), OE.Color.BLUE, 10.0);
		
		hsvRoot.line(0,0,0,1,0,0, OE.Color.RED, 10.0);
		hsvRoot.line(0,0,0,0,1,0, OE.Color.GREEN, 10.0);
		hsvRoot.line(0,0,0,0,0,1, OE.Color.BLUE, 10.0);
		
		hsvRoot.updateBuffer();
		
		OE.Utils.loadFile("data/Animations/Example1.bvh", function(content) {
			
			content = content.replace(/(\r\n|\n|\r)/gm, " ");
			var parts = content.match(/^\s*HIERARCHY\s+ROOT\s+(\S+)\s*{(.*)}\s*MOTION\s*(.+)$/);
			
			var rootName = parts[1];
			var hStr = parts[2];
			var mStr = parts[3];
			
			var hChildStr = hStr;
			while (hChildStr !== undefined) {
				var info = hChildStr.match(/^\s*OFFSET\s+([^{}]+)\s+CHANNELS\s+([^{}]+)\s+JOINT\s+(\S+)\s*\{(.*)\} $/);
				offset = info[1];
				channels = info[2];
				childName = info[3];
				hChildStr = info[4];
			}
			
			var isWhiteSpace = function(c) {
				return (c === " "    || c === "\t" ||
						c === "\n"   || c === "\r" ||
						c === "\r\n" || c === "\f" ||
						c === "\v");
			};
			var done = false;
			var EAT_WHITESPACE = 0;
			var state = EAT_WHITESPACE;
			var nextState = 1;
			for (var ci = 0; ci < content.length; ci++) {
				var c = content[ci];
				switch (state) {
					case EAT_WHITESPACE:
						if (isWhiteSpace(c)) {
							// Do nothing
						}
						else {
							ci--;
							state = nextState;
						}
						break;
				}
			}
		});
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
	
	camDist: 10.0,
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
