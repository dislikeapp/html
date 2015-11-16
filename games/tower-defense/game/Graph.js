
var Graph = OE.Utils.defClass2({
	nodes: undefined,
	edges: undefined,
	
	constructor: function Graph() {
		this.nodes = new Map();
		this.edges = new Map();
	},
	clear: function() {
		this.nodes = new Map();
		this.edges = new Map();
	},
	addNode: function(id, userData) {
		var node = new Graph.Node(this);
		if (id === undefined)
			node.id = this.nodes.insertNext(node);
		else
			node.id = this.nodes.insert(id, node);
		node.userData = userData;
		return node;
	},
	addEdge: function(id1, id2) {
		var a = this.nodes.data[id1];
		var b = this.nodes.data[id2];
		var edge = new Graph.Edge(this, a, b);
		edge.id = this.edges.insertNext(edge);
		a.edges.push(edge);
		b.edges.push(edge);
		a.neighbors.push(b);
		b.neighbors.push(a);
		return edge;
	},
	removeNode: function(id) {
		var node = this.nodes.data[id];
		if (node !== undefined) {
			for (var i=0; i<node.neighbors.length; i++) {
				this.removeEdge(node.id, node.neighbors[i].id);
			}
			this.nodes.removeKey(node.id);
			node.id = undefined;
		}
	},
	removeEdge: function(id1, id2) {
		var id = (id2 === undefined) ? id1 : undefined;
		if (id !== undefined) {
			var edge = this.edges.data[id];
			if (edge !== undefined)
				this.removeEdge(edge.a.id, edge.b.id);
		}
		else {
			var a = this.nodes.data[id1];
			var b = this.nodes.data[id2];
			
			if (a !== undefined && b !== undefined) {
				var edge = a.removeNeighbor(b);
				var edge2 = b.removeNeighbor(a);
				
				if (edge !== edge2) {
					console.warn("[Graph] Invalid state detected.");
				}
				else if (edge !== undefined) {
					this.edges.removeKey(edge.id);
					edge.id = undefined;
				}
			}
		}
	},
	areConnected: function(id1, id2) {
		var n1 = this.nodes.data[id1];
		if (n1 !== undefined)
			return n1.hasNeighbor(this.nodes.data[id1]);
		return false;
	}
});

Graph.Edge = OE.Utils.defClass2({
	graph: undefined,
	a: undefined,
	b: undefined,
	
	constructor: function(graph, a, b) {
		this.graph = graph;
		this.a = a;
		this.b = b;
	},
	getOther: function(a) {
		if (a === this.a) return this.b;
		if (a === this.b) return this.a;
		return undefined;
	},
	isBetween: function(a, b) {
		if (a === this.a && b === this.b) return true;
		if (a === this.b && b === this.a) return true;
		return false;
	}
});

Graph.Node = OE.Utils.defClass2({
	graph: undefined,
	neighbors: undefined,
	edges: undefined,
	
	constructor: function(graph) {
		this.graph = graph;
		this.edges = new Array();
		this.neighbors = new Array();
	},
	hasNeighbor: function(neighbor) {
		for (var i=0; i<this.neighbors.length; i++)
			if (this.neighbors[i] === neighbor)
				return true;
		return false;
	},
	removeNeighbor: function(neighbor) {
		var index = -1;
		for (var i=0; i<this.neighbors.length; i++) {
			if (this.neighbors[i] === neighbor) {
				index = i;
				break;
			}
		}
		if (index !== -1)
			this.neighbors.splice(index, 1);
		
		index = -1;
		for (var i=0; i<this.edges.length; i++) {
			var edge = this.edges[i];
			if (edge.isBetween(this, neighbor)) {
				index = i;
			}
		}
		
		if (index !== -1) {
			var edge = this.edges[index];
			this.edges.splice(index, 1);
			return edge;
		}
		return undefined;
	}
});
