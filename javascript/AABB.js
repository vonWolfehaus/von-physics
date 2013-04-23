var von = von || {};
von.AABB = function() {
	
	this.min = new Vector2D();
	this.max = new Vector2D();
	
	this.mass = 10; // 0 is immobile
	this.invmass = 0;
	this.restitution = 0; // bounciness
	this.velocity = new Vector2D(Math.random()*40-20, Math.random()*40-20);
	
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
	// console.log(this);
};