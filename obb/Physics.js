var Phys = {
	// scratch objects
	_scratch: new Vec2(),
	_normal: new Vec2(),
	_impulse: new Vec2(),
	_minMax: {min:0, max:0},
	
	testOBBvsOBB: function(rect1, rect2) {
		var i, normal,
			points_1 = rect1.points,
			points_2 = rect2.points;

		for (i = 0; i < 4; i++) {
			normal = points_1[i].subtract(points_1[(i + 3) % 4]).getLeftNormal().normalize();
			if (rect2.isSAT(normal, points_1[i])) {
				return false;
			}
		}

		for (i = 0; i < 4; i++) {
			normal = points_2[i].subtract(points_2[(i + 3) % 4]).getLeftNormal().normalize();
			if (rect1.isSAT(normal, points_2[i])) {
				return false;
			}
		}

		return true;
	},
	
	getMinMaxProjection: function(rect, axis) {
		var points = rect.points,
			i, pj,
			min = Number.NEGATIVE_INFINITY,
			max = Number.POSITIVE_INFINITY;
		
		for (i = 0; i < points.length; i++) {
			pj = points[i].dotProduct(axis);
			if (min > pj) min = pj;
			if (max < pj) max = pj;
		}
		
		this._minMax.min = min;
		this._minMax.max = max;
		return this._minMax;
	}
};