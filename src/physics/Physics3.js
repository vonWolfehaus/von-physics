define(function(require) {

var Manifold = require('physics/Manifold');

return {
	// scratch objects
	_normal: new THREE.Vector3(),
	_scratch: new THREE.Vector3(),
	_manifold: new Manifold(),
	
	/**
	 AABB = {
	 	position <Vec3> - center position in global space
	 	velocity <Vec3> - yes
	 	min <Vec3> - position in global coordinates of top-left corner
	 	max <Vec3> - position in global coordinates of bottom-right corner
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testAABBvsAABB: function(a, b) {
		if (a.min.x > b.max.x) return false;
		if (a.min.y > b.max.y) return false;
		if (a.min.z > b.max.z) return false;
		if (a.max.x < b.min.x) return false;
		if (a.max.y < b.min.y) return false;
		if (a.max.z < b.min.z) return false;
		return true;
	},
	
	separateAABBvsAABB: function(a, b) {
		var mtvDistance = Number.MAX_VALUE;             // Set current minimum distance (max float value so next value is always less)
		this._scratch.set(0, 0, 0);                // Axis along which to travel with the minimum distance
		
		// [Axes of potential separation]
		// • Each shape must be projected on these axes to test for intersection:
		//          
		// (1, 0, 0)                    A0 (= B0) [X Axis]
		// (0, 1, 0)                    A1 (= B1) [Y Axis]
		// (0, 0, 1)                    A1 (= B2) [Z Axis]

		if (!this.testAxisStatic(Vector3.UnitX, a.min.x, a.max.x, b.min.x, b.max.x, this._scratch, mtvDistance)) {
			return null;
		}

		if (!this.testAxisStatic(Vector3.UnitY, a.min.y, a.max.y, b.min.y, b.max.y, this._scratch, mtvDistance)) {
			return null;
		}

		if (!this.testAxisStatic(Vector3.UnitZ, a.min.z, a.max.z, b.min.z, b.max.z, this._scratch, mtvDistance)) {
			return null;
		}

		this._manifold.isIntersecting = true;

		// Calculate Minimum Translation Vector (MTV) [normal * penetration]
		this._manifold.nEnter = this._scratch.normalize();

		// Multiply the penetration depth by itself plus a small increment
		// When the penetration is resolved using the MTV, it will no longer intersect
		this._manifold.penetration = Math.sqrt(mtvDistance) * 1.001;
		
		// then: AABB.Position += contact.normal * contact.penetration;
		
		// or, with mass:
		var ma = a.invmass;
		var mb = b.invmass;
		var m = ma + mb; // (1/Ma + 1/Mb)
		a.position += contact.nEnter * contact.penetration * (ma / m);
		b.position += -contact.nEnter * contact.penetration * (mb / m);
	},
	
	testAxisStatic: function(a, b) {
		float axisLengthSquared = Vector3.Dot(axis, axis);
		
		// If the axis is degenerate then ignore
		if (axisLengthSquared < 1.0e-8f)
		{
			return true;
		}

		// Calculate the two possible overlap ranges
		// Either we overlap on the left or the right sides
		var d0 = (maxB - minA);   // 'Left' side
		var d1 = (maxA - minB);   // 'Right' side

		// Intervals do not overlap, so no intersection
		if (d0 <= 0.0f || d1 <= 0.0f)
		{
			return false;
		}

		// Find out if we overlap on the 'right' or 'left' of the object.
		float overlap = (d0 < d1) ? d0 : -d1;

		// The mtd vector for that axis
		Vector3 sep = axis * (overlap / axisLengthSquared);

		// The mtd vector length squared
		float sepLengthSquared = Vector3.Dot(sep, sep);

		// If that vector is smaller than our computed Minimum Translation Distance use that vector as our current MTV distance
		if (sepLengthSquared < mtvDistance)
		{
			mtvDistance = sepLengthSquared;
			mtvAxis = sep;
		}

		return true;
	}
	
};

});
