(function(){
var root = this;
/*
	Behold. Generic example entity.
 */
var Entity = function(settings) {
	this.active = false;
	this.uniqueID = vgp.utils.generateID();
	
	// attributes
	this.size = 20;
	
	vgp.utils.merge(this, settings);
	
	// base objects that tie together components through reference
	this.position = new vgp.Vec();
	this.velocity = new vgp.Vec();
	this.accel = new vgp.Vec();
	
	//  components
	this.body = new settings.PhysicsComponent(this, {
		width: this.size,
		height: this.size,
		depth: this.size,
		radius: this.size / 2, // well, one of them will catch
		restitution: 0.6,
		maxSpeed: 15
	});
	this.view = new settings.ViewComponent(this, settings);
	this.behavior = settings.BehaviorComponent ? new settings.BehaviorComponent(this) : null;
};

Entity.prototype = {
	update: function() {
		if (this.behavior) this.behavior.update();
		this.body.update();
		this.view.update();
	},
	
	activate: function(posx, posy, posz) {
		this.active = true;
		this.position.set(posx, posy, posz);
		this.view.activate();
		this.body.activate();
		if (this.behavior) this.behavior.activate();
	},
	
	disable: function() {
		this.active = false;
		this.velocity.set(0, 0, 0);
		this.accel.set(0, 0, 0);
		this.body.disable();
		if (this.behavior) this.behavior.disable();
		this.view.disable();
	},
	
	dispose: function() {
		this.body.dispose();
		if (this.behavior) this.behavior.dispose();
		this.view.dispose();
		this.position = null;
		this.velocity = null;
	},
	
	toString: function() {
		return '[Entity:'+this.uniqueID+']';
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = Entity;
	}
	exports.Entity = Entity;
} else if (typeof define !== 'undefined' && define.amd) {
	define(Entity);
} else {
	root.Entity = Entity;
}
}).call(this);