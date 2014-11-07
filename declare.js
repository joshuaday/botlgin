
function declare(typename, fn) {
	if (!typename) throw new Error("declare: no typename specified");
	if (!fn) throw new Error("declare: no prototype supplied");
	function cons() {
		if (!(this instanceof cons)) {
			throw new Error(typename + " constructor called as function");
		}
		if (fn.init) fn.init.apply(this, arguments);
	}

	function namespace(path, value) {
		var segments = path.split('.'), node = window, child, i;
		for (i = 0; i < segments.length - 1; i++) {
			child = node[segments[i]];
			if (!child) {
				child = { };
				node[segments[i]] = child;
			}
			node = child;
		}
		node[segments[segments.length - 1]] = value;
	}

	cons.prototype = fn;

	namespace(typename, cons);
}

// don't need this particularly:
(function () {
	var store = { }, ccs = { }, locks = { };
	window.reg = {
		get: function () {
		},
		cc: function (key, dest, destKey) {
		},
		set: function (key, val) {
			if (locks[key]) throw new Error("cyclical dependency detected in reg");
			locks[key] = true;
			var old = store[key];
			store[key] = val;
			if (ccs[key]) {
				var event = {
					key: key,
					value: val,
					old: old
				}
				for (var i = 0; i < ccs[key].length; i++) {
					ccs[key][i]
				}
			}
			locks[key] = false;
		}
	}
})

