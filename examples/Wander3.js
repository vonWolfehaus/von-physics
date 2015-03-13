(function(){
var root = this;

var Wander3 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	
	this.angleJitter = 0.7;
	this.targetDistance = 10;
	this.targetRadius = 20;
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.entity = entity;
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
	this.velocity = entity && entity.velocity ? entity.velocity : new vgp.Vec();
	this.accel = entity && entity.accel ? entity.accel : new vgp.Vec();
	
	entity.body.onCollision.add(this.onCollision, this);
	
	var a = vgp.utils.random(vgp.utils.TAU);
	this._wanderVec = new THREE.Euler(a, a, a);
	this._scratchVec = new vgp.Vec();
};

Wander3.prototype = {
	activate: function() {
		this.active = true;
	},
	
	update: function() {
		this.accel.copy(this.velocity);
		this.accel.normalize();
		this.accel.multiplyScalar(this.targetDistance);
		
		this._scratchVec.set(0, -1, 0);
		this._scratchVec.multiplyScalar(this.targetRadius);
		this._scratchVec.applyEuler(this._wanderVec);
		
		this._wanderVec.x += vgp.utils.random(this.angleJitter);
		this._wanderVec.y += vgp.utils.random(this.angleJitter);
		this._wanderVec.z += vgp.utils.random(this.angleJitter);
		
		this.accel.add(this._scratchVec);
	},
	
	disable: function() {
		this.active = false;
		this.velocity.set(0, 0, 0);
		this.accel.set(0, 0, 0);
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
			this._wanderVec.x = this.velocity.x;
			this._wanderVec.y = this.velocity.y;
			this._wanderVec.z = this.velocity.z;
		}
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = Wander3;
	}
	exports.Wander3 = Wander3;
} else if (typeof define !== 'undefined' && define.amd) {
	define(Wander3);
} else {
	root.Wander3 = Wander3;
}
}).call(this);