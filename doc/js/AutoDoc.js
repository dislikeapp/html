
function AutoDoc(docEntry, subject, subjectName) {
	if (docEntry === undefined) docEntry = {};
	
	if (docEntry.name === undefined) {
		if (subjectName !== undefined)
			docEntry.name = subjectName;
		else docEntry.name = "";
	}
	
	if (docEntry.extends !== undefined && docEntry.extends.length === 0)
		docEntry.extends = undefined;
	
	if (docEntry.fields !== undefined && docEntry.fields.length === 0)
		docEntry.fields = undefined;
	
	if (docEntry.methods !== undefined && docEntry.methods.length === 0)
		docEntry.methods = undefined;
	
	if (docEntry.fields) {
		var list = docEntry.fields;
		docEntry.fields = {};
		for (var i=0; i<list.length; i++) {
			var m = list[i];
			docEntry.fields[m.name] = m;
		}
	}
	if (docEntry.methods) {
		var list = docEntry.methods;
		docEntry.methods = {};
		for (var i=0; i<list.length; i++) {
			var m = list[i];
			m.name = this.parseFuncName(m.signature);
			docEntry.methods[m.name] = m;
		}
	}
	
	this.docEntry = docEntry;
	this.subject = subject;
	this.subjectProt = subject ? subject.prototype : undefined;
}
AutoDoc.prototype = {
	docEntry: undefined,
	subject: undefined,
	subjectProt: undefined,
	output: undefined,
	namespace: undefined,
	
	setOutput: function(elem) {
		this.output = elem;
	},
	setNamespace: function(obj, name) {
		this.namespace = {
			name: name,
			object: obj
		};
	},
	
	linkify: function(name) {
		return '<a href="./?'+name+'">'+name+'</a>';
	},
	linkifyText: function(text) {
		text = text.replace(/\[(\S+)\]/g, '<a href="./?$1">$1</a>');
		return text;
	},
	escapeHtml: function(text) {
		var map = {
			'&': '&amp;',
			'<': '&lt;',
			'>': '&gt;',
			'"': '&quot;',
			"'": '&#039;'
		};
		return text.replace(/[&<>"']/g, function(m) {return map[m];});
	},
	formatText: function(text) {
		return this.linkifyText(this.escapeHtml(text));
	},
	
	parseFuncName: function(signature) {
		var match = signature.match(/^\s*(\S*)\s*\(\s*.*\s*\)\s*$/);
		if (match) {
			return match[1].trim();
		}
		return undefined;
	},
	parseFuncArgs: function(signature) {
		var args = new Array();
		var match = signature.match(/^\s*\S*\s*\(\s*(.*)\s*\)\s*$/);
		if (match) {
			var argStr = match[1].trim();
			var bracket = argStr.indexOf('[');
			
			// @STUPID (see TODO below).
			if (bracket !== -1) {
				argStr = argStr.replace(/[\[\]]/gm, '');
				bracket = -1;
			}
			
			if (bracket === -1) {
				var list = argStr.split(',');
				for (var i=0; i<list.length; i++) {
					var str = list[i].trim();
					var arg = {};
					var words = str.match(/(\S+)\s+(\S+)/);
					if (words) {
						arg.type = words[1];
						arg.name = words[2];
					}
					else {
						arg.name = str;
					}
					args.push(arg);
				}
			}
			else {
				// TODO: Has optional arguments. Just strip the
				// square-brackets and pretend they weren't there for now.
				// See @STUPID line above.
			}
		}
		return args;
	},
	generateFuncArgStr: function(args) {
		var str = '';
		for (var i=0; i<args.length; i++) {
			var arg = args[i];
			if (i > 0) str += ', ';
			if (arg.type) {
				str += arg.type+' ';
			}
			str += arg.name;
		}
		return str;
	},
	
	getFuncArgs: function(func) {
		var funcStr = func.toString();
		var args = funcStr.match(/function\s*\S*\s*\(\s*(.*)\s*\)\s*\{/)[1].split(",");
		args.forEach(function(e, i) {args[i] = e.trim();});
		return args;
	},
	getFuncArgStr: function(func) {
		var args = this.getFuncArgs(func);
		var argStr = '';
		for (var i=0; i<args.length; i++)
			argStr += (i>0?', ':'') + args[i];
		return argStr;
	},
	getMembers: function(obj) {
		var variables = {};
		var functions = {};
		
		for (var key in obj) {
			if (key !== "constructor") {
				var value = obj[key];
				if (typeof value === "function")
					functions[key] = value;
				else
					variables[key] = value;
			}
		}
		if (Object.keys(variables).length === 0) variables = undefined;
		if (Object.keys(functions).length === 0) functions = undefined;
		return {variables: variables, functions: functions};
	},
	
	getFullClassName: function() {
		var name = this.docEntry.name;
		if (this.docEntry.name === '') {
			name = this.className;
		}
		if (this.namespace)
			name = this.namespace.name + '.' + name;
		return name;
	},
	
	writeClassName: function() {
		var str = '';
		if (this.docEntry.name !== undefined) {
			var name = this.getFullClassName();
			str += '<h1 class="class name">'+name+'</h1>';
		}
		return str;
	},
	
	writeExtends: function() {
		var str = '';
		var list = this.docEntry.extends;
		if (list) {
			str += '<div class="class extends">Extends ';
			for (var i=0; i<list.length; i++) {
				if (i > 0) str += ', ';
				str += this.linkify(list[i]);
			}
			str += '</div>';
		}
		return str;
	},
	
	writeClassDesc: function() {
		var str = '';
		if (this.docEntry.description !== undefined) {
			str += '<div class="class desc">'+this.formatText(this.docEntry.description)+'</div>';
		}
		return str;
	},
	
	writeConstructor: function() {
		var str = '';
		if (this.subject.prototype !== undefined) {
			var constr = this.subject.prototype.constructor;
			if (constr !== undefined && constr !== Object) {
				var displayName = undefined;
				if (constr.name && constr.name.length > 0) {
					displayName = this.namespace.name+'.'+constr.name;
				}
				
				str += '<h3 class="listHeader">Constructor</h3>';
				str += this.writeMethodList(true, this.docEntry.methods, [{
					func: constr,
					name: "constructor",
					displayName: displayName
				}]);
			}
		}
		return str;
	},
	
	writeMethodList: function(detailed, docs, methods) {
		var str = '';
		str += '<div class="methodList'+(detailed?' detailed':'')+'">';
		for (var i=0; i<methods.length; i++) {
			var m = methods[i];
			var doc = undefined;
			
			if (docs)
				doc = docs[m.name];
			
			var funcName = undefined;
			var funcArgStr = undefined;
			
			str += '<div>';
			
			if (doc && doc !== Object) {
				funcName = this.parseFuncName(doc.signature);
				var funcArgs = this.parseFuncArgs(doc.signature);
				
				for (var j=0; j<funcArgs.length; j++) {
					var arg = funcArgs[j];
					if (arg.type) {
						arg.type = this.linkify(arg.type);
					}
				}
				
				funcArgStr = this.generateFuncArgStr(funcArgs);
				
			}
			else {
				funcName = m.name;
				funcArgStr = this.getFuncArgStr(m.func);
			}
			
			if (m.displayName !== undefined)
				funcName = m.displayName;
			
			str += '<div class="method name">'+funcName+' ( '+funcArgStr+' )</div>';
			
			if (detailed && doc) {
				if (doc.description) {
					str += '<p class="method desc">'+this.formatText(doc.description)+'</p>';
				}
				if (doc.params) {
					str += '<h3>Params</h3>';
					for (var j=0; j<doc.params.length; j++) {
						var p = doc.params[j];
						str += '<div class="method param">'
							+'<div class="name">'+p.name+'</div>'
							+'<div class="desc">- '+this.formatText(p.desc)+'</div>'
						+'</div>';
					}
				}
				if (doc.return) {
					str += '<h3>Returns</h3>';
					str += '<p class="method returns">'+this.formatText(doc.return)+'</p>'
				}
			}
			else if (detailed) {
				str += '<div class="method undocumented">[Undocumented]</div>';
			}
			str += '</div>';
		}
		str += '</div>';
		return str;
	},
	
	writeStaticMembers: function() {
		var str = '';
		if (this.subject) {
			var members = this.getMembers(this.subject);
			
			var fullName = this.getFullClassName();
			
			if (members.variables) {
				str += '<h3 class="listHeader">Static Members & Constants</h3>';
				str += '<div class="members">';
				for (var key in members.variables) {
					var m = members.variables[key];
					str += '<div>'+fullName+'.'+key+'</div>';
				}
				str += '</div>';
			}
			
			if (members.functions) {
				str += '<h3 class="listHeader">Static Functions</h3>';
				var methods = [];
				for (var key in members.functions) {
					var m = members.functions[key];
					methods.push({
						func: m,
						name: key,
						displayName: fullName+'.'+key
					});
				}
				str += this.writeMethodList(true, undefined, methods);
			}
		}
		return str;
	},
	
	writeInstanceMembers: function() {
		var str = '';
		if (this.subjectProt !== undefined) {
			var members = this.getMembers(this.subjectProt);
			
			if (members.variables) {
				str += '<h3 class="listHeader">Prototype Member Variables</h3>';
				str += '<div class="members">';
				for (var key in members.variables) {
					var m = members.variables[key];
					str += '<div>'+key+'</div>';
				}
				str += '</div>';
			}
			
			if (members.functions) {
				str += '<h3 class="listHeader">Prototype Member Functions</h3>';
				var methods = [];
				for (var key in members.functions) {
					var m = members.functions[key];
					methods.push({
						func: m,
						name: key
					});
				}
				str += this.writeMethodList(true, this.docEntry.methods, methods);
			}
		}
		return str;
	},
	
	writeReportBtn: function() {
		var str = '';
		str += '<a id="reportPage" href="javascript:void(0);" style="'
			+'display: block; position: absolute;'
			+' top: 12px; right: 32px; background: #EFEFEF; color: #1F1F1F;'
			+' padding: 8px; text-decoration: none; font-size: 14px;'
			+'">Page has mistakes?</a>';
		return str;
	},
	
	autoDoc: function() {
		var str = '';
		
		str += this.writeClassName();
		str += this.writeExtends();
		str += this.writeClassDesc();
		
		str += this.writeConstructor();
		str += this.writeInstanceMembers();
		str += this.writeStaticMembers();
		
		str += this.writeReportBtn();
		
		this.output.innerHTML = str;
		
		var btn = document.getElementById("reportPage");
		btn.addEventListener("click", function() {
			var className = this.getFullClassName();
			OE.Utils.ajaxRequest("report.php", "className="+className,
				function(response) {
					alert("Thank you! This page has been marked, and a developer has been scolded.");
				}.bind(this)
			);
		}.bind(this));
		
		OE.Utils.ajaxRequest("reports.json", undefined, function(json) {
			json = JSON.parse(json);
			var className = this.getFullClassName();
			var n = json[className];
			if (n !== undefined) {
				btn.innerHTML = btn.innerHTML+' <b>(Marked '+n+' '+(n===1?'time':'times')+')</b>';
			}
		}.bind(this));
	}
};
AutoDoc.prototype.constructor = AutoDoc;
