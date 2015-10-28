
var MapSystem = OE.Utils.defClass2(OE.GameObject, {
	
	data: undefined,
	
	sizeX: 5,
	sizeY: 5,
	size: 25,
	
	gridScale: 10.0,
	wallHeight: 5.0,
	
	constructor: function() {
		OE.GameObject.call(this);
		this.data = new Array(this.size);
	},
	
	setGridSize: function(w, h) {
		this.sizeX = w;
		this.sizeY = h;
		this.size = w*h;
		this.data = new Array(this.size);
	},
	
	setCursor: function(x, y) {
		this.cursorX = x;
		this.cursorY = y;
		this.cursor.mActive = true;
		this.cursor.setPosf(
			this.gridToWorldX(x), this.gridScale/2.0,
			this.gridToWorldY(y));
	},
	hideCursor: function() {
		this.cursor.mActive = false;
	},
	
	worldToGridX: function(value) {
		return Math.floor(value / this.gridScale + this.sizeX/2.0);
	},
	worldToGridY: function(value) {
		return Math.floor(value / this.gridScale + this.sizeY/2.0);
	},
	gridToWorldX: function(value) {
		return value * this.gridScale + this.gridScale*(1.0 - this.sizeX)/2.0;
	},
	gridToWorldY: function(value) {
		return value * this.gridScale + this.gridScale*(1.0 - this.sizeY)/2.0;
	},
	
	getObject: function(x, y) {
		var i = this.mSizeX*y+x;
		return this.objects[i];
	},
	setObject: function(x, y, obj) {
		var i = this.mSizeX*y+x;
		var original = this.objects[i];
		this.objects[i] = this.addChild(obj);
		if (original !== undefined)
			original.destroy();
	},
	isWall: function(x, y) {
		return (this.getObject(x, y) !== undefined);
	},
	
	build: function() {
		this.destroyAll();
		
		this.cursor = this.addChild(new OE.Sphere(this.gridScale/2.0));
		this.cursor.setMaterial("DefaultWhite");
		this.hideCursor();
		
		var width = this.sizeX * this.gridScale;
		var height = this.sizeY * this.gridScale;
		
		var floor = this.addChild(new OE.Plane(width, height, this.sizeX, this.sizeY));
		floor.mTexWrapX = this.sizeX / 4;
		floor.mTexWrapY = this.sizeY / 4;
		floor.updateBuffer();
		floor.setMaterial("Concrete");
		
		this.objects = new Array(this.size);
		
		for (var y=0; y<this.sizeY; y++) {
			var fy = y/this.sizeY;
			for (var x=0; x<this.sizeX; x++) {
				var fx = x/this.sizeX;
				var i = this.sizeX*y+x;
				if (Math.random() > 0.9) {
					this.data[i] = 1;
				}
			}
		}
		
		var whh = this.wallHeight / 2.0;
		
		for (var y=0; y<this.sizeY; y++) {
			var fy = y/this.sizeY;
			for (var x=0; x<this.sizeX; x++) {
				var fx = x/this.sizeX;
				var i = this.sizeX*y+x;
				var value = this.data[i];
				var obj = undefined;
				
				if (value === 1) {
					obj = this.addChild(new OE.Box(this.gridScale, this.wallHeight, this.gridScale));
					obj.setMaterial("Bricks");
					/*obj.setPosf(
						(fx-0.5)*this.sizeX * gs + gsh, whh,
						(fy-0.5)*this.sizeY * gs + gsh);*/
					obj.setPosf(
						this.gridToWorldX(x), whh,
						this.gridToWorldY(y));
				}
				
				this.objects[i] = obj;
			}
		}
	},
	
	onUpdate: function() {},
	onDestroy: function() {}
});
