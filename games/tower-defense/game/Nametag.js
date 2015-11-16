
var Nametag = OE.Utils.defClass2(OE.GameObject, {
	
	constructor: function() {
		OE.GameObject.call(this);
		
		this.bar = this.addChild(new OE.Plane(20.0, 2.5, 1, 1));
		this.bar.setMaterial("Nametag");
		
		this.setRotAxisAngle(OE.Vector3.RIGHT, 90.0);
		this.setPosf(0.0, 10.0, 0.0);
		
		this.setHealth(1.0);
	},
	
	setHealth: function(health) {
		this.health = health;
	},
	
	onUpdate: function() {
		if (this.health !== this.lastHealth) {
			var mtl = this.bar.mMaterial;
			if (mtl !== undefined && mtl.mLoadState === OE.Resource.LoadState.LOADED) {
				this.bar.setUniform(0, "health", this.health);
				this.lastHealth = this.health;
			}
		}
	}
});
