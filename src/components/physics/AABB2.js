define(function(require) {
	
// imports
var Tools = require('utils/Tools');
var World = require('entities/World');

// constructor
var AABB2 = function(entity, settings) {
	// augment with Base
	require('core/Base').call(this);
	
	// attributes
	this.width = 50;
	this.height = 50;
	this.min = new Vec2(); // in global space
	this.max = new Vec2();
	this.mass = 100; // 0 is immobile
	this.invmass = 0; // never adjust this directly! use setMass() instead
	this.restitution = 0.6; // bounciness, 0 to 1
	this.solid = true;
	
	// this.collisionSignal = new Signal();
	
	// attribute override
	Tools.merge(this, settings);
	
	// private properties
	this._entity = entity;
	this._halfWidth = this.width / 2;
	this._halfHeight = this.height / 2;
	
	// prerequisite components
	this.position = entity.position;
	this.velocity = entity.velocity;
	
	// init
	this.min.x = this.position.x - this._halfWidth;
	this.min.y = this.position.y - this._halfHeight;
	this.max.x = this.position.x + this._halfWidth;
	this.max.y = this.position.y + this._halfHeight;
	this.setMass(this.mass);
};

// required statics for component system
AABB2.accessor = 'body'; // property name as it sits on an entity
AABB2.className = 'AABB2'; // name of component on the ComponenDef object
AABB2.priority = 1; // general position in the engine's component array; lowest updated first


AABB2.prototype = {
	constructor: AABB2,
	
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
		
		if (this.position.x < this._halfWidth) {
			this.position.x = this._halfWidth;
			this.velocity.x = -this.velocity.x * this.restitution;
			
		} else if (this.position.x + this._halfWidth > World.width) {
			this.position.x = World.width - this._halfWidth;
			this.velocity.x = -this.velocity.x * this.restitution;
		}
		
		if (this.position.y < this._halfWidth) {
			this.position.y = this._halfWidth;
			this.velocity.y = -this.velocity.y * this.restitution;
			
		} else if (this.position.y + this._halfHeight > World.height) {
			this.position.y = World.height - this._halfHeight;
			this.velocity.y = -this.velocity.y * this.restitution;
		}
		
		this.min.x = this.position.x - this._halfWidth;
		this.min.y = this.position.y - this._halfHeight;
		this.max.x = this.position.x + this._halfWidth;
		this.max.y = this.position.y + this._halfHeight;
		
		// DebugDraw.rectangle(this.position.x, this.position.y, this.width, this.height);
	},
	
	dispose: function() {
		// remove signal callbacks
		
		// null references
		this._entity = null;
		this.position = null;
		this.velocity = null;
	}
};

return AABB2;

});