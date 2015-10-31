
function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}
function Map() {
	this.data = {};
	this.next = 0;
}
Map.prototype = {
	data: undefined,
	next: 0,
	
	clear: function() {
		this.data = {};
		this.next = 0;
	},
	get: function(key) {
		return this.data[key];
	},
	findNext: function() {
		while(this.data[this.next] !== undefined) {
			this.next++;
		}
		return this.next;
	},
	insert: function(key, value) {
		if (this.data[key] === undefined) {
			this.data[key] = value;
			if (isNumber(key) && key === this.next) {
				this.findNext();
			}
			return key;
		}
		return undefined;
	},
	insertNext: function(value) {
		var key = this.next;
		if (this.data[key] === undefined) {
			this.data[key] = value;
			this.findNext();
			return key;
		}
		this.findNext();
		return this.insertNext(value);
	},
	remove: function(value) {
		var count = 0;
		for (var key in this.data) {
			if (this.data[key] === value) {
				this.removeKey(key);
				count++;
			}
		}
		return count;
	},
	removeKey: function(key) {
		if (this.data[key] !== undefined) {
			delete this.data[key];
			if (isNumber(key) && key < this.next) {
				this.next = key;
			}
			return true;
		}
		return false;
	},
	removeNumericKey: function(key) {
		delete this.data[key];
		if (key < this.next) {
			this.next = key;
		}
		return true;
	}
};
Map.prototype.constructor = Map;
