var von = von || {};
von.Cube = function(_x, _y, _z) {
	
	this.position = new THREE.Vector3(_x, _y, _z);
	this.velocity = new THREE.Vector3();
	
	this.hull = new AABB3({
		width: 50,
		height: 50,
		depth: 50,
		mass: 100,
		restitution: 0
	});
	
	// internal
	var _self = this;
	
	// TODO: convert to vectors
	this.update = function() {
		var p = _self.position;
		
		// _self.velocity.x *= von.friction;
		// _self.velocity.y *= von.friction;
		// _self.velocity.z += von.gravity;
		
		p.x += _self.velocity.x * von.elapsed;
		p.y += _self.velocity.y * von.elapsed;
		
		if (p.x < 0) {
			p.x = 0;
			_self.velocity.x = -_self.velocity.x * _self.hull.restitution;
		} else if (_self.hull.max.x > von.worldWidth) {
			p.x = von.worldWidth-_self.hull.width;
			_self.velocity.x = -_self.velocity.x * _self.hull.restitution;
		}
		if (p.y < 0) {
			p.y = 0;
			_self.velocity.y = -_self.velocity.y * _self.hull.restitution;
		} else if (_self.hull.max.y > von.worldHeight) {
			p.y = von.worldHeight-_self.hull.height;
			_self.velocity.y = -_self.velocity.y * _self.hull.restitution;
		}
		if (p.z < 0) {
			p.z = 0;
			_self.velocity.z = -_self.velocity.z * _self.hull.restitution;
		} else if (_self.hull.max.z > von.worldHeight) {
			p.z = von.worldHeight-_self.hull.depth;
			_self.velocity.z = -_self.velocity.z * _self.hull.restitution;
		}
		
		_self.hull.update(p);
	};
	
	this.render = function() {
		// ? 3js does this... somewhere
	};
	
	this.type = 'cube';
	this.hull.update(_self.position);
};