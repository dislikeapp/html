
var Wall = OE.Utils.defClass2(OE.Box, {
	
	constructor: function Wall(map) {
		OE.Box.call(this, map.gridScale, map.wallHeight, map.gridScale);
		this.setMaterial("Wall");
		this.setPosf(0.0, map.wallHeight/2.0, 0.0);
	}
});
