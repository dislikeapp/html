
var UserData = OE.Utils.defClass2({
	
	balance: 0,
	health: 0,
	dead: true,
	
	constructor: function() {
		this.receive(100);
		this.setHealth(25);
	},
	
	setHealth: function(health) {
		this.health = health;
		if (this.health < 0)
			this.health = 0;
		this.dead = this.health === 0;
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
});
