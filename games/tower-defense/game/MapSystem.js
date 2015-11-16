
var MapSystem = OE.Utils.defClass2(OE.GameObject, {
	
	sizeX: 5,
	sizeY: 5,
	size: 25,
	
	gridScale: 10.0,
	wallHeight: 10.0,
	
	waypoints: undefined,
	enemies: undefined,
	nav: undefined,
	navDebug: false,
	
	constructor: function(w, h) {
		OE.GameObject.call(this);
		this.setGridSize(w, h);
		
		this.waypoints = new Array();
		this.enemies = new Map();
	},
	
	setGridSize: function(w, h) {
		this.sizeX = w;
		this.sizeY = h;
		this.size = w*h;
		this.objects = new Array(this.size);
	},
	
	init: function() {
		this.destroyAll();
		
		this.cursor = this.addChild(new OE.Box(this.gridScale, this.gridScale, this.gridScale));
		this.cursor.setMaterial("Cursor");
		
		//this.rangeHighlight = this.cursor.addChild(new OE.Box(2.0, 0.1, 2.0));
		//this.rangeHighlight.setMaterial("Range");
		
		this.rangeHighlight = this.cursor.addChild(new OE.DrawShapes());
		(function() {
			var elevation = 0.1;
			var color = new OE.Color(1.0, 0.0, 0.0, 1.0);
			var segs = 32;
			var draw = this.rangeHighlight;
			draw.setMaterial("Shapes");
			for (var i=0; i<segs; i++) {
				var t1 = OE.Math.TWO_PI * i/segs;
				var t2 = OE.Math.TWO_PI * (i+1)/segs;
				draw.line(	Math.cos(t1), elevation, Math.sin(t1),
							Math.cos(t2), elevation, Math.sin(t2),
							color, 1.0);
			}
			draw.updateBuffer();
		}.bind(this))();
		
		this.setRangeHighlight(undefined);
		this.hideCursor();
		
		var width = this.sizeX * this.gridScale;
		var height = this.sizeY * this.gridScale;
		
		var floor = this.addChild(new OE.Plane(width, height, this.sizeX, this.sizeY));
		floor.mTexWrapX = this.sizeX / 4;
		floor.mTexWrapY = this.sizeY / 4;
		floor.updateBuffer();
		floor.setMaterial("Concrete");
	},
	
	generateWaypoints: function() {
		var randx = function() {return Math.floor(Math.random()*this.sizeX);}.bind(this);
		var randy = function() {return Math.floor(Math.random()*this.sizeY);}.bind(this);
		
		this.addWaypoint(randx(), randy(), undefined, true);
		
		var x, y;
		while (x === undefined || this.getObject(x, y) !== undefined) {
			x = randx();
			y = randy();
		}
		this.addWaypoint(x, y, 0);
	},
	generateWalls: function() {
		for (var y=0; y<this.sizeY; y++) {
			for (var x=0; x<this.sizeX; x++) {
				if (this.getObject(x, y) === undefined && Math.random() > 0.9) {
					this.addWall(x, y);
				}
			}
		}
	},
	generateNavMesh: function() {
		this.nav = new NavMesh(this);
		this.nav.build();
		
		for (var y=0; y<this.sizeY; y++) {
			for (var x=0; x<this.sizeX; x++) {
				var obj = this.getObject(x, y);
				var blocking = (obj instanceof Wall) || (obj instanceof Tower);
				if (blocking)
					this.nav.notifyBlocked(x, y);
			}
		}
		
		this.generateNavMeshDebug();
	},
	generateBestPath: function() {
		if (this.waypoints.length > 1) {
			var emitter = this.waypoints[0];
			var target = this.waypoints[this.waypoints.length-1];
			var path = this.nav.dijkstra(
				emitter.map_pos_x, emitter.map_pos_y,
				 target.map_pos_x,  target.map_pos_y);
		}
	},
	generateNavMeshDebug: function() {
		if (!this.navDebug)
			return;
		
		if (this.navDraw === undefined) {
			this.navDraw = this.addChild(new OE.DrawShapes());
			this.navDraw.setMaterial("Shapes");
		}
		
		var draw = this.navDraw;
		draw.clear();
		draw.setPosf(this.sizeX * this.gridScale * -0.5 + this.gridScale * 0.5, 1.0,
					 this.sizeY * this.gridScale * -0.5 + this.gridScale * 0.5);
		
		var c = new OE.Color(1.0, 1.0, 1.0, 0.25);
		var c2 = new OE.Color(0.0, 1.0, 1.0, 1.0);
		
		var g = this.nav.graph;
		for (var id in g.nodes.data) {
			var n = g.nodes.data[id];
			var x = n.userData.map_x * this.gridScale;
			var y = n.userData.map_y * this.gridScale;
			draw.point(new OE.Vector3(x, 0.0, y), c, 10.0);
			
			var next = n.userData.pathData.next;
			if (next !== undefined) {
				var x2 = next.node.userData.map_x * this.gridScale;
				var y2 = next.node.userData.map_y * this.gridScale;
				draw.line(x, 0.0, y, x2, 0.0, y2, c2, 1.0);
			}
		}
		for (var id in g.edges.data) {
			var e = g.edges.data[id];
			var x1 = e.a.userData.map_x * this.gridScale;
			var y1 = e.a.userData.map_y * this.gridScale;
			var x2 = e.b.userData.map_x * this.gridScale;
			var y2 = e.b.userData.map_y * this.gridScale;
			draw.line(x1, 0.0, y1, x2, 0.0, y2, c, 1.0);
		}
		draw.updateBuffer();
	},
	
	getNavNodePos: function(out, pathNode) {
		var data = pathNode.node.userData;
		out.x = this.gridToWorldX(data.map_x);
		out.z = this.gridToWorldY(data.map_y);
	},
	getNearestNavNode: function(worldX, worldZ) {
		var x = this.worldToGridX(worldX);
		var y = this.worldToGridY(worldZ);
		if (this.nav.isOnMap(x, y)) {
			var n = this.nav.graph.nodes.data[this.sizeX*y+x];
			if (n !== undefined)
				return n.userData.pathData;
		}
		return undefined;
	},
	
	addWaypoint: function(x, y, prev, isEmitter) {
		if (isEmitter === undefined)
			isEmitter = false;
		
		var prevWp = (prev !== undefined) ? this.waypoints[prev] : undefined;
		
		var wp = this.setObject(x, y, new Waypoint(this, prevWp));
		wp.isEmitter = isEmitter;
		this.waypoints.push(wp);
		
		return wp;
	},
	addWall: function(x, y) {
		this.nav.notifyBlocked(x, y);
		if (this.pathObstructed()) {
			this.nav.notifyCleared(x, y);
			alert("Blocking!");
			this.generateBestPath();
			this.generateNavMeshDebug();
			return undefined;
		}
		else {
			this.generateBestPath();
			this.generateNavMeshDebug();
			return this.setObject(x, y, new Wall(this));
		}
	},
	addTower: function(x, y, type) {
		if (app.towerData) {
			this.nav.notifyBlocked(x, y);
			if (this.pathObstructed()) {
				this.nav.notifyCleared(x, y);
				alert("Blocking!");
				return undefined;
			}
			else {
				this.generateNavMeshDebug();
				return this.setObject(x, y, new Tower(this, type));
			}
		}
		return undefined;
	},
	addActor: function(x, y, type) {
		if (app.actorData) {
			var actor = this.addChild(new Actor(this, type));
			this.setObjectPos(actor, x, y);
			
			var key = this.enemies.insertNext(actor);
			actor.on("destroyed", function() {
				this.enemies.removeKey(key);
			}.bind(this));
			
			actor.on("killed", function() {
				app.userData.receive(actor.bounty);
				app.gui.updateUserInfo();
			});
			
			return actor;
		}
		return undefined;
	},
	
	pathObstructed: function() {
		var emitters = new Array();
		var trail = new Array();
		var targets = new Array();
		
		for (var i=0; i<this.waypoints.length; i++) {
			var wp = this.waypoints[i];
			if (wp.isEmitter)
				emitters.push(wp);
			else if (wp.nextWaypoint === undefined)
				targets.push(wp);
			else trail.push(wp);
		}
		for (var i=0; i<emitters.length; i++) {
			var emitter = emitters[i];
			var noPath = true;
			for (var j=0; j<emitters.length; j++) {
				var target = targets[j];
				var path = this.nav.dijkstra(
					emitter.map_pos_x, emitter.map_pos_y,
					 target.map_pos_x,  target.map_pos_y);
				if (path !== undefined) {
					noPath = false;
					break;
				}
			}
			if (noPath) return true;
		}
		return false;
		/*
		if (trail.length > 0) {
			var first = trail[0];
			for (var i=0; i<emitters.length; i++) {
				var wp = emitters[i];
				var path = this.nav.dijkstra(
					wp.map_pos_x, wp.map_pos_y,
					first.map_pos_x, first.map_pos_y);
				if (path === undefined) {
					return true;
				}
			}
			for (var i=0; i<trail.length-1; i++) {
				var wp = trail[i];
				var wp2 = trail[i+1];
				var path = this.nav.dijkstra(
					wp.map_pos_x, wp.map_pos_y,
					wp2.map_pos_x, wp2.map_pos_y);
				if (path === undefined) {
					return true;
				}
			}
		}
		return false;*/
	},
	
	setWaypointsActive: function(active) {
		for (var i=0; i<this.waypoints.length; i++)
			this.waypoints[i].setActive(active);
	},
	startRaid: function(callback) {
		this.setWaypointsActive(true);
	},
	stopRaid: function() {
		this.setWaypointsActive(false);
	},
	getHarder: function(amount) {
		for (var i=0; i<this.waypoints.length; i++)
			if (this.waypoints[i].isEmitter)
				this.waypoints[i].getHarder(amount);
	},
	
	setCursor: function(x, y) {
		this.cursorX = x;
		this.cursorY = y;
		this.cursor.mActive = true;
		
		var h = 0.5;
		var obj = this.getObject(x, y);
		if (obj !== undefined) {
			if (obj.mBoundingBox !== undefined) {
				h = obj.mBoundingBox.p2.y - obj.mBoundingBox.p1.y;
			}
			if (obj.range !== undefined) {
				this.setRangeHighlight(obj.range);
			}
			else {
				this.setRangeHighlight(undefined);
			}
		}
		else {
			this.setRangeHighlight(undefined);
		}
		this.cursor.mHeight = h;
		this.cursor.updateBuffer();
		this.cursor.setPosf(
			this.gridToWorldX(x), h/2.0,
			this.gridToWorldY(y));
	},
	hideCursor: function() {
		this.cursor.mActive = false;
	},
	setRangeHighlight: function(range) {
		if (range === undefined)
			this.rangeHighlight.mActive = false;
		else {
			this.rangeHighlight.mActive = true;
			this.rangeHighlight.setScalef(range, 1.0, range);
		}
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
	
	setObjectPos: function(obj, x, y) {
		var pos = obj.getPos();
		pos.x = this.gridToWorldX(x);
		pos.z = this.gridToWorldY(y);
		obj.setPos(pos);
	},
	
	getObject: function(x, y) {
		var i = this.sizeX*y+x;
		return this.objects[i];
	},
	setObject: function(x, y, obj) {
		var i = this.sizeX*y+x;
		var original = this.objects[i];
		
		if (original !== undefined)
			original.destroy();
		
		if (obj !== undefined) {
			this.objects[i] = this.addChild(obj);
			obj.map_pos_x = x;
			obj.map_pos_y = y;
			this.setObjectPos(obj, x, y);
		}
		else if (original !== undefined) {
			this.objects[i] = undefined;
			this.nav.notifyCleared(x, y);
			this.generateBestPath();
			this.generateNavMeshDebug();
		}
		return obj;
	},
	clearObject: function(x, y) {
		this.setObject(x, y, undefined);
	},
	isWall: function(x, y) {
		return (this.getObject(x, y) !== undefined);
	},
	
	onUpdate: function() {},
	onDestroy: function() {}
});
