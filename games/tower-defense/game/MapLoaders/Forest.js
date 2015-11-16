
var ForestLoader = OE.Utils.defClass2({
	map: undefined,
	
	wallPrefabs: [
		"Forest/Tree1",
		"Forest/Tree2",
		//"Forest/Tree3",
		"Forest/Rock1",
		"Forest/Rock2"
		//"Forest/Rock3"
	],
	
	constructor: function(map) {
		this.map = map;
	},
	
	pick: function(arr) {
		return arr[Math.floor(Math.random()*arr.length)];
	},
	
	createWall: function() {
		var wall = new Wall(this.map);
		var tree = wall.addChild(new OE.PrefabInst(this.pick(this.wallPrefabs)));
		tree.setRotAxisAngle(OE.Vector3.UP, Math.random()*360.0);
		return wall;
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
		floor.setMaterial("Forest/Grass");
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
					map.addWall(x, y);
				}
			}
		}
	}
});
