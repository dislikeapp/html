
var UserData = OE.Utils.defClass2({
	
	balance: 100,
	health: 100,
	
	constructor: function() {
	},
	
	charge: function(amount) {
		if (this.balance >= amount) {
			this.balance -= amount;
			return true;
		}
		return false;
	},
	receive: function(amount) {
		this.balance += amount;
	},

	damage: function(power) {
		if (this.health > 0)
			this.setHealth(this.health - power);
	},
	setHealth: function(health) {
		this.health = OE.Math.clamp(health, 0, this.healthMax);
		var f = 100.0 * this.health / this.healthMax;
		//this.hpbar.style.width = f.toFixed(0)+'%';
		
		if (this.health === 0 && !this.dead) {
			alert("you died");
			// this.dead = true;
			// this.destroy();
		}
	},
});
