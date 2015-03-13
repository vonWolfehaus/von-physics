
// constructor
vgp.Radial3 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	this.type = vgp.Type.SPHERE;
	
	this.solid = true;
	this.radius = 10;
	this.offsetX = 0;
	this.offsetY = 0;
	this.offsetZ = 0;
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
	
	// init
	this.update();
	this.setMass(this.mass);
};

vgp.Radial3.prototype = {
	constructor: vgp.Radial3,
	
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
		
		this.accel.y += world.gravity * world.elapsed;
		var l = this.accel.length();
		if (l !== 0 && l > this.maxSpeed) {
			this.accel.divideScalar(l);
			this.accel.multiplyScalar(this.maxSpeed);
		}
		
		this.velocity.x *= world.friction;
		this.velocity.y *= world.friction;
		this.velocity.z *= world.friction;
		
		this.velocity.x += this.accel.x;
		this.velocity.y += this.accel.y;
		this.velocity.z += this.accel.z;
		
		this.position.x += this.velocity.x * world.elapsed;
		this.position.y += this.velocity.y * world.elapsed;
		this.position.z += this.velocity.z * world.elapsed;
		
		if (world.bounded) {
			switch (this.boundaryBehavior) {
				case vgp.Boundary.BOUNDARY_DISABLE:
					if (this.position.x + this.offsetX < world.min.x ||
						this.position.x + this.radius + this.offsetX > world.max.x ||
						this.position.y + this.offsetY < world.min.y ||
						this.position.y + this.radius + this.offsetY > world.max.y) {
						this.onCollision.dispatch(vgp.Boundary);
						this.disable();
					}
					break;
					
				case vgp.Boundary.BOUNDARY_BOUNCE:
					if (this.position.x - this.radius + this.offsetX < world.min.x) {
						this.position.x = world.min.x - this.offsetX + this.radius;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
						
					} else if (this.position.x + this.radius + this.offsetX > world.max.x) {
						this.position.x = world.max.x - this.radius - this.offsetX;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					
					if (this.position.y - this.radius + this.offsetY < world.min.y) {
						this.position.y = world.min.y - this.offsetY + this.radius;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
						
					} else if (this.position.y + this.radius + this.offsetY > world.max.y) {
						this.position.y = world.max.y - this.radius - this.offsetY;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					
					if (this.position.z - this.radius + this.offsetZ < world.min.z) {
						this.position.z = world.min.z - this.offsetZ + this.radius;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundarz);
						
					} else if (this.position.z + this.radius + this.offsetZ > world.max.z) {
						this.position.z = world.max.z - this.radius - this.offsetZ;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundarz);
					}
					break;
					
				case vgp.Boundary.BOUNDARY_WRAP:
					if (this.position.x - this.radius + this.offsetX < world.min.x) {
						this.position.x += world.max.x - this.offsetX + this.radius;
						
					} else if (this.position.x + this.radius + this.offsetX > world.max.x) {
						this.position.x -= world.max.x - this.radius - this.offsetX;
					}
					
					if (this.position.y - this.radius + this.offsetY < world.min.y) {
						this.position.y += world.max.y - this.offsetY + this.radius;
						
					} else if (this.position.y + this.radius + this.offsetY > world.max.y) {
						this.position.y -= world.max.y - this.radius - this.offsetY;
					}
					break;
			}
		}
		else {
			// extend the grid to accommodate this
			if (this.position.x + this.offsetX < world.min.x) {
				world.min.x = this.position.x + this.offsetX;
			}
			else if (this.position.x + this.radius + this.offsetX > world.max.x) {
				world.max.x = this.position.x + this.radius + this.offsetX;
			}
			if (this.position.y + this.offsetY < world.min.y) {
				world.min.y = this.position.y + this.offsetY;
			}
			else if (this.position.y + this.radius + this.offsetY > world.max.y) {
				world.max.y = this.position.y + this.radius + this.offsetY;
			}
		}
		
		this.min.x = this.position.x - this.radius + this.offsetX;
		this.min.y = this.position.y - this.radius + this.offsetY;
		this.min.z = this.position.z - this.radius + this.offsetZ;
		this.max.x = this.position.x + this.radius + this.offsetX;
		this.max.y = this.position.y + this.radius + this.offsetY;
		this.max.z = this.position.z + this.radius + this.offsetZ;
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
