
var DefaultLoader = OE.Utils.defClass2({
	map: undefined,
	
	constructor: function(map) {
		this.map = map;
	},
	
	generate: function() {
		this.generateScene();
		this.generateWaypoints();
		this.generateWalls();
	},
	
	generateScene: function() {
		var map = this.map;
		
		var width = map.sizeX * map.gridScale;
		var height = map.sizeY * map.gridScale;
		var floor = map.addChild(new OE.Plane(width, height, map.sizeX, map.sizeY));
		floor.mTexWrapX = map.sizeX / 4;
		floor.mTexWrapY = map.sizeY / 4;
		floor.updateBuffer();
		floor.setMaterial("Concrete");
	},
	generateWaypoints: function() {
		var map = this.map;
		
		var randx = function() {return Math.floor(Math.random()*map.sizeX);};
		var randy = function() {return Math.floor(Math.random()*map.sizeY);};
		
		map.addWaypoint(randx(), randy(), undefined, true);
		
		var x, y;
		while (x === undefined || map.getObject(x, y) !== undefined) {
			x = randx();
			y = randy();
		}
		var wp = map.addWaypoint(x, y, 0);
	},
	generateWalls: function() {
		var map = this.map;
		
		for (var y=0; y<map.sizeY; y++) {
			for (var x=0; x<map.sizeX; x++) {
				if (map.getObject(x, y) === undefined && Math.random() > 0.9) {
					var wall = map.addWall(x, y);
					var box = wall.addChild(new OE.Box(map.gridScale, map.wallHeight, map.gridScale));
					box.setMaterial("Wall");
					box.setPosf(0.0, map.wallHeight/2.0, 0.0);
				}
			}
		}
	}
});
