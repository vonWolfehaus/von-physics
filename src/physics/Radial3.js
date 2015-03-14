
// constructor
vgp.Radial3 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	this.type = vgp.Type.SPHERE;
	
	this.solid = true;
	this.radius = 10;
	this.maxSpeed = 20;
	// if this collider will go faster than its radius in one frame, it's continuous (like a bullet)
	this.continuous = true;
	this.mass = 50; // 0 is immobile
	this.restitution = 0.8; // bounciness, 0 to 1
	
	this.boundaryBehavior = vgp.Boundary.BOUNDARY_BOUNCE;
	this.collisionID = this.uniqueID;
	this.collisionGroup = null;
	
	this.onCollision = new vgp.Signal();
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.invmass = 0; // never adjust this directly! use setMass() instead
	
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
	this.velocity = entity && entity.velocity ? entity.velocity : new vgp.Vec();
	this.accel = entity && entity.accel ? entity.accel : new vgp.Vec();
	
	this.min = new vgp.Vec();
	this.max = new vgp.Vec();
	// this.offset = new vgp.Vec();
	// uncomment arrow stuff to visualize velocities
	// this._arrow = new THREE.ArrowHelper(new vgp.Vec(), new vgp.Vec(), 40, '0x000000', 8, 10);
	this._v = new vgp.Vec();
	
	// init
	this.setMass(this.mass);
	this.update();
};

vgp.Radial3.prototype = {
	constructor: vgp.Radial3,
	
	activate: function() {
		this.active = true;
		game.world.add(this);
		// game.scene.add(this._arrow);
		this.position = this.entity.position;
	},
	
	disable: function() {
		this.velocity.set();
		this.accel.set();
		this.active = false;
		game.world.remove(this);
		// game.scene.remove(this._arrow);
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
		if (l !== 0 && l > this.maxSpeed) { // truncate
			this.accel.divideScalar(l);
			this.accel.multiplyScalar(this.maxSpeed);
		}
		
		this.accel.add(world.gravity);
		
		this.velocity.multiplyScalar(world.friction);
		this.velocity.add(this.accel);
		
		this._v.copy(this.velocity).multiplyScalar(world.elapsed);
		this.position.add(this._v);
		
		/*this._v.copy(this.velocity).normalize();
		this._arrow.position.copy(this.position);
		this._arrow.setDirection(this._v);*/
		
		this.min.copy(this.position).subScalar(this.radius);
		this.max.copy(this.position).addScalar(this.radius);
		
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
						this.position.x = world.min.x + this.radius;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.x > world.max.x) {
						this.position.x = world.max.x - this.radius;
						this.velocity.x = -this.velocity.x * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					if (this.min.y < world.min.y) {
						this.position.y = world.min.y + this.radius;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.y > world.max.y) {
						this.position.y = world.max.y - this.radius;
						this.velocity.y = -this.velocity.y * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					if (this.min.z < world.min.z) {
						this.position.z = world.min.z + this.radius;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					else if (this.max.z > world.max.z) {
						this.position.z = world.max.z - this.radius;
						this.velocity.z = -this.velocity.z * this.restitution;
						this.onCollision.dispatch(vgp.Boundary);
					}
					break;
					
				case vgp.Boundary.BOUNDARY_WRAP:
					if (this.min.x < world.min.x) {
						this.position.x += world.max.x + this.radius;
					}
					else if (this.max.x > world.max.x) {
						this.position.x -= world.max.x - this.radius;
					}
					if (this.min.y < world.min.y) {
						this.position.y += world.max.y + this.radius;
					}
					else if (this.max.y > world.max.y) {
						this.position.y -= world.max.y - this.radius;
					}
					if (this.min.z < world.min.z) {
						this.position.z += world.max.z + this.radius;
					}
					else if (this.max.z > world.max.z) {
						this.position.z -= world.max.z - this.radius;
					}
					break;
			}
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
