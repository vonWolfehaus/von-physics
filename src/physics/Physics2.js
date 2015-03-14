vgp.physics = {
	// scratch objects
	_scratch: new vgp.Vec(),
	_scratch2: new vgp.Vec(),
	_normal: new vgp.Vec(),
	_impulse: new vgp.Vec(),
	_manifold: new vgp.Manifold(),
	_separateStr: 'separate',
	_testStr: 'test',
	
	elapsed: 0.01666,
	
	resolve: function(a, b, m) {
		// Calculate relative velocity
		this._scratch.set(b.velocity.x - a.velocity.x, b.velocity.y - a.velocity.y);
		
		// Calculate relative velocity in terms of the normal direction
		var velAlongNormal = this._scratch.dot(m.normal);
		
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
		this._impulse.set(m.normal.x * j, m.normal.y * j);
		
		a.velocity.x -= (a.invmass * this._impulse.x);
		a.velocity.y -= (a.invmass * this._impulse.y);
		
		b.velocity.x += (b.invmass * this._impulse.x);
		b.velocity.y += (b.invmass * this._impulse.y);
	},
	
	test: function(a, b) {
		if (a.type === b.type) {
			return this[this._testStr+a.type+b.type](a, b);
		}
		else {
			throw new Error('Sorry, mixed collider types are not supported');
			if (a.type === vgp.Type.AABB) {
				return this.testAABBCircle(a, b);
			}
			else {
				return this.testAABBCircle(b, a);
			}
		}
		console.error('[vgp.physics] Unknown collision type combination: '+a.type+' vs '+b.type);
	},
	
	separate: function(a, b) {
		if (a.type === b.type) {
			return this[this._separateStr+a.type+b.type](a, b);
		}
		else {
			throw new Error('Sorry, mixed collider types are not supported');
			if (a.type === vgp.Type.AABB) {
				return this.separateAABBCircle(a, b);
			}
			else {
				return this.separateAABBCircle(b, a);
			}
		}
		console.error('[vgp.physics] Unknown collision type combination: '+a.type+' vs '+b.type);
	},
	
	/**
	 AABB = {
	 	position <vgp.Vec> - center position in global space
	 	velocity <vgp.Vec> - yes
	 	min <vgp.Vec> - position in global coordinates of top-left corner
	 	max <vgp.Vec> - position in global coordinates of bottom-right corner
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testAABB2AABB2: function(a, b) {
		if (a.max.x < b.min.x || a.min.x > b.max.x) return false;
		if (a.max.y < b.min.y || a.min.y > b.max.y) return false;
		return true;
	},
	
	separateAABB2AABB2: function(a, b) {
		// Exit with no intersection if found separated along an axis
		if (a.max.x < b.min.x || a.min.x > b.max.x) return null;
		if (a.max.y < b.min.y || a.min.y > b.max.y) return null;
		
		// Vector from A to B
		this._normal.set(b.position.x - a.position.x, b.position.y - a.position.y);
		
		// Calculate half extents along x axis for each object
		var a_extent = (a.max.x - a.min.x) * 0.5;
		var b_extent = (b.max.x - b.min.x) * 0.5;
		
		// Calculate overlap on x axis
		var x_overlap = a_extent + b_extent - Math.abs(this._normal.x);
		
		a_extent = (a.max.y - a.min.y) * 0.5;
		b_extent = (b.max.y - b.min.y) * 0.5;
		
		// Calculate overlap on y axis
		var y_overlap = a_extent + b_extent - Math.abs(this._normal.y);
		
		// Find out which axis is axis of least penetration
		if (x_overlap < y_overlap) {
			// Point towards B knowing that dist points from A to B
			if (this._normal.x < 0) {
				this._manifold.normal.set(-1, 0);
			} else {
				this._manifold.normal.set(1, 0);
			}
			this._manifold.penetration = x_overlap;
		} else {
			// Point toward B knowing that dist points from A to B
			if (this._normal.y < 0) {
				this._manifold.normal.set(0, -1);
			} else {
				this._manifold.normal.set(0, 1);
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
	},
	
	/**
	 Circle = {
	 	position <vgp.Vec> - center position in global space
	 	velocity <vgp.Vec> - yes
	 	radius <number> - yup
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testCircleCircle: function(a, b) {
		var dx = b.position.x - a.position.x;
		var dy = b.position.y - a.position.y;
		var dist = (dx * dx) + (dy * dy);
		var radii = a.radius + b.radius;
		if (dist < radii * radii) {
			return true;
		}
		return false;
	},
	
	separateCircleCircle: function(a, b) {
		// relative position
		this._scratch.copy(b.position).sub(a.position);
		
		var radii = a.radius + b.radius;
		var rSqr = radii * radii;
		var dist = this._scratch.dot(this._scratch);
		
		if (dist < rSqr) {
			// already overlapping, so calculate penetration and move them back out
			dist = Math.sqrt(dist);
			
			if (dist === 0)  {
				dist = radii - 1;
				this._scratch.set(radii, radii, radii);
				
				this._manifold.penetration = a.radius;
				this._manifold.normal.set(1, 0, 0); // pick one, doesn't matter
				
			} else {
				this._manifold.penetration = radii - dist;
				this._manifold.normal.copy(this._scratch).normalize();
			}
			
			// separate
			var j = (radii - dist) / dist;
			var cim = a.invmass + b.invmass;
			
			this._scratch.multiplyScalar(j); // correction amount
			this._scratch2.copy(this._scratch); // copy for use with b
			// move a away
			this._scratch.multiplyScalar(a.invmass / cim);
			a.position.sub(this._scratch);
			// move b
			this._scratch2.multiplyScalar(b.invmass / cim);
			b.position.add(this._scratch2);
			
			return this._manifold;
		}
		
		if (!a.continuous && !b.continuous) {
			// don't make them continuous if you know they will only move slow enough (velocity.length < radius)
			return null;
		}
		
		// they went further than their radius this frame, so sweep to check if they hit between pos and pos+vel
		if (dist - rSqr < 0) {
			// console.log('no overlap');
			return null;
		}
		
		// relative velocity, taking into account delta time so it's scaled properly
		this._scratch2.copy(b.velocity).sub(a.velocity).multiplyScalar(this.elapsed);
		
		this._impulse.copy(a.velocity).multiplyScalar(this.elapsed);
		var sva = this._impulse.dot(this._impulse);
		this._impulse.copy(b.velocity).multiplyScalar(this.elapsed);
		
		if (sva + this._impulse.dot(this._impulse) + rSqr < dist) {
			// console.log('too far away');
			return null;
		}
		
		var vd = this._scratch2.dot(this._scratch2);
		var vs = this._scratch2.dot(this._scratch);
		if (vs >= 0) {
			// console.log('not moving towards each other');
			return null;
		}

		var d = (vs * vs) - (vd * (dist - rSqr));
		if (d < 0) {
			// console.log('no roots...');
			return null;
		}

		var t = (-vs - Math.sqrt(d)) / vd;
		
		// place them where the collision will happen
		this._scratch2.copy(a.velocity).multiplyScalar(this.elapsed).multiplyScalar(t);
		a.position.add(this._scratch2);
		
		this._scratch2.copy(b.velocity).multiplyScalar(this.elapsed).multiplyScalar(t);
		b.position.add(this._scratch2);
		
		this._manifold.penetration = 0;
		this._manifold.normal.copy(this._scratch).normalize();
		
		return this._manifold;
	}
	
};
