
// constructor
vgp.AABB3 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	this.type = vgp.Type.AABB3;
	
	this.solid = true;
	this.width = 50;
	this.height = 50;
	this.depth = 50;
	this.maxSpeed = 10;
	
	this.mass = 50; // 0 is immobile
	this.invmass = 0; // never adjust this directly! use setMass() instead
	this.restitution = 0.8; // bounciness, 0 to 1
	
	this.autoAdd = true;
	this.boundaryBehavior = vgp.Boundary.BOUNDARY_BOUNCE;
	this.collisionID = this.uniqueID;
	this.collisionGroup = null;
	
	this.onCollision = new vgp.Signal();
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
	this.velocity = entity && entity.velocity ? entity.velocity : new vgp.Vec();
	this.accel = entity && entity.accel ? entity.accel : new vgp.Vec();
	
	this.min = new vgp.Vec();
	this.max = new vgp.Vec();
	this.half = new vgp.Vec(this.width/2, this.height/2, this.depth/2);
	
	this._v = new vgp.Vec();
	
	// init
	this.setMass(this.mass);
	this.update();
};

vgp.AABB3.prototype = {
	constructor: vgp.AABB3,
	
	activate: function() {
		this.active = true;
		if (this.autoAdd) {
			game.world.add(this);
		}
		this.position = this.entity.position;
	},
	
	disable: function() {
		this.velocity.set();
		this.accel.set();
		this.active = false;
		game.world.remove(this);
	},
	
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
		var world = game.world;
		var l = this.accel.length();
		if (l !== 0 && l > this.maxSpeed) {
			this.accel.divideScalar(l);
			this.accel.multiplyScalar(this.maxSpeed);
		}
		
		this.accel.add(world.gravity);
		
		this.velocity.multiplyScalar(world.friction);
		this.velocity.add(this.accel);
		
		this._v.copy(this.velocity).multiplyScalar(world.elapsed);
		this.position.add(this._v);
		
		this.min.copy(this.position).sub(this.half);
		this.max.copy(this.position).add(this.half);
		
		if (world.bounded) {
			switch (this.boundaryBehavior) {
				case vgp.Boundary.BOUNDARY_DISABLE:
					if (this.min.x < world.min.x || this.max.x > world.max.x ||
					    this.min.y < world.min.y || this.max.y > world.max.y ||
					    this.min.z < world.min.z || this.max.z > world.max.z) {
						this.onCollision.dispatch(vgp.Boundary);
						this.disable();
					}
					break;
					
				case vgp.Boundary.BOUNDARY_BOUNCE:
					if (this.min.x < world.min.x) {
						this.position.x = world.min.x + this.half.x;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.x > world.max.x) {
						this.position.x = world.max.x - this.half.x;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					if (this.min.y < world.min.y) {
						this.position.y = world.min.y + this.half.y;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.y > world.max.y) {
						this.position.y = world.max.y - this.half.y;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					if (this.min.z < world.min.z) {
						this.position.z = world.min.z + this.half.z;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.z > world.max.z) {
						this.position.z = world.max.z - this.half.z;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					break;
					
				case vgp.Boundary.BOUNDARY_WRAP:
					if (this.min.x < world.min.x) {
						this.position.x += world.max.x - this.half.x;
					}
					else if (this.max.x > world.max.x) {
						this.position.x -= world.max.x - this.half.x;
					}
					if (this.min.y < world.min.y) {
						this.position.y += world.max.y - this.half.y;
					}
					else if (this.max.y > world.max.y) {
						this.position.y -= world.max.y - this.half.y;
					}
					if (this.min.z < world.min.z) {
						this.position.z += world.max.z - this.half.z;
					}
					else if (this.max.z > world.max.z) {
						this.position.z -= world.max.z - this.half.z;
					}
					break;
			}
			this.min.copy(this.position).sub(this.half);
			this.max.copy(this.position).add(this.half);
		}
		else {
			// extend the grid to accommodate this
			this.min.max(world.min);
			this.max.min(world.max);
		}
	},
	
	dispose: function() {
		this.onCollision.dispose();
		this.onCollision = null;
		this.entity = null;
		this.position = null;
		this.velocity = null;
		this.accel = null;
		this.min = null;
		this.max = null;
	}
};
