
(function() {
	if (console !== undefined && window !== undefined) {
		var funcs = ["log", "warn", "error"];
		var ops = {};
		var output = new Array();
		
		for (var i=0; i<funcs.length; i++) {
			var name = funcs[i];
			var func = console[name];
			if (typeof func === "function") {
				var op = {
					name: name,
					calls: new Array(),
					nativeFunc: func,
					func: undefined
				};
				ops[name] = op;
			}
		}
		for (var name in ops) {
			var op = ops[name];
			op.func = function() {
				var nativeFunc = op.nativeFunc;
				nativeFunc.apply(this, arguments);
				op.calls.push(arguments);
				if (typeof arguments[0] === "string") {
					output.push({
						level: op.name,
						msg: arguments[0]
					});
				}
			};
			console[name] = op.func;
		}
		var elem = undefined;
		window.showConsoleOutput = function() {
			if (elem === undefined) {
				var elem = document.createElement('textarea');
				document.body.appendChild(elem);
				
				elem.style.position = 'absolute';
				elem.style.top = '0px';
				elem.style.left = '0px';
				elem.style.zIndex = 1000;
				elem.style.width = '100%';
				elem.style.height = '100%';
				
				var str = '';
				for (var i=0; i<output.length; i++) {
					var entry = output[i];
					str += '<div>'+entry.level+':'+entry.msg+'</div>';
				}
				
				elem.innerHTML = str;
			}
		};
		window.hideConsoleOutput = function() {
			if (elem !== undefined) {
				document.body.removeChild(elem);
				elem = undefined;
			}
		};
	}
})();