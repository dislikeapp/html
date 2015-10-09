
OE.BatchedGeom = OE.Utils.defClass2(OE.GameObject, {
	mBatches: undefined,
	mEntities: undefined,
	mModels: undefined,
	
	constructor: function() {
		OE.GameObject.call(this);
		this.mBatches = new Array();
		this.mEntities = new Array();
		this.mModels = new Array();
	},
	addModel: function(model) {
		this.mModels.push(model);
	},
	addEntity: function(entity) {
		this.mEntities.push(entity);
	},
	clear: function() {
		this.clearBatches();
		this.clearEntities();
	},
	clearBatches: function() {
		for (var i=0; i<this.mBatches.length; i++) {
			this.mBatches[i].clear();
		}
		this.mBatches = new Array();
	},
	clearEntities: function() {
		this.mEntities = new Array();
		this.mModels = new Array();
	},
	compile: function() {
		this.clearBatches();
		
		var processMesh = function(model, index) {
			var mesh = model.mMeshes[index];
			var mtl = model.mMtlMapping[index];
			var vf = mesh.mVertexFormat;
			var found = false;
			for (var i=0; i<this.mBatches.length; i++) {
				var batch = this.mBatches[i];
				if (batch.mMaterial === mtl && batch.mVertexFormat.mAttributes.length === vf.mAttributes.length) {
					batch.mMeshes.push(mesh);
					found = true;
					break;
				}
			}
			if (!found) {
				var batch = new OE.BatchedGeom.Batch(this);
				this.mBatches.push(batch);
				batch.mMaterial = mtl;
				batch.mVertexFormat = vf;
				batch.mMeshes.push(mesh);
			}
		}.bind(this);
		
		for (var i=0; i<this.mEntities.length; i++) {
			var model = this.mEntities[i].mModel;
			for (var j=0; j<model.mMeshes.length; j++) {
				processMesh(model, j);
			}
		}
		for (var i=0; i<this.mModels.length; i++) {
			var model = this.mModels[i];
			for (var j=0; j<model.mMeshes.length; j++) {
				processMesh(model, j);
			}
		}
		for (var i=0; i<this.mBatches.length; i++) {
			var batch = this.mBatches[i];
			batch.mMaterial = OE.MaterialManager.getLoaded(batch.mMaterial);
			batch.compile();
		}
	},
	queueRenderables: function(rq) {
		for (var i=0; i<this.mBatches.length; i++)
			rq.queueRenderable(this.mBatches[i]);
	}
});

OE.BatchedGeom.Batch = OE.Utils.defClass2(OE.Renderable, {
	mBatchedGeom: undefined,
	mVertexFormat: undefined,
	mMeshes: undefined,
	mMaterial: undefined,
	
	constructor: function(batchedGeom) {
		OE.Renderable.call(this);
		this.mBatchedGeom = batchedGeom;
		this.mVertexFormat = undefined;
		this.mMeshes = new Array();
		this.mMaterial = undefined;
	},
	clear: function() {
		this.clearBuffers();
		this.clearMeshes();
	},
	clearBuffers: function() {
		if (this.mVertexData)
			this.mVertexData.clear();
		if (this.mIndexData)
			this.mIndexData.clear();
		this.mVertexData = undefined;
		this.mIndexData = undefined;
	},
	clearMeshes: function() {
		this.mMeshes = new Array();
	},
	compile: function() {
		this.clearBuffers();
		
		var numVerts = 0;
		var numIndices = 0;
		for (var i=0; i<this.mMeshes.length; i++) {
			numVerts += this.mMeshes[i].mNumVertices;
			numIndices += this.mMeshes[i].mNumIndices;
		}
		
		var vertData = this.mVertexData = new OE.VertexData();
		vertData.mAttributes = this.mVertexFormat.mAttributes;
		vertData.mVertexSize = this.mVertexFormat.mVertexSize;
		/*vertData.addAttribute(OE.VertexAttribute.POSITION);
		vertData.addAttribute(OE.VertexAttribute.NORMAL);
		vertData.addAttribute(OE.VertexAttribute.TEXCOORD);*/
		vertData.setNumVertices(numVerts);
		
		var vbo = vertData.createBuffer();
		var buffer = vbo.map(vertData.getByteSize());
		for (var i=0; i<this.mMeshes.length; i++) {
			var mesh = this.mMeshes[i];
			for (var j=0; j<mesh.mVertexData.length; j++) {
				buffer.putFloat(mesh.mVertexData[j]);
			}
		}
		vbo.unmap();
		
		var indexData = this.mIndexData = new OE.IndexData();
		indexData.setNumIndices(numIndices);
		
		var vertSize = vertData.mVertexSize / 4;
		var firstIndex = 0;
		var ibo = indexData.createBuffer();
		var buffer = ibo.map(indexData.getByteSize());
		for (var i=0; i<this.mMeshes.length; i++) {
			var mesh = this.mMeshes[i];
			for (var j=0; j<mesh.mIndexData.length; j++) {
				buffer.putUint(firstIndex + mesh.mIndexData[j]);
			}
			firstIndex += mesh.mVertexData.length / vertSize;
		}
		ibo.unmap();
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLES;
		op.mModelMatrix = this.mBatchedGeom.getWorldMatrix();
		op.mVertexData = this.mVertexData;
		op.mIndexData = this.mIndexData;
		op.mMaterial = this.mMaterial;
	}
});
