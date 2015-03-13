
// constructor
vgp.Radial2 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	this.type = vgp.Type.CIRCLE;
	
	this.solid = true;
	this.radius = 10;
	this.offsetX = 0;
	this.offsetY = 0;
	this.maxSpeed = 10;
	
	this.mass = 100; // 0 is immobile
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
	
	this._hitBoundaryX = false;
	this._hitBoundaryY = false;
	
	// init
	this.update();
	this.setMass(this.mass);
};

vgp.Radial2.prototype = {
	constructor: vgp.Radial2,
	
	activate: function() {
		this.active = true;
		if (this.autoAdd) {
			game.world.add(this);
		}
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
		this.accel.truncate(this.maxSpeed);
		
		this.velocity.x *= world.friction;
		this.velocity.y *= world.friction;
		
		this.velocity.x += this.accel.x;
		this.velocity.y += this.accel.y;
		
		this.position.x += this.velocity.x * world.elapsed;
		this.position.y += this.velocity.y * world.elapsed;
		
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
						if (!this._hitBoundaryX) {
							this._hitBoundaryX = true;
							this.onCollision.dispatch(vgp.Boundary);
						}
						
					}
					else if (this.position.x + this.radius + this.offsetX > world.max.x) {
						this.position.x = world.max.x - this.radius - this.offsetX;
						this.velocity.x = -this.velocity.x * this.restitution;
						if (!this._hitBoundaryX) {
							this._hitBoundaryX = true;
							this.onCollision.dispatch(vgp.Boundary);
						}
					}
					else {
						this._hitBoundaryX = false;
					}
					if (this.position.y - this.radius + this.offsetY < world.min.y) {
						this.position.y = world.min.y - this.offsetY + this.radius;
						this.velocity.y = -this.velocity.y * this.restitution;
						if (!this._hitBoundaryY) {
							this._hitBoundaryY = true;
							this.onCollision.dispatch(vgp.Boundary);
						}
						
					}
					else if (this.position.y + this.radius + this.offsetY > world.max.y) {
						this.position.y = world.max.y - this.radius - this.offsetY;
						this.velocity.y = -this.velocity.y * this.restitution;
						if (!this._hitBoundaryY) {
							this._hitBoundaryY = true;
							this.onCollision.dispatch(vgp.Boundary);
						}
					}
					else {
						this._hitBoundaryY = false;
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
		this.max.x = this.position.x + this.radius + this.offsetX;
		this.max.y = this.position.y + this.radius + this.offsetY;
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
