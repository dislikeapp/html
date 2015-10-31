
var NavMesh = OE.Utils.defClass2({
	
	nodes: undefined,
	edges: undefined,
	
	sizeX: 5,
	sizeY: 5,
	size: 25,
	
	constructor: function(map, w, h) {
		
	},
	
	build: function() {
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
	}
});
