var von = von || {};
von.AABB3 = function() {
	this.min = new THREE.Vector3();
	this.max = new THREE.Vector3();
	
	this.width = 0;
	this.height = 0;
	this.depth = 0;
	
	this.mass = 100; // 0 is immobile
	this.invmass = 0;
	this.restitution = 0.4; // bounciness, 0 to 1
	
	this.type = '';
	
	// internal
	var _self = this;
	
	this.setMass = function(newMass) {
		_self.mass = newMass;
		if (newMass <= 0) {
			_self.invmass = 0;
		} else {
			_self.invmass = 1/newMass;
		}
	};
	
	this.update = function(v) {
		_self.min.set(v.x, v.y, v.z);
		_self.max.set(v.x+_self.width, v.y+_self.height, v.y+_self.depth);
	};
	
	// overwrite instance properties
	if (typeof _settings !== 'undefined') {
		for (var attr in _settings) {
			if (_self.hasOwnProperty(attr)) _self[attr] = _settings[attr];
		}
	}
	this.setMass(this.mass); // make sure invmass is set
};