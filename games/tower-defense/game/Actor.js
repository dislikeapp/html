
var Actor = OE.Utils.defClass2(OE.Sphere, {
	map: undefined,
	actor_id: 0,
	
	scale: 1.0,
	health: 50,
	healthMax: 50,
	bounty: 1,
	
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
		
		this.nametag = document.createElement("div");
		this.nametag.setAttribute("class", "nametag healthbar");
		document.body.appendChild(this.nametag);
		
		this.hpbar = document.createElement("div");
		this.hpbar.setAttribute("class", "bar");
		this.nametag.appendChild(this.hpbar);
	},
	
	setActorType: function(type) {
		var info = app.actorData[type];
		this.actor_id = type;
		this.name = info.name;
		this.scale = info.scale;
		this.health = this.healthMax = info.health;
		this.accel = info.accel;
		this.bounty = info.bounty;
	},
	
	damage: function(power) {
		this.setHealth(this.health - power);
	},
	setHealth: function(health) {
		this.health = OE.Math.clamp(health, 0, this.healthMax);
		var f = 100.0 * this.health / this.healthMax;
		this.hpbar.style.width = f.toFixed(0)+'%';
		
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
	
	wpos: undefined,
	spos: undefined,
	updateNametagPos: function() {
		if (this.wpos === undefined) this.wpos = new Array(4);
		if (this.spos === undefined) this.spos = new Array(4);
		
		var wpos = this.mWorldTransform.getPos();
		var view = app.mCamera.getViewMatrix();
		var proj = app.mCamera.getProjectionMatrix();
		this.wpos[0] = wpos.x;
		this.wpos[1] = wpos.y + this.mRadius;
		this.wpos[2] = wpos.z;
		this.wpos[3] = 1.0;
		mat4.multiplyVec4(view, this.wpos, this.spos);
		mat4.multiplyVec4(proj, this.spos, this.spos);
		var w = app.mSurface.mCanvas.offsetWidth;
		var h = app.mSurface.mCanvas.offsetHeight;
		var ntx = w * ((this.spos[0] / this.spos[3])*0.5+0.5);
		var nty = -h * ((this.spos[1] / this.spos[3])*0.5+0.5);
		ntx -= this.nametag.offsetWidth/2;
		nty -= this.nametag.offsetHeight/2;
		this.nametag.style.transform = 'translate3d('+ntx+'px,'+nty+'px,0px)';
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
	
	nametagTimer: 0,
	onUpdate: function() {
		OE.Sphere.prototype.onUpdate.call(this);
		
		this.nametagTimer++;
		if (this.nametagTimer >= 1) {
			this.nametagTimer = 0;
			this.updateNametagPos();
		}
		
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
	onDestroy: function() {
		document.body.removeChild(this.nametag);
	}
});
