
var MapSystem = OE.Utils.defClass2(OE.GameObject, {
	
	sizeX: 5,
	sizeY: 5,
	size: 25,
	
	gridScale: 10.0,
	wallHeight: 10.0,
	
	waypoints: undefined,
	enemies: undefined,
	nav: undefined,
	
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
		this.nav = new NavMesh(this, w, h);
		
		this.objects = new Array(this.size);
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
	addTower: function(x, y, type) {
		if (app.towerData) {
			return this.setObject(x, y, new Tower(this, type));
		}
		return undefined;
	},
	addActor: function(x, y, type) {
		if (app.actorData) {
			var actor = this.addChild(new Actor(type));
			this.setObjectPos(actor, x, y);
			
			var key = this.enemies.insertNext(actor);
			
			actor.addEventListener("destroyed", function() {
				this.enemies.removeKey(key);
				app.userData.receive(actor.bounty);
				app.gui.updateUserInfo();
			}.bind(this));
			return actor;
		}
		return undefined;
	},
	
	setWaypointsActive: function(active) {
		for (var i=0; i<this.waypoints.length; i++) {
			this.waypoints[i].setActive(active);
		}
	},
	startRaid: function(callback) {
		this.setWaypointsActive(true);
		setTimeout(function() {
			callback();
		}, 45000);
	},
	stopRaid: function() {
		this.setWaypointsActive(false);
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
		else {
			this.objects[i] = undefined;
		}
		return obj;
	},
	isWall: function(x, y) {
		return (this.getObject(x, y) !== undefined);
	},
	
	init: function() {
		this.destroyAll();
		
		this.cursor = this.addChild(new OE.Box(this.gridScale, this.gridScale, this.gridScale));
		this.cursor.setMaterial("Cursor");
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
		this.addWaypoint(5, 5, undefined, true);
		this.addWaypoint(15, 15, 0);
	},
	generateWalls: function() {
		for (var y=0; y<this.sizeY; y++) {
			for (var x=0; x<this.sizeX; x++) {
				if (this.getObject(x, y) === undefined && Math.random() > 0.9) {
					this.setObject(x, y, new Wall(this));
				}
			}
		}
	},
	generateNavMesh: function() {
		// this.nav.updateMesh(); TODO
	},
	
	onUpdate: function() {},
	onDestroy: function() {}
});
