
var Wall = OE.Utils.defClass2(OE.GameObject, {
	map: undefined,
	
	constructor: function Wall(map) {
		OE.GameObject.call(this);
		this.map = map;
	}
});
