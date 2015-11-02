
var UserData = OE.Utils.defClass2({
	
	balance: 0,
	
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
});
