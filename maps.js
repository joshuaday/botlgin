// rectangular space

// some tiles
var protos = [
	{name: "floor", walk: true, color: "#ffffff"},
	{name: "statue", enter: false, color: "#888888"},
	{name: "block", enter: false, corner: false, color: "#444444"},
	{name: "water", swim: true, color: "#11aaff"},
	{name: "lava", color: "#ffaa00"}
];

// (cursor)
var cursor_proto = {
	toString: function () {
		return this.x + "," + this.y;
	},
	neighbors: function () {

	}
}

var compass = [
	{name: "north", vikey: "k", dx: 0, dy: -1, cardinal: true, diagonal: false, idx: 0},
	{name: "northeast", vikey: "u", dx: 1, dy: -1, cardinal: false, diagonal: true, idx: 1},
	{name: "east", vikey: "l", dx: 1, dy: 0, cardinal: true, diagonal: false, idx: 2},
	{name: "southeast", vikey: "n", dx: 1, dy: 1, cardinal: false, diagonal: true, idx: 3},
	{name: "south", vikey: "j", dx: 0, dy: 1, cardinal: true, diagonal: false, idx: 4},
	{name: "southwest", vikey: "b", dx: -1, dy: 1, cardinal: false, diagonal: true, idx: 5},
	{name: "west", vikey: "h", dx: -1, dy: 0, cardinal: true, diagonal: false, idx: 6},
	{name: "northwest", vikey: "y", dx: -1, dy: -1, cardinal: false, diagonal: true, idx: 7}
];


function rectangular(w, h) {
	var neighbors = {}, tiles = {}, unindex = {};

	function index(x, y) {
		return x + "," + y;
	}

	function construct_neighbors(x, y, w, h) {
		var n = [];
		for (var i = 0; i < compass.length; i++) {
			var nx = x + compass[i].dx, ny = y + compass[i].dy;
			if (nx >= 0 && ny >= 0 && nx < w && ny < h) {
				//if (compass[i].cardinal) {}
				n.push(index(nx, ny));
			}
		}

		return n;
	}

	function each_neighbor(idx, prior_time, fn) {
		var n = neighbors[idx], own_cost = 1 + tiles[idx].length; // temporary cost
		for (var i=0; i < n.length; i++) {
			if (own_cost > 1) continue; // skip unreachable [temp]
			fn(n[i], prior_time + own_cost, idx);
		}
	}

	function chebyshev(idx1, idx2) {
		var p1 = unindex[idx1], p2 = unindex[idx2], dx = p2.x - p1.x, dy = p2.y - p1.y;
		if (dx < 0) dx = -dx;
		if (dy < 0) dy = -dy;
		return dx < dy ? dx : dy;
	}

	function manhattan(idx1, idx2) {
		var p1 = unindex[idx1], p2 = unindex[idx2], dx = p2.x - p1.x, dy = p2.y - p1.y;
		if (dx < 0) dx = -dx;
		if (dy < 0) dy = -dy;
		return dx + dy;
	}

	function eachCell(cb) {
		var x, y;
		for (x = 0; x < w; x++) {
			for (y = 0; y < h; y++) {
				var idx = index(x, y);
				cb(idx, x, y);
			}
		}
	}

	function indexIfValid(x, y) {
		var idx = index(x, y);
		return tiles[idx] ? idx : null;
	}

	function spawn(entity, idx) {
		for (var i=0; i < protos.length; i++) {
			if (entity == protos[i].name) {
				add(protos[i]);
				break;
			}
		}

		function add(tile) {
			tiles[idx].push(tile);
		}
	}

	for (var y = 0; y < h; y++) {
		for (var x = 0; x < w; x++) {
			var idx = index(x, y);
			tiles[idx] = [];
			neighbors[idx] = construct_neighbors(x, y, w, h);
			unindex[idx] = {x: x, y: y};
		}
	}

	return {
		each_neighbor: each_neighbor,
		eachCell: eachCell,
		heuristic: chebyshev, //manhattan, // chebyshev,
		index: indexIfValid,
		unindex: unindex,
		tiles: tiles,
		spawn: spawn
	}
}

// within each pathing state, we keep track of [potentially] multiple sources; the model is from-few-to-many (edges are
// trivially reversed in most situations.)
//
// in general, a heuristic and a goal-tester will be used and supplied separately, although it will be interesting
// to consider what can be done by supplying both at once.

function pather(config) {
	var
		actual = {}, from = {}, map = config.map, source_idx = config.source;

	function reach(dest_idx) {
		var best_so_far = {}, frontier = new BinaryHeap()

		if (actual[dest_idx]) {
			// note however that we can add a mode that stops once all tying routes have been found so we can enumerate them
			return actual[dest_idx];
		}
		
		touch(source_idx, 0, null);

		var state;
		while (state = frontier.pop()) {
			// 1. do we want to look explicitly at edges instead of neighbors here?
			// 2. do we need to express movement or neighbor enumeration in some way independent of the map?
			var cost = best_so_far[state];
			actual[state] = cost;

			if (state == dest_idx) {
				return cost;
			} else {
				map.each_neighbor(state, cost, touch);
			}
		}

		function touch(state, cost, source) {
			if (actual[state]) return;
			
			var estimate = map.heuristic(state, dest_idx) + cost, best = best_so_far[state];
			if (typeof best === "number") {
				if (best > cost) {
					// sort of experimental -- won't come up at first anyway
					//frontier.rescore(state, estimate, best);
					frontier.remove(state); // unnecessary really
					frontier.push(state, estimate);
					best_so_far[state] = cost;
					from[state] = source;
				}
			} else {
				frontier.push(state, estimate);
				best_so_far[state] = cost;
				from[state] = source;
			}
		}
	}

	function eachCellInPath(dest_idx, cb) {
		reach(dest_idx);

		var idx = dest_idx, path;

		while (idx) {
			var coord = map.unindex[idx];
			cb(idx, coord.x, coord.y);
			idx = from[idx];
		}
	}

	return {
		reach: reach, // eh not right
		eachCellInPath: eachCellInPath
	}
}
