/*
	you'll often see a "world" object in games that hold entities, and it's purpose is to provide data about
	the world and make entities aware of one another within it, efficiently.
	this one uses a static grid for spatial hashing in a very memory-efficient manner by pooling grid "cells"
	(just doubly-linked lists) so if no object occupies a cell, it will be freed and used elsewhere.
	due to this feature, an adjacent possibility opens up: it can extend to infinity at virtually no cost. it
	will grow as needed and reuse what isn't.
	if your game only has a couple dozen colliding entities, it would be more efficient to use the brute-force
	method, as there is some overhead to maintaining these lists per frame.
	querying is the second-best aspect of grids--if you have a trigger or dynamic object (like a bullet) that
	doesn't react physically, then it can simply go through the cells it occupies looking for something it wants.
 */
vgp.World = function(cellSize) {
	this.active = true;
	/*
		if not bounded, it can grow infinitely large (since we pool cells, this doesn't affect memory).
		what does affect memory is how many objects you add (allocates more LinkedList nodes)
		and how sparse they are in the world (allocates more LinkedList nodes).
		otherwise, entities will check the world's min/max and behave according to their set boundary rule.
	 */
	this.bounded = false;
	// universal properties all entities abide by (applied in physics component)
	this.friction = 0.8;
	this.gravity = new vgp.Vec();
	// elapsed will probably sit elsewhere in your game, just find-replace with your own
	this.elapsed = 0.0166;
	/*
		sparse array of LinkedLists. and even if a cell is there, doesn't mean it's active!
		always use this.getCell() to ensure you get a legit cell to use for querying
	 */
	this.grid = [];
	/*
		world bounds. subtracts min from entity position to shift grid to avoid negative numbers,
		so we never try to reach outside this.grid array.
	 */
	this.min = new vgp.Vec(Number.MAX_VALUE, Number.MAX_VALUE);
	this.max = new vgp.Vec(Number.MIN_VALUE, Number.MIN_VALUE);

	this.pxCellSize = cellSize;
	vgp.World.PX_TO_GRID = 1 / cellSize;

	this.objects = new vgp.LinkedList();
	// this.context = null; // canvas 2d context, only used for debugging

	this._listPool = new vgp.ObjectPool(vgp.LinkedList, null, 20);
	this._emptyCell = new vgp.LinkedList(); // faster return for empty queries

	// debug stuff, comment out before release
	this._scratchVec = new vgp.Vec();
	this._cellColor = 'rgba(20, 20, 20, 0.1)';
	this._boundaryColor = 'rgba(232, 203, 9, 1)';
};

vgp.World.PX_TO_GRID = 0;

vgp.World.prototype = {
	constructor: vgp.World,

	// _sortedLayer: null,

	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/

	/*countGroup: function(groupType) {
		var obj, node = this.objects.first;
		var total = 0;
		while (node) {
			obj = node.obj;
			if (obj.active && obj.collisionGroup === groupType) {
				total++;
			}
			node = node.next;
		}
		return total;
	},*/

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
	setBounds: function(width, height) {
		if (typeof width === 'boolean') this.bounded = width;
		else this.bounded = true;

		this.min.set();
		if (this.bounded) {
			this.max.set(width, height);
		}
		else {
			this.max.set(this.pxCellSize * 2, this.pxCellSize * 2);
		}
	},

	/*
		all entities should have been updated before this is called so it has the latest position data.
	 */
	update: function() {
		var m, obj, node, otherObj, other;
		var cXEntityMin,cXEntityMax,cYEntityMin,cXEntityMax,i,j,cX,cY,gridCol,gridCell;

		// make all cells usable again
		node = this._listPool.busy.first;
		while (node) {
			obj = node.obj;
			node = node.next;
			obj.clear();
			this._listPool.recycle(obj);
		}

		// add all active objects to appropriate cells and resolve collisions among them
		node = this.objects.first;
		while (node) {
			obj = node.obj;
			node = node.next;

			if (!obj.solid || !obj.active) {
				continue;
			}

			// subtract min to shift grid to avoid negative numbers
			cXEntityMin = ((obj.min.x - this.min.x) * vgp.World.PX_TO_GRID) | 0;
			cXEntityMax = ((obj.max.x - this.min.x) * vgp.World.PX_TO_GRID) | 0;
			cYEntityMin = ((obj.min.y - this.min.y) * vgp.World.PX_TO_GRID) | 0;
			cYEntityMax = ((obj.max.y - this.min.y) * vgp.World.PX_TO_GRID) | 0;

			// insert entity into each cell it overlaps
			// we're looping to make sure that all cells between extremes are found
			for (cX = cXEntityMin; cX <= cXEntityMax; cX++) {
				// make sure a column exists, initialize if not to grid height length
				if (!this.grid[cX]) {
					this.grid[cX] = [];
				}

				gridCol = this.grid[cX];

				// loop through each cell in this column
				for (cY = cYEntityMin; cY <= cYEntityMax; cY++) {
					// ensure we have a bucket to put entities into for this cell
					if (!gridCol[cY]) {
						gridCol[cY] = this._listPool.get();
					}

					gridCell = gridCol[cY];

					// debug drawing - ALWAYS comment out when not needed; do not use a conditional, it's wasteful in such a hot loop as this
					// this._scratchVec.set(cX * this.pxCellSize, cY * this.pxCellSize);
					// vgp.draw.rect(this.context, this._scratchVec, this.pxCellSize, this.pxCellSize, this._cellColor);

					// loop again to check collisions with entities already in this cell before adding ourselves
					other = gridCell.first;
					while (other) {
						otherObj = other.obj;
						other = other.next;

						if (otherObj.collisionID === obj.collisionID) {
							continue;
						}
						/*
							no hash check for duplicates since the collision check would have moved them out of intersection and therefore fail (early, at that) the next time, making it impossible to apply impulses multiple times. anyway, a hash would thrash the gc (since it has to be recreated each frame).
						*/
						// replace whatever narrow phase your game needs here; eg if you only use AABB, use separateAABBvsAABB()
						m = vgp.physics.separateCircleCircle(obj, otherObj);
						if (m) {
							vgp.physics.resolve(obj, otherObj, m);

							obj.onCollision.dispatch(otherObj, m);
							otherObj.onCollision.dispatch(obj, m);
						}
					}
					gridCell.add(obj);
				}
			}
		}

		// debug draw new world bounds
		// this.context.strokeStyle = this._boundaryColor;
		// this.context.strokeRect(this.min.x+1, this.min.y+1, this.max.x-this.min.x-1, this.max.y-this.min.y-1);
	},

	/*
		only to be used for queries, never modify the cells directly!
	 */
	getCell: function(px, py) {
		px = (px * vgp.World.PX_TO_GRID) | 0;
		py = (py * vgp.World.PX_TO_GRID) | 0;
		if (this.grid[px] && this.grid[px][py] && this._listPool.busy.has(this.grid[px][py])) {
			// must exist and be in use, otherwise it could exist but contain old data
			return this.grid[px][py];
		}
		return this._emptyCell;
	},

	/*
		get a number of cells and put them in an array that must be provided.
		again, never modify the cells, only loop through them for their occupants!
	 */
	getCells: function(px, py, w, h, arr) {
		var cX, cY, maxX, maxY, gridCol, gridCell, ptg = vgp.World.PX_TO_GRID;
		px = (px * ptg) | 0;
		py = (py * ptg) | 0;
		maxX = px + ((w * ptg) | 0);
		maxY = py + ((h * ptg) | 0);
		for (cX = px; cX <= maxX; cX++) {
			// make sure a column exists, initialize if not to grid height length
			if (!this.grid[cX]) {
				// if the column doesn't exist, there's nothing in it, so move on
				continue;
			}
			gridCol = this.grid[cX];

			// loop through each cell in this column
			for (cY = py; cY <= maxY; cY++) {
				if (!gridCol[cY]) {
					continue;
				}
				gridCell = this.grid[cX][cY];
				// finally, make sure this isn't a ghost reference by checking if it's in use
				if (this._listPool.busy.has(gridCell)) {
					arr.push(gridCell);
				}
			}
		}
		return arr;
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
