vgp.physics = {
	// scratch objects
	_scratch: new vgp.Vec(),
	_normal: new vgp.Vec(),
	_impulse: new vgp.Vec(),
	_manifold: new vgp.Manifold(),
	_separateStr: 'separate',
	_testStr: 'test',
	
	resolve_what: function(b1, b2, depth, xn, yn, zn, restitute) {
		var v1x = b1.x - b1.px;
        var v1y = b1.y - b1.py;
        var v1z = b1.z - b1.pz;
        var v2x = b2.x - b2.px;
        var v2y = b2.y - b2.py;
        var v2z = b2.z - b2.pz;

        var mt = b1.inv_mass + b2.inv_mass;
        var f1 = b1.inv_mass/mt;
        var f2 = b2.inv_mass/mt;

        var off1 = depth*f1;
        var off2 = depth*f2;

        b1.x += xn*off1;
        b1.y += yn*off1;
        b1.z += zn*off1;
        b2.x -= xn*off2;
        b2.y -= yn*off2;
        b2.z -= zn*off2;
                    
        if(restitute){
            var vrx = v1x - v2x;
            var vry = v1y - v2y;
            var vrz = v1z - v2z;

            var vdotn = vrx*xn + vry*yn + vrz*zn;
            var modified_velocity = vdotn/mt;

            var j1 = -(1+b2.restitution)*modified_velocity*b1.inv_mass;
            var j2 = -(1+b1.restitution)*modified_velocity*b2.inv_mass;

            v1x += j1 * xn
            v1y += j1 * yn
            v1z += j1 * zn

            v2x -= j2 * xn
            v2y -= j2 * yn
            v2z -= j2 * zn
            
            b1.setVelocity(v1x, v1y, v1z);
            b2.setVelocity(v2x, v2y, v2z);
        }
	},
	
	resolve: function(a, b, m) {
		// Calculate relative velocity
		this._scratch.set(b.velocity.x - a.velocity.x, b.velocity.y - a.velocity.y, b.velocity.z - a.velocity.z);
		
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
		this._impulse.set(m.normal.x * j, m.normal.y * j, m.normal.z * j);
		
		a.velocity.x -= (a.invmass * this._impulse.x);
		a.velocity.y -= (a.invmass * this._impulse.y);
		a.velocity.z -= (a.invmass * this._impulse.z);
		
		b.velocity.x += (b.invmass * this._impulse.x);
		b.velocity.y += (b.invmass * this._impulse.y);
		b.velocity.z += (b.invmass * this._impulse.z);
	},
	
	test: function(a, b) {
		if (a.type === b.type) {
			return this[this._testStr+a.type+b.type](a, b);
		}
		else {
			throw new Error('Sorry, mixed collider types are not yet supported');
			if (a.type === vgp.Type.AABB3) {
				return this.testAABB3Sphere(a, b);
			}
			else {
				return this.testAABB3Sphere(b, a);
			}
		}
		console.error('[vgp.physics] Unknown collision type combination: '+a.type+' vs '+b.type);
	},
	
	separate: function(a, b) {
		if (a.type === b.type) {
			return this[this._separateStr+a.type+b.type](a, b);
		}
		else {
			throw new Error('Sorry, mixed collider types are not yet supported');
			if (a.type === vgp.Type.AABB3) {
				return this.separateAABB3Sphere(a, b);
			}
			else {
				return this.separateAABB3Sphere(b, a);
			}
		}
		console.error('[vgp.physics] Unknown collision type combination: '+a.type+' vs '+b.type);
	},
	
	/**
	 AABB3 = {
	 	position <vgp.Vec> - center position in global space
	 	velocity <vgp.Vec> - yes
	 	min <vgp.Vec> - position in global coordinates of top-left corner
	 	max <vgp.Vec> - position in global coordinates of bottom-right corner
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testAABB3AABB3: function(a, b) {
		if (a.max.x < b.min.x || a.min.x > b.max.x) return false;
		if (a.max.y < b.min.y || a.min.y > b.max.y) return false;
		if (a.max.z < b.min.z || a.min.z > b.max.z) return false;
		return true;
	},
	
	separateAABB3AABB3: function(a, b) {
		// Exit with no intersection if found separated along an axis
		if (a.max.x < b.min.x || a.min.x > b.max.x) return null;
		if (a.max.y < b.min.y || a.min.y > b.max.y) return null;
		if (a.max.z < b.min.z || a.min.z > b.max.z) return null;
		return null;
		// Vector from A to B
		this._normal.set(b.position.x - a.position.x, b.position.y - a.position.y, b.position.z - a.position.z);
		
		// Calculate half extents along x axis for each object
		var a_extent = (a.max.x - a.min.x) * 0.5;
		var b_extent = (b.max.x - b.min.x) * 0.5;
		var b_extent = (b.max.x - b.min.x) * 0.5;
		
		// Calculate overlap on x axis
		var x_overlap = a_extent + b_extent - Math.abs(this._normal.x);
		
		// SAT test on x axis
		if (x_overlap > 0) {
			a_extent = (a.max.y - a.min.y) * 0.5;
			b_extent = (b.max.y - b.min.y) * 0.5;
			
			// Calculate overlap on y axis
			var y_overlap = a_extent + b_extent - Math.abs(this._normal.y);
			
			// SAT test on y axis
			if (y_overlap > 0) {
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
			}
		}
		return null;
	},
	
	/**
	 Sphere = {
	 	position <vgp.Vec> - center position in global space
	 	velocity <vgp.Vec> - yes
	 	radius <number> - yup
	 	invmas <number> - 1 / mass
	 	restitution <number> - bounciness, 0 to 1
	 }
	 */
	
	testSphereSphere: function(a, b) {
		var dx = b.position.x - a.position.x;
		var dy = b.position.y - a.position.y;
		var dz = b.position.z - a.position.z;
		var dist = (dx * dx) + (dy * dy) + (dz * dz);
		var radii = a.radius + b.radius;
		if (dist < radii * radii) {
			return true;
		}
		return false;
	},
	
	separateSphereSphere: function(a, b) {
		var dx = b.position.x - a.position.x;
		var dy = b.position.y - a.position.y;
		var dz = b.position.z - a.position.z;
		var dist = (dx * dx) + (dy * dy) + (dz * dz);
		var radii = a.radius + b.radius;
		var rSqr = radii * radii;
		var cim, j, correctionX, correctionY;
		
		if (dist < rSqr) {
			dist = Math.sqrt(dist);
			
			if (dist === 0)  {
				dist = a.radius + b.radius - 1;
				dx = dy = dz = radii;
				
				this._manifold.penetration = a.radius;
				this._manifold.normal.set(1, 0, 0);
				
			} else {
				this._manifold.penetration = rSqr - dist;
				this._manifold.normal.set(dx, dy, dz).normalize();
			}
			
			j = (radii - dist) / dist;
			
			correctionX = dx * j;
			correctionY = dy * j;
			correctionZ = dy * j;
			
			cim = a.invmass + b.invmass;
			a.position.x -= correctionX * (a.invmass / cim);
			a.position.y -= correctionY * (a.invmass / cim);
			a.position.z -= correctionZ * (a.invmass / cim);
			
			b.position.x += correctionX * (b.invmass / cim);
			b.position.y += correctionY * (b.invmass / cim);
			b.position.z += correctionZ * (b.invmass / cim);
			
			return this._manifold;
		}
		
		return null;
	}
	
};
