define(function(require) {

var Manifold = require('physics/Manifold');

return {
	// scratch objects
	_scratch: new Vec2(),
	_normal: new Vec2(),
	_impulse: new Vec2(),
	_manifold: new Manifold(),
	
	
	resolve: function(a, b, m) {
		// Calculate relative velocity
		this._scratch.reset(b.velocity.x - a.velocity.x, b.velocity.y - a.velocity.y);
		
		// Calculate relative velocity in terms of the normal direction
		var velAlongNormal = this._scratch.dotProduct(m.normal);
		
		// Do not resolve if velocities are separating
		if (velAlongNormal > 0) {
			return;
		}
		
		// Calculate restitution
		var e = Math.min(a.restitution, b.restitution);
		
		// Calculate impulse scalar
		var j = -(1 + e) * velAlongNormal;
		j /= a.invmass + b.invmass;
		
		// Apply impulse
		this._impulse.reset(m.normal.x * j, m.normal.y * j);
		
		a.velocity.x -= (a.invmass * this._impulse.x);
		a.velocity.y -= (a.invmass * this._impulse.y);
		
		b.velocity.x += (b.invmass * this._impulse.x);
		b.velocity.y += (b.invmass * this._impulse.y);
	},
	
	/**
	 AABB = {
	 	position <Vec2> - center position in global space
	 	velocity <Vec2> - yes
	 	min <Vec2> - position in global coordinates of top-left corner
	 	max <Vec2> - position in global coordinates of bottom-right corner
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testAABBvsAABB: function(a, b) {
		if (a.min.x > b.max.x) return false;
		if (a.min.y > b.max.y) return false;
		if (a.max.x < b.min.x) return false;
		if (a.max.y < b.min.y) return false;
		return true;
	},
	
	separateAABBvsAABB: function(a, b) {
		// Exit with no intersection if found separated along an axis
		if (a.max.x < b.min.x || a.min.x > b.max.x) return null;
		if (a.max.y < b.min.y || a.min.y > b.max.y) return null;
		
		// Vector from A to B
		this._normal.reset(b.position.x - a.position.x, b.position.y - a.position.y);
		
		// Calculate half extents along x axis for each object
		var a_extent = (a.max.x - a.min.x) / 2;
		var b_extent = (b.max.x - b.min.x) / 2;
		
		// Calculate overlap on x axis
		var x_overlap = a_extent + b_extent - Math.abs(this._normal.x);
		
		// SAT test on x axis
		if (x_overlap > 0) {
			a_extent = (a.max.y - a.min.y) / 2;
			b_extent = (b.max.y - b.min.y) / 2;
			
			// Calculate overlap on y axis
			var y_overlap = a_extent + b_extent - Math.abs(this._normal.y);
			
			// SAT test on y axis
			if (y_overlap > 0) {
				// Find out which axis is axis of least penetration
				if (x_overlap < y_overlap) {
					// Point towards B knowing that dist points from A to B
					if (this._normal.x < 0) {
						this._manifold.normal.reset(-1, 0);
					} else {
						this._manifold.normal.reset(1, 0);
					}
					this._manifold.penetration = x_overlap;
				} else {
					// Point toward B knowing that dist points from A to B
					if (this._normal.y < 0) {
						this._manifold.normal.reset(0, -1);
					} else {
						this._manifold.normal.reset(0, 1);
					}
					this._manifold.penetration = y_overlap;
				}
				
				var correctionX = this._manifold.penetration * this._manifold.normal.x;
				var correctionY = this._manifold.penetration * this._manifold.normal.y;
				var cim = a.invmass + b.invmass;
				a.position.x -= correctionX * (a.invmass / cim);
				a.position.y -= correctionY * (a.invmass / cim);
				
				b.position.x += correctionX * (b.invmass / cim);
				b.position.y += correctionY * (b.invmass / cim);
				
				return this._manifold;
			}
		}
		return null;
	},
	
	/**
	 Circle = {
	 	position <Vec2> - center position in global space
	 	velocity <Vec2> - yes
	 	radius <number> - yup
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testCircleVsCircle: function(a, b) {
		var dx = b.position.x - a.position.x;
		var dy = b.position.y - a.position.y;
		var dist = (dx * dx) + (dy * dy);
		var radii = a.radius + b.radius;
		if (dist < radii * radii) {
			return true;
		}
		return false;
	},
	
	separateCircleVsCircle: function(a, b) {
		var dx = b.position.x - a.position.x;
		var dy = b.position.y - a.position.y;
		var dist = (dx * dx) + (dy * dy);
		var radii = a.radius + b.radius;
		var rSqr = radii * radii;
		var cim, j, correctionX, correctionY;
		
		if (dist < rSqr) {
			dist = Math.sqrt(dx * dx + dy * dy);
			
			if (dist === 0)  {
				dist = a.radius + b.radius - 1;
				dx = dy = radii;
				
				this._manifold.penetration = a.radius;
				this._manifold.normal.reset(1, 0);
				
			} else {
				this._manifold.penetration = rSqr - dist;
				this._manifold.normal.reset(dx, dy).normalize();
			}
			
			j = (radii - dist) / dist;
			
			correctionX = dx * j;
			correctionY = dy * j;
			
			cim = a.invmass + b.invmass;
			a.position.x -= correctionX * (a.invmass / cim);
			a.position.y -= correctionY * (a.invmass / cim);
			
			b.position.x += correctionX * (b.invmass / cim);
			b.position.y += correctionY * (b.invmass / cim);
			
			return this._manifold;
		}
		
		return null;
	}
	
};

});
