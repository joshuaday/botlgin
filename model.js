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
				r = parseInt(color.substr(2, 2), 16) / 255,
				g = parseInt(color.substr(4, 2), 16) / 255,
				b = parseInt(color.substr(6, 2), 16) / 255,
				voxel = [+coords[0], +coords[1], +coords[2], 0, 0, 0, r, g, b]; // for now
			
			// check data for six neighbors:
			if (hasSixNeighbors(voxel[0], voxel[1], voxel[2])) continue;
			var normal = chooseNormal(voxel[0], voxel[1], voxel[2]);
			voxel[3] = normal[0]; 
			voxel[4] = normal[1]; 
			voxel[5] = normal[2]; 

			this.voxels.push(voxel);
		}

		function hasSixNeighbors(x, y, z) {
			return data[(x - 1) + "," + (y) + "," + (z)] && data[(x + 1) + "," + (y) + "," + (z)]
				&& data[(x) + "," + (y - 1) + "," + (z)] && data[(x) + "," + (y + 1) + "," + (z)]
				&& data[(x) + "," + (y) + "," + (z - 1)] //&& data[(x) + "," + (y) + "," + (z + 1)];
		}

		function chooseNormal(x, y, z) {
			var
				nx = (data[(x - 1) + "," + (y) + "," + (z)] ? 0 : -1) + (data[(x + 1) + "," + (y) + "," + (z)] ? 0 : 1),
				ny = (data[(x) + "," + (y - 1) + "," + (z)] ? 0 : -1) + (data[(x) + "," + (y + 1) + "," + (z)] ? 0 : 1),
				nz = (data[(x) + "," + (y) + "," + (z - 1)] ? 0 : -1) + (data[(x) + "," + (y) + "," + (z + 1)] ? 0 : 1),
				mag = Math.sqrt(nx * nx + ny * ny + nz * nz);

			if (mag == 0) return [0, 0, 0];
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
