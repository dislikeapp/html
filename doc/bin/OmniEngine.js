/* OmniEngine.js
 * Author: Tom Krcmar (tomkrcmar@gmail.com)
 * Website: http://omniserver.no-ip.biz
 * Copyright 2015 by Thomas Krcmar. All Rights Reserved.
 * 
 * OmniEngine-JS is a full scale game engine implemented in Javascript using an object
 * oriented approach. The mission of the project is to provide as many triple-A features
 * as possible while keeping the application level code clean, neat, and easy to
 * understand, by taking care of the complex tasks of high performance rendering,
 * material composition, resource management and loading on-demand, game logic/mechanics,
 * physics, input, etc. under the hood, and keeping the underlying techniques abstracted
 * away from the game programmer.
 * 
 */

var OE = {};
/**
 * @class: Utils
 * @module: General
 * @description: A group of useful utility functions for you to utilize 
 *
 */
OE.Utils = {};

OE.Utils.splitLines = function(str) {
	return str.match(/[^\r\n]+/g);
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
OE.Utils.splitFirstToken = function(str) {
	var m = str.match(/^\s*(\S+)\s+(.*)/);
	if (m) return m.slice(1);
	return undefined;
	//return str.match(/(\r\n|[\n\v\f\r\x85\u2028\u2029])/g);
};
OE.Utils.isPathAbsolute = function(path) {
	var r = new RegExp('^(?:[a-z]+:)?//', 'i');
	return r.test(path);
}
OE.Utils.extend = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined && key !== "constructor") {
			child.prototype[key] = parent.prototype[key];
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined && key !== "constructor") {
			child[key] = parent[key];
		}
	}
};
OE.Utils.implement = function(child, parent) {
	// Merge prototype members.
	for (var key in parent.prototype) {
		if (child.prototype[key] === undefined && key !== "constructor") {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
	// Merge static members.
	for (var key in parent) {
		if (child[key] === undefined && key !== "constructor") {
			var parentName = parent.name;
			var childName = child.name;
			console.warn("[Utils.Implement] Error: Un-implemented static property in class '"+childName+"': '"+key+"' from interface '"+parentName+"'");
		}
	}
};

/**
 * @method defClass(constr[, ...])
 * @description defClass defines a class based on the constructor, and unlimited number of parent classes
 * @param constr - Constructor for the class to be defined
 * @param [...] - class to inherit from
 * @deprecated defClass will be changing before release to be more like the current defClass2
 */
OE.Utils.defClass = function(constr) {
	constr.prototype.constructor = constr;
	constr.constructor = constr;
	for (var i=1; i<arguments.length; i++) {
		OE.Utils.extend(constr, arguments[i]);
	}
}

/**
 * @method defClass2([... ,] Object prototype)
 * @description defClass2 is an alternative way to define a class using an unlimited amount of arguments
 * @param [...] Unlimited number of parent Object classes to inherit from
 * @param prototype Pass an object to class definition which will inherit all the optional parent arguments
 * @return constr a constructor to create an object of prototype (or undefined if invalid parameters)
 */
OE.Utils.defClass2 = function() {
	if (arguments.length > 0) {
		var prot = arguments[arguments.length-1];
		if (prot !== undefined) {
			if (prot.constructor === undefined)
				prot.constructor = Object;
			var constr = prot.constructor;
			constr.prototype = prot;
			for (var i=0; i<arguments.length-1; i++) {
				OE.Utils.extend(constr, arguments[i]);
			}
			return constr;
		}
	}
	return undefined;
}

OE.Utils.merge = function(dst, src) {
	for (var key in src) {
		if (dst[key] === undefined)
			dst[key] = src[key];
	}
};
OE.Utils.clone = function(obj, shallow) {
	if (obj == undefined || obj == null || typeof(obj) != 'object')
		return obj;
	var temp = new obj.constructor();
	for (var key in obj) {
		temp[key] = shallow ? obj[key] : OE.Utils.clone(obj[key]);
	}
	return temp;
};
OE.Utils.ajaxRequest = function(url, params, onResponse, onError) {
	var request;
	try {
		request = new XMLHttpRequest();
	}
	catch (e) {
		try {
			request = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch (e) {
			try {
				request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch (e) {
				if (onError) onError("Http request is not supported.");
				return false;
			}
		}
	}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (onResponse) onResponse(request.responseText);
		}
	}
	request.open("POST", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.send(params);
};
OE.Utils.ajaxStatic = function(url, onResponse, onError) {
	var request;
	try {
		request = new XMLHttpRequest();
	}
	catch (e) {
		try {
			request = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch (e) {
			try {
				request = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch (e) {
				if (onError) onError("Http request is not supported.");
				return false;
			}
		}
	}
	request.onreadystatechange = function() {
		if (request.readyState == 4 && request.status == 200) {
			if (onResponse) onResponse(request.responseText);
		}
	}
	request.open("GET", url, true);
	request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	request.setRequestHeader("Cache-Control", "must-revalidate");
	request.send();
};
OE.Utils.loadFile = function(filePath, onLoaded, onError) {
	OE.Utils.ajaxStatic(filePath,
		function(response) {
			if (onLoaded) onLoaded(response);
		},
		function(message) {
			if (onError) onError(message);
		}
	);
};
OE.Utils.loadFiles = function(filePaths, onLoaded, onError, onFinished) {
	var states = [];
	for (var i=0; i<filePaths.length; i++)
		states.push(0);
	
	var checkStates = function() {
		var done = true;
		var numLoaded = 0;
		var numErrors = 0;
		for (var i=0; i<states.length; i++) {
			var j = i;
			if (states[j] == 0) {
				done = false;
				setTimeout(function() {
					if (states[j] == 0) {
						requestFile(j);
					}
				}, 1000);
			}
			else {
				if (states[j] == 1) numLoaded++;
				if (states[j] == 2) numErrors++;
			}
		}
		if (done) {
			if (onFinished) onFinished(numLoaded, numErrors);
		}
	};
	var requestFile = function(index) {
		OE.Utils.ajaxStatic(filePaths[index],
			function(response) {
				if (onLoaded) onLoaded(response, index);
				states[index] = 1;
				checkStates();
			},
			function(message) {
				if (onError) onError(message, index);
				states[index] = 2;
				checkStates();
			}
		);
	};
	for (var i=0; i<filePaths.length; i++) {
		requestFile(i);
	}
};
OE.Utils.loadJSON = function(filePath, onLoaded, onError) {
	OE.Utils.loadFile(filePath,
		function(response) {
			var json = undefined;
			try {
				json = JSON.parse(response);
			}
			catch (e) {
				if (onError) onError("JSON syntax error.");
			}
			if (json) {
				if (onLoaded) onLoaded(json);
			}
		},
		function(message) {
			if (onError)
				onError(message);
		}
	);
};
OE.Utils.loadJSONFiles = function(filePaths, onLoaded, onError, onFinished) {
	var jsonArray = [];
	for (var i=0; i<filePaths.size; i++)
		jsonArray.push(undefined);
	
	OE.Utils.loadFiles(filePaths,
		function(response, index) {
			var json = undefined;
			try {
				json = JSON.parse(response);
			}
			catch (e) {
				if (onError) onError("JSON syntax error.", index);
			}
			if (json) {
				if (onLoaded) onLoaded(json, index);
				jsonArray[index] = json;
			}
		},
		function(message, index) {
			if (onError)
				onError(message, index);
		},
		function(numLoaded, numErrors) {
			if (onFinished)
				onFinished(jsonArray, numLoaded, numErrors);
		}
	);
};
/**
 * @class BaseApp
 * @module Application
 * @description A base class for most game applications.
 * 
 * BaseApp is mostly just a convenience class, in that you can initialize a [WebGLRenderSurface], [RenderSystem], [Scene], [Camera], and [Viewport] in your onRun callback, and this class will facilitate some common default behavior so you don't have to. Advanced users might choose not to extend BaseApp, and write their apps from scratch.
 */
OE.BaseApp = function() {};
OE.BaseApp.prototype = {
	mRenderSystem: undefined,
	mSurface: undefined,
	mScene: undefined,
	mCamera: undefined,
	mViewport: undefined,
	
	run: function() {
		this.onRun();
		
		var rt = this.mSurface;
		var rs = this.mRenderSystem;
		
		var gl = rt.mContext;
		gl.getExtension("OES_standard_derivatives");
		gl.getExtension("OES_element_index_uint");
		gl.enable(gl.DEPTH_TEST);
		gl.enable(gl.CULL_FACE);
		gl.cullFace(gl.BACK);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
		this.mKeyDown = new Array(256);
		this.mMouseDown = new Array(3);
		rt.addEventListener("keydown", this.keyDown.bind(this));
		rt.addEventListener("keyup", this.keyUp.bind(this));
		rt.addEventListener("mousedown", this.mouseDown.bind(this));
		rt.addEventListener("mouseup", this.mouseUp.bind(this));
		rt.addEventListener("mousemove", this.mouseMove.bind(this));
		rt.addEventListener("mousewheel", this.mouseWheel.bind(this));
		
		rt.addEventListener("resize", this.resize.bind(this));
		rt.addEventListener("frameRendered", this.frameRendered.bind(this));
		
		this.triggerResize();
	},
	triggerResize: function() {
		this.resize(this.mSurface.mCanvas.offsetWidth, this.mSurface.mCanvas.offsetHeight);
	},
	resize: function(width, height) {
		if (this.onResize)
			this.onResize(width, height);
	},
	finish: function() {
		if (this.onFinish)
			this.onFinish();
	},
	
	mKeyDown: undefined,
	mMouseDown: undefined,
	
	keyDown: function(k) {
		this.mKeyDown[k] = true;
		if (this.onKeyDown) this.onKeyDown(k);
	},
	keyUp: function(k) {
		this.mKeyDown[k] = false;
		if (this.onKeyUp) this.onKeyUp(k);
	},
	mouseDown: function(x, y, k) {
		this.mMouseDown[k] = true;
		if (this.onMouseDown) this.onMouseDown(x, y, k);
	},
	mouseUp: function(x, y, k) {
		this.mMouseDown[k] = false;
		if (this.onMouseUp) this.onMouseUp(x, y, k);
	},
	mouseMove: function(x, y) {
		if (this.onMouseMove) this.onMouseMove(x, y);
	},
	mouseWheel: function(delta) {
		if (this.onMouseWheel) this.onMouseWheel(delta);
	},
	
	update: function() {
		this.mScene.update();
		if (this.onUpdate) this.onUpdate();
	},
	frameRendered: function() {
		if (this.onFrameRendered) this.onFrameRendered();
		this.update();
	}
};
OE.Utils.defClass(OE.BaseApp);
OE.BaseApp2D = function() {
	OE.BaseApp.call(this);
};
OE.BaseApp2D.prototype = {
	mViewExtents: 1.0,
	
	resize: function(width, height) {
		var ratio = width / height;
		
		if (this.mCamera !== undefined) {
			this.mCamera.setOrtho(
				-this.mViewExtents*ratio, this.mViewExtents*ratio,
				-this.mViewExtents, this.mViewExtents,
				-1.0, 1.0);
		}
		
		if (this.onResize)
			this.onResize(width, height);
	},
	setViewExtents: function(extents) {
		this.mViewExtents = extents;
		if (this.mSurface !== undefined)
			this.resize(this.mSurface.mCanvas.offsetWidth, this.mSurface.mCanvas.offsetHeight);
	}
};
OE.Utils.defClass(OE.BaseApp2D, OE.BaseApp);
/**
 * @class BaseApp3D
 * @module Application
 * @extends BaseApp
 * @description The base application for a 3D game.
 */
OE.BaseApp3D = function() {
	OE.BaseApp.call(this);
};
OE.BaseApp3D.prototype = {
	mClipFar: 1000.0,
	mClipNear: 0.01,
	
	resize: function(width, height) {
		if (this.mCamera !== undefined)
			this.mCamera.setAspectRatio(width / height);
		
		if (this.onResize !== undefined)
			this.onResize(width, height);
	}
};
OE.Utils.defClass(OE.BaseApp3D, OE.BaseApp);

OE.ByteBuffer = function(size) {
	this.mBuffer = new ArrayBuffer(size);
	this.mDataView = new DataView(this.mBuffer);
	this.mSize = size;
	this.mPosition = 0;
	this.mLittleEndian = false;
	
	var a = new ArrayBuffer(4);
	var b = new Uint8Array(a);
	var c = new Uint32Array(a);
	b[0] = 0xa1; b[1] = 0xb2; b[2] = 0xc3; b[3] = 0xd4;
	     if (c[0] == 0xd4c3b2a1) this.mLittleEndian = true;
	else if (c[0] == 0xa1b2c3d4) this.mLittleEndian = false;
	else throw new Error("Something crazy just happened"); 
};

OE.ByteBuffer.prototype = {
	mLittleEndian: false,
	mBuffer: undefined,
	mDataView: undefined,
	mSize: 0,
	mPosition: 0,
	
	rewind: function() {
		this.mPosition = 0;
	},
	seek: function(position) {
		this.mPosition = position;
	},
	putByte: function(value) {
		var size = 1;
		var nextPos = this.mPosition + size;
		if (nextPos <= this.mSize) {
			this.mDataView.setUint8(this.mPosition, value, this.mLittleEndian);
			this.mPosition = nextPos;
		}
	},
	putInt: function(value) {
		var size = 4;
		var nextPos = this.mPosition + size;
		if (nextPos <= this.mSize) {
			this.mDataView.setInt32(this.mPosition, value, this.mLittleEndian);
			this.mPosition = nextPos;
		}
	},
	putUint: function(value) {
		var size = 4;
		var nextPos = this.mPosition + size;
		if (nextPos <= this.mSize) {
			this.mDataView.setUint32(this.mPosition, value, this.mLittleEndian);
			this.mPosition = nextPos;
		}
	},
	putFloat: function(value) {
		var size = 4;
		var nextPos = this.mPosition + size;
		if (nextPos <= this.mSize) {
			this.mDataView.setFloat32(this.mPosition, value, this.mLittleEndian);
			this.mPosition = nextPos;
		}
	},
	putVec2: function(value) {
		var size = 8;
		if (this.mPosition + size <= this.mSize) {
			this.putFloat(value.x);
			this.putFloat(value.y);
		}
	},
	putVec3: function(value) {
		var size = 12;
		if (this.mPosition + size <= this.mSize) {
			this.putFloat(value.x);
			this.putFloat(value.y);
			this.putFloat(value.z);
		}
	},
	putVec4: function(value) {
		var size = 16;
		if (this.mPosition + size <= this.mSize) {
			this.putFloat(value.x);
			this.putFloat(value.y);
			this.putFloat(value.z);
			this.putFloat(value.w);
		}
	},
	putColor4f: function(color) {
		var size = 16;
		if (this.mPosition + size <= this.mSize) {
			this.putFloat(color.r);
			this.putFloat(color.g);
			this.putFloat(color.b);
			this.putFloat(color.a);
		}
	},
	putColor4b: function(color) {
		this.putUint(color.getUint32());
	}
};
OE.Utils.defClass(OE.ByteBuffer);
/**
 * @class Color
 * @module General
 * @description A generic rgba color object.
 */

/**
 * @method constructor([Number r, Number g, Number b, Number a])
 * @description Constructs a [Color] object with the given rgba values.
 * 
 * The number of arguments is optional. When none are supplied, the color defaults to black (opaque). When two are supplied, the first value is copied as grayscale to r, g, and b, and the second is used as alpha. When three are supplied, they are copied to rgb with 1.0 alpha. When four are given, all four values are copied into rgba.
 */
OE.Color = function(r, g, b, a) {
	if (arguments.length == 4) {
		this.r = r; this.g = g;
		this.b = b; this.a = a;
	}
	else if (arguments.length == 3) {
		this.r = r; this.g = g;
		this.b = b; this.a = 1.0;
	}
	else if (arguments.length == 2) {
		this.r = this.g = this.b = r;
		this.a = g;
	}
	else if (arguments.length == 1) {
		this.r = this.g = this.b = r;
		this.a = 1.0;
	}
	else {
		this.r = this.g = this.b = 0.0;
		this.a = 1.0;
	}
};

OE.Color.prototype = {
	r: 0.0,
	g: 0.0,
	b: 0.0,
	a: 1.0,
	
	getUint32: function() {
		var c = [this.a, this.b, this.g, this.r];
		for (var i=0; i<4; i++)
			c[i] = Math.round(Math.min(Math.max(c[i] * 255.0, 0.0), 1.0));
		
		var i = 0;
		i = (((((((i
			| c[0]) << 8)
			| c[1]) << 8)
			| c[2]) << 8)
			| c[3]);
		return i;
	}
};
OE.Utils.defClass(OE.Color);

OE.Color.BLACK	= new OE.Color(0.0);
OE.Color.GREY	= new OE.Color(0.5);
OE.Color.WHITE	= new OE.Color(1.0);
OE.Color.RED	= new OE.Color(1.0, 0.0, 0.0);
OE.Color.ORANGE	= new OE.Color(1.0, 0.5, 0.0);
OE.Color.YELLOW	= new OE.Color(1.0, 1.0, 0.0);
OE.Color.GY		= new OE.Color(0.5, 1.0, 0.0);
OE.Color.GREEN	= new OE.Color(0.0, 1.0, 0.0);
OE.Color.GC		= new OE.Color(0.0, 1.0, 0.5);
OE.Color.CYAN	= new OE.Color(0.0, 1.0, 1.0);
OE.Color.TEAL	= new OE.Color(0.0, 0.5, 1.0);
OE.Color.BLUE	= new OE.Color(0.0, 0.0, 1.0);
OE.Color.BR		= new OE.Color(0.5, 0.0, 1.0);
OE.Color.VIOLET	= new OE.Color(1.0, 0.0, 1.0);
OE.Color.RB		= new OE.Color(1.0, 0.0, 0.5);
OE.Event = function() {
	this.mListeners = new Array();
	this.mOnceListeners = new Array();
};

OE.Event.prototype = {
	mListeners: undefined,
	mOnceListeners: undefined,
	
	add: function(func) {
		this.mListeners.push(func);
	},
	addOnce: function(func) {
		this.mOnceListeners.push(func);
	},
	removeAll: function() {
		this.mListeners = new Array();
		this.mOnceListeners = new Array();
	},
	remove: function(func) {
		for (var i=0; i<this.mListeners.length; i++) {
			if (this.mListeners[i] == func) {
				this.mListeners.splice(i, 1);
				i--;
			}
		}
		for (var i=0; i<this.mOnceListeners.length; i++) {
			if (this.mOnceListeners[i] == func) {
				this.mOnceListeners.splice(i, 1);
				i--;
			}
		}
	},
	dispatch: function() {
		var list = this.mListeners;
		for (var i=0; i<list.length; i++) {
			var result;
			if (arguments.length > 0)	result = list[i].apply(undefined, arguments);
			else						result = list[i]();
		}
		
		if (this.mOnceListeners.length > 0) {
			list = this.mOnceListeners;
			this.mOnceListeners = [];
			for (var i=0; i<list.length; i++) {
				var result;
				if (arguments.length > 0)	result = list[i].apply(undefined, arguments);
				else						result = list[i]();
				if (result === undefined || result == true) {
					this.mOnceListeners.push(list[i]);
				}
			}
		}
	}
};
OE.Event.prototype.constructor = OE.Event;

OE.Exception = function(arg1, arg2) {
	if (arguments.length == 2) {
		this.mName = arg1;
		this.mMessage = arg2;
	}
	else if (arguments.length == 1) {
		this.mMessage = arg1;
	}
};

OE.Exception.prototype = {
	mName: "Exception",
	mMessage: "",
	
	toString: function() {
		return "["+name+"] "+message;
	}
};
OE.Exception.prototype.constructor = OE.Exception;

OE.KeyboardListener = function() {
	this.mKeyDown = new Array(256);
	for (var i=0; i<256; i++)
		this.mKeyDown[i] = false;
};
OE.KeyboardListener.prototype = {
	mKeyDown: undefined
	
	
};
OE.KeyboardListener.prototype.constructor = OE.KeyboardListener;

OE.PointerListener = function() {
	
};
OE.PointerListener.prototype = {
	
};
OE.PointerListener.prototype.constructor = OE.PointerListener;

OE.InputManager = function() {
	
};
OE.InputManager.prototype = {
	
};
OE.InputManager.prototype.constructor = OE.InputManager;

OE.Keys = {
	Enter: 0,
	Space: 32,
	Ctrl: 0,
	Alt: 0,
	Shift: 0,
	Tab: 0
};

(function() {
	for (var i=0; i<26; i++) {
		var K = 65+i;
		var k = 97+i;
		var C = String.fromCharCode(K);
		var c = String.fromCharCode(k);
		OE.Keys[C] = K;
		OE.Keys[c] = k;
	}
})();
/**
 * @class Observable
 * @module General
 * @description Stores event listeners and calls them when a named event is dispatched.
 */
OE.Observable = function() {
	this.mEventListeners = {};
};

OE.Observable.prototype = {
	mEventListeners: undefined,
	
	addEventListener: function(event, func) {
		var list = this.mEventListeners[event];
		if (list === undefined) {
			list = new Array();
			this.mEventListeners[event] = list;
		}
		list.push({
			callback: func,
			once: false
		});
	},
	addEventListenerOnce: function(event, func) {
		var list = this.mEventListeners[event];
		if (list === undefined) {
			list = new Array();
			this.mEventListeners[event] = list;
		}
		list.push({
			callback: func,
			once: true
		});
	},
	removeAllListeners: function(event) {
		var list = this.mEventListeners[event];
		if (list !== undefined) {
			delete this.mEventListeners[event];
			this.mEventListeners[event] = undefined;
		}
	},
	removeEventListener: function(event, func) {
		var list = this.mEventListeners[event];
		if (list !== undefined) {
			var index = list.indexOf(func);
			if (index >= 0) {
				list.splice(index, 1);
			}
			if (list.length == 0) {
				delete this.mEventListeners[event];
				this.mEventListeners[event] = undefined;
			}
		}
	},
	dispatchEvent: function(event, args) {
		var list = this.mEventListeners[event];
		if (list !== undefined) {
			for (var i=0; i<list.length; i++) {
				var result;
				if (args !== undefined) {
					if (Array.isArray(args)) {
						result = list[i].callback.apply(undefined, args);
					}
					else {
						result = list[i].callback.call(undefined, args);
					}
				}
				else {
					result = list[i].callback.call(undefined);
				}
				if (list[i].once) {
					if (result === undefined || result == true) {
						list.splice(i, 1);
						i--;
					}
				}
			}
			if (list.length == 0) {
				delete this.mEventListeners[event];
				this.mEventListeners[event] = undefined;
			}
		}
	}
};
OE.Utils.defClass(OE.Observable);

OE.Serializable = function() {};
OE.Serializable.prototype = {};
OE.Serializable.serialize = function() {
	return {};
};
OE.Serializable.deserialize = function(data) {
	return new OE.Serializble();
};
OE.Utils.defClass(OE.Serializable);

OE.BoundingBox = function(p1, p2) {
	this.p1 = p1 ? p1 : new OE.Vector3();
	this.p2 = p2 ? p2 : new OE.Vector3();
};
OE.BoundingBox.prototype = {
	p1: undefined,
	p2: undefined,
	
	set: function(bbox) {
		this.p1.set(bbox.p1);
		this.p2.set(bbox.p2);
	},
	setp: function(p1, p2) {
		this.p1.set(p1);
		this.p2.set(p2);
	},
	setf: function(x1, y1, z1, x2, y2, z2) {
		this.p1.setf(x1, y1, z1);
		this.p2.setf(x2, y2, z2);
	},
	
	includePoint: function(point) {
		if (point.x < this.p1.x) this.p1.x = point.x;
		if (point.x > this.p2.x) this.p2.x = point.x;
		if (point.y < this.p1.y) this.p1.y = point.y;
		if (point.y > this.p2.y) this.p2.y = point.y;
		if (point.z < this.p1.z) this.p1.z = point.z;
		if (point.z > this.p2.z) this.p2.z = point.z;
	},
	includePointf: function(x, y, z) {
		if (x < this.p1.x) this.p1.x = x;
		if (x > this.p2.x) this.p2.x = x;
		if (y < this.p1.y) this.p1.y = y;
		if (y > this.p2.y) this.p2.y = y;
		if (z < this.p1.z) this.p1.z = z;
		if (z > this.p2.z) this.p2.z = z;
	},
	includeBbox: function(bbox) {
		if (bbox.p1.x < this.p1.x) this.p1.x = bbox.p1.x;
		if (bbox.p2.x > this.p2.x) this.p2.x = bbox.p2.x;
		if (bbox.p1.y < this.p1.y) this.p1.y = bbox.p1.y;
		if (bbox.p2.y > this.p2.y) this.p2.y = bbox.p2.y;
		if (bbox.p1.z < this.p1.z) this.p1.z = bbox.p1.z;
		if (bbox.p2.z > this.p2.z) this.p2.z = bbox.p2.z;
	},
	surroundPoint: function(point, xsize, ysize, zsize) {
		this.surroundPointf(point.x, point.y, point.z, xsize, ysize, zsize);
	},
	surroundPointf: function(x, y, z, xsize, ysize, zsize) {
		this.p1.setf(x, y, z);
		this.p2.setf(x, y, z);
		if (xsize) {
			var off = xsize * 0.5;
			this.p1.x -= off; this.p2.x += off;
		}
		if (ysize) {
			var off = ysize * 0.5;
			this.p1.y -= off; this.p2.y += off;
		}
		if (zsize) {
			var off = zsize * 0.5;
			this.p1.z -= off; this.p2.z += off;
		}
	},
	intersectsBox: function(bbox) {
		return !(
			bbox.p2.x < this.p1.x ||
			bbox.p2.y < this.p1.y ||
			bbox.p2.z < this.p1.z ||
			bbox.p1.x > this.p2.x ||
			bbox.p1.y > this.p2.y ||
			bbox.p1.z > this.p2.z);
	},
	containsPoint: function(point) {
		return (point.x > this.p1.x &&
				point.x < this.p2.x &&
				point.y > this.p1.y &&
				point.y < this.p2.y &&
				point.z > this.p1.z &&
				point.z < this.p2.z);
	}
};
OE.Utils.defClass(OE.BoundingBox);

OE.Math = {};

OE.Math.EPSILON = 0.000000001;

OE.Math.PI = 3.14159265358979323846264338327950;
OE.Math.PI_BY_90 = OE.Math.PI / 90.0;
OE.Math.PI_BY_180 = OE.Math.PI / 180.0;
OE.Math.PI_BY_360 = OE.Math.PI / 360.0;
OE.Math.TWO_PI = OE.Math.PI * 2.0;
OE.Math.TWO_BY_PI = 2.0 / OE.Math.PI;

OE.Math.DEG_TO_RAD = OE.Math.PI / 180.0;
OE.Math.RAD_TO_DEG = 180.0 / OE.Math.PI;

OE.Math.clamp = function(x, a, b) {return x<a?a:(x>b?b:x);};
OE.Math.fract = function(x) {return x - Math.floor(x);};

OE.Math.mod = function(a, b) {return ((a%b)+b)%b;};

OE.Math.linInterp = function(a, b, x) {return a+(b-a)*x;};
OE.Math.cosInterp = function(a, b, x) {
	var x2 = (1.0 - Math.cos(x*OE.Math.PI)) / 2.0;
	return (a*(1.0-x2) + b*x2);
};

OE.Math.interpN = function(dim, func, bounds, factor) {
	if (dim == 0) {
		return bounds;
	}
	else if (dim == 1) {
		var a = bounds[0];
		var b = bounds[1];
		return func(a, b, factor[0]);
	}
	else {
		var a = bounds[0];
		var b = bounds[1];
		var d2 = dim-1;
		var fx = factor[dim-2];
		var fy = factor[dim-1];
		var x1 = OE.Math.interpN(d2, func, a, factor);
		var x2 = OE.Math.interpN(d2, func, b, factor);
		var y = func(x1, x2, fy);
		return y;
	}
};

OE.Math.atanBias = function(x, bias) {return Math.atan(x * bias) * OE.Math.TWO_BY_PI;};

// #include Math/Math.js

/**
 * @class Math.Plane
 * @module Math
 * @description A 3D plane data structure for doing spatial calculations.
 */

/**
 * @method constructor(Vector3 point, Vector3 normal)
 * @description Constructs a [Plane] passing through point and perpendicular to normal.
 * @param point A [Vector3] point in 3D space.
 * @param normal A [Vector3] normal vector for the Plane.
 */
OE.Math.Plane = function(point, normal) {
	this.mPoint = point;
	this.mNormal = normal;
};
OE.Math.Plane.prototype = {
	mPoint: undefined,
	mNormal: undefined,
	
	set: function(point, normal) {
		this.mPoint.set(point);
		this.mNormal.set(normal);
	},
	setf: function(px, py, pz, nx, ny, nz) {
		this.mPoint.setf(px, py, pz);
		this.mNormal.setf(nx, ny, nz);
	},
	pointInFront: function(point) {
		var dx = point.x - this.mPoint.x,
			dy = point.y - this.mPoint.y,
			dz = point.z - this.mPoint.z,
			dot = dx*this.mNormal.x + dy*this.mNormal.y + dz*this.mNormal.z;
		return dot > 0.0;
	},
	pointInFrontf: function(px, py, pz) {
		var dx = px - this.mPoint.x,
			dy = py - this.mPoint.y,
			dz = pz - this.mPoint.z,
			dot = dx*this.mNormal.x + dy*this.mNormal.y + dz*this.mNormal.z;
		return dot > 0.0;
	}
};
OE.Math.Plane.prototype.constructor = OE.Math.Plane;

/**
 * @class Frustum
 * @module Math
 * @description A viewing frustum for doing frustum occlusion calculations.
 */
OE.Frustum = function() {
	this.mPlanes = new Array(6);
	this.mPoints = new Array(8);
	
	for (var i=0; i<6; i++)
		this.mPlanes[i] = new OE.Math.Plane(new OE.Vector3(0.0), new OE.Vector3(0.0, 0.0, 1.0));
	
	for (var i=0; i<8; i++)
		this.mPoints[i] = new OE.Vector3(0.0);
};
OE.Frustum.prototype = {
	mPlanes: undefined,
	mPoints: undefined,
	
	calcPlane: function(index, a, b, c, d) {
		var p = this.mPlanes[index].mPoint;
		var n = this.mPlanes[index].mNormal;
		
		var ab = b.sub(a).normalize(); 
		var ac = c.sub(a).normalize();
		
		p.set(a); p.addBy(b); p.addBy(c); p.addBy(d); p.mulByf(0.25);
		n.set(ab.crossBy(ac));
	},
	calcPlanes: function() {
		var p = this.mPoints;
		this.calcPlane(0, p[0], p[1], p[2], p[3]); // Front
		this.calcPlane(1, p[5], p[4], p[7], p[6]); // Back
		this.calcPlane(2, p[4], p[0], p[6], p[2]); // Left
		this.calcPlane(3, p[1], p[5], p[3], p[7]); // Right
		this.calcPlane(4, p[2], p[3], p[6], p[7]); // Top
		this.calcPlane(5, p[4], p[5], p[0], p[1]); // Bottom
	},
	containsBox: function(bbox) {
		var x1 = bbox.p1.x, y1 = bbox.p1.y, z1 = bbox.p1.z,
			x2 = bbox.p2.x, y2 = bbox.p2.y, z2 = bbox.p2.z;
		var i, out, plane;
		// Check box outside/inside of frustum.
		for (i=0; i<6; i++) {
			plane = this.mPlanes[i];
			out = 0;
			out += plane.pointInFrontf(x1, y1, z1) ? 1 : 0;
			out += plane.pointInFrontf(x2, y1, z1) ? 1 : 0;
			out += plane.pointInFrontf(x1, y2, z1) ? 1 : 0;
			out += plane.pointInFrontf(x2, y2, z1) ? 1 : 0;
			out += plane.pointInFrontf(x1, y1, z2) ? 1 : 0;
			out += plane.pointInFrontf(x2, y1, z2) ? 1 : 0;
			out += plane.pointInFrontf(x1, y2, z2) ? 1 : 0;
			out += plane.pointInFrontf(x2, y2, z2) ? 1 : 0;
			if (out == 8) return false;
		}
		/*
		// Check frustum outside/inside box.
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].x > box.mMaxX)?1:0);} if (out==8) return false;
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].x < box.mMinX)?1:0);} if (out==8) return false;
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].y > box.mMaxY)?1:0);} if (out==8) return false;
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].y < box.mMinY)?1:0);} if (out==8) return false;
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].z > box.mMaxZ)?1:0);} if (out==8) return false;
		out=0; for (i=0; i<8; i++) {out += ((fru.mPoints[i].z < box.mMinZ)?1:0);} if (out==8) return false;
		*/
		return true;
	}
};
OE.Utils.defClass(OE.Frustum);

var glMatrixArrayType = typeof Float32Array !== "undefined" ?
							   Float32Array : typeof WebGLFloatArray !== "undefined" ?
													 WebGLFloatArray : Array;

OE.Math.Matrix4 = function() {
	this.m = new glMatrixArrayType(16);
};
OE.Math.Matrix4.prototype = {
	
};
OE.Utils.defClass(OE.Math.Matrix4);

var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};

/**
 * @class Movable
 * @module Math
 * @description An object that has a [Transform] which can be used to move it.
 */
OE.Movable = function(scene) {
	this.mTransform = new OE.Transform();
};

OE.Movable.prototype = {
	mTransform: undefined,
	
	onTransformChanged: function() {},
	
	setPos: function(pos) {
		this.mTransform.setPos(pos);
		this.onTransformChanged();
	},

	/**
	 * @method setPosf(Number x, Number y, Number z)
	 * @description Sets this object's position.
	 * @param x New x value.
	 * @param y New y value.
	 * @param z New z value.
	 */
	setPosf: function(x, y, z) {
		this.mTransform.setPosf(x, y, z);
		this.onTransformChanged();
	},
	setRot: function(rot) {
		this.mTransform.setRot(rot);
		this.onTransformChanged();
	},
	setRotf: function(x, y, z, w) {
		this.mTransform.setRotf(x, y, z, w);
		this.onTransformChanged();
	},
	setRotAxisAngle: function(axis, angle) {
		this.mTransform.setRotAxisAngle(axis, angle);
		this.onTransformChanged();
	},
	setScale: function(scale) {
		this.mTransform.setScale(scale);
		this.onTransformChanged();
	},
	setScalef: function(x, y, z) {
		this.mTransform.setScalef(x, y, z);
		this.onTransformChanged();
	},
	setTransform: function(xform) {
		this.mTransform.set(xform);
		this.onTransformChanged();
	},
	
	getPos: function() {
		return this.mTransform.getPos();
	},
	getRot: function() {
		return this.mTransform.getRot();
	},
	getScale: function() {
		return this.mTransform.getScale();
	},
	getTransform: function() {
		return this.mTransform;
	},
	getTransformMatrix: function() {
		return this.mTransform.getMatrix();
	}
}
OE.Utils.defClass(OE.Movable);

OE.Noise = {};

OE.Noise.mSeed = [12.9898, 77.233, 143.66337, 23.53277];

OE.Noise.noise = function(size, a, b, c, d) {
	var seed = OE.Noise.mSeed;
	var result = [a, b, c, d];
	for (var i=0; i<4; i++) {
		result[i] = OE.Noise.noiseN(size, result[i]);
	}
	return result;
};
OE.Noise.noiseN = function(size, pos) {
	var dot = 0.0;
	for (var i=0; i<size; i++) dot += pos[i]*OE.Noise.mSeed[i];
	return OE.Math.fract(Math.sin(dot) * 43758.5453) * 2.0 - 1.0;
};

OE.Noise.smoothNoise2 = function(v) {
	var C0 = [	Math.floor(v[0]),
				Math.floor(v[1])];
	var C = [C0,
			[C0[0] + 1.0, C0[1] + 0.0],
			[C0[0] + 0.0, C0[1] + 1.0],
			[C0[0] + 1.0, C0[1] + 1.0]];
	var p = [	OE.Math.fract(v[0]),
				OE.Math.fract(v[1])];
	var r = OE.Noise.noise(2, C[0], C[1], C[2], C[3]);
	return OE.Math.interpN(2, OE.Math.cosInterp, [[r[0], r[1]], [r[2], r[3]]], p);
};
OE.Noise.smoothNoise3 = function(v) {
	var C0 = [	Math.floor(v[0]),
				Math.floor(v[1]),
				Math.floor(v[2])];
	var C = [C0,
			[C0[0]+1.0, C0[1]+0.0, C0[2]+0.0],
			[C0[0]+0.0, C0[1]+1.0, C0[2]+0.0],
			[C0[0]+1.0, C0[1]+1.0, C0[2]+0.0],
			[C0[0]+0.0, C0[1]+0.0, C0[2]+1.0],
			[C0[0]+1.0, C0[1]+0.0, C0[2]+1.0],
			[C0[0]+0.0, C0[1]+1.0, C0[2]+1.0],
			[C0[0]+1.0, C0[1]+1.0, C0[2]+1.0]];
	var p = [	OE.Math.fract(v[0]),
				OE.Math.fract(v[1]),
				OE.Math.fract(v[2])];
	var r1 = OE.Noise.noise(3, C[0], C[1], C[2], C[3]);
	var r2 = OE.Noise.noise(3, C[4], C[5], C[6], C[7]);
	var r = [	[	[r1[0], r1[1]],
					[r1[2], r1[3]]],
				[	[r2[0], r2[1]],
					[r2[2], r2[3]]]
			];
	return OE.Math.interpN(3, OE.Math.cosInterp, r, p);
};
OE.Noise.smoothNoiseN = function(n, v) {
	var C0 = [];
	for (var i=0; i<n; i++)
		C0.push(Math.floor(v[i]));
	
	var numCorners = Math.pow(2, n);
	var corners = [];
	for (var i=0; i<numCorners; i++) {
		var corner = [];
		for (var j=0; j<n; j++) {
			var bit = 1&(i>>j);
			corner.push(C0[j] + bit);
		}
		corners.push(OE.Noise.noiseN(n, corner));
	}
	
	var i = 0;
	var buildTree = function(node, depth) {
		if (depth+1 < n) {
			node[0] = [];
			node[1] = [];
			buildTree(node[0], depth+1);
			buildTree(node[1], depth+1);
		}
		else {
			node[0] = corners[i++];
			node[1] = corners[i++];
		}
	};
	var r = [];
	buildTree(r, 0);
	
	var p = [];
	for (var i=0; i<n; i++)
		p.push(OE.Math.fract(v[i]));
	
	return OE.Math.interpN(n, OE.Math.cosInterp, r, p);
};

OE.Noise.perlinNoise2 = function(v, octaves, frequency, persistence) {
	var x = 0.0;
	var vx = v[0] * frequency;
	var vy = v[1] * frequency;
	for (var i = 0; i < octaves; i++) {
		var amp = Math.pow(persistence, i);
		var freq = Math.pow(2.0, i);
		x += OE.Noise.smoothNoise2([vx*freq, vy*freq]) * amp;
	}
	return x;
};
/*OE.Noise.perlinNoise3 = function(Vector3 v, int octaves, double frequency, double persistence)
{
	double x = 0.0;
	v *= (Real)frequency;
	for(int i = 0;i < octaves;i++)
	{
		double amp = pow(persistence, (double)i);
		double freq = pow(2.0, (double)i);
		x += smoothNoise3(v * (Real)freq) * amp;
	}
	return x;
};*/
OE.Noise.ridgedNoise2 = function(v, octaves, frequency, persistence) {
	var x = 0.0;
	var vx = v[0] * frequency;
	var vy = v[1] * frequency;
	for (var i = 0; i < octaves; i++)
	{
		var amp = Math.pow(persistence, i);
		var freq = Math.pow(2.0, i);
		x += Math.abs(OE.Noise.smoothNoise2([vx*freq, vy*freq]) * amp);
	}
	return -x*2.0+1.0;
};
OE.Noise.ridgedNoise3 = function(v, octaves, frequency, persistence) {
	var x = 0.0;
	var vx = v[0] * frequency;
	var vy = v[1] * frequency;
	var vz = v[2] * frequency;
	for (var i = 0; i < octaves; i++)
	{
		var amp = Math.pow(persistence, i);
		var freq = Math.pow(2.0, i);
		x += Math.abs(OE.Noise.smoothNoise3([vx*freq, vy*freq, vz*freq]) * amp);
	}
	return -x*2.0+1.0;
};
OE.Noise.ridgedNoise4 = function(v, octaves, frequency, persistence) {
	var x = 0.0;
	var vx = v[0] * frequency;
	var vy = v[1] * frequency;
	var vz = v[2] * frequency;
	var vw = v[3] * frequency;
	for (var i = 0; i < octaves; i++)
	{
		var amp = Math.pow(persistence, i);
		var freq = Math.pow(2.0, i);
		x += Math.abs(OE.Noise.smoothNoiseN(4, [vx*freq, vy*freq, vz*freq, vw*freq]) * amp);
	}
	return -x*2.0+1.0;
};
/**
 * @class Quaternion
 * @module Math
 * @description A 4d hypersphere forming a four-dimensional associative normed division algebra over real numbers.
 */
OE.Quaternion = function(x, y, z, w) {
	if (arguments.length == 4) {
		this.x = x; this.y = y;
		this.z = z; this.w = w;
	}
	else {
		this.x = this.y = this.z = 0.0;
		this.w = 1.0;
	}
};

OE.Quaternion.EPSILON = 0.000000001;

OE.Quaternion.prototype = {
	x: 0.0, y: 0.0, z: 0.0, w: 0.0,
	
	set: function(q) {this.x = q.x; this.y = q.y; this.z = q.z; this.w = q.w;},
	setf: function(x, y, z, w) {this.x = x; this.y = y; this.z = z; this.w = w;},
	
	getConjugate: function() {
		return new OE.Quaternion(-this.x, -this.y, -this.z, this.w);
	},
	normalize: function() {
		var len2 =	this.x*this.x + this.y*this.y +
					this.z*this.z + this.w*this.w;
		if (len2 > OE.Quaternion.EPSILON) {
			var len = Math.sqrt(len2);
			this.x /= len;
			this.y /= len;
			this.z /= len;
			this.w /= len;
		}
	},
	getNormal: function() {
		var len2 =	this.x*this.x + this.y*this.y +
					this.z*this.z + this.w*this.w;
		if (len2 > OE.Quaternion.EPSILON) {
			var len = Math.sqrt(len2);
			return new OE.Quaternion(
				this.x / len,
				this.y / len,
				this.z / len,
				this.w / len
			);
		}
		return new OE.Quaternion(this.x, this.y, this.z, this.w);
	},
	
	fromRotationMatrix: function(mat) {
		// This algorithm lifted from http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/
		
		var _copysign = function(x, y) {
			x = Math.abs(x);
			return y == 0.0 ? 0.0 : (y > 0.0 ? x : -x);
		};
		
		this.w = Math.sqrt(Math.max(0.0, 1.0 + mat[0] + mat[4] + mat[8])) / 2.0;
		this.x = Math.sqrt(Math.max(0.0, 1.0 + mat[0] - mat[4] - mat[8])) / 2.0;
		this.y = Math.sqrt(Math.max(0.0, 1.0 - mat[0] + mat[4] - mat[8])) / 2.0;
		this.z = Math.sqrt(Math.max(0.0, 1.0 - mat[0] - mat[4] + mat[8])) / 2.0;
		
		this.x = _copysign(this.x, mat[5] - mat[7]);
		this.y = _copysign(this.y, mat[6] - mat[2]);
		this.z = _copysign(this.z, mat[1] - mat[3]);
	},
	fromAxes: function(xAxis, yAxis, zAxis) {
		this.fromRotationMatrix();
	},
	fromAxisAngle: function(axis, angle) {
		angle *= OE.Math.PI_BY_360;
		var sinAngle = Math.sin(angle);
		this.x = (axis.x * sinAngle);
		this.y = (axis.y * sinAngle);
		this.z = (axis.z * sinAngle);
		this.w = Math.cos(angle);
	},
	fromEuler: function(euler) {
		this.fromEulerf(euler.x, euler.y, euler.z);
	},
	fromEulerf: function(ex, ey, ez) {
		var ep = ex * OE.Math.PI_BY_90;
		var eq = ey * OE.Math.PI_BY_90;
		var er = ez * OE.Math.PI_BY_90;
		var sinp = Math.sin(ep);
		var siny = Math.sin(eq);
		var sinr = Math.sin(er);
		var cosp = Math.cos(ep);
		var cosy = Math.cos(eq);
		var cosr = Math.cos(er);
		this.x = sinr * cosp * cosy - cosr * sinp * siny;
		this.y = cosr * sinp * cosy + sinr * cosp * siny;
		this.z = cosr * cosp * siny - sinr * sinp * cosy;
		this.w = cosr * cosp * cosy + sinr * sinp * siny;
		this.normalize();
	},
	
	getAxisAngle: function(axisAngle) {
		this.normalize();
		var scale = Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);
		if (scale > OE.Quaternion.EPSILON && Math.abs(this.w) <= 1.0) {
			axisAngle.x = this.x / scale;
			axisAngle.y = this.y / scale;
			axisAngle.z = this.z / scale;
			axisAngle.w = Math.acos(this.w) * 2.0 * OE.Math.RAD_TO_DEG;
		}
		else {
			axisAngle.x = 1.0;
			axisAngle.y = 0.0;
			axisAngle.z = 0.0;
			axisAngle.w = 0.0;
		}
	},
	getMatrix: function() {
		var x2 = this.x * this.x;
		var y2 = this.y * this.y;
		var z2 = this.z * this.z;
		var xy = this.x * this.y;
		var xz = this.x * this.z;
		var yz = this.y * this.z;
		var wx = this.w * this.x;
		var wy = this.w * this.y;
		var wz = this.w * this.z;
		return [
			1.0 - 2.0 * (y2 + z2),	2.0 * (xy - wz),		2.0 * (xz + wy),		0.0,
			2.0 * (xy + wz),		1.0 - 2.0 * (x2 + z2),	2.0 * (yz - wx),		0.0,
			2.0 * (xz - wy),		2.0 * (yz + wx),		1.0 - 2.0 * (x2 + y2),	0.0,
			0.0,					0.0,					0.0,					1.0
		];
	},
	getForward: function() {
		var x2 = this.x * this.x;
		var y2 = this.y * this.y;
		var xz = this.x * this.z;
		var yz = this.y * this.z;
		var wx = this.w * this.x;
		var wy = this.w * this.y;
		return new OE.Vector3(
			2.0 * (xz - wy),
			2.0 * (yz + wx),
			1.0 - 2.0 * (x2 + y2)
		);
	},
	getUp: function() {
		var x2 = this.x * this.x;
		var z2 = this.z * this.z;
		var xy = this.x * this.y;
		var yz = this.y * this.z;
		var wx = this.w * this.x;
		var wz = this.w * this.z;
		return new OE.Vector3(
			2.0 * (xy + wz),
			1.0 - 2.0 * (x2 + z2),
			2.0 * (yz - wx)
		);
	},
	getRight: function() {
		var y2 = this.y * this.y;
		var z2 = this.z * this.z;
		var xy = this.x * this.y;
		var xz = this.x * this.z;
		var wy = this.w * this.y;
		var wz = this.w * this.z;
		return new OE.Vector3(
			1.0 - 2.0 * (y2 + z2),
			2.0 * (xy - wz),
			2.0 * (xz + wy)
		);
	},
	
	dot: function(q) {
		return this.x*q.x + this.y*q.y + this.z*q.z + this.w*q.w;
	},
	
	lerp: function(q, t) {
		var a = OE.Quaternion._aux;
		a.set(q);
		a.subBy(this);
		a.mulByf(t);
		this.addBy(a);
		this.normalize();
	},
	slerp: function(q, t) {
		var q3;
		var d = this.dot(q);

		if (d < 0) {
			d = -d;
			q3 = q.getConjugate();
		}
		else {
			q3 = q;
		}
		
		if (d < 0.95) {
			var angle = Math.acos(d);
			this.mulByf(Math.sin(angle*(1.0-t)));
			q3.mulByf(Math.sin(angle*t));
			this.addBy(q3);
			this.divByf(Math.sin(angle));
		}
		else {
			return this.lerp(q3, t);
		}
	},
	
	getLerp: function(q, t) {
		return (this.add((q.sub(this)).mulf(t))).getNormal();
	},
	getSlerp: function(q, t) {
		var q3;
		var d = this.dot(q);

		if (d < 0) {
			d = -d;
			q3 = q.getConjugate();
		}
		else {
			q3 = q;
		}
		
		if (d < 0.95) {
			var angle = Math.acos(d);
			return (this.mulf(Math.sin(angle*(1.0-t))).add(
					q3.mulf(Math.sin(angle*t))))
					.divf(Math.sin(angle));
		}
		else {
			return this.lerp(q3, t);
		}
	},
	
	addf: function(f) {return new OE.Quaternion(this.x+f, this.y+f, this.z+f, this.w+f);},
	subf: function(f) {return new OE.Quaternion(this.x-f, this.y-f, this.z-f, this.w-f);},
	mulf: function(f) {return new OE.Quaternion(this.x*f, this.y*f, this.z*f, this.w*f);},
	divf: function(f) {return new OE.Quaternion(this.x/f, this.y/f, this.z/f, this.w/f);},
	add: function(q) {return new OE.Quaternion(this.x+q.x, this.y+q.y, this.z+q.z, this.w+q.w);},
	sub: function(q) {return new OE.Quaternion(this.x-q.x, this.y-q.y, this.z-q.z, this.w-q.w);},
	
	addByf: function(f) {this.x+=f; this.y+=f; this.z+=f; this.w+=f;},
	subByf: function(f) {this.x-=f; this.y-=f; this.z-=f; this.w-=f;},
	mulByf: function(f) {this.x*=f; this.y*=f; this.z*=f; this.w*=f;},
	divByf: function(f) {this.x/=f; this.y/=f; this.z/=f; this.w/=f;},
	addBy: function(q) {this.x+=q.x; this.y+=q.y; this.z+=q.z; this.w+=q.w;},
	subBy: function(q) {this.x-=q.x; this.y-=q.y; this.z-=q.z; this.w-=q.w;},
	
	mul: function(q) {
		return new OE.Quaternion(
			this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
			this.w*q.y + this.y*q.w + this.z*q.x - this.x*q.z,
			this.w*q.z + this.z*q.w + this.x*q.y - this.y*q.x,
			this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z
		);
	},
	mulBy: function(q) {
		this.setf(
			this.w*q.x + this.x*q.w + this.y*q.z - this.z*q.y,
			this.w*q.y + this.y*q.w + this.z*q.x - this.x*q.z,
			this.w*q.z + this.z*q.w + this.x*q.y - this.y*q.x,
			this.w*q.w - this.x*q.x - this.y*q.y - this.z*q.z
		);
	},
	mulv: function(v) {
		var vq = new OE.Quaternion(v.x, v.y, v.z, 0.0);
		var q = new OE.Quaternion(); q.set(this);
		var c = q.getConjugate();
		q.mulBy(vq);
		q.mulBy(c);
		return new OE.Vector3(q.x, q.y, q.z);
	},
	mulvBy: function(v) {
		var vq = new OE.Quaternion(v.x, v.y, v.z, 0.0);
		var q = new OE.Quaternion(); q.set(this);
		var c = q.getConjugate();
		q.mulBy(vq);
		q.mulBy(c);
		v.setf(q.x, q.y, q.z);
		return v;
	}
};
OE.Utils.defClass(OE.Quaternion);

OE.Quaternion.mulOut = function(result, a, b) {
	result.setf(
		a.w*b.x + a.x*b.w + a.y*b.z - a.z*b.y,
		a.w*b.y + a.y*b.w + a.z*b.x - a.x*b.z,
		a.w*b.z + a.z*b.w + a.x*b.y - a.y*b.x,
		a.w*b.w - a.x*b.x - a.y*b.y - a.z*b.z
	);
};

OE.Quaternion._aux = new OE.Quaternion();
/**
 * @class Transform
 * @module Math
 * @description Represents a transformation (translation, rotation, and scale) in 3D space.
 * 
 * This is achieved by wrapping transformation matrices and other linear algebra, exposing methods for modifying the transformation.
 */
 
 /**
 * @method constructor()
 * @description Constructs an identity transform (No translation, rotation, or scale).
 */
OE.Transform = function() {
	this.mMatrix = mat4.create();
	this.mPosition = new OE.Vector3(0.0, 0.0, 0.0);
	this.mRotation = new OE.Quaternion();
	this.mScale = new OE.Vector3(1.0, 1.0, 1.0);
	this.mAxisAngle = new OE.Vector4();
	
	mat4.identity(this.mMatrix);
};
OE.Transform.prototype = {
	mMatrix: undefined,
	mPosition: undefined,
	mRotation: undefined,
	mScale: undefined,
	mAxisAngle: undefined,
	mChanged: true,
	
	set: function(transform) {
		this.mPosition.set(transform.mPosition);
		this.mRotation.set(transform.mRotation);
		this.mAxisAngle.set(transform.mAxisAngle);
		this.mScale.set(transform.mScale);
		this.mChanged = true;
		//this.updateMatrix();
	},
	
	getPos: function() {
		return this.mPosition;
	},
	getRot: function() {
		return this.mRotation;
	},
	getScale: function() {
		return this.mScale;
	},

	setPos: function(pos) {
		this.mPosition.set(pos);
		this.mChanged = true;
	},

	/**
	 * @method setPosf(Number x, Number y, Number z)
	 * @description Set this transform's position.
	 * @param x New x value.
	 * @param y New y value.
	 * @param z New z value.
	 */
	setPosf: function(x, y, z) {
		this.mPosition.setf(x, y, z);
		this.mChanged = true;
	},
	setRot: function(rot) {
		this.mRotation.set(rot);
		this.mRotation.getAxisAngle(this.mAxisAngle);
		this.mChanged = true;
	},
	setRotf: function(x, y, z, w) {
		this.mRotation.setf(x, y, z, w);
		this.mRotation.getAxisAngle(this.mAxisAngle);
		this.mChanged = true;
	},
	setRotAxisAngle: function(axis, angle) {
		this.mRotation.fromAxisAngle(axis, angle);
		this.mAxisAngle.setf(axis.x, axis.y, axis.z, angle);
		this.mChanged = true;
	},
	setScale: function(scale) {
		this.mScale.set(scale);
		this.mChanged = true;
	},
	setScalef: function(x, y, z) {
		this.mScale.setf(x, y, z);
		this.mChanged = true;
	},
	
	updateMatrix: function() {
		mat4.identity(this.mMatrix);
		mat4.translate(this.mMatrix,
			[this.mPosition.x, this.mPosition.y, this.mPosition.z]);
		mat4.rotate(this.mMatrix,
			this.mAxisAngle.w*OE.Math.DEG_TO_RAD,
			[this.mAxisAngle.x, this.mAxisAngle.y, this.mAxisAngle.z]);
		mat4.scale(this.mMatrix,
			[this.mScale.x, this.mScale.y, this.mScale.z]);
	},
	
	fromMatrix: function(matrix) {
		var rot = [	matrix[0], matrix[1], matrix[2],
					matrix[4], matrix[5], matrix[6],
					matrix[8], matrix[9], matrix[10]];
		
		this.mMatrix = matrix;
		this.mPosition.setf(matrix[12], matrix[13], matrix[14]);
		this.mRotation.fromRotationMatrix(rot);
		this.mRotation.getAxisAngle(this.mAxisAngle);
		
		var x2 = rot[0]*rot[0] + rot[1]*rot[1] + rot[2]*rot[2];
		var y2 = rot[3]*rot[3] + rot[4]*rot[4] + rot[5]*rot[5];
		var z2 = rot[6]*rot[6] + rot[7]*rot[7] + rot[8]*rot[8];
		this.mScale.setf(Math.sqrt(x2), Math.sqrt(y2), Math.sqrt(z2));
	},
	getMatrix: function() {
		if (this.mChanged) {
			this.mChanged = false;
			this.updateMatrix();
		}
		return this.mMatrix;
	}
};
OE.Utils.defClass(OE.Transform);

OE.Transform.apply = function(result, a, b) {
	var mat = result.mMatrix;
	mat4.multiply(a.getMatrix(), b.getMatrix(), mat);
	result.fromMatrix(mat);
};

OE.Vector2 = function(x, y) {
	if (arguments.length == 2) {
		this.x = x; this.y = y;
	}
	else if (arguments.length == 1) {
		this.x = this.y = x;
	}
	else {
		this.x = this.y = 0.0;
	}
};
OE.Vector2.prototype = {
	x: 0.0, y: 0.0,
	
	length2: function() {return this.x*this.x + this.y*this.y;},
	length: function() {return Math.sqrt(this.x*this.x + this.y*this.y);},
	normalize: function() {
		var len2 = this.x*this.x + this.y*this.y;
		if (len2 > 0.0) {
			var len = Math.sqrt(len2);
			this.x /= len;
			this.y /= len;
		}
		return this;
	},
	
	dot: function(vec) {return this.x*vec.x+this.y*vec.y;},
	
	angleBetween: function(vec) {return Math.acos(this.dot(vec)/(this.length()*vec.length()));},
	
	set: function(vec) {this.x = vec.x; this.y = vec.y;},
	setf: function(x, y) {this.x = x; this.y = y;},
	
	add: function(v) {return new OE.Vector2(this.x+v.x, this.y+v.y);},
	sub: function(v) {return new OE.Vector2(this.x-v.x, this.y-v.y);},
	mul: function(v) {return new OE.Vector2(this.x*v.x, this.y*v.y);},
	div: function(v) {return new OE.Vector2(this.x/v.x, this.y/v.y);},
	addBy: function(v) {this.x+=v.x; this.y+=v.y;},
	subBy: function(v) {this.x-=v.x; this.y-=v.y;},
	mulBy: function(v) {this.x*=v.x; this.y*=v.y;},
	divBy: function(v) {this.x/=v.x; this.y/=v.y;},
	
	addf: function(f) {return new OE.Vector2(this.x+f, this.y+f);},
	subf: function(f) {return new OE.Vector2(this.x-f, this.y-f);},
	mulf: function(f) {return new OE.Vector2(this.x*f, this.y*f);},
	divf: function(f) {return new OE.Vector2(this.x/f, this.y/f);},
	addByf: function(f) {this.x+=f; this.y+=f;},
	subByf: function(f) {this.x-=f; this.y-=f;},
	mulByf: function(f) {this.x*=f; this.y*=f;},
	divByf: function(f) {this.x/=f; this.y/=f;}
};
OE.Utils.defClass(OE.Vector2);

OE.Vector2.ZERO = new OE.Vector2(0.0, 0.0);
OE.Vector2.ONE = new OE.Vector2(1.0, 1.0);
OE.Vector2.RIGHT = new OE.Vector2(1.0, 0.0);
OE.Vector2.LEFT = new OE.Vector2(-1.0, 0.0);
OE.Vector2.UP = new OE.Vector2(0.0, 1.0);
OE.Vector2.DOWN = new OE.Vector2(0.0, -1.0);

/**
 * @class Vector3
 * @module Math
 * @description Represents a 3D vector or point.
 */
OE.Vector3 = function(x, y, z) {
	if (arguments.length == 3) {
		this.x = x; this.y = y; this.z = z;
	}
	else if (arguments.length == 2) {
		this.x = x; this.y = y; this.z = 0.0;
	}
	else if (arguments.length == 1) {
		this.x = this.y = this.z = x;
	}
	else {
		this.x = this.y = this.z = 0.0;
	}
};
OE.Vector3.prototype = {
	x: 0.0, y: 0.0, z: 0.0,
	
	length2: function() {return this.x*this.x + this.y*this.y + this.z*this.z;},
	length: function() {return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z);},
	normalize: function() {
		var len2 = this.x*this.x + this.y*this.y + this.z*this.z;
		if (len2 > 0.0) {
			var len = Math.sqrt(len2);
			this.x /= len;
			this.y /= len;
			this.z /= len;
		}
		return this;
	},
	
	cross: function(vec) {
		return new OE.Vector3(
			this.y * vec.z - this.z * vec.y,
			this.z * vec.x - this.x * vec.z,
			this.x * vec.y - this.y * vec.x);
	},
	crossBy: function(vec) {
		this.setf(
			this.y * vec.z - this.z * vec.y,
			this.z * vec.x - this.x * vec.z,
			this.x * vec.y - this.y * vec.x);
		return this;
	},
	dot: function(vec) {return this.x*vec.x+this.y*vec.y+this.z*vec.z;},
	
	angleBetween: function(vec) {return Math.acos(this.dot(vec)/(this.length()*vec.length()));},
	
	set: function(vec) {this.x = vec.x; this.y = vec.y; this.z = vec.z;},

	/**
	 * @method setPosf(Number x, Number y, Number z)
	 * @description Changes this vector's x, y, and z values.
	 * @param x New x value.
	 * @param y New y value.
	 * @param z New z value.
	 */
	setf: function(x, y, z) {this.x = x; this.y = y; this.z = z;},

	add: function(v) {return new OE.Vector3(this.x+v.x, this.y+v.y, this.z+v.z);},
	sub: function(v) {return new OE.Vector3(this.x-v.x, this.y-v.y, this.z-v.z);},
	mul: function(v) {return new OE.Vector3(this.x*v.x, this.y*v.y, this.z*v.z);},
	div: function(v) {return new OE.Vector3(this.x/v.x, this.y/v.y, this.z/v.z);},
	addBy: function(v) {this.x+=v.x; this.y+=v.y; this.z+=v.z;},
	subBy: function(v) {this.x-=v.x; this.y-=v.y; this.z-=v.z;},
	mulBy: function(v) {this.x*=v.x; this.y*=v.y; this.z*=v.z;},
	divBy: function(v) {this.x/=v.x; this.y/=v.y; this.z/=v.z;},

	addf: function(f) {return new OE.Vector3(this.x+f, this.y+f, this.z+f);},
	subf: function(f) {return new OE.Vector3(this.x-f, this.y-f, this.z-f);},
	mulf: function(f) {return new OE.Vector3(this.x*f, this.y*f, this.z*f);},
	divf: function(f) {return new OE.Vector3(this.x/f, this.y/f, this.z/f);},
	addByf: function(f) {this.x+=f; this.y+=f; this.z+=f;},
	subByf: function(f) {this.x-=f; this.y-=f; this.z-=f;},
	mulByf: function(f) {this.x*=f; this.y*=f; this.z*=f;},
	divByf: function(f) {this.x/=f; this.y/=f; this.z/=f;}
};
OE.Utils.defClass(OE.Vector3);

OE.Vector3.ZERO = new OE.Vector3(0.0, 0.0, 0.0);
OE.Vector3.ONE = new OE.Vector3(1.0, 1.0, 1.0);
OE.Vector3.RIGHT = new OE.Vector3(1.0, 0.0, 0.0);
OE.Vector3.LEFT = new OE.Vector3(-1.0, 0.0, 0.0);
OE.Vector3.UP = new OE.Vector3(0.0, 1.0, 0.0);
OE.Vector3.DOWN = new OE.Vector3(0.0, -1.0, 0.0);
OE.Vector3.FORWARD = new OE.Vector3(0.0, 0.0, -1.0);
OE.Vector3.BACKWARD = new OE.Vector3(0.0, 0.0, 1.0);

/**
 * @class Vector4
 * @module Math
 * @description Represents a 4D vector or point.
 */
OE.Vector4 = function(x, y, z, w) {
	if (arguments.length == 4) {
		this.x = x; this.y = y; this.z = z; this.w = w;
	}
	else if (arguments.length == 3) {
		this.x = x; this.y = y; this.z = z; this.w = 1.0;
	}
	else if (arguments.length == 2) {
		this.x = x.x; this.y = x.y; this.z = x.z; this.w = y;
	}
	else if (arguments.length == 1) {
		this.x = this.y = this.z = x; this.w = 1.0;
	}
	else {
		this.x = this.y = this.z = 0.0; this.w = 1.0;
	}
};
OE.Vector4.prototype = {
	x: 0.0, y: 0.0, z: 0.0, w: 0.0,
	
	length2: function() {return this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;},
	length: function() {return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w);},
	
	normalize: function() {
		var len2 = this.x*this.x + this.y*this.y + this.z*this.z + this.w*this.w;
		if (len2 > 0.0) {
			var len = Math.sqrt(len2);
			this.x /= len;
			this.y /= len;
			this.z /= len;
			this.w /= len;
		}
		return this;
	},
	
	dot: function(vec) {return this.x*vec.x+this.y*vec.y+this.z*vec.z+this.w*vec.w;},
	angleBetween: function(vec) {return Math.acos(this.dot(vec)/(this.length()*vec.length()));},
	
	set: function(v) {this.x = v.x; this.y = v.y; this.z = v.z; this.w = v.w;},
	setf: function(x, y, z, w) {this.x = x; this.y = y; this.z = z; this.w = w;},

	add: function(v) {return new OE.Vector4(this.x+v.x, this.y+v.y, this.z+v.z, this.w+v.w);},
	sub: function(v) {return new OE.Vector4(this.x-v.x, this.y-v.y, this.z-v.z, this.w-v.w);},
	mul: function(v) {return new OE.Vector4(this.x*v.x, this.y*v.y, this.z*v.z, this.w*v.w);},
	div: function(v) {return new OE.Vector4(this.x/v.x, this.y/v.y, this.z/v.z, this.w/v.w);},
	addBy: function(v) {this.x+=v.x; this.y+=v.y; this.z+=v.z; this.w+=v.w;},
	subBy: function(v) {this.x-=v.x; this.y-=v.y; this.z-=v.z; this.w-=v.w;},
	mulBy: function(v) {this.x*=v.x; this.y*=v.y; this.z*=v.z; this.w*=v.w;},
	divBy: function(v) {this.x/=v.x; this.y/=v.y; this.z/=v.z; this.w/=v.w;},

	addf: function(f) {return new OE.Vector4(this.x+f, this.y+f, this.z+f, this.w+f);},
	subf: function(f) {return new OE.Vector4(this.x-f, this.y-f, this.z-f, this.w-f);},
	mulf: function(f) {return new OE.Vector4(this.x*f, this.y*f, this.z*f, this.w*f);},
	divf: function(f) {return new OE.Vector4(this.x/f, this.y/f, this.z/f, this.w/f);},
	addByf: function(f) {this.x+=f; this.y+=f; this.z+=f; this.w+=f;},
	subByf: function(f) {this.x-=f; this.y-=f; this.z-=f; this.w-=f;},
	mulByf: function(f) {this.x*=f; this.y*=f; this.z*=f; this.w*=f;},
	divByf: function(f) {this.x/=f; this.y/=f; this.z/=f; this.w/=f;}
};
OE.Utils.defClass(OE.Vector4);
// glMatrix v0.9.5
glMatrixArrayType=typeof Float32Array!="undefined"?Float32Array:typeof WebGLFloatArray!="undefined"?WebGLFloatArray:Array;var vec3={};vec3.create=function(a){var b=new glMatrixArrayType(3);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2]}return b};vec3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];return b};vec3.add=function(a,b,c){if(!c||a==c){a[0]+=b[0];a[1]+=b[1];a[2]+=b[2];return a}c[0]=a[0]+b[0];c[1]=a[1]+b[1];c[2]=a[2]+b[2];return c};
vec3.subtract=function(a,b,c){if(!c||a==c){a[0]-=b[0];a[1]-=b[1];a[2]-=b[2];return a}c[0]=a[0]-b[0];c[1]=a[1]-b[1];c[2]=a[2]-b[2];return c};vec3.negate=function(a,b){b||(b=a);b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];return b};vec3.scale=function(a,b,c){if(!c||a==c){a[0]*=b;a[1]*=b;a[2]*=b;return a}c[0]=a[0]*b;c[1]=a[1]*b;c[2]=a[2]*b;return c};
vec3.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=Math.sqrt(c*c+d*d+e*e);if(g){if(g==1){b[0]=c;b[1]=d;b[2]=e;return b}}else{b[0]=0;b[1]=0;b[2]=0;return b}g=1/g;b[0]=c*g;b[1]=d*g;b[2]=e*g;return b};vec3.cross=function(a,b,c){c||(c=a);var d=a[0],e=a[1];a=a[2];var g=b[0],f=b[1];b=b[2];c[0]=e*b-a*f;c[1]=a*g-d*b;c[2]=d*f-e*g;return c};vec3.length=function(a){var b=a[0],c=a[1];a=a[2];return Math.sqrt(b*b+c*c+a*a)};vec3.dot=function(a,b){return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]};
vec3.direction=function(a,b,c){c||(c=a);var d=a[0]-b[0],e=a[1]-b[1];a=a[2]-b[2];b=Math.sqrt(d*d+e*e+a*a);if(!b){c[0]=0;c[1]=0;c[2]=0;return c}b=1/b;c[0]=d*b;c[1]=e*b;c[2]=a*b;return c};vec3.lerp=function(a,b,c,d){d||(d=a);d[0]=a[0]+c*(b[0]-a[0]);d[1]=a[1]+c*(b[1]-a[1]);d[2]=a[2]+c*(b[2]-a[2]);return d};vec3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+"]"};var mat3={};
mat3.create=function(a){var b=new glMatrixArrayType(9);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9]}return b};mat3.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];return b};mat3.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=1;a[5]=0;a[6]=0;a[7]=0;a[8]=1;return a};
mat3.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[5];a[1]=a[3];a[2]=a[6];a[3]=c;a[5]=a[7];a[6]=d;a[7]=e;return a}b[0]=a[0];b[1]=a[3];b[2]=a[6];b[3]=a[1];b[4]=a[4];b[5]=a[7];b[6]=a[2];b[7]=a[5];b[8]=a[8];return b};mat3.toMat4=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=0;b[4]=a[3];b[5]=a[4];b[6]=a[5];b[7]=0;b[8]=a[6];b[9]=a[7];b[10]=a[8];b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat3.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+"]"};var mat4={};mat4.create=function(a){var b=new glMatrixArrayType(16);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15]}return b};
mat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=a[12];b[13]=a[13];b[14]=a[14];b[15]=a[15];return b};mat4.identity=function(a){a[0]=1;a[1]=0;a[2]=0;a[3]=0;a[4]=0;a[5]=1;a[6]=0;a[7]=0;a[8]=0;a[9]=0;a[10]=1;a[11]=0;a[12]=0;a[13]=0;a[14]=0;a[15]=1;return a};
mat4.transpose=function(a,b){if(!b||a==b){var c=a[1],d=a[2],e=a[3],g=a[6],f=a[7],h=a[11];a[1]=a[4];a[2]=a[8];a[3]=a[12];a[4]=c;a[6]=a[9];a[7]=a[13];a[8]=d;a[9]=g;a[11]=a[14];a[12]=e;a[13]=f;a[14]=h;return a}b[0]=a[0];b[1]=a[4];b[2]=a[8];b[3]=a[12];b[4]=a[1];b[5]=a[5];b[6]=a[9];b[7]=a[13];b[8]=a[2];b[9]=a[6];b[10]=a[10];b[11]=a[14];b[12]=a[3];b[13]=a[7];b[14]=a[11];b[15]=a[15];return b};
mat4.determinant=function(a){var b=a[0],c=a[1],d=a[2],e=a[3],g=a[4],f=a[5],h=a[6],i=a[7],j=a[8],k=a[9],l=a[10],o=a[11],m=a[12],n=a[13],p=a[14];a=a[15];return m*k*h*e-j*n*h*e-m*f*l*e+g*n*l*e+j*f*p*e-g*k*p*e-m*k*d*i+j*n*d*i+m*c*l*i-b*n*l*i-j*c*p*i+b*k*p*i+m*f*d*o-g*n*d*o-m*c*h*o+b*n*h*o+g*c*p*o-b*f*p*o-j*f*d*a+g*k*d*a+j*c*h*a-b*k*h*a-g*c*l*a+b*f*l*a};
mat4.inverse=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=a[4],h=a[5],i=a[6],j=a[7],k=a[8],l=a[9],o=a[10],m=a[11],n=a[12],p=a[13],r=a[14],s=a[15],A=c*h-d*f,B=c*i-e*f,t=c*j-g*f,u=d*i-e*h,v=d*j-g*h,w=e*j-g*i,x=k*p-l*n,y=k*r-o*n,z=k*s-m*n,C=l*r-o*p,D=l*s-m*p,E=o*s-m*r,q=1/(A*E-B*D+t*C+u*z-v*y+w*x);b[0]=(h*E-i*D+j*C)*q;b[1]=(-d*E+e*D-g*C)*q;b[2]=(p*w-r*v+s*u)*q;b[3]=(-l*w+o*v-m*u)*q;b[4]=(-f*E+i*z-j*y)*q;b[5]=(c*E-e*z+g*y)*q;b[6]=(-n*w+r*t-s*B)*q;b[7]=(k*w-o*t+m*B)*q;b[8]=(f*D-h*z+j*x)*q;
b[9]=(-c*D+d*z-g*x)*q;b[10]=(n*v-p*t+s*A)*q;b[11]=(-k*v+l*t-m*A)*q;b[12]=(-f*C+h*y-i*x)*q;b[13]=(c*C-d*y+e*x)*q;b[14]=(-n*u+p*B-r*A)*q;b[15]=(k*u-l*B+o*A)*q;return b};mat4.toRotationMat=function(a,b){b||(b=mat4.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];b[4]=a[4];b[5]=a[5];b[6]=a[6];b[7]=a[7];b[8]=a[8];b[9]=a[9];b[10]=a[10];b[11]=a[11];b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};
mat4.toMat3=function(a,b){b||(b=mat3.create());b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[4];b[4]=a[5];b[5]=a[6];b[6]=a[8];b[7]=a[9];b[8]=a[10];return b};mat4.toInverseMat3=function(a,b){var c=a[0],d=a[1],e=a[2],g=a[4],f=a[5],h=a[6],i=a[8],j=a[9],k=a[10],l=k*f-h*j,o=-k*g+h*i,m=j*g-f*i,n=c*l+d*o+e*m;if(!n)return null;n=1/n;b||(b=mat3.create());b[0]=l*n;b[1]=(-k*d+e*j)*n;b[2]=(h*d-e*f)*n;b[3]=o*n;b[4]=(k*c-e*i)*n;b[5]=(-h*c+e*g)*n;b[6]=m*n;b[7]=(-j*c+d*i)*n;b[8]=(f*c-d*g)*n;return b};
mat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2],f=a[3],h=a[4],i=a[5],j=a[6],k=a[7],l=a[8],o=a[9],m=a[10],n=a[11],p=a[12],r=a[13],s=a[14];a=a[15];var A=b[0],B=b[1],t=b[2],u=b[3],v=b[4],w=b[5],x=b[6],y=b[7],z=b[8],C=b[9],D=b[10],E=b[11],q=b[12],F=b[13],G=b[14];b=b[15];c[0]=A*d+B*h+t*l+u*p;c[1]=A*e+B*i+t*o+u*r;c[2]=A*g+B*j+t*m+u*s;c[3]=A*f+B*k+t*n+u*a;c[4]=v*d+w*h+x*l+y*p;c[5]=v*e+w*i+x*o+y*r;c[6]=v*g+w*j+x*m+y*s;c[7]=v*f+w*k+x*n+y*a;c[8]=z*d+C*h+D*l+E*p;c[9]=z*e+C*i+D*o+E*r;c[10]=z*
g+C*j+D*m+E*s;c[11]=z*f+C*k+D*n+E*a;c[12]=q*d+F*h+G*l+b*p;c[13]=q*e+F*i+G*o+b*r;c[14]=q*g+F*j+G*m+b*s;c[15]=q*f+F*k+G*n+b*a;return c};mat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1];b=b[2];c[0]=a[0]*d+a[4]*e+a[8]*b+a[12];c[1]=a[1]*d+a[5]*e+a[9]*b+a[13];c[2]=a[2]*d+a[6]*e+a[10]*b+a[14];return c};
mat4.multiplyVec4=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=b[3];c[0]=a[0]*d+a[4]*e+a[8]*g+a[12]*b;c[1]=a[1]*d+a[5]*e+a[9]*g+a[13]*b;c[2]=a[2]*d+a[6]*e+a[10]*g+a[14]*b;c[3]=a[3]*d+a[7]*e+a[11]*g+a[15]*b;return c};
mat4.translate=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[12]=a[0]*d+a[4]*e+a[8]*b+a[12];a[13]=a[1]*d+a[5]*e+a[9]*b+a[13];a[14]=a[2]*d+a[6]*e+a[10]*b+a[14];a[15]=a[3]*d+a[7]*e+a[11]*b+a[15];return a}var g=a[0],f=a[1],h=a[2],i=a[3],j=a[4],k=a[5],l=a[6],o=a[7],m=a[8],n=a[9],p=a[10],r=a[11];c[0]=g;c[1]=f;c[2]=h;c[3]=i;c[4]=j;c[5]=k;c[6]=l;c[7]=o;c[8]=m;c[9]=n;c[10]=p;c[11]=r;c[12]=g*d+j*e+m*b+a[12];c[13]=f*d+k*e+n*b+a[13];c[14]=h*d+l*e+p*b+a[14];c[15]=i*d+o*e+r*b+a[15];return c};
mat4.scale=function(a,b,c){var d=b[0],e=b[1];b=b[2];if(!c||a==c){a[0]*=d;a[1]*=d;a[2]*=d;a[3]*=d;a[4]*=e;a[5]*=e;a[6]*=e;a[7]*=e;a[8]*=b;a[9]*=b;a[10]*=b;a[11]*=b;return a}c[0]=a[0]*d;c[1]=a[1]*d;c[2]=a[2]*d;c[3]=a[3]*d;c[4]=a[4]*e;c[5]=a[5]*e;c[6]=a[6]*e;c[7]=a[7]*e;c[8]=a[8]*b;c[9]=a[9]*b;c[10]=a[10]*b;c[11]=a[11]*b;c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15];return c};
mat4.rotate=function(a,b,c,d){var e=c[0],g=c[1];c=c[2];var f=Math.sqrt(e*e+g*g+c*c);if(!f)return null;if(f!=1){f=1/f;e*=f;g*=f;c*=f}var h=Math.sin(b),i=Math.cos(b),j=1-i;b=a[0];f=a[1];var k=a[2],l=a[3],o=a[4],m=a[5],n=a[6],p=a[7],r=a[8],s=a[9],A=a[10],B=a[11],t=e*e*j+i,u=g*e*j+c*h,v=c*e*j-g*h,w=e*g*j-c*h,x=g*g*j+i,y=c*g*j+e*h,z=e*c*j+g*h;e=g*c*j-e*h;g=c*c*j+i;if(d){if(a!=d){d[12]=a[12];d[13]=a[13];d[14]=a[14];d[15]=a[15]}}else d=a;d[0]=b*t+o*u+r*v;d[1]=f*t+m*u+s*v;d[2]=k*t+n*u+A*v;d[3]=l*t+p*u+B*
v;d[4]=b*w+o*x+r*y;d[5]=f*w+m*x+s*y;d[6]=k*w+n*x+A*y;d[7]=l*w+p*x+B*y;d[8]=b*z+o*e+r*g;d[9]=f*z+m*e+s*g;d[10]=k*z+n*e+A*g;d[11]=l*z+p*e+B*g;return d};mat4.rotateX=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[4],g=a[5],f=a[6],h=a[7],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[0]=a[0];c[1]=a[1];c[2]=a[2];c[3]=a[3];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[4]=e*b+i*d;c[5]=g*b+j*d;c[6]=f*b+k*d;c[7]=h*b+l*d;c[8]=e*-d+i*b;c[9]=g*-d+j*b;c[10]=f*-d+k*b;c[11]=h*-d+l*b;return c};
mat4.rotateY=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[8],j=a[9],k=a[10],l=a[11];if(c){if(a!=c){c[4]=a[4];c[5]=a[5];c[6]=a[6];c[7]=a[7];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*-d;c[1]=g*b+j*-d;c[2]=f*b+k*-d;c[3]=h*b+l*-d;c[8]=e*d+i*b;c[9]=g*d+j*b;c[10]=f*d+k*b;c[11]=h*d+l*b;return c};
mat4.rotateZ=function(a,b,c){var d=Math.sin(b);b=Math.cos(b);var e=a[0],g=a[1],f=a[2],h=a[3],i=a[4],j=a[5],k=a[6],l=a[7];if(c){if(a!=c){c[8]=a[8];c[9]=a[9];c[10]=a[10];c[11]=a[11];c[12]=a[12];c[13]=a[13];c[14]=a[14];c[15]=a[15]}}else c=a;c[0]=e*b+i*d;c[1]=g*b+j*d;c[2]=f*b+k*d;c[3]=h*b+l*d;c[4]=e*-d+i*b;c[5]=g*-d+j*b;c[6]=f*-d+k*b;c[7]=h*-d+l*b;return c};
mat4.frustum=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=e*2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=e*2/i;f[6]=0;f[7]=0;f[8]=(b+a)/h;f[9]=(d+c)/i;f[10]=-(g+e)/j;f[11]=-1;f[12]=0;f[13]=0;f[14]=-(g*e*2)/j;f[15]=0;return f};mat4.perspective=function(a,b,c,d,e){a=c*Math.tan(a*Math.PI/360);b=a*b;return mat4.frustum(-b,b,-a,a,c,d,e)};
mat4.ortho=function(a,b,c,d,e,g,f){f||(f=mat4.create());var h=b-a,i=d-c,j=g-e;f[0]=2/h;f[1]=0;f[2]=0;f[3]=0;f[4]=0;f[5]=2/i;f[6]=0;f[7]=0;f[8]=0;f[9]=0;f[10]=-2/j;f[11]=0;f[12]=-(a+b)/h;f[13]=-(d+c)/i;f[14]=-(g+e)/j;f[15]=1;return f};
mat4.lookAt=function(a,b,c,d){d||(d=mat4.create());var e=a[0],g=a[1];a=a[2];var f=c[0],h=c[1],i=c[2];c=b[1];var j=b[2];if(e==b[0]&&g==c&&a==j)return mat4.identity(d);var k,l,o,m;c=e-b[0];j=g-b[1];b=a-b[2];m=1/Math.sqrt(c*c+j*j+b*b);c*=m;j*=m;b*=m;k=h*b-i*j;i=i*c-f*b;f=f*j-h*c;if(m=Math.sqrt(k*k+i*i+f*f)){m=1/m;k*=m;i*=m;f*=m}else f=i=k=0;h=j*f-b*i;l=b*k-c*f;o=c*i-j*k;if(m=Math.sqrt(h*h+l*l+o*o)){m=1/m;h*=m;l*=m;o*=m}else o=l=h=0;d[0]=k;d[1]=h;d[2]=c;d[3]=0;d[4]=i;d[5]=l;d[6]=j;d[7]=0;d[8]=f;d[9]=
o;d[10]=b;d[11]=0;d[12]=-(k*e+i*g+f*a);d[13]=-(h*e+l*g+o*a);d[14]=-(c*e+j*g+b*a);d[15]=1;return d};mat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+", "+a[4]+", "+a[5]+", "+a[6]+", "+a[7]+", "+a[8]+", "+a[9]+", "+a[10]+", "+a[11]+", "+a[12]+", "+a[13]+", "+a[14]+", "+a[15]+"]"};quat4={};quat4.create=function(a){var b=new glMatrixArrayType(4);if(a){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3]}return b};quat4.set=function(a,b){b[0]=a[0];b[1]=a[1];b[2]=a[2];b[3]=a[3];return b};
quat4.calculateW=function(a,b){var c=a[0],d=a[1],e=a[2];if(!b||a==b){a[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return a}b[0]=c;b[1]=d;b[2]=e;b[3]=-Math.sqrt(Math.abs(1-c*c-d*d-e*e));return b};quat4.inverse=function(a,b){if(!b||a==b){a[0]*=1;a[1]*=1;a[2]*=1;return a}b[0]=-a[0];b[1]=-a[1];b[2]=-a[2];b[3]=a[3];return b};quat4.length=function(a){var b=a[0],c=a[1],d=a[2];a=a[3];return Math.sqrt(b*b+c*c+d*d+a*a)};
quat4.normalize=function(a,b){b||(b=a);var c=a[0],d=a[1],e=a[2],g=a[3],f=Math.sqrt(c*c+d*d+e*e+g*g);if(f==0){b[0]=0;b[1]=0;b[2]=0;b[3]=0;return b}f=1/f;b[0]=c*f;b[1]=d*f;b[2]=e*f;b[3]=g*f;return b};quat4.multiply=function(a,b,c){c||(c=a);var d=a[0],e=a[1],g=a[2];a=a[3];var f=b[0],h=b[1],i=b[2];b=b[3];c[0]=d*b+a*f+e*i-g*h;c[1]=e*b+a*h+g*f-d*i;c[2]=g*b+a*i+d*h-e*f;c[3]=a*b-d*f-e*h-g*i;return c};
quat4.multiplyVec3=function(a,b,c){c||(c=b);var d=b[0],e=b[1],g=b[2];b=a[0];var f=a[1],h=a[2];a=a[3];var i=a*d+f*g-h*e,j=a*e+h*d-b*g,k=a*g+b*e-f*d;d=-b*d-f*e-h*g;c[0]=i*a+d*-b+j*-h-k*-f;c[1]=j*a+d*-f+k*-b-i*-h;c[2]=k*a+d*-h+i*-f-j*-b;return c};quat4.toMat3=function(a,b){b||(b=mat3.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=k+g;b[4]=1-(j+e);b[5]=d-f;b[6]=c-h;b[7]=d+f;b[8]=1-(j+l);return b};
quat4.toMat4=function(a,b){b||(b=mat4.create());var c=a[0],d=a[1],e=a[2],g=a[3],f=c+c,h=d+d,i=e+e,j=c*f,k=c*h;c=c*i;var l=d*h;d=d*i;e=e*i;f=g*f;h=g*h;g=g*i;b[0]=1-(l+e);b[1]=k-g;b[2]=c+h;b[3]=0;b[4]=k+g;b[5]=1-(j+e);b[6]=d-f;b[7]=0;b[8]=c-h;b[9]=d+f;b[10]=1-(j+l);b[11]=0;b[12]=0;b[13]=0;b[14]=0;b[15]=1;return b};quat4.slerp=function(a,b,c,d){d||(d=a);var e=c;if(a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3]<0)e=-1*c;d[0]=1-c*a[0]+e*b[0];d[1]=1-c*a[1]+e*b[1];d[2]=1-c*a[2]+e*b[2];d[3]=1-c*a[3]+e*b[3];return d};
quat4.str=function(a){return"["+a[0]+", "+a[1]+", "+a[2]+", "+a[3]+"]"};
/**
 * @class BlendMode
 * @module Materials
 * @description Describes a blending operation that the GPU can use to blend geometries together as they are rendered (ex. alpha blending, additive, etc.).
 */

/**
 * @method constructor([BlendMode.Operand src, BlendMode.Operand dst])
 * @description Constructs a BlendMode based on the src and dst operands.
 * @param src TODO
 * @param dst TODO
 */
OE.BlendMode = function(src, dst) {
	if (src !== undefined) this.mSrc = src;
	if (dst !== undefined) this.mDst = dst;
};
OE.BlendMode.Operand = {
	ZERO: 0,
	ONE: 1,
	DST_ALPHA: 2,
	DST_COLOR: 3,
	SRC_ALPHA: 4,
	SRC_COLOR: 5,
	ONE_MINUS_DST_ALPHA: 6,
	ONE_MINUS_DST_COLOR: 7,
	ONE_MINUS_SRC_ALPHA: 8,
	ONE_MINUS_SRC_COLOR: 9
};
OE.BlendMode.DEFAULT = new OE.BlendMode(
	OE.BlendMode.Operand.SRC_ALPHA,
	OE.BlendMode.Operand.ONE_MINUS_SRC_ALPHA);

OE.BlendMode.ADDITIVE = new OE.BlendMode(
	OE.BlendMode.Operand.SRC_ALPHA,
	OE.BlendMode.Operand.DST_ALPHA);
	
OE.BlendMode.ADDITIVE_OPAQUE = new OE.BlendMode(
	OE.BlendMode.Operand.ONE,
	OE.BlendMode.Operand.ONE);

OE.BlendMode.prototype = {
	mSrc: OE.BlendMode.DEFAULT.mSrc,
	mDst: OE.BlendMode.DEFAULT.mDst
};
OE.Utils.defClass(OE.BlendMode);
/**
 * @class DepthMode
 * @module Materials
 * @description Describes the way the GPU should test against the depth buffer.
 */

/**
 * @method constructor([Boolean test, Boolean write])
 * @description Constructs a DepthMode object.
 * @param test Whether or not to test against the depth buffer. Defaults to true if omitted.
 * @param write Whether or not to write to the depth buffer. Defaults to true if omitted.
 */
OE.DepthMode = function(test, write) {
	if (test !== undefined) this.mTest = test;
	if (write !== undefined) this.mWrite = write;
};
OE.DepthMode.prototype = {
	mTest: true,
	mWrite: true
};
OE.Utils.defClass(OE.DepthMode);

OE.DepthMode.DEFAULT = new OE.DepthMode(true, true);
/**
 * @class Resource
 * @module Resources
 * @extends Observable
 * @description An abstract class for defining resource types. Subclasses of [Resource] should provide an implementation of how the resource is loaded, how loading fails, etc.
 */
OE.Resource = function() {
	OE.Observable.call(this);
};

OE.Resource.LoadState = {
	NOT_LOADED: 0,
	LOADING: 1,
	LOADED: 2,
	UNLOADING: 3,
	LOAD_ERROR: 4
};

OE.Resource.prototype = {
	mResKey: undefined,
	mLoadState: OE.Resource.LoadState.NOT_LOADED,
	mLoadError: "",
	
	loadResource: function(filePath) {},
	unloadResource: function() {},
	
	changeLoadState: function(state) {
		this.mLoadState = state;
		this.dispatchEvent("loadStateChanged", [this, state]);
	},
	onLoadStart: function() {
		this.changeLoadState(OE.Resource.LoadState.LOADING);
	},
	onLoaded: function() {
		this.changeLoadState(OE.Resource.LoadState.LOADED);
	},
	onLoadError: function(message) {
		this.mLoadError = message;
		this.changeLoadState(OE.Resource.LoadState.LOAD_ERROR);
	}
};
OE.Utils.defClass(OE.Resource, OE.Observable);

// #include Resources/Resource.js

/**
 * @class Material
 * @module Materials
 * @extends Resource
 * @description A kind of [Resource] for describing the way the surface of an object looks.
 */
OE.MtlParams = function() {
	this.mBlendMode = OE.BlendMode.DEFAULT;
	this.mDepthMode = OE.DepthMode.DEFAULT;
};
OE.MtlParams.prototype = {
	mUniforms: undefined,
	mTextures: undefined,
	mBlendMode: undefined,
	mDepthMode: undefined,
	
	getUniformValue: function(name) {
		for (var j = 0; j < this.mUniforms.length; j++) {
			if (this.mUniforms[j].mName == name) {
				return this.mUniforms[j].mValue;
			}
		}
		return undefined;
	},
	setUniform: function(shader, name, value) {
		if (this.mUniforms === undefined) {
			this.mUniforms = new Array();
		}
		for (var i = 0; i < this.mUniforms.length; i++) {
			if (this.mUniforms[i].mName == name) {
				this.mUniforms[i].mValue = value;
				return true;
			}
		}
		var uniforms = shader.mUniforms;
		for (var i = 0; i < uniforms.length; i++) {
			var u = uniforms[i];
			if (u.mName === name) {
				var u2 = new OE.Shader.Uniform(u.mName, u.mLoc, u.mPreset, u.mType, value);
				this.mUniforms.push(u2);
				return true;
			}
		}
		return false;
	}
};
OE.MtlParams.prototype.constructor = OE.MtlParams;

OE.Pass = function() {};
OE.Pass.prototype = {
	mShader: undefined,
	mMtlParams: undefined
};
OE.Pass.prototype.constructor = OE.Pass;

OE.Material = function() {
	OE.Resource.call(this);
	this.mPasses = [];
};
OE.Material.prototype = {
	mPasses: undefined,
	mLayer: undefined,
	
	clear: function() {
		this.mPasses = [];
	},
	createPass: function() {
		var pass = new OE.Pass();
		this.mPasses.push(pass);
		return pass;
	},
	loadResource: function(filePath) {
		var material = this;
		material.onLoadStart();
		OE.Utils.loadJSON(filePath,
			function(json) {
				if (json == undefined ||
					json.material == undefined ||
					json.material.passes == undefined) {
					material.onLoadError("File format error.");
					return;
				}
				var mtl = json.material;
				
				var layer = mtl.layer;
				material.mLayer = OE.RenderQueue.Layer[layer];
				
				var passes = mtl.passes;
				var count = 0;
				for (var i=0; i<passes.length; i++) {
					var p = passes[i];
					if (p) {
						var pass = material.createPass();
						var initShader = false;
						var initOthers = false;
						if (p.shader) {
							OE.ShaderManager.load(p.shader,
								function(shader) {
									pass.mShader = shader;
									if (typeof p.uniforms == "object") {
										if (pass.mMtlParams == undefined) pass.mMtlParams = new OE.MtlParams();
										var params = pass.mMtlParams;
										
										if (params.mUniforms == undefined) params.mUniforms = [];
										
										for (var key in p.uniforms) {
											var u = shader.getUniformByName(key);
											if (u != undefined) {
												var u2 = OE.Utils.clone(u, true);
												u2.mValue = p.uniforms[key];
												params.mUniforms.push(u2);
											}
										}
									}
									else {
										console.warn("[Material] Material '"+filePath+"' uniforms format error.");
									}
									count++;
									
									if (count == passes.length)
										initShader = true;
									
									if (initShader && initOthers)
										material.onLoaded();
								},
								function(message) {
									console.warn("[Material] Material '"+filePath+"' Shader failed to load.");
								}
							);
							pass.mShader = OE.ShaderManager.retrieve(p.shader);
						}
						if (p.blendMode ||
							p.depthMode ||
							p.textures ||
							p.uniforms) {
							if (pass.mMtlParams == undefined) pass.mMtlParams = new OE.MtlParams();
							var params = pass.mMtlParams;
							if (p.blendMode) {
								if (typeof p.blendMode === "string") {
									params.mBlendMode = OE.BlendMode[p.blendMode];
								}
								else if (typeof p.blendMode === "object") {
									var src = p.blendMode.src;
									var dst = p.blendMode.dst;
									params.mBlendMode = new OE.BlendMode(
										OE.BlendMode.Operand[src],
										OE.BlendMode.Operand[dst]);
								}
							}
							if (p.depthMode) {
								var test = (p.depthMode.test === "true");
								var write = (p.depthMode.write === "true");
								params.mDepthMode = new OE.DepthMode(test, write);
							}
							if (p.textures) {
								params.mTextures = [];
								for (var key in p.textures) {
									var tex = OE.TextureManager.getLoaded(p.textures[key]);
									if (tex != undefined)
										params.mTextures[key] = tex;
								}
							}
						}
						initOthers = true;
						
						if (initShader && initOthers)
							material.onLoaded();
					}
				}
			},
			function(message) {
				material.onLoadError(message);
			}
		);
	},
	unloadResource: function() {
		this.mPasses = [];
	}
};
OE.Utils.defClass(OE.Material, OE.Resource);

/**
 * @class HasMaterial
 * @module Materials
 * @description A class which has an associated [Material]. Subclasses will inherit a set of utility methods for setting materials and their parameters.
 */
OE.HasMaterial = function() {
	this.mMaterial = undefined;
	this.mMtlParams = undefined;
};
OE.HasMaterial.prototype = {
	mMaterial: undefined,
	mMtlParams: undefined,
	
	setMaterial: function(material) {
		if (typeof material === "string") {
			material = OE.MaterialManager.getLoaded(material);
		}
		this.mMaterial = material;
	},
	clearMtlParams: function() {
		this.mMtlParams = undefined;
	},
	clearMaterial: function() {
		this.mMaterial = undefined;
	},
	setUniform: function(pass, name, value) {
		if (this.mMtlParams === undefined)
			this.mMtlParams = new OE.MtlParams();
		var p = this.mMaterial.mPasses[pass];
		return this.mMtlParams.setUniform(p.mShader, name, value);
	},
	unsetUniform: function(pass, name) {
		if (this.mMtlParams !== undefined) {
			var p = this.mMtlParams;
			if (p.mUniforms !== undefined) {
				for (var i=0; i<p.mUniforms.length; i++) {
					if (p.mUniforms[i].mName === name) {
						p.mUniforms.splice(i, 1);
						break;
					}
				}
			}
		}
	}
};
OE.Utils.defClass(OE.HasMaterial);
// #include Resources/Resource.js

/**
 * @class Shader
 * @module Materials
 * @extends Resource
 * @description A kind of [Resource] for loading shader programs which run on the GPU and shade geometry.
 */
OE.Shader = function() {
	OE.Resource.call(this);
	this.mUniforms = [];
	this.mAttributes = [];
};

OE.Shader.Attribute = function(name, loc) {
	this.mName = name;
	this.mLoc = loc;
};
OE.Shader.Attribute.prototype.constructor = OE.Shader.Attribute;

OE.Shader.Uniform = function(name, loc, preset, type, value) {
	this.mName = name;
	this.mLoc = loc;
	this.mPreset = preset;
	this.mType = type;
	this.mValue = value;
};
OE.Shader.Uniform.prototype.constructor = OE.Shader.Uniform;

OE.Shader.Uniform.Type = {
	INT: 0, INT2: 1, INT3: 2, INT4: 3,
	FLOAT: 4, VEC2: 5, VEC3: 6, VEC4: 7,
	MAT3: 8, MAT4: 9
};
OE.Shader.Uniform.Preset = {
	M_MATRIX: 0,
	V_MATRIX: 1,
	P_MATRIX: 2,
	MV_MATRIX: 3,
	MVP_MATRIX: 4,
	N_MATRIX: 5,
	CAMERA_POS: 6
};

OE.Shader.sBoundShader = undefined;
OE.Shader.bindShader = function(shader) {
	if (this.sBoundShader != shader) {
		this.sBoundShader = shader;
		var gl = OE.getActiveContext();
		if (shader && shader.mProgBinding)
			gl.useProgram(shader.mProgBinding);
	}
};

OE.Shader.prototype = {
	mProgBinding: undefined,
	mVertBinding: undefined,
	mFragBinding: undefined,
	mUniforms: undefined,
	mAttributes: undefined,
	
	generate: function() {
		if (this.mProgBinding === undefined) {
			var gl = OE.getActiveContext();
			this.mProgBinding = gl.createProgram();
		}
	},
	destroy: function() {
		var gl = OE.getActiveContext();
		if (this.mProgBinding != undefined) gl.deleteProgram(this.mProgBinding);
		if (this.mVertBinding != undefined) gl.deleteShader(this.mVertBinding);
		if (this.mFragBinding != undefined) gl.deleteShader(this.mFragBinding);
		this.mProgBinding = undefined;
		this.mVertBinding = undefined;
		this.mFragBinding = undefined;
		this.mUniforms = [];
		this.mAttributes = [];
	},
	compileVert: function(source) {
		var gl = OE.getActiveContext();
		var binding = gl.createShader(gl.VERTEX_SHADER);
		gl.shaderSource(binding, source);
		gl.compileShader(binding);
		if (gl.getShaderParameter(binding, gl.COMPILE_STATUS) == true) {
			this.mVertBinding = binding;
		}
		else {
			console.log("Error in vertex shader: "+gl.getShaderInfoLog(binding));
			gl.deleteShader(binding);
			return false;
		}
		return true;
	},
	compileFrag: function(source) {
		var gl = OE.getActiveContext();
		var binding = gl.createShader(gl.FRAGMENT_SHADER);
		gl.shaderSource(binding, source);
		gl.compileShader(binding);
		if (gl.getShaderParameter(binding, gl.COMPILE_STATUS) == true) {
			this.mFragBinding = binding;
		}
		else {
			console.log("Error in fragment shader: "+gl.getShaderInfoLog(binding));
			gl.deleteShader(binding);
			return false;
		}
		return true;
	},
	attach: function() {
		var gl = OE.getActiveContext();
		if (this.mProgBinding != undefined) {
			if (this.mVertBinding != undefined)
				gl.attachShader(this.mProgBinding, this.mVertBinding);
			if (this.mFragBinding != undefined)
				gl.attachShader(this.mProgBinding, this.mFragBinding);
		}
	},
	link: function() {
		if (this.mProgBinding != undefined) {
			var gl = OE.getActiveContext();
			gl.linkProgram(this.mProgBinding);
			
			if (gl.getProgramParameter(this.mProgBinding, gl.LINK_STATUS) != true) {
				console.warn("Error linking program: " + gl.getProgramInfoLog(this.mProgBinding));
				return false;
			}
		}
		return true;
	},
	bind: function() {
		if (this.mProgBinding != undefined && this.mLoadState == OE.Resource.LoadState.LOADED) {
			var gl = OE.getActiveContext();
			gl.useProgram(this.mProgBinding);
		}
	},
	
	getAttribLocation: function(vertAttrib) {
		var attr = this.mAttributes[vertAttrib.mID];
		if (attr != undefined)
			return attr.mLoc;
		return -1;
	},
	mapAttribPreset: function(name, preset) {
		var vertAttrib = OE.VertexAttribute[preset];
		if (vertAttrib != undefined && vertAttrib.mID != undefined) {
			var gl = OE.getActiveContext();
			this.mAttributes[vertAttrib.mID] = {
				mName: name,
				mLoc: gl.getAttribLocation(this.mProgBinding, name)
			};
		}
		else {
			console.warn("[Shader] Unknown attribute preset '"+presetKey+"'.");
		}
	},
	mapAttribCustom: function(name, info) {
		var gl = OE.getActiveContext();
		var offset = OE.VertexAttribute.CUSTOM_ID;
		this.mAttributes[offset + info.customID] = new OE.Shader.Attribute(
			name, gl.getAttribLocation(this.mProgBinding, name)
		);
	},
	
	getUniforms: function() {
		return this.mUniforms;
	},
	getUniformByName: function(name) {
		for (var i=0; i<this.mUniforms.length; i++) {
			if (this.mUniforms[i].mName == name) {
				return this.mUniforms[i];
			}
		}
		return undefined;
	},
	mapUniformPreset: function(name, presetKey) {
		var gl = OE.getActiveContext();
		var preset = OE.Shader.Uniform.Preset[presetKey];
		if (preset != undefined) {
			this.mUniforms.push(new OE.Shader.Uniform(
				name, gl.getUniformLocation(this.mProgBinding, name),
				preset, undefined, undefined
			));
		}
		else {
			console.warn("[Shader] Unknown uniform preset '"+presetKey+"'.");
		}
	},
	mapUniformCustom: function(name, info) {
		// Maybe convert VEC values to OE.Vector2/3/4?
		var gl = OE.getActiveContext();
		var type = OE.Shader.Uniform.Type[info.type];
		if (type != undefined) {
			this.mUniforms.push(new OE.Shader.Uniform(
				name, gl.getUniformLocation(this.mProgBinding, name),
				undefined, type, info.value
			));
		}
		else {
			console.warn("[Shader] Unknown uniform type '"+info.type+"'.");
		}
	},
	
	loadResource: function(filePath) {
		var shader = this;
		shader.onLoadStart();
		OE.Utils.loadJSON(filePath,
			function(json) {
				if (json == undefined ||
					json.shader == undefined) {
					shader.onLoadError("File format error.");
					return;
				}
				var vert = json.shader.vert;
				var frag = json.shader.frag;
				var attribs = json.shader.attributes;
				var uniforms = json.shader.uniforms;
				
				shader.generate();
				
				var paths = [vert, frag];
				var sources = [undefined, undefined];
				for (var i=0; i<paths.length; i++) {
					// Split by either slash.
					var path = filePath.split('\\');
					if (path.length == 1) path = path[0].split('/');
					
					// Replace file name part with extended path to source.
					path[path.length-1] = paths[i];
					
					// Recompile new path.
					paths[i] = path.join('/');
				}
				
				OE.Utils.loadFiles(paths,
					function(response, index) {
						sources[index] = response;
					},
					function(message, index) {
						shader.onLoadError(message);
					},
					function(numLoaded, numErrors) {
						if (numLoaded == paths.length && numErrors == 0) {
							shader.compileVert(sources[0]);
							shader.compileFrag(sources[1]);
							shader.attach();
							shader.link();
							
							var gl = OE.getActiveContext();
							var prev = OE.Shader.sBoundShader;
							OE.Shader.bindShader(shader);
							
							if (attribs) {
								for (var key in attribs) {
									var value = attribs[key];
									if (typeof value == "string") {
										shader.mapAttribPreset(key, value);
									}
									else if (typeof value == "object") {
										shader.mapAttribCustom(key, value);
									}
								}
							}
							if (uniforms) {
								for (var key in uniforms) {
									var value = uniforms[key];
									if (typeof value == "string") {
										shader.mapUniformPreset(key, value);
									}
									else if (typeof value == "object") {
										var keys = Object.keys(value);
										if (keys.length == 1) {
											shader.mapUniformCustom(key, {
												type: keys[0],
												value: value[keys[0]]});
										}
									}
								}
							}
							
							OE.Shader.bindShader(prev);
							shader.onLoaded();
						}
						else {
							shader.onLoadError("One or more shaders sources failed to load.");
						}
					}
				);
			},
			function(message) {
				shader.onLoadError(message);
			}
		);
	},
	unloadResource: function() {
		this.destroy();
	}
};
OE.Utils.defClass(OE.Shader, OE.Resource);

OE.ShaderBuilder = function() {};
OE.ShaderBuilder.prototype = {
	mShader: undefined,
	
	create: function() {
		if (this.mShader === undefined) {
			this.mShader = OE.ShaderManager.createUnmanaged();
			
			
		}
	},
	destroy: function() {
		if (this.mShader !== undefined) {
			this.mShader.destroy();
			this.mShader = undefined;
		}
	},
	bind: function() {
		if (this.mShader !== undefined) {
			this.mShader.bind();
		}
	},
	unbind: function() {
		if (this.mShader !== undefined) {
			this.mShader.unbind();
		}
	}
};
OE.Utils.defClass(OE.ShaderBuilder);

// #include Resources/Resource.js

OE.Texture = function() {
	OE.Resource.call(this);
};

OE.Texture.sActiveUnit = 0;
OE.Texture.sBoundTextures = [];
OE.Texture.sPrevTexture = undefined;
OE.Texture.getBoundTexture = function() {
	return OE.Texture.sBoundTextures[OE.Texture.sActiveUnit];
};
OE.Texture.bindTemp = function(texture) {
	var gl = OE.getActiveContext();
	this.sPrevTexture = this.sBoundTextures[this.sActiveUnit];
	gl.bindTexture(gl.TEXTURE_2D, texture.mBinding);
};
OE.Texture.unbindTemp = function() {
	var gl = OE.getActiveContext();
	if (this.sPrevTexture !== undefined) {
		gl.bindTexture(gl.TEXTURE_2D, this.sPrevTexture.mBinding);
		this.sPrevTexture = undefined;
	}
	else {
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
};
OE.Texture.activateUnit = function(unit) {
	if (this.sActiveUnit != unit) {
		this.sActiveUnit = unit;
		var gl = OE.getActiveContext();
		gl.activeTexture(gl.TEXTURE0 + unit);
	}
};
OE.Texture.bindTexture = function(texture) {
	if (this.sBoundTextures[this.sActiveUnit] !== texture) {
		if (texture) {
			if (texture.bind())
				this.sBoundTextures[this.sActiveUnit] = texture;
		}
		else {
			var gl = OE.getActiveContext();
			this.sBoundTextures[this.sActiveUnit] = undefined;
			gl.bindTexture(gl.TEXTURE_2D, null);
		}
	}
};

OE.Texture.prototype = {
	mBinding: undefined,
	
	generate: function() {
		if (this.mBinding === undefined) {
			var gl = OE.getActiveContext();
			this.mBinding = gl.createTexture();
		}
	},
	destroy: function() {
		var gl = OE.getActiveContext();
		if (this.mBinding != undefined)
			gl.deleteTexture(this.mBinding);
		this.mBinding = undefined;
	},
	bind: function() {
		if (this.mBinding != undefined && this.mLoadState == OE.Resource.LoadState.LOADED) {
			var gl = OE.getActiveContext();
			gl.bindTexture(gl.TEXTURE_2D, this.mBinding);
			return true;
		}
		return false;
	},
	
	loadResource: function(filePath) {
		var texture = this;
		texture.onLoadStart();
		try {
			var gl = OE.getActiveContext();
			var image = new Image();
			
			var resizeImage = function(img, width, height) {
				var canvas = document.createElement('canvas');
				var context = canvas.getContext('2d');
				
				canvas.width = width;
				canvas.height = height;
				context.drawImage(img, 0, 0, width, height);
				
				img.src = canvas.toDataURL();
				return img;
			};
			
			image.onload = function() {
				var w = image.width;
				var h = image.height;
				var wlog2 = Math.log(w) / Math.log(2);
				var hlog2 = Math.log(h) / Math.log(2);
				var wlog2i = Math.round(wlog2);
				var hlog2i = Math.round(hlog2);
				if (wlog2i != wlog2 || hlog2i != hlog2) {
					var w2 = Math.pow(2, wlog2i);
					var h2 = Math.pow(2, hlog2i);
					image = resizeImage(image, w2, h2);
				}
				
				var prevTexture = OE.Texture.getBoundTexture();
				var prevBinding = prevTexture ? prevTexture.mBinding : null;
				
				texture.generate();
				gl.bindTexture(gl.TEXTURE_2D, texture.mBinding);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
				gl.generateMipmap(gl.TEXTURE_2D);
				
				gl.bindTexture(gl.TEXTURE_2D, prevBinding);
				
				texture.onLoaded();
			};
			image.onerror = function() {
				texture.onLoadError("Error loading image.");
			};
			image.src = filePath;
		}
		catch(e) {
			texture.onLoadError("Error loading image.");
		}
	},
	unloadResource: function() {
		this.destroy();
	}
};
OE.Utils.defClass(OE.Texture, OE.Resource);
/**
 * @class Renderable
 * @module Rendering
 * @description An interface for anything that can be queued in a [RenderQueue], and later rendered by the [RenderSystem] by supplying a [RenderOperation].
 */
OE.Renderable = function() {};

OE.Renderable.prototype = {
	getRenderOperation: function(op) {}
};
OE.Utils.defClass(OE.Renderable);

// #include General/Observable.js
// #include Math/Movable.js

/**@class GameObject
 * @module Scene
 * @extends Movable Observable
 * @description The base class for game objects that can be added to a [Scene].
 * 
 * [GameObject]s can be added as children to other [GameObject]s, forming a tree structure in which each node transforms together with its parent.
 */
OE.GameObject = OE.Utils.defClass2(OE.Movable, OE.Observable, {
	mScene: undefined,
	mParent: undefined,
	mChildren: undefined,
	mActive: true,
	mWorldTransform: undefined,
	mCulledLastFrame: false,
	
	/**@method constructor()
	 * @description Creates a new [GameObject] with the identity [Transform] and no children.
	 */
	constructor: function GameObject() {
		OE.Movable.call(this);
		OE.Observable.call(this);
		
		this.mChildren = [];
		this.mWorldTransform = new OE.Transform();
		
		this.onCreate();
	},
	
	/**
	 * @method onCreate()
	 * @description Called by the GameObject constructor. It must be overridden to do anything.
	 */
	onCreate: function() {},
	onAddedToScene: function() {},
	onRemovedFromScene: function() {},
	onUpdate: function() {},

	/**
	 * @method onDestroy()
	 * @description Called by the destructor. It must be overwritten to do anything.
	 */
	onDestroy: function() {},
	queueRenderables: function(renderQueue) {},
	
	/**
	 * @method _setScene(Scene scene)
	 * @description Associate a [Scene] with this [GameObject]. This should only be called by the [GameObject] class. Do not override.
	 * @param scene The [Scene] to associate with this object.
	 */
	_setScene: function(scene) {
		if (this.mScene !== scene) {
			if (this.mScene)
				this.mScene.dispatchEvent("objectRemoved", [this]);
			
			this.mScene = scene;
			
			if (this.mScene)
				this.mScene.dispatchEvent("objectAdded", [this]);
			
			for (var i=0; i<this.mChildren.length; i++) {
				this.mChildren[i]._setScene(scene);
			}
			this.dispatchEvent("sceneChanged");
		}
	},

	/**
	 * @method addChild(GameObject child)
	 * @description Adds a child [GameObject] to this object.
	 * @param child The [GameObject] to add as a child.
	 * @return The child [GameObject] for chaining.
	 */
	addChild: function(child) {
		var oldParent = child.mParent;
		if (oldParent !== undefined) {
			child.mParent.removeChild(child);
		}
		this.mChildren.push(child);
		child.mParent = this;
		child._setScene(this.mScene);
		child.onTransformChanged();
		child.onAddedToScene();
		this.dispatchEvent("childAdded");
		child.dispatchEvent("addedToScene");
		return child;
	},
	removeChild: function(child) {
		var index = this.mChildren.indexOf(child);
		if (index >= 0) {
			child.onRemovedFromScene();
			child._setScene(undefined);
			child.mParent = undefined;
			this.mChildren.splice(index, 1);
			this.dispatchEvent("childRemoved");
			child.dispatchEvent("removedFromScene");
			this.mScene.dispatchEvent("childRemoved", [child, this]);
		}
	},
	
	/**
	 * @method destroy()
	 * @description Destroys this object and all its children.
	 */
	destroy: function() {
		this.onDestroy();
		this.destroyAll();
		if (this.mParent) {
			this.mParent.removeChild(this);
			this.dispatchEvent("destroyed");
		}
	},

	/**
	 * @method destroyAll()
	 * @description Destroys all of this object's children (and all of their children and so on).
	 */
	destroyAll: function() {
		while (this.mChildren.length > 0) {
			this.mChildren[0].destroy();
		}
	},
	update: function() {
		if (this.mActive) {
			this.onUpdate();
			for (var i=0; i<this.mChildren.length; i++) {
				if (this.mChildren[i].mActive)
					this.mChildren[i].update();
			}
		}
	},
	
	getTransform: function(local) {
		return (local ? this.mTransform : this.mWorldTransform);
	},
	getWorldMatrix: function() {
		return this.mWorldTransform.getMatrix();
	},
	onTransformChanged: function() {
		if (this.mParent !== undefined) {
			OE.Transform.apply(	this.mWorldTransform,
								this.mParent.mWorldTransform,
								this.mTransform);
		}
		else {
			this.mWorldTransform.set(this.mTransform);
		}
		
		for (var i=0; i<this.mChildren.length; i++)
			this.mChildren[i].onTransformChanged();
	},
	
	mSerialData: undefined,
	
	applySerialData: function(data) {
		if (data.transform) {
			var pos = data.transform.pos;
			var rot = data.transform.rot;
			var scale = data.transform.scale;
			if (pos) this.setPosf(pos[0], pos[1], pos[2]);
			if (rot) this.setRotf(rot[0], rot[1], rot[2], rot[3]);
			if (scale) this.setScalef(scale[0], scale[1], scale[2]);
		}
	}
});

OE.GameObject.serialize = function(object) {
	var className = object.prototype.constructor;
	var pos = object.getPos();
	var rot = object.getRot();
	return {
		transform: {
			pos: [pos.x, pos.y, pos.z],
			rot: [rot.x, rot.y, rot.z, rot.w],
			scale: [1.0, 1.0, 1.0]
		}
	};
};
OE.GameObject.decodeMtlParams = function(data) {
	if (data.mtlParams === undefined)
		return undefined;
	
	var material = OE.MaterialManager.getLoaded(data.material);
	var p = data.mtlParams;
	var shader = material.mPasses[0].mShader;
	var params = new OE.MtlParams();
	
	if (params.mUniforms == undefined)
		params.mUniforms = [];
	
	for (var key in p.uniforms) {
		var u = shader.getUniformByName(key);
		if (u != undefined) {
			var u2 = OE.Utils.clone(u, true);
			u2.mValue = p.uniforms[key];
			params.mUniforms.push(u2);
		}
	}
	
	return params;
};
OE.GameObject.deserialize = function(data) {
	var constr = eval(data.className);
	var object = undefined;
	
	if (constr !== undefined) {
		if (constr.deserialize !== OE.GameObject.deserialize &&
			constr.deserialize !== undefined) {
			object = constr.deserialize(data);
		}
		else {
			object = new OE.GameObject();
		}
		object.applySerialData(data);
	}
	return object;
};

OE.Utils.implement(OE.GameObject, OE.Serializable);

// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.BatchedGeom = OE.Utils.defClass2(OE.GameObject, {
	mBatches: undefined,
	mEntities: undefined,
	mModels: undefined,
	
	constructor: function() {
		OE.GameObject.call(this);
		this.mBatches = new Array();
		this.mEntities = new Array();
		this.mModels = new Array();
	},
	addModel: function(model) {
		this.mModels.push(model);
	},
	addEntity: function(entity) {
		this.mEntities.push(entity);
	},
	clear: function() {
		this.clearBatches();
		this.clearEntities();
	},
	clearBatches: function() {
		for (var i=0; i<this.mBatches.length; i++) {
			this.mBatches[i].clear();
		}
		this.mBatches = new Array();
	},
	clearEntities: function() {
		this.mEntities = new Array();
		this.mModels = new Array();
	},
	compile: function() {
		this.clearBatches();
		
		var processMesh = function(model, index) {
			var mesh = model.mMeshes[index];
			var mtl = model.mMtlMapping[index];
			var vf = mesh.mVertexFormat;
			var found = false;
			for (var i=0; i<this.mBatches.length; i++) {
				var batch = this.mBatches[i];
				if (batch.mMaterial === mtl && batch.mVertexFormat.mAttributes.length === vf.mAttributes.length) {
					batch.mMeshes.push(mesh);
					found = true;
					break;
				}
			}
			if (!found) {
				var batch = new OE.BatchedGeom.Batch(this);
				this.mBatches.push(batch);
				batch.mMaterial = mtl;
				batch.mVertexFormat = vf;
				batch.mMeshes.push(mesh);
			}
		}.bind(this);
		
		for (var i=0; i<this.mEntities.length; i++) {
			var model = this.mEntities[i].mModel;
			for (var j=0; j<model.mMeshes.length; j++) {
				processMesh(model, j);
			}
		}
		for (var i=0; i<this.mModels.length; i++) {
			var model = this.mModels[i];
			for (var j=0; j<model.mMeshes.length; j++) {
				processMesh(model, j);
			}
		}
		for (var i=0; i<this.mBatches.length; i++) {
			var batch = this.mBatches[i];
			batch.mMaterial = OE.MaterialManager.getLoaded(batch.mMaterial);
			batch.compile();
		}
	},
	queueRenderables: function(rq) {
		for (var i=0; i<this.mBatches.length; i++)
			rq.queueRenderable(this.mBatches[i]);
	}
});

OE.BatchedGeom.Batch = OE.Utils.defClass2(OE.Renderable, {
	mBatchedGeom: undefined,
	mVertexFormat: undefined,
	mMeshes: undefined,
	mMaterial: undefined,
	
	constructor: function(batchedGeom) {
		OE.Renderable.call(this);
		this.mBatchedGeom = batchedGeom;
		this.mVertexFormat = undefined;
		this.mMeshes = new Array();
		this.mMaterial = undefined;
	},
	clear: function() {
		this.clearBuffers();
		this.clearMeshes();
	},
	clearBuffers: function() {
		if (this.mVertexData)
			this.mVertexData.clear();
		if (this.mIndexData)
			this.mIndexData.clear();
		this.mVertexData = undefined;
		this.mIndexData = undefined;
	},
	clearMeshes: function() {
		this.mMeshes = new Array();
	},
	compile: function() {
		this.clearBuffers();
		
		var numVerts = 0;
		var numIndices = 0;
		for (var i=0; i<this.mMeshes.length; i++) {
			numVerts += this.mMeshes[i].mNumVertices;
			numIndices += this.mMeshes[i].mNumIndices;
		}
		
		var vertData = this.mVertexData = new OE.VertexData();
		vertData.mAttributes = this.mVertexFormat.mAttributes;
		vertData.mVertexSize = this.mVertexFormat.mVertexSize;
		vertData.setNumVertices(numVerts);
		
		var vbo = vertData.createBuffer();
		var buffer = vbo.map(vertData.getByteSize());
		for (var i=0; i<this.mMeshes.length; i++) {
			var mesh = this.mMeshes[i];
			for (var j=0; j<mesh.mVertexData.length; j++) {
				buffer.putFloat(mesh.mVertexData[j]);
			}
		}
		vbo.unmap();
		
		var indexData = this.mIndexData = new OE.IndexData();
		indexData.setNumIndices(numIndices);
		
		var vertSize = vertData.mVertexSize / 4;
		var firstIndex = 0;
		var ibo = indexData.createBuffer();
		var buffer = ibo.map(indexData.getByteSize());
		for (var i=0; i<this.mMeshes.length; i++) {
			var mesh = this.mMeshes[i];
			for (var j=0; j<mesh.mIndexData.length; j++) {
				buffer.putUint(firstIndex + mesh.mIndexData[j]);
			}
			firstIndex += mesh.mVertexData.length / vertSize;
		}
		ibo.unmap();
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLES;
		op.mModelMatrix = this.mBatchedGeom.getWorldMatrix();
		op.mVertexData = this.mVertexData;
		op.mIndexData = this.mIndexData;
		op.mMaterial = this.mMaterial;
	}
});

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.Billboard = function() {
	OE.Renderable.call(this);
	OE.GameObject.call(this);
	OE.HasMaterial.call(this);
	
	this.mVertexData = new OE.VertexData();
	this.mColor = new OE.Color(1.0);
	this.mSize = new OE.Vector2(1.0);
	this.mUpdateBufferFlag = false;
	
	this.updateBuffer();
};

OE.Billboard.prototype = {
	mVertexData: undefined,
	mColor: undefined,
	mSize: undefined,
	mUpdateBufferFlag: false,
	
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	updateBuffer: function() {
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(4);
		
		var vert = function(buffer, p, t, c) {
			buffer.putVec3(p);
			buffer.putVec2(t);
			buffer.putColor4f(c);
		};
		
		var pos = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		
		var p = new OE.Vector3();
		var t = new OE.Vector2();
		var c = this.mColor;
		var s = this.mSize;
		
		var bufferSize = vertexData.getByteSize();
		var buffer = gpuBuffer.map(bufferSize);
		for (var i = 0; i < 4; i++) {
			var i2 = i*2;
			p.setf(	pos[i2  ] * s.x,
					pos[i2+1] * s.y,
					0.0);
			t.setf(pos[i2], pos[i2+1]);
			vert(buffer, p, t, c);
		}
		gpuBuffer.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
};
OE.Utils.defClass(OE.Billboard, OE.Renderable, OE.GameObject, OE.HasMaterial);

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.Box = OE.Utils.defClass2(OE.Renderable, OE.GameObject, OE.HasMaterial, {
	mVertexData: undefined,
	mColor: undefined,
	mUpdateBufferFlag: false,
	mBoundingBox: undefined,
	
	mWidth: 1.0,
	mHeight: 1.0,
	mDepth: 1.0,
	
	constructor: function(width, height, depth) {
		OE.Renderable.call(this);
		OE.GameObject.call(this);
		OE.HasMaterial.call(this);
		
		this.mVertexData = new OE.VertexData();
		this.mColor = new OE.Color(1.0);
		this.mUpdateBufferFlag = false;
		this.mBoundingBox = new OE.BoundingBox();
		
		if (width !== undefined) this.mWidth = width;
		if (height !== undefined) this.mHeight = height;
		if (depth !== undefined) this.mDepth = depth;
		
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO,
			this.mWidth, this.mHeight, this.mDepth);
		
		this.updateBuffer();
	},
	
	setSize: function(width, height, depth) {
		if (width !== undefined) this.mWidth = width;
		if (height !== undefined) this.mHeight = height;
		if (depth !== undefined) this.mDepth = depth;
		
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO,
			this.mWidth, this.mHeight, this.mDepth);
		this.updateBuffer();
	},
	
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	onDestroy: function() {
		if (this.mVertexData)
			this.mVertexData.clear();
		this.mUpdateBufferFlag = false;
	},
	updateBuffer: function() {
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO,
			this.mWidth, this.mHeight, this.mDepth);
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.NORMAL);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		
		var vert = function(buffer, p, n, t, c) {
			buffer.putVec3(p);
			buffer.putVec3(n);
			buffer.putVec2(t);
			buffer.putColor4f(c);
		};
		
		var p = new OE.Vector3(), n = new OE.Vector3();
		var t = new OE.Vector2();
		var c = this.mColor;
		
		var norms = [
			 0,-1, 0,
			 0, 0, 1,
			 1, 0, 0,
			 0, 0,-1,
			-1, 0, 0,
			 0, 1, 0
		];
		// x, y, z, face. every 5th and 6th line a degenerate triangle
		var verts = [
			-1,-1, 1,	0, // begin bottom
			-1,-1,-1,	0,
			 1,-1, 1,	0,
			 1,-1,-1,	0,
			 1,-1,-1,	0, // end bottom
			-1, 1, 1,	1, // begin front
			-1, 1, 1,	1,
			-1,-1, 1,	1,
			 1, 1, 1,	1,
			 1,-1, 1,	1,
			 1,-1, 1,	1, // end front
			 1, 1, 1,	2, // begin right
			 1, 1, 1,	2,
			 1,-1, 1,	2,
			 1, 1,-1,	2,
			 1,-1,-1,	2,
			 1,-1,-1,	2, // end right
			 1, 1,-1,	3, // begin back
			 1, 1,-1,	3,
			 1,-1,-1,	3,
			-1, 1,-1,	3,
			-1,-1,-1,	3,
			-1, 1,-1,	3, // end back
			-1, 1,-1,	4, // begin left
			-1, 1,-1,	4,
			-1,-1,-1,	4,
			-1, 1, 1,	4,
			-1,-1, 1,	4,
			-1,-1, 1,	4, // end left
			-1, 1,-1,	5, // begin top
			-1, 1,-1,	5,
			-1, 1, 1,	5,
			 1, 1,-1,	5,
			 1, 1, 1,	5 // end top
		];
		
		var w = this.mWidth;
		var h = this.mHeight;
		var d = this.mDepth;
		var halfSize = new OE.Vector3(w/2.0, h/2.0, d/2.0);
		
		vertexData.setNumVertices(verts.length / 4);
		var vbo = vertexData.createBuffer();
		var buffer = vbo.map(vertexData.getByteSize());
		
		for (var i = 0; i < verts.length; i+=4) {
			var fx = verts[i];
			var fy = verts[i+1];
			var fz = verts[i+2];
			var ni = verts[i+3] * 3;
			
			p.setf(fx, fy, fz);
			p.mulBy(halfSize);
			n.setf(norms[ni], norms[ni+1], norms[ni+2]);
			
			var tx, ty;
			
			switch (verts[i+3]) {
				case 0: t.setf( fx*0.5+0.5, fz*0.5+0.5); break;
				case 1: t.setf( fx*0.5+0.5, fy*0.5+0.5); break;
				case 2: t.setf( fz*0.5+0.5, fy*0.5+0.5); break;
				case 3: t.setf(-fx*0.5+0.5, fy*0.5+0.5); break;
				case 4: t.setf(-fz*0.5+0.5, fy*0.5+0.5); break;
				case 5: t.setf( fx*0.5+0.5, fz*0.5+0.5); break;
			}
			vert(buffer, p, n, t, c);
		}
		vbo.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
});

OE.Box.serialize = function(object) {
	return {
		width: object.mRadius,
		height: object.mSlices
	};
};
OE.Box.deserialize = function(data) {
	var object = new OE.Box(data.width, data.height, data.depth);
	object.mMaterial = OE.MaterialManager.getLoaded(data.material);
	object.mMtlParams = OE.GameObject.decodeMtlParams(data);
	return object;
};

// #include Scene/GameObject.js

OE.DrawShapes = OE.Utils.defClass2(OE.GameObject, OE.HasMaterial, {
	mPoints: undefined,
	mLines: undefined,
	mRenderables: undefined,
	
	constructor: function() {
		OE.GameObject.call(this);
		this.mPoints = new Array();
		this.mLines = new Array();
		this.mRenderables = new Array();
	},
	clearBuffers: function() {
		for (var i=0; i<this.mRenderables.length; i++) {
			this.mRenderables[i].mVertexData.clear();
		}
		this.mRenderables = new Array();
	},
	clear: function() {
		this.mPoints = new Array();
		this.mLines = new Array();
		this.clearBuffers();
	},
	point: function(pos, color, size) {
		if (color === undefined) color = OE.Color.WHITE;
		if (size === undefined) size = 4.0;
		this.mPoints.push({
			pos: pos,
			color: color,
			size: size});
	},
	line: function(x1, y1, z1, x2, y2, z2, color, size) {
		this.mLines.push({
			src: new OE.Vector3(x1, y1, z1),
			dst: new OE.Vector3(x2, y2, z2),
			color: color,
			size: size});
	},
	updateBuffer: function() {
		this.clearBuffers();
		
		if (this.mPoints.length > 0) {
			var vertexData = new OE.VertexData();
			vertexData.addAttribute(OE.VertexAttribute.POSITION);
			vertexData.addAttribute(OE.VertexAttribute.COLOR);
			vertexData.addCustomAttribute(0, OE.VertexAttribute.Type.FLOAT, 1);
			vertexData.setNumVertices(this.mPoints.length);
			var vbo = vertexData.createBuffer();
			var buffer = vbo.map(vertexData.getByteSize());
			for (var i=0; i<this.mPoints.length; i++) {
				var p = this.mPoints[i];
				buffer.putVec3(p.pos);
				buffer.putColor4f(p.color);
				buffer.putFloat(p.size);
			}
			vbo.unmap();
			
			var r = new OE.Renderable();
			r.mParentObj = this;
			r.mVertexData = vertexData;
			r.getRenderOperation = function(op) {
				op.mType = OE.RenderOperation.Type.POINTS;
				op.mModelMatrix = this.mParentObj.getWorldMatrix();
				op.mVertexData = this.mVertexData;
				op.mMaterial = this.mParentObj.mMaterial;
			};
			this.mRenderables.push(r);
		}
		if (this.mLines.length > 0) {
			var vertexData = new OE.VertexData();
			vertexData.addAttribute(OE.VertexAttribute.POSITION);
			vertexData.addAttribute(OE.VertexAttribute.COLOR);
			vertexData.addCustomAttribute(0, OE.VertexAttribute.Type.FLOAT, 1);
			vertexData.setNumVertices(this.mLines.length*2);
			var vbo = vertexData.createBuffer();
			var buffer = vbo.map(vertexData.getByteSize());
			for (var i=0; i<this.mLines.length; i++) {
				var line = this.mLines[i];
				buffer.putVec3(line.src);
				buffer.putColor4f(line.color);
				buffer.putFloat(line.size);
				
				buffer.putVec3(line.dst);
				buffer.putColor4f(line.color);
				buffer.putFloat(line.size);
			}
			vbo.unmap();
			
			var r = new OE.Renderable();
			r.mParentObj = this;
			r.mVertexData = vertexData;
			r.getRenderOperation = function(op) {
				op.mType = OE.RenderOperation.Type.LINES;
				op.mModelMatrix = this.mParentObj.getWorldMatrix();
				op.mVertexData = this.mVertexData;
				op.mMaterial = this.mParentObj.mMaterial;
			};
			this.mRenderables.push(r);
			
		}
	},
	queueRenderables: function(rq) {
		for (var i=0; i<this.mRenderables.length; i++) {
			rq.queueRenderable(this.mRenderables[i]);
		}
	}
});

// #include Scene/GameObject.js

OE.Emitter = function(params) {
	OE.GameObject.call(this);
	
	this.mEmitClass = params.emitClass;
	this.mClassArgs = params.classArgs;
	
	this.mMaterial = params.material;
	
	if (params.emitsPerBurst !== undefined) this.mEmitsPerBurst = params.emitsPerBurst;
	if (params.framesPerBurst !== undefined) this.mFramesPerBurst = params.framesPerBurst;
	if (params.lifespan !== undefined) this.mLifespan = params.lifespan;
	
	if (params.radiusMin !== undefined) this.mRadiusMin = params.radiusMin;
	if (params.radiusMax !== undefined) this.mRadiusMax = params.radiusMax;
	if (params.speedMin !== undefined) this.mSpeedMin = params.speedMin;
	if (params.speedMax !== undefined) this.mSpeedMax = params.speedMax;
	
	this.mOnEmit = params.onEmit;
	
	this.mTimer = this.mFramesPerBurst - 1;
	
	this.mChildData = {};
};

OE.Emitter.prototype = {
	mEmitClass: undefined,
	mClassArgs: undefined,
	mMaterial: undefined,
	mEmitsPerBurst: 1,
	mFramesPerBurst: 5,
	mLifespan: 30,
	mRadiusMin: 0.0,
	mRadiusMax: 0.0,
	mSpeedMin: 0.0,
	mSpeedMax: 0.125,
	mOnEmit: undefined,
	
	mTimer: 0,
	
	onUpdate: function() {
		this.mTimer++;
		if (this.mTimer >= this.mFramesPerBurst) {
			this.burst();
			this.mTimer = 0;
		}
		
		for (var i=0; i<this.mChildren.length; i++) {
			var obj = this.mChildren[i];
			var data = obj.mEmitterData;
			if (data !== undefined) {
				var p = obj.getPos();
				p.addBy(data.velocity);
				obj.setPos(p);
				
				data.lifetime++;
				if (data.lifetime > this.mLifespan) {
					obj.destroy();
					i--;
				}
			}
		}
	},
	burst: function() {
		for (var i=0; i<this.mEmitsPerBurst; i++) {
			this.emit();
		}
	},
	rad2fwd: function(radx, rady, result) {
		var yinv = Math.cos(radx);
		result.setf(Math.sin(rady) * yinv,
					Math.sin(radx),
					-Math.cos(rady) * yinv);
	},
	deg2fwd: function(degx, degy, result) {
		this.rad2fwd(degx * OE.Math.DEG_TO_RAD, degy * OE.Math.DEG_TO_RAD, result);
	},
	emit: function() {
		if (this.mEmitClass !== undefined) {
			function construct(constructor, args) {
				function F() {
					return constructor.apply(this, args);
				}
				F.prototype = constructor.prototype;
				return new F();
			}
			
			var obj = construct(this.mEmitClass, this.mClassArgs);
			this.addChild(obj);
			obj.mMaterial = this.mMaterial;
			
			var pos = obj.getPos();
			var ax = Math.random() * 360.0;
			var ay = Math.random() * 180.0 - 90.0;
			var r = this.mRadiusMin + (this.mRadiusMax - this.mRadiusMin) * Math.random();
			var s = this.mSpeedMin + (this.mSpeedMax - this.mSpeedMin) * Math.random();
			
			this.deg2fwd(ax, ay, pos);
			
			var v = new OE.Vector3();
			v.set(pos);
			v.mulByf(s);
			
			pos.mulByf(r);
			obj.setPos(pos);
			
			obj.mEmitterData = {
				velocity: v,
				lifetime: 0
			};
			
			if (this.mOnEmit !== undefined)
				this.mOnEmit(obj);
		}
	},
	
	queueRenderables: function(renderQueue) {}
};
OE.Utils.defClass(OE.Emitter, OE.GameObject);

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.SubEntity = function(entity, mesh, material) {
	OE.Renderable.call(this);
	OE.HasMaterial.call(this);
	
	this.mBoundingBox = new OE.BoundingBox();
	this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, 1.0, 1.0, 1.0);
	
	this.mEntity = entity;
	this.mMesh = mesh;
	this.mMaterial = material;
	this.mVertexData = new OE.VertexData();
	this.mIndexData = new OE.IndexData();
	this.updateBuffer();
};
OE.SubEntity.prototype = {
	mEntity: undefined,
	mMesh: undefined,
	mVertexData: undefined,
	mIndexData: undefined,
	
	onDestroy: function() {
		this.mMesh = undefined;
		this.mMaterial = undefined;
		if (this.mVertexData) this.mVertexData.clear();
		if (this.mIndexData) this.mIndexData.clear();
	},
	updateBuffer: function() {
		var vertexData = this.mVertexData;
		var indexData = this.mIndexData;
		vertexData.clear();
		indexData.clear();
		
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, 1.0, 1.0, 1.0);
		
		if (this.mMesh) {
			this.mBoundingBox.set(this.mMesh.mBoundingBox);
			
			var vertexBuffer = new OE.GpuBuffer();
			vertexBuffer.create();
			vertexData.setBuffer(vertexBuffer);
			vertexData.mAttributes = this.mMesh.mVertexFormat.mAttributes;
			vertexData.mVertexSize = this.mMesh.mVertexFormat.mVertexSize;
			vertexData.setNumVertices(this.mMesh.mNumVertices);
			
			var bufferSize = vertexData.getByteSize();
			var buffer = vertexBuffer.map(bufferSize);
			for (var i = 0; i < this.mMesh.mVertexData.length; i++) {
				buffer.putFloat(this.mMesh.mVertexData[i]);
			}
			vertexBuffer.unmap();
			
			var indexBuffer = new OE.GpuBuffer(OE.GpuBuffer.Target.ELEMENT_ARRAY);
			indexBuffer.create();
			indexData.setBuffer(indexBuffer);
			indexData.setNumIndices(this.mMesh.mNumIndices);
			
			bufferSize = indexData.getByteSize();
			buffer = indexBuffer.map(bufferSize);
			for (var i = 0; i < this.mMesh.mIndexData.length; i++) {
				buffer.putUint(this.mMesh.mIndexData[i]);
			}
			indexBuffer.unmap();
		}
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLES;
		op.mVertexData = this.mVertexData;
		op.mIndexData = this.mIndexData;
		op.mModelMatrix = this.mEntity.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
};
OE.Utils.defClass(OE.SubEntity, OE.Renderable, OE.HasMaterial);

OE.Entity = function Entity(model, material) {
	OE.GameObject.call(this);
	this.mModel = undefined;
	this.mSubEntities = [];
	
	if (typeof model === "string") model = OE.ModelManager.getLoaded(model);
	if (typeof material === "string") material = OE.MaterialManager.getLoaded(material);
	
	this.mBoundingBox = new OE.BoundingBox();
	this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, 1.0, 1.0, 1.0);
	
	if (model !== undefined) {
		this.fromModel(model, material);
	}
};
OE.Entity.prototype = {
	mSubEntities: undefined,
	
	clear: function() {
		for (var i=0; i<this.mSubEntities.length; i++) {
			this.mSubEntities[i].clear();
		}
		this.mModel = undefined;
		this.mSubEntities = [];
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, 1.0, 1.0, 1.0);
	},
	fromModel: function(model, material) {
		this.clear();
		
		var onLoaded = function(res) {
			this.mModel = res;
			for (var i=0; i<res.mMeshes.length; i++) {
				var mesh = res.mMeshes[i];
				var mtl = res.mMtlMapping[i];
				
				if (material !== undefined) mtl = material;
				else if (mtl !== undefined) mtl = OE.MaterialManager.getLoaded(mtl);
				
				var sub = new OE.SubEntity(this, mesh, mtl);
				this.mSubEntities.push(sub);
			}
			this.mBoundingBox.set(res.mBoundingBox);
		}.bind(this);
		
		OE.ModelManager.load(model.mResKey, onLoaded);
	},
	queueRenderables: function(renderQueue) {
		for (var i=0; i<this.mSubEntities.length; i++) {
			renderQueue.queueRenderable(this.mSubEntities[i]);
		}
	}
};

OE.Entity.deserialize = function(data) {
	var object = new OE.Entity(data.model);
	return object;
};

OE.Utils.defClass(OE.Entity, OE.GameObject);

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.ParticleSystem = OE.Utils.defClass(OE.Renderable, OE.GameObject, OE.HasMaterial, {
	constructor: function() {
		OE.Renderable.call(this);
		OE.GameObject.call(this);
		OE.HasMaterial.call(this);
	},
	
	onUpdate: function() {},
	
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
});

// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.Plane = OE.Utils.defClass2(OE.Renderable, OE.GameObject, {
	mVertexData: undefined,
	mMaterial: undefined,
	mUpdateBufferFlag: false,
	
	mWidth: 128.0,
	mHeight: 128.0,
	mTexWrapX: 1.0,
	mTexWrapY: 1.0,
	mSizeX: 5,
	mSizeY: 5,
	mSize: 25,
	
	constructor: function Plane(width, height, xSegs, ySegs) {
		OE.Renderable.call(this);
		OE.GameObject.call(this);
		
		this.mVertexData = new OE.VertexData();
		this.mMaterial = undefined;
		this.mUpdateBufferFlag = false;
		this.mBoundingBox = new OE.BoundingBox();
		
		this.mWidth = width;
		this.mHeight = height;
		this.mSizeX = xSegs != undefined ? xSegs : 5;
		this.mSizeY = ySegs != undefined ? ySegs : this.mSizeX;
		this.mSizeX++; this.mSizeY++;
		this.mSize = this.mSizeX * this.mSizeY;
		
		this.mTexWrapX = this.mSizeX-1;
		this.mTexWrapY = this.mSizeY-1;
		
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, this.mWidth, 0.0, this.mHeight);
		
		this.updateBuffer();
	},
	
	onDestroy: function() {
		if (this.mVertexData !== undefined) {
			this.mVertexData.clear();
			this.mVertexData = undefined;
		}
	},
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	updateBuffer: function() {
		var w = this.mWidth;
		var h = this.mHeight;
		var xsegs = this.mSizeX-1;
		var ysegs = this.mSizeY-1;
		var num = ysegs + ysegs*(xsegs+1)*2 + ysegs;
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.NORMAL);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		vertexData.setNumVertices(num);
		
		var vert = function(buffer, p, n, t) {
			buffer.putVec3(p);
			buffer.putVec3(n);
			buffer.putVec2(t);
			buffer.putColor4f(OE.Color.WHITE);
		};
		
		var p1 = new OE.Vector3(), p2 = new OE.Vector3(), n = OE.Vector3.UP;
		var t1 = new OE.Vector2(), t2 = new OE.Vector2();
		
		var vbo = vertexData.createBuffer();
		var buffer = vbo.map(vertexData.getByteSize());
		for (var iy = 0; iy < ysegs; iy++) {
			var fy1 = iy / ysegs;
			var fy2 = (iy+1) / ysegs;
			for (var ix = 0; ix <= xsegs; ix++) {
				var fx = ix / xsegs;
				p1.setf((fx-0.5)*w, 0.0, (fy1-0.5)*h);
				p2.setf((fx-0.5)*w, 0.0, (fy2-0.5)*h);
				t1.setf(fx * this.mTexWrapX, fy1 * this.mTexWrapY);
				t2.setf(fx * this.mTexWrapX, fy2 * this.mTexWrapY);
				
				if (ix == 0) {
					vert(buffer, p2, n, t2);
				}
				vert(buffer, p2, n, t2);
				vert(buffer, p1, n, t1);
			}
			vert(buffer, p1, n, t1);
		}
		vbo.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
	}
});

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

/**
 * @class Sphere
 * @module Objects
 * @extends Renderable GameObject HasMaterial
 * @description A default [GameObject] that generates a spherical mesh.
 *              Also implements a [Renderable], which is submitted to the [RenderSystem] for rendering.
 */
OE.Sphere = OE.Utils.defClass2(OE.Renderable, OE.GameObject, OE.HasMaterial, {
	mVertexData: undefined,
	mColor: undefined,
	mUpdateBufferFlag: false,
	mBoundingBox: undefined,
	
	mRadius: 1.0,
	mStacks: 16,
	mSlices: 16,
	
	constructor: function Sphere(radius, stacks, slices) {
		OE.Renderable.call(this);
		OE.GameObject.call(this);
		OE.HasMaterial.call(this);
		
		this.mVertexData = new OE.VertexData();
		this.mColor = new OE.Color(1.0);
		this.mUpdateBufferFlag = false;
		this.mBoundingBox = new OE.BoundingBox();
		
		if (stacks == undefined) stacks = 16;
		if (slices == undefined) slices = stacks*2;
		
		this.mRadius = radius == undefined ? 1.0 : radius;
		this.mStacks = stacks;
		this.mSlices = slices;
		
		var r2 = this.mRadius*2.0;
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, r2, r2, r2);
		
		this.updateBuffer();
	},
	
	setRadius: function(radius) {
		this.mRadius = radius;
		var r2 = this.mRadius*2.0;
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, r2, r2, r2);
		this.updateBuffer();
	},
	
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	onDestroy: function() {
		if (this.mVertexData)
			this.mVertexData.clear();
		this.mUpdateBufferFlag = false;
	},
	onTransformChanged: function() {
		OE.GameObject.prototype.onTransformChanged.call(this);
		//var r2 = this.mRadius*2.0;
		//this.mBoundingBox.surroundPoint(this.getTransform().getPos(), r2, r2, r2);
	},
	updateBuffer: function() {
		var r = this.mRadius;
		var st = this.mStacks;
		var sl = this.mSlices;
		var num = st*2*(sl+2);
		
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.NORMAL);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(num);
		
		var vert = function(buffer, p, n, t, c) {
			buffer.putVec3(p);
			buffer.putVec3(n);
			buffer.putVec2(t);
			buffer.putColor4f(c);
		};
		
		var n1 = new OE.Vector3(), n2 = new OE.Vector3(),
			p1 = new OE.Vector3(), p2 = new OE.Vector3();
		var t1 = new OE.Vector2(), t2 = new OE.Vector2();
		var c = this.mColor;
		
		var rad2fwd = function(radx, rady, result) {
			var yinv = Math.cos(radx);
			result.setf(Math.sin(rady) * yinv,
						Math.sin(radx),
						-Math.cos(rady) * yinv);
		}
		var deg2fwd = function(degx, degy, result) {
			rad2fwd(degx * OE.Math.DEG_TO_RAD, degy * OE.Math.DEG_TO_RAD, result);
		}
		
		var bufferSize = vertexData.getByteSize();
		var buffer = gpuBuffer.map(bufferSize);
		for (var ix = 0; ix < st; ix++)
		{
			var fx1 = ix / st;
			var fx2 = (ix+1) / st;
			var ax1 = fx1 * 180.0 - 90.0;
			var ax2 = fx2 * 180.0 - 90.0;
			for (var iy = 0; iy <= sl; iy++)
			{
				var fy = iy / sl;
				var ay = fy * 360.0;
				deg2fwd(ax1, ay, n1); n1.normalize();
				deg2fwd(ax2, ay, n2); n2.normalize();
				p1.set(n1); p1.mulByf(r);
				p2.set(n2); p2.mulByf(r);
				t1.setf(fy, fx1);
				t2.setf(fy, fx2);
				
				if (iy == 0) {
					vert(buffer, p2, n2, t2, c);
				}
				vert(buffer, p2, n2, t2, c);
				vert(buffer, p1, n1, t1, c);
			}
			vert(buffer, p1, n1, t1, c);
		}
		gpuBuffer.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
});

OE.Sphere.serialize = function(object) {
	return {
		radius: object.mRadius,
		segments: object.mSlices
	};
};
OE.Sphere.deserialize = function(data) {
	var object = new OE.Sphere(data.radius, data.segments);
	object.mMaterial = OE.MaterialManager.getLoaded(data.material);
	object.mMtlParams = OE.GameObject.decodeMtlParams(data);
	return object;
};

// #include Scene/GameObject.js
// #include Objects/Sphere.js

OE.PointLight = function(rad) {
	OE.Sphere.call(this, rad, 16, 24);
	
	this.mMaterial = OE.MaterialManager.getLoaded("LightVolume");
	
	this.mBillboard = new OE.Billboard();
};
OE.PointLight.prototype = {
	mBillboard: undefined,
	
};
OE.Utils.defClass(OE.PointLight, OE.Sphere);


// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.Spline = function() {
	OE.Renderable.call(this);
	OE.GameObject.call(this);
	
	this.mVertexData = new OE.VertexData();
	this.mMaterial = undefined;
	this.mColor = new OE.Color(1.0);
	this.mUpdateBufferFlag = false;
	
	this.mPoints = new Array();
	this.updateBuffer();
};

OE.Spline.prototype = {
	mVertexData: undefined,
	mMaterial: undefined,
	mColor: undefined,
	mUpdateBufferFlag: false,
	mBoundingBox: undefined,
	
	mPoints: undefined,
	
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	onDestroy: function() {
		if (this.mVertexData)
			this.mVertexData.clear();
		this.mUpdateBufferFlag = false;
	},
	updateBuffer: function() {
		var num = this.mPoints.length;
		if (num > 1) {
			var gpuBuffer = new OE.GpuBuffer();
			gpuBuffer.create();
			
			var vertexData = this.mVertexData;
			vertexData.clear();
			vertexData.addAttribute(OE.VertexAttribute.POSITION);
			vertexData.addAttribute(OE.VertexAttribute.COLOR);
			vertexData.setBuffer(gpuBuffer);
			vertexData.setNumVertices(num);
			
			var vert = function(buffer, p, c) {
				buffer.putVec3(p);
				buffer.putColor4f(c);
			};
			
			var p = new OE.Vector3();
			var c = this.mColor;
			
			var bufferSize = vertexData.getByteSize();
			var buffer = gpuBuffer.map(bufferSize);
			for (var i = 0; i < this.mPoints.length; i++) {
				p.set(this.mPoints[i]);
				vert(buffer, p, c);
			}
			gpuBuffer.unmap();
		}
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.LINE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
};

OE.Spline.serialize = function(object) {
}
OE.Spline.deserialize = function(data) {
}

OE.Utils.defClass(OE.Spline, OE.Renderable, OE.GameObject);

// #include Materials/HasMaterial.js
// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.Sprite = OE.Utils.defClass2(OE.Renderable, OE.GameObject, OE.HasMaterial, {
	mVertexData: undefined,
	mColor: undefined,
	mAnchor: undefined,
	mSize: undefined,
	mUpdateBufferFlag: false,
	
	constructor: function() {
		OE.Renderable.call(this);
		OE.GameObject.call(this);
		
		this.mVertexData = new OE.VertexData();
		this.mColor = new OE.Color(1.0);
		this.mAnchor = new OE.Vector2(0.5),
		this.mSize = new OE.Vector2(1.0);
		this.mUpdateBufferFlag = false;
		
		this.updateBuffer();
	},
	
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	updateBuffer: function() {
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(4);
		
		var vert = function(buffer, p, t, c) {
			buffer.putVec3(p);
			buffer.putVec2(t);
			buffer.putColor4f(c);
		};
		
		var bufferSize = vertexData.getByteSize();
		
		var pos = [
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,
			1.0, 1.0
		];
		
		var p = new OE.Vector3();
		var t = new OE.Vector2();
		var c = this.mColor;
		var a = this.mAnchor;
		var s = this.mSize;
		
		var buffer = gpuBuffer.map(bufferSize);
		for (var i = 0; i < 4; i++)
		{
			var i2 = i*2;
			p.setf(	(pos[i2  ]-a.x) * s.x,
					(pos[i2+1]-a.y) * s.y,
					0.0);
			t.setf(pos[i2], pos[i2+1]);
			
			vert(buffer, p, t, c);
		}
		gpuBuffer.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
});

// #include Rendering/Renderable.js
// #include Scene/GameObject.js

OE.TerrainPatch = function(width, height, xSegs, ySegs) {
	OE.Renderable.call(this);
	OE.GameObject.call(this);
	
	this.mVertexData = new OE.VertexData();
	this.mMaterial = undefined;
	this.mUpdateBufferFlag = false;
	this.mBoundingBox = new OE.BoundingBox();
	
	this.mWidth = width;
	this.mHeight = height;
	this.mSizeX = xSegs != undefined ? xSegs : 255;
	this.mSizeY = ySegs != undefined ? ySegs : this.mSizeX;
	this.mSizeX++; this.mSizeY++;
	this.mSize = this.mSizeX * this.mSizeY;
	
	this.mHeightmap = new Array(this.mSize);
	this.mNormals = new Array(this.mSize);
	
	for (var i = 0; i < this.mSize; i++) {
		this.mHeightmap[i] = 0.0;
		this.mNormals[i] = new OE.Vector3(0.0, 1.0, 0.0);
	}
	
	this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, this.mWidth, 50.0, this.mHeight);
	
	this.updateBuffer();
};
OE.TerrainPatch.prototype = {
	mVertexData: undefined,
	mMaterial: undefined,
	mUpdateBufferFlag: false,
	mBoundingBox: undefined,
	
	mThread: undefined,
	mThreadWorkPerTick: 100,
	mMinThreadTime: 20,
	mMaxThreadTime: 30,
	
	mHeightmap: undefined,
	mNormals: undefined,
	mWidth: 128.0,
	mHeight: 128.0,
	mMinHeight: 0.0,
	mMaxHeight: 0.0,
	mSizeX: 256,
	mSizeY: 256,
	mSize: 256*256,
	
	onDestroy: function() {
		if (this.mThread !== undefined) {
			clearInterval(this.mThread.interval);
			this.mThread.interval = undefined;
			this.mThread = undefined;
		}
		if (this.mVertexData !== undefined) {
			this.mVertexData.clear();
			this.mVertexData = undefined;
		}
	},
	onUpdate: function() {
		if (this.mUpdateBufferFlag) {
			this.mUpdateBufferFlag = false;
			this.updateBuffer();
		}
	},
	onTransformChanged: function() {
		OE.GameObject.prototype.onTransformChanged.call(this);
		this.mBoundingBox.surroundPoint(OE.Vector3.ZERO, this.mWidth, 0.0, this.mHeight);
		this.mBoundingBox.p1.y = this.mMinHeight;
		this.mBoundingBox.p2.y = this.mMaxHeight;
	},
	getHeight: function(x, y) {
		var i = this.mSizeX*y+x;
		return this.mHeightmap[i];
	},
	setHeight: function(x, y, height) {
		this.mHeightmap[this.mSizeX*y+x] = height;
	},
	getHeightInterp: function(px, py) {
		px = (px / this.mWidth) * (this.mSizeX-1);
		py = (py / this.mHeight) * (this.mSizeY-1);
		var x = Math.floor(px);
		var y = Math.floor(py);
		var h1 = this.getHeight(x,   y);
		var h2 = this.getHeight(x+1, y);
		var h3 = this.getHeight(x,   y+1);
		var h4 = this.getHeight(x+1, y+1);
		px = OE.Math.fract(px);
		py = OE.Math.fract(py);
		var height = OE.Math.interpN(2, OE.Math.linInterp, [[h1, h2], [h3, h4]], [px, py]);
		return height;
	},
	getNormal: function(x, y) {
		var i = this.mSizeX*y+x;
		return this.mNormals[i];
	},
	setNormal: function(x, y, normal) {
		this.mNormals[this.mSizeX*y+x] = normal;
	},
	getNormalInterp: function(px, py) {
		px = (px / this.mWidth) * (this.mSizeX-1);
		py = (py / this.mHeight) * (this.mSizeY-1);
		var x = Math.floor(px);
		var y = Math.floor(py);
		return this.getNormal(x, y);
	},
	setHeightmap: function(heightFunc, callback) {
		var thread = {
			patch: this,
			workPerTick: this.mThreadWorkPerTick,
			x: 0, y: 0, index: 0,
			interval: undefined,
			heightFunc: heightFunc,
			start: function() {
				this.patch.mMinHeight = this.patch.mMinHeight = 0.0;
				this.updateBBox();
				
				var msec = OE.Math.linInterp(this.mMinThreadTime, this.mMaxThreadTime, Math.random());
				this.interval = setInterval(this.updateHeights.bind(this), msec);
			},
			updateHeights: function() {
				for (var i=0; i<this.workPerTick; i++) {
					var height = this.heightFunc(this.x, this.y);
					this.patch.setHeight(this.x, this.y, height);
					if (this.index === 0) {
						this.patch.mMinHeight = height;
						this.patch.mMaxHeight = height;
					}
					if (height < this.patch.mMinHeight) this.patch.mMinHeight = height;
					if (height > this.patch.mMaxHeight) this.patch.mMaxHeight = height;
					
					this.index++;
					this.x++;
					if (this.x == this.patch.mSizeX) {
						this.x = 0;
						this.y++;
						if (this.y == this.patch.mSizeY) {
							clearInterval(this.interval);
							this.interval = undefined;
							this.updateBBox();
							this.updateNormals();
							this.patch.mUpdateBufferFlag = true;
							this.patch.mThread = undefined;
							callback();
							break;
						}
					}
					//if (this.index % Math.round(this.patch.mSize/5) == 0) {
					//	this.patch.mUpdateBufferFlag = true;
					//}
				}
			},
			updateBBox: function() {
				this.patch.mBoundingBox.surroundPoint(OE.Vector3.ZERO, this.patch.mWidth, 0.0, this.patch.mHeight);
				this.patch.mBoundingBox.p1.y += this.patch.mMinHeight;
				this.patch.mBoundingBox.p2.y += this.patch.mMaxHeight;
			},
			updateNormals: function() {
				var p = this.patch;
				var h1, h2, h3,
					fx, fy, px, py,
					n1, n2, n3, n4, n;
				var dx = p.mWidth / (p.mSizeX-1);
				var dy = p.mHeight / (p.mSizeY-1);
				
				n1 = new OE.Vector3();
				n2 = new OE.Vector3();
				n3 = new OE.Vector3();
				n4 = new OE.Vector3();
				n = new OE.Vector3();
				
				for (var y=0; y<p.mSizeY; y++) {
					var fy = y / (p.mSizeY-1);
					py = (fy-0.5)*p.mHeight;
					for (var x=0; x<p.mSizeX; x++) {
						var fx = x / (p.mSizeX-1);
						px = (fx-0.5)*p.mWidth;
						var i = p.mSizeX*y+x;
						
						h1 = h2 = h3 = p.getHeight(x, y);
						if (x > 0) h1 = p.getHeight(x-1, y);
						if (x+1 < p.mSizeX) h3 = p.getHeight(x+1, y);
						
						n1.setf(-(h2 - h1), dx, 0.0);
						n2.setf((h2 - h3), dx, 0.0);
						
						h1 = h2 = h3 = p.getHeight(x, y);
						if (y > 0) h1 = p.getHeight(x, y-1);
						if (y+1 < p.mSizeY) h3 = p.getHeight(x, y+1);
						
						n3.setf(0.0, dy, -(h2 - h1));
						n4.setf(0.0, dy, (h2 - h3));
						
						n.set(n1); n.addBy(n2);
						n.addBy(n3); n.addBy(n4);
						n.normalize();
						
						p.mNormals[i].set(n);
					}
				}
			}
		};
		this.mThread = thread;
		thread.start();
	},
	updateBuffer: function() {
		var w = this.mWidth;
		var h = this.mHeight;
		var xsegs = this.mSizeX-1;
		var ysegs = this.mSizeY-1;
		var num = ysegs + ysegs*(xsegs+1)*2 + ysegs;
		
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.addAttribute(OE.VertexAttribute.NORMAL);
		vertexData.addAttribute(OE.VertexAttribute.TEXCOORD);
		vertexData.addAttribute(OE.VertexAttribute.COLOR);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(num);
		
		var vert = function(buffer, p, n, t) {
			buffer.putVec3(p);
			buffer.putVec3(n);
			buffer.putVec2(t);
			buffer.putColor4f(OE.Color.WHITE);
		};
		
		var bufferSize = vertexData.getByteSize();
		
		var p1 = new OE.Vector3(), p2 = new OE.Vector3(),
			n1 = new OE.Vector3(), n2 = new OE.Vector3();
		var t1 = new OE.Vector2(), t2 = new OE.Vector2();
		
		var buffer = gpuBuffer.map(bufferSize);
		for (var iy = 0; iy < ysegs; iy++)
		{
			var fy1 = iy / ysegs;
			var fy2 = (iy+1) / ysegs;
			for (var ix = 0; ix <= xsegs; ix++)
			{
				var fx = ix / xsegs;
				var i1 = this.mSizeX*iy+ix;
				var i2 = this.mSizeX*(iy+1)+ix;
				p1.setf((fx-0.5)*w, this.mHeightmap[i1], (fy1-0.5)*h);
				p2.setf((fx-0.5)*w, this.mHeightmap[i2], (fy2-0.5)*h);
				n1.set(this.mNormals[i1]);
				n2.set(this.mNormals[i2]);
				t1.setf(fx, fy1);
				t2.setf(fx, fy2);
				
				if (ix == 0) {
					vert(buffer, p2, n2, t2);
				}
				vert(buffer, p2, n2, t2);
				vert(buffer, p1, n1, t1);
			}
			vert(buffer, p1, n1, t1);
		}
		gpuBuffer.unmap();
	},
	queueRenderables: function(renderQueue) {
		renderQueue.queueRenderable(this);
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.getWorldMatrix();
		op.mMaterial = this.mMaterial;
	}
};
OE.Utils.defClass(OE.TerrainPatch, OE.Renderable, OE.GameObject);

OE.Compositor = function(viewport) {
	this.mViewport = viewport;
	this.mRenderTargets = {};
};
OE.Compositor.prototype = {
	mViewport: undefined,
	mRenderTargets: undefined,
	
	mapRenderTarget: function(name, rt) {
		this.mRenderTargets[name] = rt;
	},
	getRenderTarget: function(name) {
		return this.mRenderTargets[name];
	},
	renderScene: function(scene, viewport, camera) {
		scene.mRenderQueue.renderAll();
	}
};
OE.Utils.defClass(OE.Compositor);



OE.ForwardCompositor = function(viewport) {
	OE.Compositor.call(this, viewport);
	
	var rect = viewport.getScreenRect();
	this.mOpaqueRT = new OE.RenderTexture(rect.width, rect.height);
	this.mFinalRT = new OE.RenderTexture(rect.width, rect.height);
	this.mHDR = new OE.RenderTexture(rect.width, rect.height);
	/*var size = Math.max(rect.width, rect.height);
	var slog2 = Math.log(size) / Math.log(2);
	var slog2i = Math.round(slog2);
	if (slog2i != slog2) {
		size = Math.pow(2, slog2i);
	}
	this.mOpaqueRT = new OE.RenderTexture(size, size);
	this.mFinalRT = new OE.RenderTexture(size, size);*/
	
	this.mapRenderTarget("OE_Forward_Opaque", this.mOpaqueRT);
	this.mapRenderTarget("OE_Forward_Final", this.mFinalRT);
	this.mapRenderTarget("OE_Forward_HDR", this.mHDR);
};
OE.ForwardCompositor.prototype = {
	mOpaqueRT: undefined,
	mFinalRT: undefined,
	
	renderScene: function(scene, viewport, camera) {
		var Layer = OE.RenderQueue.Layer;
		var rq = scene.mRenderQueue;
		var rs = rq.mRenderSystem;
		
		var gl = OE.getActiveContext();
		
		this.mOpaqueRT.bind();
		rs.clearBuffer(true, true);
		rq.renderLayer(Layer.Default);
		rq.renderLayer(Layer.Opaque);
		rq.renderLayer(Layer.Background);
		this.mOpaqueRT.unbind();
		
		this.mFinalRT.bind();
		rs.blitRenderTexture(this.mOpaqueRT);
		rq.renderLayer(Layer.Transparent);
		this.mFinalRT.unbind();
		
		/*this.mHDR.bind();
		rs.blitRenderTexture(this.mFinalRT);
		this.mHDR.unbind();*/
		
		/*this.mBloom.bind();
		rs.blitRenderTexture(this.mHDR);
		this.mBloom.unbind();*/
		
		rs.activateViewport(undefined);
		rs.activateViewport(viewport);
		
		rs.blitRenderTexture(this.mFinalRT);
		//rs.blitRenderTexture(this.mBloom);
	}
};
OE.Utils.defClass(OE.ForwardCompositor, OE.Compositor);



OE.DeferredCompositor = function(viewport) {
	OE.Compositor.call(this, viewport);
	
	var gl = OE.getActiveContext();
	
	var rect = viewport.getScreenRect();
	this.mGBuffer = new OE.FrameBuffer(rect.width, rect.height);
	this.mTextures = [
		this.mGBuffer.addColorTexture(),
		this.mGBuffer.addColorTexture(),
		this.mGBuffer.addColorTexture()];
	this.mDepthBuffer = this.mGBuffer.addDepthTexture();
	this.mGBuffer.setBlitTex(0);
	
	this.mFinalRT = new OE.FrameBuffer(rect.width, rect.height);
	this.mFinalRT.addColorTexture();
	this.mFinalRT.setBlitTex(0);
	
	this.mapRenderTarget("OE_Deferred_GBuffer", this.mGBuffer);
	this.mapRenderTarget("OE_Deferred_Final", this.mFinalRT);
};
OE.DeferredCompositor.prototype = {
	mGBuffer: undefined,
	mTextures: undefined,
	mDepthBuffer: undefined,
	
	renderScene: function(scene, viewport, camera) {
		var Layer = OE.RenderQueue.Layer;
		var rq = scene.mRenderQueue;
		var rs = rq.mRenderSystem;
		
		var gl = OE.getActiveContext();
		
		gl.disable(gl.BLEND);
		
		this.mGBuffer.bind();
		rs.clearBuffer(true, true);
		rq.renderAllExcept(Layer.Lights);
		this.mGBuffer.unbind();
		
		gl.enable(gl.BLEND);
		
		this.mFinalRT.bind();
		rs.clearBuffer(true, true);
		rq.renderLayer(Layer.Lights);
		this.mFinalRT.unbind();
		
		rs.activateViewport(undefined);
		rs.activateViewport(viewport);
		rs.blitRenderTexture(this.mFinalRT);
		
		//debug
		//rs.blitRenderTexture(this.mGBuffer);
	}
};
OE.Utils.defClass(OE.DeferredCompositor, OE.Compositor);


OE.FrameBuffer = function(width, height) {
	OE.Renderable.call(this);
	
	this.width = width;
	this.height = height;
	this.textures = new Array();
	
	this.mModelMatrix = mat4.create();
	mat4.identity(this.mModelMatrix);
	this.mMaterial = undefined;
	
	this.mMtlParams = new OE.MtlParams();
	this.mMtlParams.mTextures = [undefined];
	this.mMtlParams.mDepthMode = undefined;
	this.mMtlParams.mBlendMode = undefined;
	
	this.create();
	this.updateVBO();
};
OE.FrameBuffer.prototype = {
	create: function() {
		var gl = OE.getActiveContext();
		this.fbo = gl.createFramebuffer();
	},
	destroy: function() {
		this.clearVBO();
		this.mMtlParams.mTextures[0] = undefined;
		for (var i=0; i<this.textures.length; i++)
			this.textures[i].clear();
		this.textures = new Array();
		
		var gl = OE.getActiveContext();
		gl.deleteFramebuffer(this.fbo);
		this.fbo = undefined;
		
		gl.deleteRenderbuffer(this.rbo);
		this.rbo = undefined;
		
	},
	setBlitTex: function(id) {
		this.mMtlParams.mTextures[0] = this.textures[id];
	},
	addColorTexture: function(params) {
		var gl = OE.getActiveContext();
		var ext = gl.getExtension("WEBGL_draw_buffers");
		var id = this.textures.length;
		
		if (!ext && gl.rawgl) ext = gl.rawgl.getExtension("WEBGL_draw_buffers");
		
		if (!ext && id > 0) {
			console.warn("[FrameBuffer] Extension not supported: WEBGL_draw_buffers. Cannot add more than one color attachment.");
		}
		else {
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
			
			var tex = gl.createTexture();
			var oeTex = new OE.Texture();
			oeTex.mBinding = tex;
			this.textures.push(oeTex);
			
			if (params === undefined) params = {};
			if (params.min_filter === undefined) params.min_filter = gl.NEAREST;
			if (params.mag_filter === undefined) params.mag_filter = gl.NEAREST;
			if (params.wrap_s === undefined) params.wrap_s = gl.CLAMP_TO_EDGE;
			if (params.wrap_t === undefined) params.wrap_t = gl.CLAMP_TO_EDGE;
			if (params.internal_format === undefined) params.internal_format = gl.RGBA;
			if (params.src_format === undefined) params.src_format = params.internal_format;
			if (params.type === undefined) params.type = gl.UNSIGNED_BYTE;
			
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, params.mag_filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, params.min_filter);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, params.wrap_s);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, params.wrap_t);
			gl.texImage2D(gl.TEXTURE_2D, 0, params.internal_format, this.width, this.height, 0, params.src_format, params.type, null);
			//gl.generateMipmap(gl.TEXTURE_2D);
			
			if (!ext) {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
			}
			else {
				gl.framebufferTexture2D(gl.FRAMEBUFFER, ext.COLOR_ATTACHMENT0_WEBGL + id, gl.TEXTURE_2D, tex, 0);
				var buffers = new Array(id+1);
				for (var i=0; i<=id; i++) {
					buffers[i] = ext.COLOR_ATTACHMENT0_WEBGL + i;
				}
				ext.drawBuffersWEBGL(buffers);
			}
			
			gl.bindTexture(gl.TEXTURE_2D, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
			return oeTex;
		}
	},
	addDepthTexture: function() {
		if (this.rbo === undefined) {
			var gl = OE.getActiveContext();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
			
			var rbo = gl.createRenderbuffer();
			this.rbo = rbo;
			gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
			
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		}
		return this.rbo;
	},
	bind: function() {
		var gl = OE.getActiveContext();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.viewport(0, 0, this.width, this.height);
	},
	unbind: function() {
		var gl = OE.getActiveContext();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		/*OE.Texture.bindTemp(this.texture);
		gl.generateMipmap(gl.TEXTURE_2D);
		OE.Texture.unbindTemp();*/
	},
	clearVBO: function() {
		if (this.mVertexData !== undefined) {
			this.mVertexData.clear();
			this.mVertexData = undefined;
		}
	},
	updateVBO: function() {
		this.clearVBO();
		
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		this.mVertexData = new OE.VertexData();
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(4);
		
		var vert = function(buffer, p) {
			buffer.putVec3(p);
		};
		
		var pos = [
			-1.0, -1.0,
			 1.0, -1.0,
			-1.0,  1.0,
			 1.0,  1.0];
		var p = new OE.Vector3();
		
		var bufferSize = vertexData.getByteSize();
		var buffer = gpuBuffer.map(bufferSize);
		for (var i = 0; i < 4; i++) {
			var i2 = i*2;
			p.setf(pos[i2], pos[i2+1], 0.0);
			vert(buffer, p);
		}
		gpuBuffer.unmap();
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.mModelMatrix;
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
};
OE.Utils.defClass(OE.FrameBuffer, OE.Renderable);

OE.GpuBuffer = function(target) {
	this.mBinding = 0;
	this.mSize = 0;
	this.mMapData = undefined;
	this.mTarget = (target === undefined) ? OE.GpuBuffer.Target.ARRAY : target;
};

OE.GpuBuffer.Target = {
	ARRAY: 0,
	ELEMENT_ARRAY: 1
};
OE.GpuBuffer.getGLTarget = function(target) {
	var gl = OE.getActiveContext();
	switch (target) {
		case OE.GpuBuffer.Target.ARRAY:			return gl.ARRAY_BUFFER;
		case OE.GpuBuffer.Target.ELEMENT_ARRAY:	return gl.ELEMENT_ARRAY_BUFFER;
	}
	return gl.ARRAY_BUFFER;
};

OE.GpuBuffer.sBoundBuffer = [
	undefined,
	undefined
];
OE.GpuBuffer.bindBuffer = function(buffer, target) {
	var gl = OE.getActiveContext();
	
	if (target === undefined)
		target = buffer ? buffer.mTarget : gl.ARRAY_BUFFER;
	
	if (this.sBoundBuffer[target] != buffer) {
		this.sBoundBuffer[target] = buffer;
		if (buffer && buffer.mBinding) {
			var glTarget = OE.GpuBuffer.getGLTarget(target);
			gl.bindBuffer(glTarget, buffer.mBinding);
		}
	}
};

OE.GpuBuffer.prototype = {
	mBinding: 0,
	mSize: 0,
	mMapData: undefined,
	
	create: function() {
		var gl = OE.getActiveContext();
		this.mBinding = gl.createBuffer();
	},
	destroy: function() {
		var gl = OE.getActiveContext();
		gl.deleteBuffer(this.mBinding);
		this.mBinding = 0;
		this.mSize = 0;
	},
	allocSize: function(size) {
		var mapData = {
			buffer: new OE.ByteBuffer(size),
			mode: 0
		};
		mapData.buffer.rewind();
		this.writeData(mapData);
	},
	writeData: function(mapData) {
		var gl = OE.getActiveContext();
		var prev = OE.GpuBuffer.sBoundBuffer[this.mTarget];
		OE.GpuBuffer.bindBuffer(this);
		var target = OE.GpuBuffer.getGLTarget(this.mTarget);
		
		if (mapData.mode === 0) {
			this.mSize = mapData.buffer.mSize;
			gl.bufferData(target, mapData.buffer.mBuffer, gl.STATIC_DRAW);
		}
		else if (mapData.mode === 1) {
			gl.bufferSubData(target, mapData.offset, mapData.buffer.mBuffer);
		}
		OE.GpuBuffer.bindBuffer(prev);
	},
	map: function(size) {
		this.mMapData = {
			buffer: new OE.ByteBuffer(size),
			mode: 0
		};
		this.mMapData.buffer.rewind();
		return this.mMapData.buffer;
	},
	mapSub: function(offset, size) {
		this.mMapData = {
			buffer: new OE.ByteBuffer(size),
			mode: 1,
			offset: offset
		};
		this.mMapData.buffer.rewind();
		return this.mMapData.buffer;
	},
	unmap: function() {
		if (this.mMapData != undefined) {
			this.writeData(this.mMapData);
			this.mMapData = undefined;
		}
	}
};
OE.Utils.defClass(OE.GpuBuffer);

OE.IndexData = function() {};
OE.IndexData.prototype = {
	mGpuBuffer: undefined,
	mNumIndices: 0,
	
	clear: function() {
		this.mNumIndices = 0;
		if (this.mGpuBuffer) {
			this.mGpuBuffer.destroy();
			this.mGpuBuffer = undefined;
		}
	},
	createBuffer: function(gpuBuffer) {
		this.mGpuBuffer = new OE.GpuBuffer(OE.GpuBuffer.Target.ELEMENT_ARRAY);
		this.mGpuBuffer.create();
		return this.mGpuBuffer;
	},
	setBuffer: function(gpuBuffer) {
		this.mGpuBuffer = gpuBuffer;
	},
	setNumIndices: function(num) {
		this.mNumIndices = num;
	},
	getByteSize: function() {
		return this.mNumIndices * 4;
	}
};
OE.Utils.defClass(OE.IndexData);

OE.RenderOperation = function() {
	this.reset();
};

OE.RenderOperation.prototype = {
	mType: undefined,
	mVertexData: undefined,
	mIndexData: undefined,
	mMaterial: undefined,
	mMtlParams: undefined,
	mModelMatrix: undefined,
	
	reset: function() {
		this.mType = OE.RenderOperation.Type.TRIANGLES;
		this.mVertexData = undefined;
		this.mIndexData = undefined;
		this.mMaterial = undefined;
		this.mMtlParams = undefined;
		this.mModelMatrix = undefined;
	}
};
OE.Utils.defClass(OE.RenderOperation);

OE.RenderOperation.Type = {
	POINTS: 0,
	LINES: 1,
	LINE_STRIP: 2,
	TRIANGLES: 3,
	TRIANGLE_STRIP: 4
};
/**
 * @class RenderQueue
 * @module Rendering
 * @description A data structure for feeding sets of [Renderable] objects to the [RenderSystem].
 *
 * The RenderQueue is divided into named semantic layers. Each layer is a queue of [Renderable]s that will be submitted to the [RenderSystem] for rendering. By default, a [Renderable] decides what layer it will go in based on its [Material].
 * 
 * They can also be rendered one layer at a time, which can be useful for various [Compositor] effects. For example, rendering everything in the scene except for the Lights layer, then rendering only the Lights layer to a different buffer, as in Deferred Shading.
 */
OE.RenderQueue = function(renderSystem) {
	this.mRenderSystem = renderSystem;
	// this.mQueue = [];
	
	var size = Object.keys(OE.RenderQueue.Layer).length;
	this.mLayers = new Array(size);
	
	for (var i=0; i<size; i++) {
		this.mLayers[i] = new Array();
	}
};
OE.RenderQueue.Layer = {
	Default: 0,
	Opaque: 1,
	Background: 2,
	Transparent: 3,
	Lights: 4
};
OE.RenderQueue.prototype = {
	mRenderSystem: undefined,
	// mQueue: undefined,
	mLayers: undefined,
	
	clearRenderables: function() {
		// this.mQueue = [];
		for (var i=0; i<this.mLayers.length; i++)
			this.mLayers[i] = new Array();
	},
	op: new OE.RenderOperation(),
	queueRenderable: function(renderable, layer) {
		// this.mQueue.push(renderable);
		if (layer === undefined) {
			renderable.getRenderOperation(this.op);
			if (this.op.mMaterial !== undefined &&
				this.op.mMaterial.mLayer !== undefined) {
				layer = this.op.mMaterial.mLayer;
			}
			else {
				layer = 0;
			}
		}
		this.mLayers[layer].push(renderable);
	},
	renderLayer: function(layer) {
		var queue = this.mLayers[layer];
		var dbg = OE.getActiveContext().dbg;
		if (dbg == undefined) {
			for (var i = 0; i < queue.length; i++) {
				this.op.reset();
				queue[i].getRenderOperation(this.op);
				this.mRenderSystem.render(this.op);
			}
		}
		else {
			for (var i = 0; i < queue.length; i++) {
				dbg.startRenderOp();
				this.op.reset();
				queue[i].getRenderOperation(this.op);
				this.mRenderSystem.render(this.op);
				dbg.endRenderOp();
			}
		}
	},
	renderAll: function() {
		var dbg = OE.getActiveContext().dbg;
		if (dbg) dbg.nextFrame();
		
		for (var i=0; i<this.mLayers.length; i++)
			this.renderLayer(i);
	},
	renderAllExcept: function(layer) {
		var dbg = OE.getActiveContext().dbg;
		
		for (var i=0; i<this.mLayers.length; i++)
			if (i !== layer)
				this.renderLayer(i);
	}
};
OE.Utils.defClass(OE.RenderQueue);
/**
 * @class RenderSystem
 * @module Rendering
 * @description Provides an abstraction layer to the rendering API, and manages/minimizes state changes.
 */
OE.RenderSystem = function() {
	this.mRenderQueue = new OE.RenderQueue(this);
	
	this.mModelMatrix = mat4.create();
	this.mViewMatrix = mat4.create();
	this.mProjectionMatrix = mat4.create();
	this.mModelViewMatrix = mat4.create();
	this.mModelViewProjectionMatrix = mat4.create();
	this.mNormalMatrix = mat3.create();
	
	mat4.identity(this.mModelMatrix);
	mat4.identity(this.mViewMatrix);
	mat4.identity(this.mProjectionMatrix);
	mat4.identity(this.mModelViewMatrix);
	mat4.identity(this.mModelViewProjectionMatrix);
	mat3.identity(this.mNormalMatrix);
};
OE.RenderSystem.prototype = {
	mContext: undefined,
	mRenderQueue: undefined,
	
	mActiveViewport: undefined,
	mActivePass: undefined,
	mActiveShader: undefined,
	mActiveCamera: undefined,
	mMtlParamsChanged: true,
	
	mModelMatrix: undefined,
	mViewMatrix: undefined,
	mProjectionMatrix: undefined,
	mModelViewMatrix: undefined,
	mModelViewProjectionMatrix: undefined,
	mNormalMatrix: undefined,
	
	/**
	 * @method createRenderSurface(Element container)
	 * @description Creates and returns a [WebGLSurface] with the given container.
	 * @param container DOM element or string id of DOM element that will contain our render surface
	 * @return surface The created [WebGLSurface].
	 */
	createRenderSurface: function(container) {
		var surface = new OE.WebGLSurface(container);
		return surface;
	},
	
	startFrame: function() {
		this.mContext = OE.getActiveContext();
	},
	
	activateViewport: function(viewport) {
		var gl = this.mContext;
		
		var rect;
		if (viewport !== undefined) {
			rect = viewport.getScreenRect();
		}
		
		if (this.mActiveViewport !== viewport || (this.mActiveViewport && this.mActiveViewport.mChanged)) {
			this.mActiveViewport = viewport;
			if (viewport !== undefined) {
				viewport.mChanged = false;
				gl.viewport(rect.x,		rect.y,
							rect.width,	rect.height);
				
				var clear = OE.Color.BLACK; //viewport.mClearColor;
				gl.clearColor(	clear.r, clear.g,
								clear.b, clear.a);
				// gl.clearDepth(1.0);
			}
		}
		
		if (viewport !== undefined) {
			gl.enable(gl.SCISSOR_TEST);
			gl.scissor(rect.x,		rect.y,
					rect.width,	rect.height);
			this.clearBuffer(viewport.mResetColor, viewport.mResetDepth);
			gl.disable(gl.SCISSOR_TEST);
			
			this.mActiveCamera = viewport.mCamera;
			this.mProjectionMatrix = this.mActiveCamera.getProjectionMatrix();
			this.mViewMatrix = this.mActiveCamera.getViewMatrix();
		}
	},
	
	clearBuffer: function(color, depth) {
		var gl = this.mContext;
		if (color && depth) {
			gl.depthMask(true);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		}
		else if (color && !depth) {
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		else if (!color && depth) {
			//gl.depthMask(true);
			gl.clear(gl.DEPTH_BUFFER_BIT);
		}
	},
	
	updateModelViewMatrix: function() {
		mat4.multiply(	this.mViewMatrix,
						this.mModelMatrix,
						this.mModelViewMatrix);
		
		var j = 0;
		for (var y=0; y<3; y++) {
			for (var x=0; x<3; x++) {
				var i = y*4+x;
				this.mNormalMatrix[j] = this.mModelViewMatrix[i];
				j++;
			}
		}
		
		this.updateMVPMatrix();
	},
	updateMVPMatrix: function() {
		mat4.multiply(	this.mProjectionMatrix,
						this.mModelViewMatrix,
						this.mModelViewProjectionMatrix);
	},
	setModelMatrix: function(matrix) {
		this.mModelMatrix = matrix;
		this.updateModelViewMatrix();
	},
	setViewMatrix: function(matrix) {
		this.mViewMatrix = matrix;
		this.updateModelViewMatrix();
	},
	setProjectionMatrix: function(matrix) {
		this.mProjectionMatrix = matrix;
		this.updateMVPMatrix();
	},
	
	setActivePass: function(pass) {
		var gl = this.mContext;
		if (this.mActivePass != pass) {
			this.mActivePass = pass;
			var shader = pass.mShader;
			if (shader != undefined) {
				if (shader != this.mActiveShader) {
					this.mActiveShader = shader;
					OE.Shader.bindShader(this.mActiveShader);
					this.setStaticUniforms(shader.mUniforms);
				}
			}
			this.mMtlParamsChanged = true;
		}
		if (pass.mMtlParams !== undefined) {
		//	if (this.mMtlParamsChanged) {
				this.mMtlParamsChanged = false;
				this.setRenderParams(pass.mMtlParams);
		//	}
		}
	},
	
	setRenderParams: function(params) {
		var gl = this.mContext;
		if (params.mTextures !== undefined) this.setTextures(params.mTextures);
		if (params.mBlendMode !== undefined) this.setBlendMode(params.mBlendMode);
		if (params.mDepthMode !== undefined) this.setDepthMode(params.mDepthMode);
		if (params.mUniforms !== undefined) this.setStaticUniforms(params.mUniforms);
	},
	setTextures: function(textures) {
		var gl = this.mContext;
		for (var i = 0; i < textures.length; i++) {
			OE.Texture.activateUnit(i);
			OE.Texture.bindTexture(textures[i]);
		}
	},
	setBlendMode: function(bm) {
		var gl = this.mContext;
		
		if (this.mActiveBlendMode === undefined
				|| this.mActiveBlendMode.mSrc !== bm.mSrc
				|| this.mActiveBlendMode.mDst !== bm.mDst) {
			if (this.mActiveBlendMode === undefined)
				this.mActiveBlendMode = new OE.BlendMode(bm.mSrc, bm.mDst);
			else {
				this.mActiveBlendMode.mSrc = bm.mSrc;
				this.mActiveBlendMode.mDst = bm.mDst;
			}
			
			var src = 0;
			var dst = 0;
			var op = 0;
			for (var i=0; i<2; i++) {
				var mOp = i==0 ? bm.mSrc : bm.mDst;
				var OP = OE.BlendMode.Operand;
				switch (mOp) {
					case OP.ZERO:				op = gl.ZERO; break;
					case OP.ONE:				op = gl.ONE; break;
					case OP.DST_ALPHA:			op = gl.DST_ALPHA; break;
					case OP.DST_COLOR:			op = gl.DST_COLOR; break;
					case OP.SRC_ALPHA:			op = gl.SRC_ALPHA; break;
					case OP.SRC_COLOR:			op = gl.SRC_COLOR; break;
					case OP.ONE_MINUS_DST_ALPHA:op = gl.ONE_MINUS_DST_ALPHA; break;
					case OP.ONE_MINUS_DST_COLOR:op = gl.ONE_MINUS_DST_COLOR; break;
					case OP.ONE_MINUS_SRC_ALPHA:op = gl.ONE_MINUS_SRC_ALPHA; break;
					case OP.ONE_MINUS_SRC_COLOR:op = gl.oNE_MINUS_SRC_COLOR; break;
				}
				if (i==0) src = op; else dst = op;
			}
			gl.blendFunc(src, dst);
		}
	},
	setDepthMode: function(depthMode) {
		var gl = this.mContext;
		if (this.mActiveDepthMode === undefined
				|| this.mActiveDepthMode.mTest !== depthMode.mTest
				|| this.mActiveDepthMode.mWrite !== depthMode.mWrite) {
			if (this.mActiveDepthMode === undefined) {
				this.mActiveDepthMode = new OE.DepthMode(depthMode.mTest, depthMode.mWrite);
			}
			if (this.mActiveDepthMode.mTest !== depthMode.mTest) {
				if (depthMode.mTest) gl.enable(gl.DEPTH_TEST);
				else				 gl.disable(gl.DEPTH_TEST);
				this.mActiveDepthMode.mTest = depthMode.mTest;
			}
			if (depthMode.mWrite !== this.mActiveDepthMode.mWrite) {
				if (depthMode.mWrite) gl.depthMask(true);
				else				  gl.depthMask(false);
				this.mActiveDepthMode.mWrite = depthMode.mWrite;
			}
		}
	},
	setStaticUniforms: function(uniforms) {
		var gl = this.mContext;
		for (var i = 0; i < uniforms.length; i++) {
			var u = uniforms[i];
			if (u.mPreset == undefined) {
				var index = u.mLoc;
				var val = u.mValue;
				var Type = OE.Shader.Uniform.Type;
				switch (u.mType) {
					case Type.INT: gl.uniform1i(index, val); break;
					case Type.INT2: gl.uniform2i(index, val); break;
					case Type.INT3: gl.uniform3i(index, val[0], val[1], val[2]); break;
					case Type.INT4: gl.uniform4i(index, val[0], val[1], val[2], val[3]); break;
					case Type.FLOAT: gl.uniform1f(index, val); break;
					case Type.VEC2: gl.uniform2f(index, val[0], val[1]); break;
					case Type.VEC3: gl.uniform3f(index, val[0], val[1], val[2]); break;
					case Type.VEC4: gl.uniform4f(index, val[0], val[1], val[2], val[3]); break;
					case Type.MAT3: gl.uniformMatrix3fv(index, false, val); break;
					case Type.MAT4: gl.uniformMatrix4fv(index, false, val); break;
					default: break;
				}
			}
		}
	},
	setDynamicUniforms: function(uniforms) {
		var gl = this.mContext;
		
		for (var i = 0; i < uniforms.length; i++) {
			var u = uniforms[i];
			var index = u.mLoc;
			
			var Preset = OE.Shader.Uniform.Preset;
			switch (u.mPreset) {
				case Preset.M_MATRIX:	gl.uniformMatrix4fv(index, false, this.mModelMatrix);				break;
				case Preset.V_MATRIX:	gl.uniformMatrix4fv(index, false, this.mViewMatrix);				break;
				case Preset.P_MATRIX:	gl.uniformMatrix4fv(index, false, this.mProjectionMatrix);			break;
				case Preset.MV_MATRIX:	gl.uniformMatrix4fv(index, false, this.mModelViewMatrix);			break;
				case Preset.MVP_MATRIX:	gl.uniformMatrix4fv(index, false, this.mModelViewProjectionMatrix);	break;
				case Preset.N_MATRIX:	gl.uniformMatrix3fv(index, false, this.mNormalMatrix);				break;
				case Preset.CAMERA_POS: {
					var cam = this.mActiveCamera;
					if (cam != undefined) {
						var pos = cam.mPos;
						// Do nothing - Unsupported
						// gl.uniform3f(index, x, y, z);
					}
					break;
				}
				default:
					break;
			}
		}
	},
	setAttributes: function(vertexData, shader) {
		var gl = this.mContext;
		var type = undefined;
		var size = 1;
		var stride = vertexData.mVertexSize;
		var attribSize = 4;
		var offset = 0;
		var normalized = true;
		
		var attribs = vertexData.mAttributes;
		for (var i = 0; i < attribs.length; i++) {
			var attrib = attribs[i];
			
			size = attrib.mNumComponents;
			attribSize = attrib.mByteSize;
			
			switch (attrib.mType) {
				case OE.VertexAttribute.Type.UNSIGNED_BYTE:	type = gl.UNSIGNED_BYTE; break;
				case OE.VertexAttribute.Type.INT:			type = gl.INT; break;
				case OE.VertexAttribute.Type.FLOAT:			type = gl.FLOAT; break;
			}
			
			var index = shader.getAttribLocation(attrib);
			if (index >= 0) {
				gl.enableVertexAttribArray(index);
				gl.vertexAttribPointer(index, size, type, normalized, stride, offset);
			}
			offset += attribSize;
		}
	},
	unsetAttributes: function(vertexData, shader) {
		var gl = this.mContext;
		var attribs = vertexData.mAttributes;
		for (var i = 0; i < attribs.length; i++) {
			var attrib = attribs[i];
			
			var index = shader.getAttribLocation(attrib);
			if (index >= 0) {
				gl.disableVertexAttribArray(index);
			}
		}
	},
	
	op: new OE.RenderOperation(),
	blitRenderTexture: function(rt) {
		this.op.reset();
		rt.getRenderOperation(this.op);
		this.render(this.op);
	},
	/*blitRenderTexture: function(rt) {
		var gl = this.mContext;
		gl.blitFramebuffer(	0, 0, rt.width, rt.height,
							0, 0, rt.width, rt.height,
							gl.COLOR_BUFFER_BIT, gl.LINEAR);
	},*/
	
	render: function(op) {
		var material = op.mMaterial;
		var vertexData = op.mVertexData;
		var indexData = op.mIndexData;
		
		if (vertexData != undefined && material != undefined) {
			var vertexBuffer = vertexData.mGpuBuffer;
			var indexBuffer = indexData ? indexData.mGpuBuffer : undefined;
			if (vertexBuffer != undefined) {
				var gl = this.mContext;
				
				OE.GpuBuffer.bindBuffer(vertexBuffer);
				if (indexBuffer)
					OE.GpuBuffer.bindBuffer(indexBuffer);
				
				var geomType = gl.POINTS;
				switch (op.mType) {
					case OE.RenderOperation.Type.POINTS:		geomType = gl.POINTS;			break;
					case OE.RenderOperation.Type.LINES:			geomType = gl.LINES;			break;
					case OE.RenderOperation.Type.LINE_STRIP:	geomType = gl.LINE_STRIP;		break;
					case OE.RenderOperation.Type.TRIANGLES:		geomType = gl.TRIANGLES;		break;
					case OE.RenderOperation.Type.TRIANGLE_STRIP:geomType = gl.TRIANGLE_STRIP;	break;
				}
				
				var passes = material.mPasses;
				for (var i = 0; i < passes.length; i++) {
					var pass = passes[i];
					var shader = pass.mShader;
					
					if (shader != undefined && shader.mLoadState == OE.Resource.LoadState.LOADED) {
						if (op.mModelMatrix !== undefined)
							this.mModelMatrix = op.mModelMatrix;
						this.updateModelViewMatrix();
						
						this.setActivePass(pass);
						if (op.mMtlParams !== undefined) {
							this.mMtlParamsChanged = true;
							this.setRenderParams(op.mMtlParams);
						}
						this.setDynamicUniforms(shader.mUniforms);
						
						this.setAttributes(vertexData, shader);
						if (indexData)
							gl.drawElements(geomType, indexData.mNumIndices, gl.UNSIGNED_INT, 0);
						else
							gl.drawArrays(geomType, vertexData.mStartVertex, vertexData.mNumVertices);
						this.unsetAttributes(vertexData, shader);
					}
				}
			}
		}
	}
};
OE.Utils.defClass(OE.RenderSystem);

window.requestAnimFrame = (function() {
	return	window.requestAnimationFrame		|| 
			window.webkitRequestAnimationFrame	|| 
			window.mozRequestAnimationFrame		|| 
			window.oRequestAnimationFrame		|| 
			window.msRequestAnimationFrame		|| 
	function (callback, element) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

/**
 * @class RenderTarget
 * @module Rendering
 * @description Abstract class representing anything with a backing buffer that can be rendered to.
 */
OE.RenderTarget = function() {
	OE.Observable.call(this);
	this.mViewports = [];
};

OE.mActiveContext = undefined;
OE.activateContext = function(context) {
	this.mActiveContext = context;
};
OE.getActiveContext = function() {
	return this.mActiveContext;
};

OE.RenderTarget.prototype = {
	mContext: undefined,
	mViewports: undefined,
	mWidth: 1,
	mHeight: 1,
	
	getWidth: function() {
		return this.mWidth;
	},
	getHeight: function() {
		return this.mHeight;
	},
	resize: function(width, height) {
		if (width != this.mWidth || height != this.mHeight) {
			this.mWidth = width;
			this.mHeight = height;
			for (var i=0; i<this.mViewports.length; i++) {
				this.mViewports[i].mChanged = true;
			}
			this.dispatchEvent("resize", [width, height]);
		}
	},
	makeCurrent: function() {
		OE.activateContext(this.mContext);
	},

	/**
	 * @method createViewport(Camera camera)
	 * @description Creates a new [Viewport] attached to the given [Camera].
	 * @param camera The [Camera] to attach the [Viewport] to.
	 * @return The newly created [Viewport].
	 */
	createViewport: function(camera) {
		var vp = new OE.Viewport(this, camera);
		this.mViewports.push(vp);
		return vp;
	},
	render: function() {
		this.makeCurrent();
		for (var i=0; i<this.mViewports.length; i++) {
			var vp = this.mViewports[i];
			var camera = vp.mCamera;
			var scene = camera.mScene;
			if (scene !== undefined)
				scene.renderViewport(vp, camera);
		}
		this.dispatchEvent("frameRendered");
		window.requestAnimFrame(this.render.bind(this), this.mCanvas);
	}
};
OE.Utils.defClass(OE.RenderTarget, OE.Observable);

OE.rbo = undefined;

OE.RenderTexture = function(width, height) {
	OE.Renderable.call(this);
	
	var gl = OE.getActiveContext();
	
	var fbo = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	
	var tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	//gl.generateMipmap(gl.TEXTURE_2D);
	
	if (OE.rbo === undefined) {
		OE.rbo = gl.createRenderbuffer();
		gl.bindRenderbuffer(gl.RENDERBUFFER, OE.rbo);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	}
	else {
		gl.bindRenderbuffer(gl.RENDERBUFFER, OE.rbo);
	}
	var rbo = OE.rbo;
	
	/*
	var rbo = gl.createRenderbuffer();
	gl.bindRenderbuffer(gl.RENDERBUFFER, rbo);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
	*/
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rbo);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	this.fbo = fbo;
	this.rbo = rbo;
	this.texture = new OE.Texture();
	this.texture.mBinding = tex;
	this.width = width;
	this.height = height;
	
	this.mModelMatrix = mat4.create();
	mat4.identity(this.mModelMatrix);
	this.mVertexData = new OE.VertexData();
	this.mMaterial = undefined;
	this.mMtlParams = new OE.MtlParams();
	this.mMtlParams.mTextures = [this.texture];
	this.mMtlParams.mDepthMode = undefined;
	this.mMtlParams.mBlendMode = undefined;
	
	this.updateBuffer();
};
OE.RenderTexture.prototype = {
	bind: function() {
		var gl = OE.getActiveContext();
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
		gl.viewport(0, 0, this.width, this.height);
	},
	unbind: function() {
		var gl = OE.getActiveContext();
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		/*OE.Texture.bindTemp(this.texture);
		gl.generateMipmap(gl.TEXTURE_2D);
		OE.Texture.unbindTemp();*/
	},
	updateBuffer: function() {
		var gpuBuffer = new OE.GpuBuffer();
		gpuBuffer.create();
		
		var vertexData = this.mVertexData;
		vertexData.clear();
		vertexData.addAttribute(OE.VertexAttribute.POSITION);
		vertexData.setBuffer(gpuBuffer);
		vertexData.setNumVertices(4);
		
		var vert = function(buffer, p) {
			buffer.putVec3(p);
		};
		
		var pos = [
			-1.0, -1.0,
			 1.0, -1.0,
			-1.0,  1.0,
			 1.0,  1.0];
		var p = new OE.Vector3();
		
		var bufferSize = vertexData.getByteSize();
		var buffer = gpuBuffer.map(bufferSize);
		for (var i = 0; i < 4; i++) {
			var i2 = i*2;
			p.setf(pos[i2], pos[i2+1], 0.0);
			vert(buffer, p);
		}
		gpuBuffer.unmap();
	},
	getRenderOperation: function(op) {
		op.mType = OE.RenderOperation.Type.TRIANGLE_STRIP;
		op.mVertexData = this.mVertexData;
		op.mModelMatrix = this.mModelMatrix;
		op.mMaterial = this.mMaterial;
		op.mMtlParams = this.mMtlParams;
	}
};
OE.Utils.defClass(OE.RenderTexture, OE.Renderable);

OE.VertexAttribute = function(id, type, numComponents) {
	this.mID = id;
	this.mType = type;
	this.mNumComponents = numComponents;
	this.mByteSize = type.mSize * numComponents;
};
OE.VertexAttribute.prototype = {
	mID: 0,
	mType: undefined,
	mNumComponents: 0,
	mByteSize: 0
};
OE.VertexAttribute.prototype.constructor = OE.VertexAttribute;

OE.VertexAttribute.Type = {
	UNSIGNED_BYTE:	{mSize: 1},
	INT:			{mSize: 4},
	FLOAT:			{mSize: 4}
};
OE.VertexAttribute.POSITION	= new OE.VertexAttribute(0, OE.VertexAttribute.Type.FLOAT, 3);
OE.VertexAttribute.NORMAL	= new OE.VertexAttribute(1, OE.VertexAttribute.Type.FLOAT, 3);
OE.VertexAttribute.TEXCOORD	= new OE.VertexAttribute(2, OE.VertexAttribute.Type.FLOAT, 2);
OE.VertexAttribute.COLOR	= new OE.VertexAttribute(3, OE.VertexAttribute.Type.FLOAT, 4);
OE.VertexAttribute.CUSTOM_ID = 4;
OE.VertexAttribute.custom = function(id, type, count) {
	return new OE.VertexAttribute(OE.VertexAttribute.CUSTOM_ID+id, type, count);
};

// TODO: Unused class. (Only used in Model.js, unrelated to rendering.) Should be used for more than that.
OE.VertexFormat = function() {
	this.mAttributes = [];
};
OE.VertexFormat.prototype = {
	mAttributes: undefined,
	mVertexSize: 0,
	
	clear: function() {
		this.mAttributes = [];
		this.mVertexSize = 0;
	},
	addAttribute: function(attribute) {
		this.mAttributes.push(attribute);
		this.mVertexSize += attribute.mByteSize;
	},
};
OE.VertexFormat.prototype.constructor = OE.VertexFormat;


/**
 * @class VertexData
 * @module Rendering
 * @description Represents a buffer of vertex data formatted with a number of vertex attributes on the GPU.
 */
OE.VertexData = function() {
	this.clear();
};
OE.VertexData.prototype = {
	mAttributes: undefined,
	mGpuBuffer: undefined,
	mStartVertex: 0,
	mNumVertices: 0,
	mVertexSize: 0,
	
	/**
	 * @method clear()
	 * @description Erases the vertex buffer from the GPU and clears all attribute declarations.
	 */
	clear: function() {
		this.mAttributes = [];
		this.mStartVertex = 0;
		this.mNumVertices = 0;
		this.mVertexSize = 0;
		if (this.mGpuBuffer) {
			this.mGpuBuffer.destroy();
			this.mGpuBuffer = undefined;
		}
	},
	addAttribute: function(attribute) {
		this.mAttributes.push(attribute);
		this.mVertexSize += attribute.mByteSize;
	},
	addAttributes: function() {
		for (var i=0; i<arguments.length; i++) {
			var attribute = arguments[i];
			this.mAttributes.push(attribute);
			this.mVertexSize += attribute.mByteSize;
		}
	},
	addCustomAttribute: function(id, type, numComponents) {
		if (numComponents === undefined) numComponents = 1;
		var attribute = new OE.VertexAttribute(OE.VertexAttribute.CUSTOM_ID+id, type, numComponents);
		this.addAttribute(attribute);
	},
	createBuffer: function(gpuBuffer) {
		this.mGpuBuffer = new OE.GpuBuffer();
		this.mGpuBuffer.create();
		return this.mGpuBuffer;
	},
	setBuffer: function(gpuBuffer) {
		this.mGpuBuffer = gpuBuffer;
	},
	setStartVertex: function(start) {
		this.mStartVertex = start;
	},
	setNumVertices: function(num) {
		this.mNumVertices = num;
	},
	getByteSize: function() {
		return this.mNumVertices * this.mVertexSize;
	}
};
OE.Utils.defClass(OE.VertexData);

function bindMemberListeners(parent) {
	var list = new Array();
	for (var i=1; i<arguments.length; i+=3) {
		var e = {
			parent: arguments[i+0],
			event: arguments[i+1],
			handler: arguments[i+2]};
		e.handler = e.handler.bind(parent);
		e.parent.addEventListener(e.event, e.handler);
		list.push(e);
	}
	parent.mBoundEventHandlers = list;
}
function unbindMemberListeners(parent) {
	if (parent.mBoundEventHandlers !== undefined) {
		for (var i=0; i<parent.mBoundEventHandlers.length; i++) {
			var e = parent.mBoundEventHandlers[i];
			e.parent.removeEventListener(e.event, e.handler);
		}
		parent.mBoundEventHandlers = undefined;
	}
}


/**
 * @class WebGLSurface
 * @extends RenderTarget
 * @module Rendering
 * @description A [RenderTarget] which creates and wraps a <canvas> element.
 */

/**
 * @method constructor(container[, Number width, Number height])
 * @description Creates a WebGLSurface and canvas inside the container element.
 * @param container The DOM element or String id of DOM element which will contain the canvas.
 * @param width The width of the WebGLSurface.
 * @param height The height of the WebGLSurface.
 */
OE.WebGLSurface = function(container, width, height) {
	OE.RenderTarget.call(this);
	
	if (container === undefined)
		container = document.body();
	
	if (typeof container === "string")
		container = document.getElementById(container);
	
	this.mContainer = container;
	
	this.create(width, height);
};

OE.WebGLSurface.prototype = {
	mContainer: undefined,
	mCanvas: undefined,
	mContext: undefined,
	mFixedSize: false,
	
	/**
	 * @method create([Number width, Number height])
	 * @param width The width of the canvas (default: width of the container).
	 * @param height The height of the canvas (default: height of the container).
	 * @description Creates a canvas DOM object and initializes the [RenderTarget] and it's render loop.
	 * 
	 * When width and height are omitted, the canvas will always fill the container element. When a width and height are given, the canvas will enter fixed-size mode.
	 * In fixed-size mode, the canvas' internal buffer size is always controlled via code, and changes to the canvas style size will stretch the canvas to that size, keeping the internal size the same unless you change it. When fixed-size mode is disabled, the canvas will always resize it's internal buffer to match it's display size on the screen.
	 */
	create: function(width, height) {
		var canvas = this.mCanvas = document.createElement("canvas");
		canvas.setAttribute("tabindex", 1);
		
		if (width !== undefined && height !== undefined) {
			this.mFixedSize = true;
			canvas.width = width;
			canvas.height = height;
			canvas.style.width = width+"px";
			canvas.style.height = height+"px";
		}
		else {
			this.mFixedSize = false;
			canvas.width = this.mContainer.clientWidth;
			canvas.height = this.mContainer.clientHeight;
			canvas.style.width = "100%";
			canvas.style.height = "100%";
		}
		this.mContainer.appendChild(canvas);
		this.mWidth = canvas.offsetWidth;
		this.mHeight = canvas.offsetHeight;
		
		bindMemberListeners(this,
			window,			"resize",		this.parentResize,
			document,		"keydown",		this.keyDown,
			document,		"keyup",		this.keyUp,
			canvas,			"mousedown",	this.mouseDown,
			document,		"mouseup",		this.mouseUp,
			document,		"mousemove",	this.mouseMove,
			document,		"mousewheel",	this.mouseWheel);
		
		try {
			this.mContext =	canvas.getContext("webgl") ||
							canvas.getContext("experimental-webgl");
		} catch(e) {}
		
		if (this.mContext) {
			this.render();
		}
		else {
			console.warn("[WebGLSurface] Could not create WebGL context.");
		}
	},
	destroy: function() {
		unbindMemberListeners(this);
		
		this.mContainer.removeChild(this.mCanvas);
		this.mCanvas = undefined;
		this.mContext = undefined;
	},
	
	resize: function(width, height) {
		OE.RenderTarget.prototype.resize.call(this, width, height);
		this.mCanvas.width = width;
		this.mCanvas.height = height;
	},
	parentResize: function(e) {
		if (!this.mFixedSize) {
			var newWidth = this.mContainer.clientWidth;
			var newHeight = this.mContainer.clientHeight;
			if (newWidth !== this.mWidth || newHeight !== this.mHeight) {
				this.resize(newWidth, newHeight);
			}
		}
	},
	keyDown: function(e) {
		if (document.activeElement == this.mCanvas) {
			var k = e.keyCode;
			this.dispatchEvent("keydown", k);
			e.preventDefault();
			e.stopPropagation();
		}
	},
	keyUp: function(e) {
		var k = e.keyCode;
		this.dispatchEvent("keyup", k);
	},
	mouseDown: function(e) {
		var x = e.clientX;
		var y = e.clientY;
		var k = e.button;
		this.mCanvas.focus();
		this.dispatchEvent("mousedown", [x, y, k]);
		e.preventDefault();
	},
	mouseUp: function(e) {
		var x = e.clientX;
		var y = e.clientY;
		var k = e.button;
		this.dispatchEvent("mouseup", [x, y, k]);
	},
	mouseMove: function(e) {
		var x = e.clientX;
		var y = e.clientY;
		this.dispatchEvent("mousemove", [x, y]);
	},
	mouseWheel: function(e) {
		if (document.activeElement == this.mCanvas) {
			var delta = e.wheelDelta;
			this.dispatchEvent("mousewheel", delta);
			e.preventDefault();
			e.stopPropagation();
		}
	},
	
	debugNextFrames: function(frames, postTarget, savePath) {
		var gl = this.mContext;
		OE.WebGLSurface.makeDebugContext(gl);
		var dbg = gl.dbg;
		dbg.debugFramesStart = 0;
		dbg.debugFramesEnd = frames;
		dbg.onFinished = function() {
			var text = encodeURIComponent(dbg.toHtml());
			OE.Utils.ajaxRequest(postTarget, "path="+savePath+"&text="+text,
				function(response) {
					if (response != "") alert(response);
				}
			);
			OE.WebGLSurface.removeDebugContext(gl);
		}
	}
};
OE.Utils.defClass(OE.WebGLSurface, OE.RenderTarget);

OE.WebGLSurface.makeDebugContext = function(gl) {
	var eventFuncs = [
		"bindBuffer", "useProgram", "bindTexture", "drawArrays"
	];
	for (var i=0; i<eventFuncs.length; i++) {
		var f = eventFuncs[i];
		gl[f] = function() {
			WebGLRenderingContext.prototype[f].apply(gl, arguments);
			gl.dbg.addEvent(i);
		};
	}
	gl.dbg = {
		state: 0,
		debug: false,
		debugFramesStart: 0,
		debugFramesEnd: 10,
		frameCount: 0,
		frames: [],
		frame: undefined,
		frameTouched: true,
		renderOp: undefined,
		onFinished: undefined,
		
		nextFrame: function() {
			if (this.state === 0) {
				if (this.frameCount >= this.debugFramesStart) {
					this.state = 1;
				}
			}
			else if (this.state === 1) {
				if (this.frameCount > this.debugFramesEnd) {
					this.state = 2;
					if (this.onFinished !== undefined)
						this.onFinished();
				}
			}
			
			this.debug = (this.state === 1);
			
			if (this.debug) {
				if (this.frameTouched) {
					this.frame = {serial: this.frameCount, renderOps: []};
					this.frames.push(this.frame);
					this.frameTouched = false;
				}
			}
			this.frameCount++;
		},
		startRenderOp: function() {
			if (this.debug) {
				if (this.renderOp == undefined) {
					this.renderOp = [];
					this.frame.renderOps.push(this.renderOp);
					this.frameTouched = true;
				}
			}
		},
		endRenderOp: function() {
			if (this.renderOp) {
				this.renderOp = undefined;
			}
		},
		addEvent: function(event) {
			if (this.debug) {
				if (this.renderOp) {
					this.renderOp.push(event);
				}
			}
		},
		
		toHtml: function() {
			var str = '';
			var colors = ["#BF0000", "#BFBF00", "#0000BF", "#BFBFBF"];
			var names = ["Buffer", "Program", "Texture", "Draw"];
			
			str += '<div class="dbgFrame"><div class="dbgRenderOp">';
			for (var i=0; i<4; i++) {
				var c = colors[i];
				str += '<div class="dbgEventLabel" style="background: '+c+';">'+names[i]+'</div>';
			}
			str += '</div></div>';
			
			for (var i=0; i<this.frames.length; i++) {
				var frame = this.frames[i];
				var prevEvents = undefined;
				var sameOps = 0;
				
				str += '<div class="dbgFrame">Frame '+frame.serial+'<br />';
				for (var j=0; j<frame.renderOps.length; j++) {
					var op = frame.renderOps[j];
					var events = [0, 0, 0, 0];
					for (var k=0; k<op.length; k++) {
						var e = op[k];
						events[e]++;
					}
					var same = true;
					if (prevEvents) {
						for (var k=0; k<events.length; k++) {
							if (events[k] != prevEvents[k]) {
								same = false;
								break;
							}
						}
					}
					else {
						same = false;
					}
					prevEvents = events;
					
					if (same) {
						sameOps++;
					}
					else {
						if (sameOps > 0) {
							str += '<div class="dbgRenderOp">'
							+'+'+sameOps+' equivalent RenderOps'
							+'</div><br />';
						}
						sameOps = 0;
						str += '<div class="dbgRenderOp">';
						for (var k=0; k<events.length; k++) {
							var e = events[k];
							var c = e > 0 ? colors[k] : "#0F0F0F";
							str += '<div class="dbgEvent" style="background: '+c+';">x'+e+'</div>';
						}
						str += '</div><br />';
					}
				}
				if (sameOps > 0) {
					str += '<div class="dbgRenderOp">'
					+'+'+sameOps+' equivalent RenderOps'
					+'</div><br />';
				}
				str += '</div>';
			}
			return str;
		}
	};
	
	return gl;
}
OE.WebGLSurface.removeDebugContext = function(gl) {
	var eventFuncs = [
		"bindBuffer", "useProgram", "bindTexture", "drawArrays"
	];
	for (var i=0; i<eventFuncs.length; i++) {
		var f = eventFuncs[i];
		gl[f] = WebGLRenderingContext.prototype[f];
	}
	gl.dbg = undefined;
}

OE.Mesh = function() {
	this.mVertexFormat = new OE.VertexFormat();
	this.mVertexData = new Float32Array();
	this.mIndexData = new Int32Array();
};
OE.Mesh.prototype = {
	mVertexFormat: undefined,
	mVertexData: undefined,
	mIndexData: undefined,
	mNumVertices: 0,
	mNumIndices: 0
};
OE.Utils.defClass(OE.Mesh);

OE.Model = function() {
	OE.Resource.call(this);
	this.mMeshes = [];
	this.mMtlMapping = [];
	
	this.mBoundingBox = new OE.BoundingBox();
};
OE.Model.prototype = {
	mMeshes: undefined,
	mMtlMapping: undefined,
	
	clear: function() {
		for (var i=0; i<mMeshes.length; i++) {
			mMeshes[i].clear();
		}
		mMeshes = [];
	},
	createMesh: function(mtl) {
		var mesh = new OE.Mesh();
		this.mMeshes.push(mesh);
		this.mMtlMapping.push(mtl);
		return mesh;
	},
	loadResource: function(filePath) {
		var model = this;
		model.onLoadStart();
		var loaded = function(response) {
			var optimize = false;
			
			var currentMesh = undefined;
			var currentMtl = undefined;
			
			var positions = new Array();
			var normals = new Array();
			var texcoords = new Array();
			
			var filteredVerts = new Array();
			var vertexData = new Array();
			var indexData = new Array();
			
			var finishMesh = function() {
				if (filteredVerts.length > 0) {
					var hasPos = false, hasNorm = false, hasTexCoord = false;
					var format = new OE.VertexFormat();
					var bbox = new OE.BoundingBox();
					for (var i = 0; i < filteredVerts.length; i++) {
						var v = filteredVerts[i];
						if (i == 0) {
							if (v[0] !== undefined && !isNaN(v[0])) {
								hasPos = true;
								format.addAttribute(OE.VertexAttribute.POSITION);
							}
							if (v[2] !== undefined && !isNaN(v[2])) {
								hasNorm = true;
								format.addAttribute(OE.VertexAttribute.NORMAL);
							}
							if (v[1] !== undefined && !isNaN(v[1])) {
								hasTexCoord = true;
								format.addAttribute(OE.VertexAttribute.TEXCOORD);
							}
							vertexData = new Array();
						}
						if (hasPos) {
							var p = positions[v[0]-1];
							vertexData.push(p[0]);
							vertexData.push(p[1]);
							vertexData.push(p[2]);
							
							if (i===0) bbox.setf(p[0], p[1], p[2], p[0], p[1], p[2]);
							else bbox.includePointf(p[0], p[1], p[2]);
						}
						if (hasNorm) {
							var n = normals[v[2]-1];
							vertexData.push(n[0]);
							vertexData.push(n[1]);
							vertexData.push(n[2]);
						}
						if (hasTexCoord) {
							var tc = texcoords[v[1]-1];
							vertexData.push(tc[0]);
							vertexData.push(tc[1]);
						}
					}
					currentMesh = this.createMesh(currentMtl);
					currentMesh.mBoundingBox = bbox;
					currentMesh.mVertexFormat = format;
					currentMesh.mVertexData = new Float32Array(vertexData);
					currentMesh.mIndexData = new Uint32Array(indexData);
					currentMesh.mNumVertices = filteredVerts.length;
					currentMesh.mNumIndices = indexData.length;
					
					if (this.mMeshes.length === 1)
						this.mBoundingBox.set(bbox);
					else
						this.mBoundingBox.includeBbox(bbox);
					
					currentMesh = undefined;
					filteredVerts = new Array();
					vertexData = new Array();
					indexData = new Array();
				}
			}.bind(this);
			
			var lines = OE.Utils.splitLines(response);
			for (var n=0; n<lines.length; n++) {
				var line = lines[n];
				var parts = OE.Utils.splitFirstToken(line);
				if (parts) {
					var cmd = parts[0];
					var params = parts[1];
					if (cmd === "v") {
						var v = params.split(/\s+/);
						positions.push([v[0]*1, v[1]*1, v[2]*1]);
					}
					else if (cmd === "vn") {
						var v = params.split(/\s+/);
						normals.push([v[0]*1, v[1]*1, v[2]*1]);
					}
					else if (cmd === "vt") {
						var v = params.split(/\s+/);
						texcoords.push([v[0]*1, v[1]*1]);
					}
					else if (cmd === "usemtl") {
						var mtl = params;
						finishMesh();
						currentMtl = mtl;
					}
					else if (cmd === "g") {
						var name = params;
						finishMesh();
					}
					else if (cmd === "f") {
						var fStr = params.split(/\s+/);
						fStr.pop();
						var numVerts = fStr.length;
						// Only support triangles or quads.
						if (numVerts == 3 || numVerts == 4) {
							var f = [];
							var reg = new RegExp(/([^\/\s]*)\/?/g);
							for (var i=0; i<numVerts; i++) {
								var vStr = fStr[i];
								var v = [];
								var j = 0;
								reg.lastIndex = 0;
								var match = reg.exec(vStr);
								while (match != null) {
									// Ignore any more than 3 vertex attributes
									if (j < 3) {
										var index = parseInt(match[1]);
										v.push(index);
									}
									else {
										break;
									}
									j++;
									match = reg.exec(vStr);
								}
								f.push(v);
							}
							// f now contains array of 3 or 4 vertices on the surface.
							// Each vertex contains indices to the attributes, or
							// NaN for unused attributes.
							if (numVerts === 3) {
								for (var i=0; i<3; i++) {
									var vert = f[i];
									var index = -1;
									if (optimize) {
										for (var j=0; j<filteredVerts.length; j++) {
											var v2 = filteredVerts[j];
											if (v2 == vert) {
												index = j;
												break;
											}
										}
									}
									if (index == -1) {
										index = filteredVerts.length;
										filteredVerts.push(vert);
									}
									indexData.push(index);
								}
							}
							else if (numVerts === 4) {
								var fArray = [	[f[0], f[1], f[2]],
												[f[0], f[2], f[3]]];
								for (var k=0; k<2; k++) {
									f = fArray[k];
									for (var i=0; i<3; i++) {
										var vert = f[i];
										var index = -1;
										if (optimize) {
											for (var j=0; j<filteredVerts.length; j++) {
												var v2 = filteredVerts[j];
												if (v2 == vert) {
													index = j;
													break;
												}
											}
										}
										if (index == -1) {
											index = filteredVerts.length;
											filteredVerts.push(vert);
										}
										indexData.push(index);
									}
								}
							}
						}
					}
				}
			}
			
			finishMesh();
			
			model.onLoaded();
		};
		OE.Utils.loadFile(filePath, loaded.bind(model),
			function(message) {
				model.onLoadError(message);
			}.bind(model)
		);
	},
	unloadResource: function() {
		this.clear();
	}
};
OE.Utils.defClass(OE.Model, OE.Resource);

OE.Prefab = function() {
	OE.Resource.call(this);
	this.mRootObject = new OE.GameObject();
};
OE.Prefab.prototype = {
	mData: undefined,
	
	createInst: function() {
		var root = OE.GameObject.deserialize(this.mData.root);
		return root;
	},
	
	loadResource: function(filePath) {
		var prefab = this;
		prefab.onLoadStart();
		
		OE.Utils.loadJSON(filePath,
			function(data) {
				this.mData = data;
				prefab.onLoaded();
			}.bind(prefab),
			function(error) {
				prefab.onLoadError(error);
			}.bind(prefab)
		);
	},
	unloadResource: function() {
		this.clear();
	}
};
OE.Utils.defClass(OE.Prefab, OE.Resource);

OE.PrefabInst = OE.Utils.defClass2(OE.GameObject, {
	mPrefab: undefined,
	
	constructor: function(prefab) {
		OE.GameObject.call(this);
		
		if (prefab !== undefined) {
			if (typeof prefab !== "string")
				prefab = prefab.mResKey;
			
			OE.PrefabManager.load(prefab, function(res) {
				var obj = res.createInst();
				if (obj !== undefined) {
					this.mPrefab = res;
					this.addChild(obj);
				}
			}.bind(this));
		}
	}
});
OE.PrefabInst.deserialize = function(data) {
	var inst = new OE.PrefabInst(data.prefab);
	return inst;
};

OE.Behavior = function() {}
OE.Behavior.prototype = {
	mObject: undefined,
	
	onAdded: function() {},
	onRemoved: function() {},
	onDestroy: function() {},
	onUpdate: function() {}
};
OE.Utils.defClass(OE.Behavior);

OE.Script = function() {
	OE.Resource.call(this);
};

OE.Script.Exports = {};/*
OE.Script.initExports = function(key) {
	OE.Script.Exports[key] = {};
};
OE.Script.getExports = function(key) {
	return OE.Script.Exports[key];
};
OE.Script.clearExports = function(key) {
	OE.Script.Exports[key] = undefined;
	delete OE.Script.Exports[key];
};*/

OE.Script.prototype = {
	mElement: undefined,
	mContext: undefined,
	
	loadResource: function(filePath) {
		OE.Utils.loadFile(filePath,
			function(response) {
				this.mContext = {};
				
				var elem = document.createElement("script");
				elem.setAttribute("type", "text/javascript");
				document.head.appendChild(elem);
				
				response = "(function() {"+response+"})();"
				
				OE.Script.Exports = {};
				elem.innerHTML = response;
				this.mContext = OE.Script.Exports;
				OE.Script.Exports = {};
				
				document.head.removeChild(elem);
				
				this.onLoadingSuccess();
			}.bind(this),
			function(message) {
				this.onLoadingError(message);
			}.bind(this)
		);
		/*
		this.mContext = {};
		
		var elem = document.createElement("script");
		elem.setAttribute("type", "text/javascript");
		
		elem.addEventListener("load", function () {
			this.mContext = OE.Script.getExports(this.mResKey);
			OE.Script.clearExports(this.mResKey);
			this.onLoadingSuccess();
		}.bind(this));
		
		OE.Script.initExports(this.mResKey);
		
		elem.setAttribute("src", filePath);
		document.head.appendChild(elem);
		
		this.mElement = elem;*/
	},
	unloadResource: function() {
		
	}
};
OE.Utils.defClass(OE.Script, OE.Resource);

OE.Sound = function() {
	OE.Resource.call(this);
};
OE.Sound.prototype = {
	mContext: undefined,
	mBuffer: undefined,
	mSource: undefined,
	
	setLoop: function(loop) {
		if (this.mSource !== undefined)
			this.mSource.loop = loop;
	},
	play: function() {
		if (this.mSource !== undefined)
			this.mSource.start();
	},
	stop: function() {
		if (this.mSource !== undefined)
			this.mSource.stop();
	},
	
	loadResource: function(filePath) {
		this.onLoadStart();
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		try {
			this.mContext = new AudioContext();
			
			var request = new XMLHttpRequest();
			request.open('GET', filePath, true);
			request.responseType = 'arraybuffer';
			request.onload = function() {
				this.mContext.decodeAudioData(request.response, function(buffer) {
					this.mBuffer = buffer;
					this.mSource = this.mContext.createBufferSource();
					this.mSource.buffer = this.mBuffer;
					this.mSource.connect(this.mContext.destination);
					this.onLoaded();
				}.bind(this));
			}.bind(this);
			request.send();
		}
		catch (e) {
			this.onLoadError("Error while loading sound data.");
		}
	},
	unloadResource: function() {
		if (this.mSource !== undefined) {
			this.mSource.stop();
			this.mSource.disconnect(0);
			this.mSource.buffer = undefined;
			this.mContext.close();
			this.mSource = undefined;
			this.mBuffer = undefined;
			this.mContext = undefined;
		}
	}
};
OE.Utils.defClass(OE.Sound, OE.Resource);

OE.ResourceDecl = function(filePath, resource, managed) {
	this.mFilePath = filePath;
	this.mResource = resource;
	this.mManaged = managed ? managed : (filePath != undefined);
};
OE.ResourceDecl.prototype = {
	mFilePath: undefined,
	mResource: undefined,
	mManaged: true
};
OE.Utils.defClass(OE.ResourceDecl);

/**
 * @class ResourceManager
 * @module Resources
 * @extends Observable
 * @description Manages declaration, fetching, loading, and unloading of a given type of [Resource].
 */

/**
 * @method constructor(Resource resourceClass, [String managerName, String resourceName])
 * @description constructs a ResourceManager for the given [Resource] type
 * @param resourceClass The type of [Resource] this manager is managing.
 * @param managerName String name of this manager. Defaults to "ResourceManager" if omitted.
 * @param resourceName String name of the kind of [Resource] this manager uses. Defaults to the Function name (resourceClass.name) if omitted.
 */
OE.ResourceManager = function(resourceClass, managerName, resourceName) {
	OE.Observable.call(this);
	
	this.mClass = resourceClass;
	
	if (managerName !== undefined)
		this.mMgrName = managerName;
	
	if (resourceName === undefined)
		resourceName = resourceClass.name;
	
	this.mResName = resourceName;
	
	this.mData = {};
};
OE.ResourceManager.prototype = {
	mMgrName: "ResourceManager",
	mResName: "Resource",
	mClass: OE.Resource,
	mData: undefined,
	
	create: function() {
		return new this.mClass();
	},

	/**
	 * @method declare(String name, String filePath)
	 * @description Declares a new managed [Resource] of the manager's type.
	 * @param name The name of the new [Resource].
	 * @param filePath The path to the new [Resource].
	 */
	declare: function(name, filePath) {
		var decl = this.mData[name];
		if (decl === undefined) {
			this.mData[name] = new OE.ResourceDecl(filePath);
			this.dispatchEvent("resourceDeclared", name);
		}
		else {
			console.warn("["+this.mMgrName+"] "+this.mResName+" '"+name+"' redeclared - not overridden."
				+"\n\tOriginal source: "+decl.mFilePath
				+"\n\tIgnored source: "+filePath);
		}
	},
	declareAll: function(filePath, onFinished) {
		OE.Utils.loadJSON(filePath,
			function(json) {
				for (var key in json) {
					this.declare(key, json[key]);
				}
				if (onFinished) onFinished();
			}.bind(this),
			function(message) {
				console.warn("["+this.mMgrName+"] Error declaring resources from '"+filePath+"': "+message);
			}.bind(this)
		);
	},
	declareUnmanaged: function(name, resource) {
		var decl = this.mData[name];
		if (decl === undefined) {
			this.mData[name] = new OE.ResourceDecl(undefined, resource);
			resource.mLoadState = OE.Resource.LoadState.LOADED;
		}
		else {
			console.warn("["+this.mMgrName+"] "+this.mResName+" '"+name+"' redeclared - not overridden."
				+"\n\tOriginal source: "+decl.mFilePath
				+"\n\tIgnored source: [unmanaged]");
		}
	},
	contains: function(name) {
		var decl = this.mData[name];
		if (decl != undefined) {
			return true;
		}
		return false;
	},
	retrieve: function(name) {
		var decl = this.mData[name];
		if (decl != undefined) {
			return decl.mResource;
		}
		else {
			console.warn("["+this.mMgrName+"] Error retrieving "+this.mResName+" '"+name+"' Resource not found.");
		}
		return undefined;
	},

	/**
	 * @method getLoaded(String name [, Function onLoaded, Function onError])
	 * @description Get the [Resource] by name, loading it if not already loaded.
	 * 
	 * If the [Resource] needs to be loaded, the unloaded [Resource] will be returned, and it's asynchronous load procedure will be started in the background.
	 * @param name The name of the [Resource].
	 * @param onLoaded A Function that gets called on a successful load. Ignored if omitted.
	 * @param onError A Function that gets called on a failed load. Ignored if omitted.
	 */
	getLoaded: function(name, onLoaded, onError) {
		var decl = this.mData[name];
		if (decl != undefined) {
			if (decl.mResource === undefined) {
				if (!this.load(name, onLoaded, onError)) {
					return undefined;
				}
			}
			else if (decl.mResource.mLoadState == OE.Resource.LoadState.LOADED) {
				if (onLoaded) onLoaded(decl.mResource);
			}
			return decl.mResource;
		}
		else {
			console.warn("["+this.mMgrName+"] Error retrieving "+this.mResName+" '"+name+"' Resource not found.");
		}
		return undefined;
	},
	remove: function(name) {
		var decl = this.mData[name];
		if (decl != undefined) {
			this.mData[name] = undefined;
			delete this.mData[name];
			this.dispatchEvent("resourceRemoved", name);
		}
		else {
			console.warn("["+this.mMgrName+"] Error removing "+this.mResName+" '"+name+"'. Resource not found.");
		}
	},
	load: function(name, onLoaded, onError) {
		var decl = this.mData[name];
		if (decl != undefined) {
			if (decl.mManaged) {
				var res = decl.mResource;
				
				var changed = function(res, state) {
					switch (state) {
						case OE.Resource.LoadState.LOADED: {
							if (onLoaded) onLoaded(res);
							return true;
						}
						case OE.Resource.LoadState.LOAD_ERROR: {
							var message = res.mLoadError;
							console.warn("["+this.mMgrName+"] "+this.mResName+" '"+name+"' could not be loaded. Message: "+message);
							res.unloadResource();
							decl.mResource = undefined;
							if (onError) onError(message);
							return true;
						}
					}
					return false;
				};
				
				if (res === undefined) {
					res = decl.mResource = this.create();
					res.mResKey = name;
					res.addEventListenerOnce("loadStateChanged", changed.bind(this));
					res.loadResource(decl.mFilePath);
				}
				else if (res.mLoadState == OE.Resource.LoadState.LOADING) {
					// Don't do anything - continue to wait for loading result,
					// which will fire everyone who's passed through here's event listeners.
					
					// Add this loading request to the listeners list.
					res.addEventListenerOnce("loadStateChanged", changed.bind(this));
				}
				else if (res.mLoadState == OE.Resource.LoadState.LOADED) {
					if (onLoaded) onLoaded(res);
				}
				else if (res.mLoadState == OE.Resource.LoadState.UNLOADING) {
					if (onError) onError("This resource is currently unloading, and cannot be loaded again until finished.");
				}
				else if (res.mLoadState == OE.Resource.LoadState.LOAD_ERROR) {
					if (onError) onError("This resource encountered an error and has not yet been freed.");
				}
				else {
					if (onError) onError("Unknown resource loading state.");
				}
			}
			else {
				console.warn("["+this.mMgrName+"] Error loading "+this.mResName+" '"+name+"'. This resource is not managed.");
				if (onError) onError("This resource is not managed.");
			}
			return true;
		}
		else {
			console.warn("["+this.mMgrName+"] Error loading "+this.mResName+" '"+name+"'. Resource not found.");
			if (onError) onError("Resource not found.");
		}
		return false;
	},
	unload: function(name) {
		var decl = this.mData[name];
		if (decl != undefined) {
			if (decl.mManaged) {
				var res = decl.mResource;
				if (decl.mResource != undefined) {
					decl.mResource.unloadResource();
					decl.mResource = undefined;
				}
				else {
					console.warn("["+this.mMgrName+"] Error unloading "+this.mResName+" '"+name+"'. This resource is already unloaded.");
				}
			}
			else {
				console.warn("["+this.mMgrName+"] Error unloading "+this.mResName+" '"+name+"'. This resource is not managed.");
			}
		}
		else {
			console.warn("["+this.mMgrName+"] Error unloading "+this.mResName+" '"+name+"'. Resource not found.");
		}
	}
};
OE.Utils.defClass(OE.ResourceManager, OE.Observable);

OE.ResourceManager.declareLibrary = function(libPath, onFinished, onError) {
	OE.Utils.loadJSON(libPath,
		function(library) {
			for (var resType in library) {
				var mgr = undefined;
				switch (resType) {
					case "Textures": mgr = OE.TextureManager; break;
					case "Shaders": mgr = OE.ShaderManager; break;
					case "Materials": mgr = OE.MaterialManager; break;
					case "Models": mgr = OE.ModelManager; break;
					case "Prefabs": mgr = OE.PrefabManager; break;
					case "Scripts": mgr = OE.ScriptManager; break;
				}
				var list = library[resType];
				if (mgr) {
					for (var key in list) {
						// Split by either slash.
						var path = libPath.split('\\');
						if (path.length == 1) path = path[0].split('/');
						
						// Replace file name part with extended path to source.
						path[path.length-1] = list[key];
						
						// Recompile new path.
						path = path.join('/');
						
						mgr.declare(key, path);
					}
				}
			}
			if (onFinished) onFinished();
		}, function(error) {
			console.warn("Error loading resource library '"+libPath+"': "+error);
			if (onError) onError(error);
		});
};

// #include Materials/Shader.js
// #include Materials/Texture.js
// #include Materials/Material.js
// #include Resources/Model.js
// #include Resources/Prefab.js
// #include Resources/Script.js
// #include Resources/Sound.js

/**
 * @class ShaderManager
 * @extends ResourceManager
 * @module Resources
 * @description This is not actually a class, but an instance of a [ResourceManager] that handles [Shader] objects.
 */
OE.ShaderManager = new OE.ResourceManager(OE.Shader, "ShaderMgr", "Shader");
OE.TextureManager = new OE.ResourceManager(OE.Texture, "TextureMgr", "Texture");

/**
 * @class MaterialManger
 * @extends ResourceManager
 * @module Resources
 * @description This is not actually a class, but an instance of a [ResourceManager] that handles [Material] objects.
 */
OE.MaterialManager = new OE.ResourceManager(OE.Material, "MaterialMgr", "Material");
OE.ModelManager = new OE.ResourceManager(OE.Model, "ModelMgr", "Model");
OE.PrefabManager = new OE.ResourceManager(OE.Prefab, "PrefabMgr", "Prefab");
OE.ScriptManager = new OE.ResourceManager(OE.Script, "ScriptMgr", "Script");
OE.SoundManager = new OE.ResourceManager(OE.Sound, "SoundMgr", "Sound");
/**
 * @class Camera
 * @extends GameObject
 * @module Scene
 * @description A subclass of [GameObject] that is used to project the scene onto a [Viewport].
 */

/**
 * @method constructor(Scene scene)
 * @description Constructs the camera with the identity [Transform] and an identity projection matrix.
 * @param scene The [Scene] this [Camera] is attached to.
 */
OE.Camera = function Camera(scene) {
	OE.GameObject.call(this);
	this.mParentScene = scene;
	this.mFrustum = new OE.Frustum();
	this.mLocalFrustum = new OE.Frustum();
	this.mProjectionMatrix = mat4.create();
	this.mViewMatrix = mat4.create();
	mat4.identity(this.mProjectionMatrix);
	mat4.identity(this.mViewMatrix);
};

OE.Camera.prototype = {
	mParentScene: undefined,
	mFrustum: undefined,
	mLocalFrustum: undefined,
	mProjectionMatrix: undefined,
	mViewMatrix: undefined,
	
	mNearPlane: 0.1,
	mFarPlane: 1000.0,
	mFieldOfView: 45.0,
	mAspectRatio: 1.0,
	
	// TODO: Don't applyPerspective each time you invalidate.
	// Set the flag, and applyPerspective only when someone asks
	// for the frustum or matrices and the flag is set.
	
	invalidate: function() {
		this.mInvalidate = true;
	},
	setAspectRatio: function(value) {
		this.mAspectRatio = value;
		this.mInvalidate = true;
		this.applyPerspective();
	},
	setNearPlane: function(value) {
		this.mNearPlane = value;
		this.mInvalidate = true;
		this.applyPerspective();
	},
	setFarPlane: function(value) {
		this.mFarPlane = value;
		this.mInvalidate = true;
		this.applyPerspective();
	},
	setPerspective: function(fieldOfView, aspectRatio, near, far) {
		this.mNearPlane = near;
		this.mFarPlane = far;
		this.mFieldOfView = fieldOfView;
		this.mAspectRatio = aspectRatio;
		this.mInvalidate = true;
		this.applyPerspective();
	},
	
	applyPerspective: function() {
		mat4.perspective(this.mFieldOfView,
						 this.mAspectRatio,
						 this.mNearPlane,
						 this.mFarPlane,
						 this.mProjectionMatrix);
		
		var tan = Math.tan(this.mFieldOfView * 0.5 * OE.Math.DEG_TO_RAD);
		var nh = this.mNearPlane * tan;
		var fh = this.mFarPlane * tan;
		var nw = nh * this.mAspectRatio;
		var fw = fh * this.mAspectRatio;
		
		var nz = -this.mNearPlane;
		var fz = -this.mFarPlane;
		var nxoff = nw; var nyoff = nh;
		var fxoff = fw; var fyoff = fh;
		
		var p = this.mLocalFrustum.mPoints;
		p[0].setf(-nxoff, -nyoff, nz);
		p[1].setf( nxoff, -nyoff, nz);
		p[2].setf(-nxoff,  nyoff, nz);
		p[3].setf( nxoff,  nyoff, nz);
		p[4].setf(-fxoff, -fyoff, fz);
		p[5].setf( fxoff, -fyoff, fz);
		p[6].setf(-fxoff,  fyoff, fz);
		p[7].setf( fxoff,  fyoff, fz);
		this.mLocalFrustum.calcPlanes();
		
		this.updateWorldFrustum();
	},
	
	// TODO: include ortho in the apply function, and make this
	// function just set ortho params then invalidate, like
	// the other setters.
	setOrtho: function(left, right, bottom, top, near, far) {
		this.mNearPlane = near;
		this.mFarPlane = far;
		mat4.ortho(left, right, bottom, top, near, far, this.mProjectionMatrix);
		// TODO: set frustum planes for ortho.
		this.updateWorldFrustum();
	},
	
	updateWorldFrustum: function() {
		var localPlanes = this.mLocalFrustum.mPlanes;
		var planes = this.mFrustum.mPlanes;
		
		var pos = this.getTransform().getPos();
		var rot = this.getTransform().getRot();
		
		for (var i=0; i<6; i++) {
			var plane = planes[i];
			var localPlane = localPlanes[i];
			plane.set(localPlane.mPoint, localPlane.mNormal);
			rot.mulvBy(plane.mPoint);
			plane.mPoint.addBy(pos);
			rot.mulvBy(plane.mNormal);
		}
	},
	
	mMLookX: 0.0, mMLookY: 0.0,
	mouseLook: function(dx, dy, sensitivity, lockY) {
		if (sensitivity === undefined) sensitivity = 0.25;
		if (lockY === undefined) lockY = false;
		
		this.mMLookX += dy * sensitivity;
		this.mMLookY += dx * sensitivity;
		
		if (lockY) {
			// TODO: Do something
		}
		else {
			var rot = this.getRot();
			OE.Quaternion._aux.fromAxisAngle(OE.Vector3.RIGHT, this.mMLookX);
			rot.fromAxisAngle(OE.Vector3.UP, this.mMLookY);
			rot.mulBy(OE.Quaternion._aux);
			this.setRot(rot);
		}
	},
	
	onTransformChanged: function() {
		OE.GameObject.prototype.onTransformChanged.call(this);
		mat4.inverse(this.getWorldMatrix(), this.mViewMatrix);
		this.updateWorldFrustum();
	},
	
	getProjectionMatrix: function() {
		return this.mProjectionMatrix;
	},
	getViewMatrix: function() {
		return this.mViewMatrix;
	},
	
	applySerialData: function(data) {
		OE.GameObject.prototype.applySerialData.call(this, data);
		
		if (data.nearPlane !== undefined)
			this.setNearPlane(data.nearPlane);
		
		if (data.farPlane !== undefined)
			this.setFarPlane(data.farPlane);
	}
};

OE.Camera.deserialize = function(data) {
	var cam = new OE.Camera();
	cam.applySerialData(data);
	return cam;
};

OE.Utils.defClass(OE.Camera, OE.GameObject);

OE.ForceCamera = function ForceCamera(scene) {
	OE.Camera.call(this, scene);
	
	this.mVelocity = new OE.Vector3(0.0);
	this.mRotVel = new OE.Quaternion();
	this.mMLookA = new OE.Quaternion();
};

OE.ForceCamera.prototype = {
	mVelocity: undefined,
	mRotVel: undefined,
	mFriction: 0.875,
	mRotFriction: 0.625,
	
	mLockY: false,
	mRotX: 0.0,
	mRotY: 0.0,
	mRotVelX: 0.0,
	mRotVelY: 0.0,
	
	onCreate: function() {},
	
	accel: function(accel, local) {
		if (local) {
			var rot = this.getRot();
			rot.mulvBy(accel);
		}
		this.mVelocity.addBy(accel);
	},
	rotAccel: function(accel) {
		this.mRotVel.mulBy(accel);
	},
	setRotVel: function(vel) {
		this.mRotVel.set(vel);
	},
	
	nullQuat: new OE.Quaternion(),
	
	onUpdate: function() {
		var pos = this.getPos();
		pos.addBy(this.mVelocity);
		this.mVelocity.mulByf(this.mFriction);
		this.setPos(pos);
		
		if (this.mLockY) {
			this.mRotX += this.mRotVelX;
			this.mRotY += this.mRotVelY;
			this.mRotVelX *= this.mRotFriction;
			this.mRotVelY *= this.mRotFriction;
			var rot = this.getRot();
			rot.fromAxisAngle(OE.Vector3.UP, this.mRotY);
			OE.Quaternion._aux.fromAxisAngle(OE.Vector3.RIGHT, this.mRotX);
			rot.mulBy(OE.Quaternion._aux);
			this.setRot(rot);
		}
		else {
			var rot = this.getRot();
			rot.mulBy(this.mRotVel);
			this.mRotVel.lerp(this.nullQuat, 1.0-this.mRotFriction);
			this.setRot(rot);
		}
	},
	
	mMLookA: undefined,
	mouseLook: function(dx, dy, sensitivity) {
		if (sensitivity === undefined) sensitivity = 0.1;
		
		this.mMLookX = dy * sensitivity;
		this.mMLookY = dx * sensitivity;
		
		if (this.mLockY) {
			this.mRotVelX += this.mMLookX;
			this.mRotVelY += this.mMLookY;
		}
		else {
			OE.Quaternion._aux.fromAxisAngle(OE.Vector3.RIGHT, this.mMLookX);
			this.mMLookA.fromAxisAngle(OE.Vector3.UP, this.mMLookY);
			this.mMLookA.mulBy(OE.Quaternion._aux);
			this.rotAccel(this.mMLookA);
		}
	},
	
	applySerialData: function(data) {
		OE.Camera.prototype.applySerialData.call(this, data);
	}
};

OE.ForceCamera.deserialize = function(data) {
	var cam = new OE.ForceCamera();
	cam.applySerialData(data);
	return cam;
};

OE.Utils.defClass(OE.ForceCamera, OE.Camera);
/**
 * @class Scene
 * @module Scene
 * @extends Observable
 * @description Any system for containing a scene of [GameObject]s.
 * 
 * The default [Scene] class implements a hierarchical scene graph with simple [BoundingBox] spatial partitioning. Subclasses may choose to implement a different method of storing and partitioning objects, like octrees, BSP trees, etc. For a large, complex game, this is recommended.
 */
OE.Scene = function Scene() {
	OE.Observable.call(this);
	this.mRoot = new OE.GameObject();
	this.mRoot._setScene(this);
};

OE.Scene.prototype = {
	mRenderSystem: undefined,
	mRenderQueue: undefined,
	mRoot: undefined,

	/**
	 * @method setRenderSystem(RenderSystem rs)
	 * @description Sets the [RenderSystem] this [Scene] uses to render the geometry it decides is visible.
	 * @param rs The [RenderSystem] that this scene uses to render.
	 */
	setRenderSystem: function(rs) {
		this.mRenderSystem = rs;
		this.mRenderQueue = rs.mRenderQueue;
	},
	
	clear: function() {
		this.mRoot.destroy();
		this.mRoot = new OE.GameObject();
		this.mRoot._setScene(this);
	},
	
	/**
	 * @method addObject(GameObject object)
	 * @description Adds a [GameObject] to the root node of the scene. Subclasses may implement this method differently.
	 * @param object The object to add to the scene.
	 * @return The added [GameObject] (for chaining).
	 */
	addObject: function(object) {
		return this.mRoot.addChild(object);
	},
	
	auxBbox: undefined,
	objectVisible: function(object, camera) {
		var bbox = object.mBoundingBox;
		if (bbox) {
			if (this.auxBbox === undefined) this.auxBbox = new OE.BoundingBox();
			var pos = object.mWorldTransform.mPosition;
			this.auxBbox.p1.setf(
				pos.x + bbox.p1.x,
				pos.y + bbox.p1.y,
				pos.z + bbox.p1.z);
			this.auxBbox.p2.setf(
				pos.x + bbox.p2.x,
				pos.y + bbox.p2.y,
				pos.z + bbox.p2.z);
			object.mCulledLastFrame = !camera.mFrustum.containsBox(this.auxBbox);
		}
		else {
			object.mCulledLastFrame = false;
		}
		return !object.mCulledLastFrame;
	},
	queueObject: function(object, rq, camera) {
		if (object.mActive) {
			object.queueRenderables(rq);
			for (var i=0; i<object.mChildren.length; i++) {
				if (this.objectVisible(object.mChildren[i], camera)) {
					this.queueObject(object.mChildren[i], rq, camera);
				}
			}
		}
	},
	renderViewport: function(viewport, camera) {
		this.mRenderQueue.clearRenderables();
		this.queueObject(this.mRoot, this.mRenderQueue, camera);
		
		this.mRenderSystem.startFrame();
		
		if (viewport.mCompositor !== undefined) {
			viewport.mCompositor.renderScene(this, viewport, camera);
		}
		else {
			this.mRenderSystem.activateViewport(viewport);
			this.mRenderQueue.renderAll();
		}
	},
	update: function() {
		this.mRoot.update();
	}
};
OE.Utils.defClass(OE.Scene, OE.Observable);

OE.TerrainScene = function() {
	OE.Scene.call(this);
};

OE.TerrainScene.prototype = {
	mChunks: undefined,
	mNumChunks: 5,
	mChunkSegs: 127,
	mChunkSize: 500.0,
	mTerrainHeight: 100.0,
	mMainChunk: undefined,
	mPlayerObject: undefined,
	mSceneX: 0,
	mSceneY: 0,
	
	init: function() {
		this.mChunks = [];
		var centerOffset = Math.floor((this.mNumChunks-1)/2);
		for (var y=0; y<this.mNumChunks; y++) {
			for (var x=0; x<this.mNumChunks; x++) {
				var i = this.mNumChunks*y+x;
				var offx = (x - centerOffset);
				var offy = (y - centerOffset);
				var terrain = this.mChunks[i] = new OE.TerrainPatch(
					this.mChunkSize, this.mChunkSize,
					this.mChunkSegs, this.mChunkSegs);
				terrain.setPosf(
					offx*this.mChunkSize, 0.0,
					offy*this.mChunkSize);
				this.mRoot.addChild(terrain);
			}
		}
		var size = this.mNumChunks * this.mNumChunks;
		this.mMainChunk = this.mChunks[Math.floor(size/2)];
		
		for (var y=0; y<this.mNumChunks; y++) {
			for (var x=0; x<this.mNumChunks; x++) {
				this.dispatchEvent("chunkLoaded", [x, y]);
			}
		}
	},
	addObject: function(object) {
		var chunk = this.getChunkForPoint(object.getPos());
		return chunk.addChild(object);
	},
	setPlayerObject: function(object) {
		this.mPlayerObject = object;
		return this.mRoot.addChild(this.mPlayerObject);
	},
	onObjectMoved: function(object) {
		var chunk = this.getChunkForPoint(object.getPos());
		if (object.mParent != chunk) {
			chunk.addChild(object);
		}
	},
	setHeightmap: function(heightFunc) {
		this.mHeightFunc = heightFunc;
		var centerOffset = Math.floor((this.mNumChunks-1)/2);
		for (var y=0; y<this.mNumChunks; y++) {
			for (var x=0; x<this.mNumChunks; x++) {
				this.updateHeightmap(x, y);
			}
		}
	},
	updateHeightmap: function(x, y) {
		var centerOffset = Math.floor((this.mNumChunks-1)/2);
		var i = this.mNumChunks*y+x;
		var terrain = this.mChunks[i];
		var offx = (x - centerOffset) + this.mSceneX;
		var offy = (y - centerOffset) + this.mSceneY;
		var data = {
			scene: this,
			terrain: terrain,
			chunkIndex: {x: x, y: y},
			chunkWorldOffset: {x: offx, y: offy},
			heightmapIndex: {x: 0, y: 0}
		};
		data.terrain.mActive = false;
		terrain.setHeightmap(
			function(ix, iy) {
				this.heightmapIndex.x = ix;
				this.heightmapIndex.y = iy;
				return this.scene.mHeightFunc(this);
			}.bind(data),
			function() {
				data.terrain.mActive = true;
			}.bind(data)
		);
	},
	getHeight: function(pos) {
		var chunk = this.getChunkForPoint(pos);
		if (chunk) {
			var cp = chunk.getPos();
			var cx = cp.x - this.mChunkSize/2.0;
			var cz = cp.z - this.mChunkSize/2.0;
			var px = (pos.x - cx);
			var pz = (pos.z - cz);
			return chunk.getHeightInterp(px, pz);
		}
		return 0.0;
	},
	getNormal: function(pos) {
		var chunk = this.getChunkForPoint(pos);
		if (chunk) {
			var cp = chunk.getPos();
			var cx = cp.x - this.mChunkSize/2.0;
			var cz = cp.z - this.mChunkSize/2.0;
			var px = (pos.x - cx);
			var pz = (pos.z - cz);
			return chunk.getNormalInterp(px, pz);
		}
		return OE.Vector3.UP;
	},
	shiftChunks: function(x_offset, y_offset) {
		var n = this.mNumChunks * this.mNumChunks;
		var objects = new Array(n);
		var new_index = new Array(n);
		var needs_update = new Array(n);
		var centerOffset = Math.floor((this.mNumChunks-1)/2);
		
		console.log("Shift("+x_offset+", "+y_offset+")");
		
		for (var y=0; y<this.mNumChunks; y++) {
			for (var x=0; x<this.mNumChunks; x++) {
				var x2 = OE.Math.mod(x-x_offset, this.mNumChunks);
				var y2 = OE.Math.mod(y-y_offset, this.mNumChunks);
				var i = this.mNumChunks*y+x;
				var i2 = this.mNumChunks*y2+x2;
				objects[i] = this.mChunks[i];
				new_index[i] = [x2, y2, i2];
				needs_update[i] = (	x2 !== x-x_offset ||
									y2 !== y-y_offset);
				
				if (needs_update[i]) {
					this.dispatchEvent("chunkUnloaded", [x, y]);
					this.dispatchEvent("chunkLoaded", [x2, y2]);
					//console.log("Update Terrain ("+x2+", "+y2+") (was "+x+", "+y+")");
				}
			}
		}
		var size = this.mNumChunks * this.mNumChunks;
		for (var i=0; i<size; i++) {
			var offx = new_index[i][0];
			var offy = new_index[i][1];
			var i2 = new_index[i][2];
			var c = objects[i];
			this.mChunks[i2] = c;
			
			c.setPosf(	(offx - centerOffset)*this.mChunkSize, 0.0,
						(offy - centerOffset)*this.mChunkSize);
			
			if (needs_update[i]) {
				this.updateHeightmap(offx, offy);
			}
		}
		this.mMainChunk = this.mChunks[Math.floor(size/2)];
	},
	getChunkInfo: function(chunk_x, chunk_y) {
		var i = this.mNumChunks * chunk_y + chunk_x;
		return {
			chunk: this.mChunks[i],
			index_x: chunk_x,
			index_y: chunk_y,
			index: i,
			world_x: chunk_x + this.mSceneX,
			world_y: chunk_y + this.mSceneY
		};
	},
	getChunkForPoint: function(point) {
		var corner = -this.mChunkSize * this.mNumChunks / 2.0;
		var fx = (point.x - corner) / this.mChunkSize;
		var fz = (point.z - corner) / this.mChunkSize;
		var x = Math.floor(fx);
		var y = Math.floor(fz);
		var i = this.mNumChunks*y+x;
		return this.mChunks[i];
	},
	update: function() {
		OE.Scene.prototype.update.call(this);
		
		if (this.mPlayerObject) {
			var b = (this.mChunkSize / 2.0) * 1.125;
			var pos = this.mPlayerObject.getPos();
			var offx = 0;
			var offy = 0;
				 if (pos.x < -b) offx = -1;
			else if (pos.x > b)  offx = 1;
				 if (pos.z < -b) offy = -1;
			else if (pos.z > b)  offy = 1;
			
			if (offx != 0 || offy != 0) {
				this.mSceneX += offx;
				this.mSceneY += offy;
				this.shiftChunks(offx, offy);
				pos.x -= this.mChunkSize * offx;
				pos.z -= this.mChunkSize * offy;
				this.mPlayerObject.setPos(pos);
			}
		}
	}
};
OE.Utils.defClass(OE.TerrainScene, OE.Scene);
/**
 * @class Viewport
 * @module Scene
 * @description TODO
 */

/**
 * @method constructor(RenderTarget renderTarget, Camera camera)
 * @description Constructs the [Viewport].
 * @param renderTarget The parent [RenderTarget] this [Viewport] is attached to.
 * @param camera The [Camera] whose view is being rendered through this [Viewport].
 */
OE.Viewport = function(renderTarget, camera) {
	this.mRenderTarget = renderTarget;
	this.mCamera = camera;
	this.mExtents = {
		left: 0.0, top: 0.0,
		right: 1.0, bottom: 1.0,
		width: 1.0, height: 1.0,
	};
};

OE.Viewport.prototype = {
	mRenderTarget: undefined,
	mCamera: undefined,
	mResetColor: true,
	mResetDepth: true,
	mCompositor: undefined,
	mExtents: undefined,
	mChanged: false,
	
	setExtents: function(left, top, right, bottom) {
		this.mExtents.left = left;
		this.mExtents.top = top;
		this.mExtents.right = right;
		this.mExtents.bottom = bottom;
		this.mExtents.width = right - left;
		this.mExtents.height = bottom - top;
	},
	getScreenRect: function() {
		var w = this.mRenderTarget.getWidth();
		var h = this.mRenderTarget.getHeight();
		var x = this.mExtents.left * w;
		var y = this.mExtents.top * h;
		w *= this.mExtents.width;
		h *= this.mExtents.height;
		
		return {x: x, y: y, width: w, height: h};
	},
	unproject: function(pixels_x, pixels_y, outRayPos, outRayDir) {
		pixels_x /= this.mRenderTarget.getWidth();
		pixels_y /= this.mRenderTarget.getHeight();
		
		var xmin, xmax, ymin, ymax, zmin;
		zmin = this.mCamera.mNearPlane;
		ymax = zmin * Math.tan(this.mCamera.mFieldOfView * OE.Math.PI_BY_360);
		ymin = -ymax;
		xmax = ymax * this.mCamera.mAspectRatio;
		xmin = -xmax;
		
		var rect = this.getScreenRect();
		
		var fwd = new OE.Vector3(
			xmin + (xmax - xmin) * (pixels_x - this.mExtents.left) / this.mExtents.width,
			-(ymin + (ymax - ymin) * (pixels_y - this.mExtents.top) / this.mExtents.height),
			-zmin);
		fwd.normalize();
		
		var rot = this.mCamera.mWorldTransform.getRot();
		rot.mulvBy(fwd);
		outRayDir.set(fwd);
		outRayPos.set(this.mCamera.mWorldTransform.getPos());
		outRayPos.addBy(outRayDir);
	}
};
OE.Utils.defClass(OE.Viewport);
