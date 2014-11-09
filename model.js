function VoxelSet() {
	if (!(this instanceof VoxelSet)) {
		throw new Error("VoxelSet constructor called as function");
	}

	this.voxels = [];
}

VoxelSet.prototype = {
	injectBlob: function(data) {
		for (var triple in data) {
			var
				coords = triple.split(","),
				color = data[triple],
				x = +coords[0],
				y = +coords[1],
				z = +coords[2],
				faces = parseInt(color.substr(0, 2), 16),
				r = parseInt(color.substr(3, 2), 16) / 255,
				g = parseInt(color.substr(5, 2), 16) / 255,
				b = parseInt(color.substr(7, 2), 16) / 255,
				voxel = [x - 20, y - 20, z, 0, 0, 0, r, g, b]; // for now
			
			// check data for six neighbors:
			var normal = chooseNormal(faces);
			voxel[3] = normal[0];
			voxel[4] = normal[1];
			voxel[5] = normal[2];

			this.voxels.push(voxel);
		}
		function chooseNormal(faces) {
			var
				nx = ((faces & 1) ? 0 : 1) + ((faces & 2) ? 0 : -1),
				ny = ((faces & 4) ? 0 : 1) + ((faces & 8) ? 0 : -1),
				nz = ((faces & 16) ? 0 : 1) + ((faces & 32) ? 0 : -1),
				mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

			if (mag == 0) return [1, 0, 0]; // temphack
			else return [nx / mag, ny / mag, nz / mag]
		}
	},
	sortVoxels: function(sortOrder) {
		var i;
		for (i = 0; i < this.voxels.length; i++) {
			var voxel = this.voxels[i];
			voxel.depth = voxel[0] * sortOrder[0] + voxel[1] * sortOrder[1] + voxel[2] * sortOrder[2];
		}

		this.voxels.sort(function(a, b) { return b.depth - a.depth; })
	},
	eachVoxel: function(cb) {
		var i;

		for (i = 0; i < this.voxels.length; i++) {
			var voxel = this.voxels[i];
			cb(voxel); // for now
		}
	}
}
