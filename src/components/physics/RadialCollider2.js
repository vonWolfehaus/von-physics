define(function(require) {
	
// imports
var Tools = require('utils/Tools');
var World = require('entities/World');

// constructor
var RadialColider2 = function(entity, settings) {
	// augment with Base
	require('core/Base').call(this);
	
	// attributes
	this.radius = 25;
	this.mass = 100; // 0 is immobile
	this.invmass = 0; // never adjust this directly! use setMass() instead
	this.restitution = 0.8; // bounciness, 0 to 1
	this.solid = true;
	
	// attribute override
	Tools.merge(this, settings);
	
	// this.collisionSignal = new Signal();
	
	// private properties
	this._entity = entity;
	
	// prerequisite components
	this.position = entity.position;
	this.velocity = entity.velocity;
	
	// init
	this.setMass(this.mass);
};

// required statics for component system
RadialColider2.accessor = 'body'; // property name as it sits on an entity
RadialColider2.className = 'RADIAL_COLLIDER2'; // name of component on the ComponenDef object
RadialColider2.priority = 1; // general position in the engine's component array; lowest updated first


RadialColider2.prototype = {
	constructor: RadialColider2,
	
	setMass: function(newMass) {
		this.mass = newMass;
		if (newMass <= 0) {
			this.invmass = 0;
		} else {
			this.invmass = 1 / newMass;
		}
	},
	
	reset: function() {
		this.setMass(this.mass); // make sure invmass is set
	},
	
	update: function() {
		this.velocity.y += World.gravity * World.elapsed;
		
		// this.velocity.x *= World.friction;
		// this.velocity.y *= World.friction;
		
		this.position.x += this.velocity.x * World.elapsed;
		this.position.y += this.velocity.y * World.elapsed;
		
		if (this.position.x < this.radius) {
			this.position.x = this.radius;
			this.velocity.x = -this.velocity.x * this.restitution;
			
		} else if (this.position.x + this.radius > World.width) {
			this.position.x = World.width - this.radius;
			this.velocity.x = -this.velocity.x * this.restitution;
		}
		
		if (this.position.y < this.radius) {
			this.position.y = this.radius;
			this.velocity.y = -this.velocity.y * this.restitution;
			
		} else if (this.position.y + this.radius > World.height) {
			this.position.y = World.height - this.radius;
			this.velocity.y = -this.velocity.y * this.restitution;
		}
		
		// DebugDraw.circle(this.position.x, this.position.y, this.radius);
	},
	
	dispose: function() {
		// remove signal callbacks
		
		// null references
		this._entity = null;
		this.position = null;
		this.velocity = null;
	}
};

return RadialColider2;

});