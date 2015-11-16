
var Waypoint = OE.Utils.defClass2(OE.GameObject, {
	
	map: undefined,
	
	active: false,
	isEmitter: false,
	difficulty: 0.0,
	
	prevWaypoint: undefined,
	nextWaypoint: undefined,
	
	constructor: function Waypoint(map, prev) {
		OE.GameObject.call(this);
		
		var box = this.addChild(new OE.Box(
			1.0,
			map.gridScale,
			1.0));
		box.setMaterial("DefaultWhite");
		box.setPosf(0.0, map.gridScale/2.0, 0.0);
		this.mBoundingBox = box.mBoundingBox;
		
		this.map = map;
		
		this.prevWaypoint = prev;
		
		if (prev !== undefined)
			prev.nextWaypoint = this;
	},
	
	getHarder: function(amount) {
		if (this.difficulty < 1) {
			this.difficulty += amount;
			if (this.difficulty >= 1)
				this.difficulty = 1;
		}
	},
	
	emitEnemy: function() {
		var minType = OE.Math.linInterp(0, app.actorData.length-2, this.difficulty);
		var maxType = OE.Math.linInterp(2, app.actorData.length, this.difficulty);
		var curve = OE.Math.linInterp(1.75, 0.75, this.difficulty);
		var type = Math.floor(OE.Math.linInterp(
								minType,
								maxType,
								Math.pow(Math.random(), curve)));
		var actor = this.map.addActor(this.map_pos_x, this.map_pos_y, type);
		
		actor.visitWaypoint(this);
	},
	emitWave: function() {
		this.emitting = true;
		var count = 0;
		var waveSize = OE.Math.linInterp(this.difficulty*0.5, 1.0, Math.random());
		
		var emit = function() {
			if (this.active) {
				count++;
				this.emitEnemy();
				
				var base = OE.Math.linInterp(4.0, 6.0, waveSize);
				if (Math.random() < base / count) {
					this.nextEmitTimeout = setTimeout(emit, 600);
				}
				else {
					this.nextEmitTimeout = undefined;
					this.emitting = false;
				}
			}
		}.bind(this);
		
		emit();
	},
	
	setActive: function(active) {
		if (active) this.activate();
		else this.deactivate();
	},
	activate: function() {
		if (!this.active) {
			this.active = true;
			this.timer = this.delay - 60;
		}
	},
	deactivate: function() {
		this.active = false;
		this.timer = 0;
		if (this.nextEmitTimeout !== undefined) {
			clearTimeout(this.nextEmitTimeout);
			this.nextEmitTimeout = undefined;
		}
		this.emitting = false;
	},
	
	emitting: false,
	timer: 0,
	delay: 300,
	onUpdate: function() {
		if (this.isEmitter && this.active) {
			if (!this.emitting) {
				this.timer++;
				if (this.timer >= this.delay) {
					this.timer = 0;
					this.emitWave();
				}
			}
		}
	},
	onDestroy: function() {}
});
