var von = von || {};
von.Circle = function(_x, _y, _settings) {
	von.AABB.call(this);
	
	this.x = _x;
	this.y = _y;
	
	this.radius = 30;
	
	
	// internal
	var _self = this,
		_pi = Math.PI, _tau = _pi*2, _rad = 0.0174532925199;
	
	this.update = function() {
		_self.velocity.y += von.gravity;
		
		// _self.velocity.x *= von.friction;
		// _self.velocity.y *= von.friction;
		
		_self.x += _self.velocity.x * von.elapsed;
		_self.y += _self.velocity.y * von.elapsed;
		
		if (_self.x-_self.radius < 0) {
			_self.x = 0;
			_self.velocity.x = -_self.velocity.x * _self.restitution;
		} else if (_self.x+_self.radius > von.worldWidth) {
			_self.x = von.worldWidth-_self.radius;
			_self.velocity.x = -_self.velocity.x * _self.restitution;
		}
		if (_self.y-_self.radius < 0) {
			_self.y = 0;
			_self.velocity.y = -_self.velocity.y * _self.restitution;
		} else if (_self.y+_self.radius > von.worldHeight) {
			_self.y = von.worldHeight-_self.radius;
			_self.velocity.y = -_self.velocity.y * _self.restitution;
		}
		
		_self.min.reset(_self.x, _self.y);
		_self.max.reset(_self.x+_self.width, _self.y+_self.radius);
	};
	
	this.render = function() {
		von.ctx.beginPath();
		von.ctx.arc(_self.x, _self.y, _self.radius, 0, _tau, false);
		von.ctx.fillStyle = 'rgba(20, 100, 150, 0.7)';
		von.ctx.fill();
	};
	
	// overwrite instance properties
	if (typeof _settings !== 'undefined') {
		for (var attr in _settings) {
			if (_self.hasOwnProperty(attr)) _self[attr] = _settings[attr];
		}
	}
};