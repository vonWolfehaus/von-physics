var von = von || {};
von.AABB = function() {
	this.min = new Vector2D();
	this.max = new Vector2D();
	
	this.mass = 100; // 0 is immobile
	this.invmass = 0;
	this.restitution = 0; // bounciness, 0 to 1
	this.velocity = new Vector2D(Math.random()*75-30, Math.random()*75-30);
	
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
	
	this.setMass(this.mass); // make sure invmass is set
};