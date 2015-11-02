
var NavMesh = OE.Utils.defClass2({
	map: undefined,
	graph: undefined,
	
	constructor: function(map) {
		this.map = map;
		this.graph = new Graph();
	},
	
	isOnMap: function(x, y) {
		return x >= 0 && x < this.map.sizeX && y >= 0 && y < this.map.sizeY;
	},
	
	addNode: function(x, y) {
		var node = this.graph.addNode(this.map.sizeX*y+x, {
			map_x: x,
			map_y: y,
			pathData: {
				prev: undefined,
				next: undefined,
				dist: undefined,
				node: undefined
			}
		});
		node.userData.pathData.node = node;
		return node;
	},
	addEdge: function(x1, y1, x2, y2) {
		var w = this.map.sizeX;
		var nodes = this.graph.nodes.data;
		n1 = nodes[w*y1+x1];
		n2 = nodes[w*y2+x2];
		if (n1 !== undefined && n2 !== undefined && !n1.hasNeighbor(n2)) {
			var dx = x2-x1;
			var dy = y2-y1;
			if (dx !== 0 && dy !== 0) {
				if (nodes[w*y2+x1] !== undefined &&
					nodes[w*y1+x2] !== undefined)
					this.graph.addEdge(n1.id, n2.id);
			}
			else this.graph.addEdge(n1.id, n2.id);
		}
	},
	
	build: function() {
		var map = this.map;
		this.graph.clear();
		
		var x, y, i, node,
			x1, y1, i1, n1,
			x2, y2, i2, n2;
		
		for (y = 0; y < map.sizeY; y++) {
			for (x = 0; x < map.sizeX; x++) {
				this.addNode(x, y);
			}
		}
		
		var edges = [0,0, 0,1, 1,0, 0,0, 1,1];
		
		for (y = 0; y < map.sizeY; y++) {
			for (x = 0; x < map.sizeX; x++) {
				i = map.sizeX * y + x;
				node = this.graph.nodes.data[i];
				
				for (var j=0; j<edges.length-2; j+=2) {
					x1 = x + edges[j];
					y1 = y + edges[j+1];
					x2 = x + edges[j+2];
					y2 = y + edges[j+3];
					if (this.isOnMap(x1, y1) && this.isOnMap(x2, y2)) {
						i1 = map.sizeX*y1+x1;
						i2 = map.sizeX*y2+x2;
						n1 = this.graph.nodes.data[i1];
						n2 = this.graph.nodes.data[i2];
						if (n1 !== undefined && n2 !== undefined) {
							this.graph.addEdge(i1, i2);
						}
					}
				}
			}
		}
	},
	removeClippedCorners: function(x, y) {
		var w = this.map.sizeX;
		var x1, y1, n1, x2, y2, n2;
		var corners = [-1, 0, 0, 1, 1, 0, 0, -1];
		for (var i = 0; i < corners.length; i+=2) {
			x1 = x + corners[i];
			y1 = y + corners[i+1];
			x2 = x + corners[(i+2)%corners.length];
			y2 = y + corners[(i+3)%corners.length];
			if (this.isOnMap(x1, y1) && this.isOnMap(x2, y2)) {
				n1 = this.graph.nodes.data[w*y1+x1];
				n2 = this.graph.nodes.data[w*y2+x2];
				if (n1 !== undefined && n1.hasNeighbor(n2))
					this.graph.removeEdge(n1.id, n2.id);
			}
		}
	},
	notifyBlocked: function(x, y) {
		var w = this.map.sizeX;
		var i = w*y+x;
		var node = this.graph.nodes.data[i];
		
		if (node === undefined)
			return undefined;
		
		var offx, offy, x1, y1, n1, x2, y2, n2;
		
		for (offy = -1; offy <= 1; offy++) {
			for (offx = -1; offx <= 1; offx++) {
				if (offx !== 0 || offy !== 0) {
					x2 = x+offx;
					y2 = y+offy;
					if (this.isOnMap(x2, y2)) {
						n2 = this.graph.nodes.data[w*y2+x2];
						if (n2 !== undefined && node.hasNeighbor(n2)) {
							this.graph.removeEdge(node.id, n2.id);
						}
					}
				}
			}
		}
		
		this.removeClippedCorners(x, y);
		
		this.graph.removeNode(node.id);
	},
	notifyCleared: function(x, y) {
		var w = this.map.sizeX;
		var node = this.graph.nodes.data[w*y+x];
		
		if (node !== undefined)
			return;
		
		node = this.addNode(x, y);
		
		var offx, offy, x1, y1, n1, x2, y2, n2;
		
		for (offy = -1; offy <= 1; offy++) {
			for (offx = -1; offx <= 1; offx++) {
				if (offx !== 0 || offy !== 0) {
					x2 = x+offx;
					y2 = y+offy;
					if (this.isOnMap(x2, y2)) {
						this.addEdge(x, y, x2, y2);
					}
				}
			}
		}
		
		var corners = [-1, 0, 0, 1, 1, 0, 0, -1];
		for (var j = 0; j < corners.length; j+=2) {
			x1 = x + corners[j];
			y1 = y + corners[j+1];
			x2 = x + corners[(j+2)%corners.length];
			y2 = y + corners[(j+3)%corners.length];
			if (this.isOnMap(x1, y1) && this.isOnMap(x2, y2)) {
				this.addEdge(x1, y1, x2, y2);
			}
		}
	},
	
	dijkstra: function(x1, y1, x2, y2) {
		var w = this.map.sizeX;
		var nodes = this.graph.nodes.data;
		
		var startKey = w * y1 + x1;
		var finishKey = w * y2 + x2;
		var start = nodes[startKey];
		var finish = nodes[finishKey];
		
		var Q = [];
		for (var id in nodes) {
			var node = nodes[id].userData.pathData;
			node.prev = undefined;
			node.next = undefined;
			node.dist = undefined;
			Q.push(node);
		}
		if (start === undefined || finish === undefined)
			return undefined;
		
		finish.userData.pathData.dist = 0.0;
		
		while (Q.length > 0) {
			var best = undefined;
			for (var i=0; i<Q.length; i++) {
				if (best === undefined)
					best = i;
				else if (Q[i].dist !== undefined) {
					if (Q[best].dist !== undefined) {
						if (Q[i].dist < Q[best].dist)
							best = i;
					}
					else best = i;
				}
			}
			var u = Q[best];
			Q.splice(best, 1);
			
			if (u.dist === undefined)
				break;
			
			for (var i=0; i<u.node.neighbors.length; i++) {
				var vn = u.node.neighbors[i];
				var v = undefined;
				for (var j=0; j<Q.length; j++) {
					if (vn == Q[j].node) {
						v = Q[j];
						break;
					}
				}
				if (v !== undefined) {
					var dx = v.node.userData.map_x - u.node.userData.map_x;
					var dy = v.node.userData.map_y - u.node.userData.map_y;
					var d = dx*dx + dy*dy;
					var alt = u.dist + d;
					if (v.dist === undefined || alt < v.dist) {
						v.dist = alt;
						v.prev = u;
					}
				}
			}
		}
		
		for (var id in nodes) {
			var n = nodes[id].userData.pathData;
			//if (n.prev !== undefined)
				n.next = n.prev;
		}
		
		var path = new Array();
		var n = start.userData.pathData;
		
		if (n.prev === undefined)
			return undefined;
		
		while (n !== undefined) {
			path.push(n);
			n = n.prev;
		}
	//	path.reverse();
		return path;
	},
	aStar: function(x1, y1, x2, y2) {
		
	}
});
