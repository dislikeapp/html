
var Waypoint = OE.Utils.defClass2(OE.GameObject, {
	
	isEmitter: false,
	difficulty: 0.0,
	
	constructor: function Waypoint() {
		OE.GameObject.call(this);
		var box = this.addChild(new OE.Box(
			1.0,
			app.map.gridScale,
			1.0));
		box.setMaterial("DefaultWhite");
		box.setPosf(0.0, app.map.gridScale/2.0, 0.0);
		
		this.mBoundingBox = box.mBoundingBox;
	},
	
	getHarder: function() {
		if (this.difficulty < 1) {
			this.difficulty += 0.05;
			if (this.difficulty >= 1)
				this.difficulty = 1;
		}
	},
	
	emitEnemy: function() {
		var minType = OE.Math.linInterp(0, app.actorData.length-2, this.difficulty);
		var maxType = OE.Math.linInterp(2, app.actorData.length, this.difficulty);
		var curve = OE.Math.linInterp(2.0, 0.75, this.difficulty);
		var type = Math.floor(OE.Math.linInterp(
								minType,
								maxType,
								Math.pow(Math.random(), curve)));
		var actor = app.addActor(this.map_pos_x, this.map_pos_y, type);
		
		var offx = Math.cos(Math.random() * OE.Math.TWO_PI) * 0.025;
		var offz = Math.sin(Math.random() * OE.Math.TWO_PI) * 0.025;
		
		actor.onUpdate = function() {
			Actor.prototype.onUpdate.call(this);
			this.velocity.x += Math.cos(Math.random() * OE.Math.TWO_PI) * 0.025 + offx;
			this.velocity.z += Math.sin(Math.random() * OE.Math.TWO_PI) * 0.025 + offz;
		};
	},
	emitWave: function() {
		this.emitting = true;
		var emits = 0;
		var emit = function() {
			emits++;
			this.emitEnemy();
			
			var size = OE.Math.linInterp(this.difficulty*0.5, 1.0, Math.random());
			var base = OE.Math.linInterp(4.0, 5.0, size);
			if (Math.random() < base / emits) {
				setTimeout(emit, 1000);
			}
			else {
				this.getHarder();
				this.emitting = false;
			}
		}.bind(this);
		
		emit();
	},
	
	emitting: false,
	timer: 600,
	delay: 900,
	onUpdate: function() {
		if (this.isEmitter) {
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
