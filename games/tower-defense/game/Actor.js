
var Actor = OE.Utils.defClass2(OE.Sphere, {
	map: undefined,
	actor_id: 0,
	
	scale: 1.0,
	health: 50,
	healthMax: 50,
	bounty: 1,
	power: 1,
	
	accel: 0.1,
	friction: 0.75,
	velocity: undefined,
	target: undefined,
	
	lastWaypoint: undefined,
	nextNode: undefined,
	
	dead: false,
	
	constructor: function Actor(map, type) {
		OE.Sphere.call(this, map.gridScale * 0.5, 16);
		this.setMaterial("DefaultWhite");
		
		this.map = map;
		
		this.setActorType(type);
		
		this.setScalef(this.scale, this.scale, this.scale);
		this.setPosf(0.0, this.mRadius * this.scale, 0.0);
		this.velocity = new OE.Vector3(0.0);
		this.target = new OE.Vector3(0.0);
		
		this.nametag = this.addChild(new Nametag());
	},
	
	setActorType: function(type) {
		var info = app.actorData[type];
		this.actor_id = type;
		this.name = info.name;
		this.scale = info.scale;
		this.health = this.healthMax = info.health;
		this.accel = info.accel;
		this.bounty = info.bounty;
		this.power = info.power;
	},
	
	visitWaypoint: function(wp) {
		this.lastWaypoint = wp;
		if (wp.nextWaypoint === undefined) {
			app.userData.damage(this.power);
			this.dead = true;
			this.destroy();
		}
	},
	damage: function(power) {
		this.setHealth(this.health - power);
	},
	setHealth: function(health) {
		this.health = OE.Math.clamp(health, 0, this.healthMax);
		var f = this.health / this.healthMax;
		
		this.nametag.setHealth(f);
		
		if (this.health === 0 && !this.dead) {
			this.dead = true;
			this.dispatchEvent("killed");
			this.destroy();
		}
	},
	
	applyForce: function(accel) {
		this.velocity.addBy(accel);
	},
	walk: function(dir, mag) {
		dir.mulByf(mag * this.accel);
		this.velocity.addBy(accel);
	},
	
	visitWaypoint: function(wp) {
		this.lastWaypoint = wp;
		if (wp.nextWaypoint === undefined) {
			this.dead = false;
			this.destroy();
		}
	},
	visitNode: function(node) {
		this.nextNode = node;
		if (this.nextNode !== undefined) {
			this.nextNode = this.nextNode.next;
			if (this.nextNode !== undefined)
				this.map.getNavNodePos(this.target, this.nextNode);
		}
	},
	gotoTarget: function() {
		var p1 = this.getPos();
		var p2 = this.target;
		var dx = p2.x - p1.x;
		var dz = p2.z - p1.z;
		var d2 = dx*dx + dz*dz;
		if (d2 < 1.0) {
			this.visitNode(this.nextNode);
		}
		else {
			var d = Math.sqrt(d2);
			this.velocity.x += this.accel * dx / d;
			this.velocity.z += this.accel * dz / d;
		}
	},
	
	onUpdate: function() {
		OE.Sphere.prototype.onUpdate.call(this);
		
		var pos = this.getPos();
		
		if (this.lastWaypoint !== undefined &&
			this.lastWaypoint.nextWaypoint !== undefined) {
			var next = this.lastWaypoint.nextWaypoint;
			var p2 = next.getPos();
			var dx = p2.x - pos.x;
			var dz = p2.z - pos.z;
			var d2 = dx*dx + dz*dz;
			if (d2 < 1.0) {
				this.visitWaypoint(next);
			}
			else {
				if (this.nextNode === undefined)
					this.visitNode(this.map.getNearestNavNode(pos.x, pos.z));
				
				if (this.nextNode !== undefined)
					this.gotoTarget();
			}
		}
		
		this.velocity.mulByf(this.friction);
		pos.addBy(this.velocity);
		this.setPos(pos);
	},
	onDestroy: function() {}
});
