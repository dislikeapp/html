OE.LensFlare = OE.Utils.defClass2(OE.GameObject, OE.Renderable, OE.HasMaterial, {
	mVertexData: undefined,
	mAlpha: 1.0,
	
	constructor: function() {
		OE.GameObject.call(this);
		OE.HasMaterial.call(this);
		
		this.updateBuffer();
		this.mBoundingBox = new OE.BoundingBox();
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, 1.0, 1.0);
	},
	
	clearBuffer: function() {
		if (this.mVertexData !== undefined) {
			this.mVertexData.clear();
			this.mVertexData = undefined;
		}
	},
	
	updateBuffer: function() {
		this.clearBuffer();
		
		var vertexData = this.mVertexData = new OE.VertexData();
		vertexData.addAttributes(OE.VertexAttribute.POSITION,
								 OE.VertexAttribute.TEXCOORD,
								 OE.VertexAttribute.custom(0, OE.VertexAttribute.Type.FLOAT, 1),
								 OE.VertexAttribute.custom(1, OE.VertexAttribute.Type.FLOAT, 1));
		
		var numBillboards = Math.floor(Math.random() * 10) + 50;
		var numVerts = numBillboards * 6;
		vertexData.setNumVertices(numVerts);
		
		/*var verts = [ // Counter-clockwise
			0.0, 0.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0];*/
		var verts = [ // Reversed
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 0.0,
			1.0, 1.0,
			0.0, 1.0];
		
		var p = new OE.Vector3();
		var t = new OE.Vector2();
		
		var vert = function(buffer, p, t, f1, f2) {
			buffer.putVec3(p);
			buffer.putVec2(t);
			buffer.putFloat(f1);
			buffer.putFloat(f2);
		};
		
		var vbo = vertexData.createBuffer();
		var buffer = vbo.map(vertexData.getByteSize());
		for (var i = 0; i < numBillboards; i++) {
			var dist = i === 0 ? 0.0 : Math.random() * 2.5 - 0.125;
			var domain = i === 0 ? 1.0 : Math.pow(Math.random() * 0.8, 5.0);
			
			for (var j = 0; j < verts.length; j+=2) {
				var fx = verts[j];
				var fy = verts[j+1];
				p.setf(fx*2-1, fy*2-1, 0.0);
				t.setf(fx, fy);
				vert(buffer, p, t, dist, domain);
			}
		}
		vbo.unmap();
	},
	
	onUpdate: function() {
		
	},
	
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this, OE.RenderQueue.Layer.Lights);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLES;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
});
