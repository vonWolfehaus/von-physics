(function(){
var root = this;

var Wander2 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	
	this.angleJitter = 0.9;
	this.targetDistance = 10;
	this.targetRadius = 20;
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.entity = entity;
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
	this.velocity = entity && entity.velocity ? entity.velocity : new vgp.Vec();
	this.accel = entity && entity.accel ? entity.accel : new vgp.Vec();
	
	entity.body.onCollision.add(this.onCollision, this);
	
	this._wanderAngle = vgp.utils.random(vgp.utils.TAU);
	this._scratchVec = new vgp.Vec();
};

Wander2.prototype = {
	activate: function() {
		this.active = true;
	},
	
	update: function() {
		this.accel.copy(this.velocity);
		this.accel.normalize();
		this.accel.multiplyScalar(this.targetDistance);
		
		this._scratchVec.set(0, -1);
		this._scratchVec.multiplyScalar(this.targetRadius);
		this._scratchVec.setAngle(this._wanderAngle);
		
		this._wanderAngle += vgp.utils.random(this.angleJitter);
		
		this.accel.add(this._scratchVec);
	},
	
	disable: function() {
		this.active = false;
		this.velocity.set();
		this.accel.set();
	},
	
	dispose: function() {
		this.position = null;
		this.velocity = null;
		this.accel = null;
		this.entity = null;
	},
	
	onCollision: function(other) {
		if (other === vgp.Boundary) {
			// prevent entity from banging against walls
			this._wanderAngle = this.velocity.getAngle();
		}
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = Wander2;
	}
	exports.Wander2 = Wander2;
} else if (typeof define !== 'undefined' && define.amd) {
	define(Wander2);
} else {
	root.Wander2 = Wander2;
}
}).call(this);