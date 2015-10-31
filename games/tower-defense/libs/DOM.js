
Element.prototype.getElementsByName = function(arg) {
	var returnList = [];
	(function BuildReturn(startPoint) {
		for (var child in startPoint) {
			if (startPoint[child].nodeType != 1)
				continue;
			
			if (startPoint[child].getAttribute("name") == arg)
				returnList.push(startPoint[child]);
			
			if (startPoint[child].childNodes.length > 0)
				BuildReturn(startPoint[child].childNodes);
		}
	})(this.childNodes);
	return returnList;
};
/*
EventTarget.prototype.addEventListenerBase = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function(event, handler) {
	this.addEventListenerBase.apply(this, arguments);
	
	if (this.mEventList === undefined)
		this.mEventList = new Array();
	
	this.mEventList.push({event: event, handler: handler});
};
EventTarget.prototype.removeEventListenerBase = EventTarget.prototype.removeEventListener;
EventTarget.prototype.removeEventListener = function(event, handler) {
	this.removeEventListenerBase.apply(this, arguments);
	
	if (this.mEventList === undefined)
		this.mEventList = new Array();
	
	for (var i=0; i<this.mEventList.length; i++) {
		var e = this.mEventList[i];
		if (e.event === event && e.handler === handler) {
			this.mEventList.splice(i, 1);
			i--;
		}
	}
};
EventTarget.prototype.removeAllEventListeners = function(event) {
	if (this.mEventList === undefined)
		this.mEventList = new Array();
	
	if (event === undefined) {
		for (var i=0; i<this.mEventList.length; i++) {
			var e = this.mEventList[i];
			this.removeEventListenerBase(e.event, e.handler);
		}
		this.mEventList = new Array();
	}
	else {
		for (var i=0; i<this.mEventList.length; i++) {
			var e = this.mEventList[i];
			if (e.event === event) {
				this.removeEventListenerBase(event, e.handler);
				this.mEventList.splice(i, 1);
				i--;
			}
		}
	}
};*/

Element.prototype.findByName = function(name) {
	var list = this.getElementsByName(name);
	if (list === undefined) return undefined;
	if (list.length === 0) return undefined;
	return list[0];
};

Element.prototype.on = function() {
	this.addEventListener.apply(this, arguments);
};

Element.prototype.load = function(src, onLoaded) {
	Utils.ajaxStatic(src, function(response) {
		this.innerHTML = response;
		if (onLoaded) onLoaded();
	}.bind(this));
};

Element.prototype.isDescendant = function(parent, includeSelf) {
	if (includeSelf === true && parent === this)
		return true;
	
	var node = this.parentNode;
	while (node !== null) {
		if (node === parent)
			return true;
		
		node = node.parentNode;
	}
	return false;
};
