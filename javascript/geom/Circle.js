var von = von || {};
von.Circle = function() {
	von.AABB.call(this);
	this.x = _x;
	this.y = _y;
	
	this.radius = 50;
	
	
	// internal
	var _self = this;
	
	this.update = function() {
		// _self.velocity.y += von.gravity;
		
		// _self.velocity.x *= von.friction;
		// _self.velocity.y *= von.friction;
		
		_self.x += _self.velocity.x * von.elapsed;
		_self.y += _self.velocity.y * von.elapsed;
		
		if (_self.x < 0) {
			_self.x = 0;
			_self.velocity.x = -_self.velocity.x;
		} else if (_self.x+_self.radius > von.worldWidth) {
			_self.x = von.worldWidth-_self.radius;
			_self.velocity.x = -_self.velocity.x;
		}
		if (_self.y < 0) {
			_self.y = 0;
			_self.velocity.y = -_self.velocity.y;
		} else if (_self.y+_self.radius > von.worldHeight) {
			_self.y = von.worldHeight-_self.radius;
			_self.velocity.y = -_self.velocity.y;
		}
		
		_self.min.reset(_self.x, _self.y);
		_self.max.reset(_self.x+_self.width, _self.y+_self.radius);
	};
	
	this.render = function() {
		
	};
	
	// overwrite instance properties
	if (typeof _settings !== 'undefined') {
		for (var attr in _settings) {
			if (_self.hasOwnProperty(attr)) _self[attr] = _settings[attr];
		}
	}
};