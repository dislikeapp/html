
var UserData = OE.Utils.defClass2(OE.Observable, {
	balance: 0,
	health: 0,
	dead: true,
	
	constructor: function() {
		OE.Observable.call(this);
		this.receive(100);
		this.setHealth(25);
	},
	
	setHealth: function(health) {
		this.health = health;
		if (this.health < 0)
			this.health = 0;
		var wasDead = this.dead;
		this.dead = (this.health === 0);
		this.dispatchEvent("healthChange");
		
		if (this.dead !== wasDead) {
			if (this.dead) {
				alert("you dead");
				this.dispatchEvent("die");
			}
			else {
				this.dispatchEvent("revive");
			}
		}
	},
	damage: function(power) {
		if (this.health > 0) {
			this.setHealth(this.health - power);
			this.dispatchEvent("damage");
		}
	},
	
	charge: function(amount) {
		if (this.balance >= amount) {
			this.balance -= amount;
			this.dispatchEvent("balanceChange");
			return true;
		}
		return false;
	},
	receive: function(amount) {
		this.balance += amount;
		this.dispatchEvent("balanceChange");
	}
});
