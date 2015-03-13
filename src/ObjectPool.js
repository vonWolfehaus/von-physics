
// constructor
vgp.ObjectPool = function(classConstructor, instanceSettings, initSize) {
	// public
	this.free = new vgp.LinkedList();
	this.busy = new vgp.LinkedList();
	this.size = initSize;
	
	// private
	this._Class = classConstructor;
	this._settings = instanceSettings || {};
	this._settings.pool = this;
	
	for (var i = 0; i < this.size; i++) {
		this.free.add(new this._Class(this._settings));
	}
};


vgp.ObjectPool.prototype = {
	constructor: vgp.ObjectPool,
	
	get: function() {
		var obj;
		if (this.free.length) {
			// console.log('[ObjectPool.get] Free: '+this.free.length);
			obj = this.free.pop();
			this.busy.add(obj);
			return obj;
		}
		
		// grow
		obj = new this._Class(this._settings);
		this.busy.add(obj);
		this.size++;
		// console.log('[ObjectPool.get] Free: '+this.free.length+'; Busy: '+this.busy.length);
		
		return obj;
	},
	
	recycle: function(obj) {
		if (this.busy.has(obj)) {
			this.busy.remove(obj);
			this.free.add(obj);
		
		} /*else {
			// already in free, or not in either list
			console.log('[ObjectPool.recycle] Object ignored');
		}*/
		// console.log('[ObjectPool.recycle] Free: '+this.free.length+'; Busy: '+this.busy.length);
	},
	
	freeAll: function() {
		var obj, node = this.busy.first;
		while (node) {
			obj = node.obj;
			this.busy.remove(obj);
			this.free.add(obj);
			node = node.next;
		}
	},
	
	dispose: function() {
		var node = this.busy.first;
		while (node) {
			node.obj.dispose();
			node = node.next;
		}
		node = this.free.first;
		while (node) {
			node.obj.dispose();
			node = node.next;
		}
		this.free.dispose();
		this.busy.dispose();
		this.free = null;
		this.busy = null;
		this._Class = null;
		this._settings = null;
	},
	
	toString: function() {
		return '[ObjectPool size: '+this.size+', free: '+this.free.length+', busy: '+this.busy.length+']';
	}
};
