(function () {
var res = {};

// http://gamedev.stackexchange.com/questions/32807/collision-resolve-sphere-aabb-and-aabb-aabb
res.AABB3vsAABB3 = function(Shape s1, Shape s2, ref Contact contact) {
	AABB a = s1 as AABB;
	AABB b = s2 as AABB;

	// [Minimum Translation Vector]
	float mtvDistance = float.MaxValue;             // Set current minimum distance (max float value so next value is always less)
	Vector3 mtvAxis = new Vector3();                // Axis along which to travel with the minimum distance

	// [Axes of potential separation]
	// • Each shape must be projected on these axes to test for intersection:
	//          
	// (1, 0, 0)                    A0 (= B0) [X Axis]
	// (0, 1, 0)                    A1 (= B1) [Y Axis]
	// (0, 0, 1)                    A1 (= B2) [Z Axis]

	// [X Axis]
	if (!TestAxisStatic(Vector3.UnitX, a.MinPoint.X, a.MaxPoint.X, b.MinPoint.X, b.MaxPoint.X, ref mtvAxis, ref mtvDistance))
	{
		return false;
	}

	// [Y Axis]
	if (!TestAxisStatic(Vector3.UnitY, a.MinPoint.Y, a.MaxPoint.Y, b.MinPoint.Y, b.MaxPoint.Y, ref mtvAxis, ref mtvDistance))
	{
		return false;
	}

	// [Z Axis]
	if (!TestAxisStatic(Vector3.UnitZ, a.MinPoint.Z, a.MaxPoint.Z, b.MinPoint.Z, b.MaxPoint.Z, ref mtvAxis, ref mtvDistance))
	{
		return false;
	}

	contact.isIntersecting = true;

	// Calculate Minimum Translation Vector (MTV) [normal * penetration]
	contact.nEnter = Vector3.Normalize(mtvAxis);

	// Multiply the penetration depth by itself plus a small increment
	// When the penetration is resolved using the MTV, it will no longer intersect
	contact.penetration = (float)Math.Sqrt(mtvDistance) * 1.001f;
	
	// then: AABB.Position += contact.normal * contact.penetration;
	
	// or, with mass:
	/*float ma = a.InverseMass;
	float mb = b.InverseMass;
	float m = ma + mb; // (1/Ma + 1/Mb)
	a.Position += contact.nEnter * contact.penetration * (ma / m);
	b.Position += -contact.nEnter * contact.penetration * (mb / m);*/
	return true;
};

private static bool TestAxisStatic(Vector3 axis, float minA, float maxA, float minB, float maxB, ref Vector3 mtvAxis, ref float mtvDistance)
{
	// [Separating Axis Theorem]
	// • Two convex shapes only overlap if they overlap on all axes of separation
	// • In order to create accurate responses we need to find the collision vector (Minimum Translation Vector)   
	// • Find if the two boxes intersect along a single axis 
	// • Compute the intersection interval for that axis
	// • Keep the smallest intersection/penetration value
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
};

window.Resolve = res;

}());