/*
	Brute force sim example.
 */
vgp.World = function() {
	this.active = true;
	/*
		if not bounded, it can grow infinitely large (since we pool cells, this doesn't affect memory).
		what does affect memory is how many objects you add (allocates more LinkedList nodes)
		and how sparse they are in the world (allocates more LinkedList nodes).
		otherwise, entities will check the world's min/max and behave according to their set boundary rule.
	 */
	this.bounded = false;
	// universal properties all entities abide by (applied in physics component)
	this.friction = 0.9;
	this.gravity = new vgp.Vec();
	// elapsed will probably sit elsewhere in your game, just find-replace with your own
	this.elapsed = 0.0166;
	
	/*
		world bounds. only matters if colliders have specific boundary behavior
	 */
	this.min = new vgp.Vec();
	this.max = new vgp.Vec(100, 100, 100);
	
	this.objects = new vgp.LinkedList();
};

vgp.World.prototype = {
	constructor: vgp.World,
	
	// _sortedLayer: null,
	
	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/
	
	// e must be an entity with a collision body or the body itself, like an AABB
	add: function(e) {
		e = e.body || e;
		if (!e.onCollision) {
			console.warn('[vgp.World.add] Ignoring object; must be an entity or physics component');
			console.dir(e);
			return;
		}
		this.objects.add(e);
	},
	
	remove: function(e) {
		e = e.body || e;
		// harmless: if it doesn't exist, will return silently
		this.objects.remove(e);
	},
	
	/*
		pass in `false` to disable bounds, or a width and height to enable or change bounds.
		WARNING: if bounded, it assumes position at 0, 0 so position your assets accordingly
	 */
	setBounds: function(width, height, depth) {
		if (typeof width === 'boolean') this.bounded = width;
		else this.bounded = true;
		
		this.min.set(0, 0, 0);
		if (this.bounded) {
			this.max.set(width, height, depth);
		}
	},
	
	/*
		all entities should have been updated before this is called so it has the latest position data.
	 */
	update: function() {
		var m, obj, node, otherObj, other;
		
		// add all active objects to appropriate cells and resolve collisions among them
		node = this.objects.first;
		while (node) {
			obj = node.obj;
			
			if (!obj.solid || !obj.active) {
				node = node.next;
				continue;
			}
			
			other = node.next;
			while (other) {
				otherObj = other.obj;
				other = other.next;
				
				if (!otherObj.solid || !otherObj.active || otherObj.collisionID === obj.collisionID) {
					continue;
				}
				
				// replace whatever narrow phase your game needs here; eg if you only use AABB, use separateAABBvsAABB()
				m = vgp.physics.separate(obj, otherObj);
				if (m) {
					vgp.physics.resolve(obj, otherObj, m);
					
					obj.onCollision.dispatch(otherObj, m);
					otherObj.onCollision.dispatch(obj, m);
				}
			}
			
			node = node.next;
		}
	},
	
	disable: function() {
		this.active = false;
	},
	
	dispose: function() {
		this.objects.dispose();
		this.objects = null;
		this.grid = null;
		this.min = null;
		this.max = null;
		this._emptyCell = null;
	}
};
