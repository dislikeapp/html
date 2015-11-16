
var Tower = OE.Utils.defClass2(OE.PrefabInst, {
	
	map: undefined,
	
	tower_id: 0,
	upgrade_level: 0,
	
	series: "Sentry",
	
	offensive: true,
	range: 1.0,
	range2: 1.0,
	fireDelay: 120,
	power: 1,
	
	timer: 0,
	angle: 0.0,
	
	constructor: function Tower(map, type) {
		var info = app.towerData[type];
		OE.PrefabInst.call(this, info.series);
		
		this.map = map;
		this.tower_id = type;
		this.setUpgradeLevel(0);
		
		if (this.offensive) {
			this.sound = OE.SoundManager.getLoaded(this.series, function(sound) {
				sound.setTriggerLimit(1, 90); // Can only play 2 times within a 50 millisecond boundary.
			});
		}
		
		//this.muzzleFlash = this.addChild(new OE.Entity("MuzzleFlash"));
	},
	
	setUpgradeLevel: function(level) {
		this.upgrade_level = level;
		var info = app.towerData[this.tower_id];
		var levelInfo = info.levels[level];
		
		this.series = info.series;
		this.offensive = info.offensive === undefined ? true : info.offensive;
		
		if (this.offensive) {
			this.range = levelInfo.range * app.map.gridScale;
			this.range2 = this.range * this.range;
			this.fireDelay = levelInfo.delay;
			this.power = levelInfo.power;
		}
		
		var colors = [
			[1.25, 1.25, 1.25],
			[1.25, 0.25, 1.25],
			[0.25, 1.25, 0.25],
			[0.25, 1.25, 1.25],
			[1.25, 0.25, 0.25]];
		
		var entity = this.mChildren[0];
		if (entity instanceof OE.Entity) {
			var set = false;
			var sub = entity.mSubEntities[0];
			if (sub !== undefined && sub.mMaterial !== undefined && sub.mMaterial.mLoadState === OE.Resource.LoadState.LOADED) {
				sub.setUniform(0, "diffuse", colors[level]);
				set = true;
			}
			if (!set) {
				setTimeout(function() {
					this.setUpgradeLevel(level);
				}.bind(this), 100);
			}
		}
	},
	
	findTarget: function() {
		/*var keys = Object.keys(this.map.enemies.data);
		for (var i=keys.length-1; i>=0; i--) {
			var enemy = this.map.enemies.data[keys[i]];
			if (this.canTarget(enemy)) {
				this.target = enemy;
				return;
			}
		}*/
		for (var key in this.map.enemies.data) {
			var enemy = this.map.enemies.data[key];
			if (this.canTarget(enemy)) {
				this.target = enemy;
				return;
			}
		}
	},
	auxVec: undefined,
	fire: function() {
		/*this.muzzleFlash.mActive = true;
		setTimeout(function() {
			this.muzzleFlash.mActive = false;
		}, 100);*/
		
		if (this.auxVec === undefined) this.auxVec = new OE.Vector3();
		this.auxVec.set(this.getPos());
		this.auxVec.subBy(app.mCamera.getPos());
		
		var f = this.auxVec.length();
		f = 1.0-OE.Math.clamp(f/100.0, 0.0, 1.0);
		
		if (f > 0.05)
			this.sound.trigger({gain: f});
		
		if (this.target !== undefined) {
			this.target.damage(this.power);
			if (!this.canTarget(this.target))
				this.target = undefined;
		}
	},
	canTarget: function(actor) {
		if (actor.dead || actor.mScene === undefined)
			return false;
		
		var p1 = this.getPos();
		var p2 = actor.getPos();
		var dx = p2.x - p1.x;
		var dz = p2.z - p1.z;
		var d2 = dx*dx + dz*dz;
		if (d2 > this.range2)
			return false;
		
		return true;
	},
	faceTarget: function() {
		var p1 = this.getPos();
		var p2 = this.target.getPos();
		var rot = this.getRot();
		
		var dx = p2.x-p1.x;
		var dz = p2.z-p1.z;
		this.angle = Math.atan2(dz, dx) * OE.Math.RAD_TO_DEG;
		
		rot.fromAxisAngle(OE.Vector3.DOWN, this.angle-90.0);
		
		this.setRot(rot);
	},
	onUpdate: function() {
		if (this.offensive) {
			var pos = this.getPos();
			
			if (this.target === undefined)
				this.findTarget();
			else if (!this.canTarget(this.target))
				this.target = undefined;
			
			if (this.target !== undefined) {
				this.timer++;
				if (this.timer >= this.fireDelay) {
					this.timer = 0;
					if (this.target !== undefined) {
						this.faceTarget();
						this.fire();
					}
				}
			}
			else if (this.timer < this.fireDelay) {
				this.timer++;
			}
		}
	},
	onDestroy: function() {}
});
