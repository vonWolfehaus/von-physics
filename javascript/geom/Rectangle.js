var von = von || {};
von.Rectangle = function(_x, _y, _settings) {
	von.AABB.call(this);
	
	this.x = _x;
	this.y = _y;
	
	this.width = 50;
	this.height = 50;
	
	// internal
	var _self = this;
	
	this.update = function() {
		_self.velocity.y += von.gravity;
		
		// _self.velocity.x *= von.friction;
		// _self.velocity.y *= von.friction;
		
		_self.x += _self.velocity.x * von.elapsed;
		_self.y += _self.velocity.y * von.elapsed;
		
		if (_self.x < 0) {
			_self.x = 0;
			_self.velocity.x = -_self.velocity.x * _self.restitution;
		} else if (_self.x+_self.width > von.worldWidth) {
			_self.x = von.worldWidth-_self.width;
			_self.velocity.x = -_self.velocity.x * _self.restitution;
		}
		if (_self.y < 0) {
			_self.y = 0;
			_self.velocity.y = -_self.velocity.y * _self.restitution;
		} else if (_self.y+_self.height > von.worldHeight) {
			_self.y = von.worldHeight-_self.height;
			_self.velocity.y = -_self.velocity.y * _self.restitution;
		}
		
		_self.min.reset(_self.x, _self.y);
		_self.max.reset(_self.x+_self.width, _self.y+_self.height);
	};
	
	this.render = function() {
		von.ctx.fillStyle = 'rgba(20, 100, 150, 0.7)'; // DEBUG
	    von.ctx.fillRect(_self.x, _self.y, _self.width, _self.height); // DEBUG
	};
	
	// overwrite instance properties
	if (typeof _settings !== 'undefined') {
		for (var attr in _settings) {
			if (_self.hasOwnProperty(attr)) _self[attr] = _settings[attr];
		}
	}
};