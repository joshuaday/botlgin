(function ($) {
	var host, canvas, context;
	var cellSize = 2, stepSize = 3, halfCell = (.5 * cellSize), map;
	var heldButton = 0, lastX = 0, lastY = 0;
	function up(e) {
		e.preventDefault();
		e.which = e.which || 1;
		heldButton = 0; // heldButton & ~(1 << (e.which - 1));
	}

	function wheel(e) {
		e.preventDefault();
		console.log(e.delta);
		findTarget(e);
	}

	function down(e) {
		e.preventDefault();
		e.which = e.which || 1;
		heldButton = e.which; // heldButton | (1 << (e.which - 1));
		move(e);
	}

	function keyup(e) {
		//e.preventDefault();
	}

	function keydown(e) {
		//e.preventDefault();
		var ch = String.fromCharCode(e.which);

		if (ch == "!") { // pgup
			test.pushUndo("resize");
			test.resize(test.width + 4, test.height + 4);
		}

		if (ch == "\"") { // pgdn
			test.pushUndo("resize");
			test.resize(test.width - 4, test.height - 4);
		}

		if (e.ctrlKey && ch == "Z") {
			test.popUndo();
		}

		if (ch == " ") {
			test.pushUndo();
		}
	}

	function cancel(e) {
		e.preventDefault();
	}

	function savechanges(e) {
		
	}

	function prepare() {
		scene = zombie;
		// scene.sortVoxels([.5, .5, 1]);
		scene.sortVoxels([-1, 1, 0]);

		console.log(scene.voxels.length);
	}

	var oldx, oldy;
	function move(e) {
		e.preventDefault();
		var x = e.offsetX;
		var y = e.offsetY;
	}

	// hidden = document.createElement(canvas); 
	// hidden.width = 64
	// hidden.height = 64
	// context.drawImage(hidden, x, y)

	function animate() {
		requestAnimationFrame(animationFrame);
	}

	var oldTimestamp = 0, left = 0, direction = 1;
	function animationFrame(timestamp) {
		requestAnimationFrame(animationFrame);

		context.fillStyle = "#000000";
		context.fillRect(0, 0, canvas.width, canvas.height);

		var cos = Math.cos(left * Math.PI), sin = Math.sin(left * Math.PI), shiftdown = 60, camdistance = 130;
		var camera = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0
		];

		var model = [
			cos, sin, 0, 0,
			0, 0, -1, shiftdown,
			-sin, cos, 0, camdistance
		];

		var flicker = .4 * Math.random() * Math.random();
		var lights = [
			//[0, -1, 0,  .1, .3, .1], // beneath
			[0, 1, 0, .15, .15, .4], // above
			//[1, 0, 0, 1, 1, 1], // left
			//[-1, 0, 0, 1, 1, 1], // right

			[0, 0, 1, .2, .2, .2], // front
			[-.7, 0, .7, .6 + flicker, .6 + flicker, .4] // front-right

		];

		context.fillStyle = "#ffffff";

		scene.eachVoxel(drawCell);

		//model[11] += 40;
		//model[3] -= 60;		
		//scene.eachVoxel(drawCell);


		 left += .0001 * (timestamp - oldTimestamp) * direction;
		//left += .01 * direction;
		console.log(timestamp - oldTimestamp);
		oldTimestamp = timestamp;
		if (left > .5) { left = .5 ; direction = -direction; }
		if (left < 0) { left = 0; direction = -direction;}

		function drawCell(voxel) {
			var 
				mx = voxel[0], my = voxel[1], mz = voxel[2], // model location
				mnx = voxel[3], mny = voxel[4], mnz = voxel[5], // model space normal
				dr = voxel[6], dg = voxel[7], db = voxel[8]; // diffuse

			var
				wx = model[0] * mx + model[1] * my + model[2] * mz + model[3],
				wy = model[4] * mx + model[5] * my + model[6] * mz + model[7],
				wz = model[8] * mx + model[9] * my + model[10] * mz + model[11];


			var
				nx = model[0] * mnx + model[1] * mny + model[2] * mnz,
				ny = model[4] * mnx + model[5] * mny + model[6] * mnz,
				nz = model[8] * mnx + model[9] * mny + model[10] * mnz;

			var
				sx = camera[0] * wx + camera[1] * wy + camera[2] * wz,
				sy = camera[4] * wx + camera[5] * wy + camera[6] * wz,
				sz = camera[8] * wx + camera[9] * wy + camera[10] * wz;


			var r = 0, g = 0, b = 0, i, light, dot;

			for (i = 0; i < lights.length; i++) {
				light = lights[i];
				dot = -(light[0] * nx + light[1] * ny + light[2] * nz);
				if (dot > 0) {
					r += dr * dot * light[3];
					g += dg * dot * light[4];
					b += db * dot * light[5];
				}
			}


				r =  ~~(255 * r);
				g =  ~~(255 * g);
				b =  ~~(255 * b);
			// isometric:
			//var midx = stepSize * (x - y) + 250, midy = stepSize * (.5 * (y + x) - z) + 250;
			//var boxSize = cellSize * 2;

// linear projection:
			var w = 450 / sz;
			var midx =200 + (w * sx), midy = 250 + (w * sy);
			var boxSize = cellSize * w;

			context.fillStyle = "rgb(" + r + "," + g + "," + b + ")";
			context.fillRect(midx - halfCell, midy - halfCell, boxSize, boxSize);

			//context.fillRect(~~midx - halfCell, ~~midy - halfCell, cellSize, cellSize);
			//context.clearRect(~~midx, ~~midy, 1, 1);
		}
	}

	function resize() {
		canvas.width = host.width() * window.devicePixelRatio;
		canvas.height = host.height() * window.devicePixelRatio;
	}

	function init() {
		host = $("#host");

		canvas = document.createElement("CANVAS");
		canvas.style.position = "absolute";
		resize();

		context = canvas.getContext('2d');
		context.globalCompositeOperator = 'copy';

		host.append(canvas);

		$.fn.wheel = function (callback) {
		    return this.each(function () {
		        $(this).on('mousewheel DOMMouseScroll', function (e) {
		            e.delta = null;
		            if (e.originalEvent) {
		                if (e.originalEvent.wheelDelta) e.delta = e.originalEvent.wheelDelta / -40;
		                if (e.originalEvent.deltaY) e.delta = e.originalEvent.deltaY;
		                if (e.originalEvent.detail) e.delta = e.originalEvent.detail;
		            }

		            if (typeof callback == 'function') {
		                callback.call(this, e);
		            }
		        });
		    });
		};

		prepare();

		host.on("mousemove", move);
		host.on("mousedown", down);
		host.on("mouseup", up);
		$(document).on("keydown", keydown);
		$(document).on("keyup", keyup);
		$(window).on("unload", savechanges);
		host.wheel(wheel);

		host.on("contextmenu", cancel);

		$(window).on("resize", resize);

		animate();
	}

	$(init);
})(jQuery);

