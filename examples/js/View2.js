(function(){
var root = this;

var View2 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	
	this.color = 'rgba(9, 150, 232, 1)';
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.entity = entity;
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
};

View2.prototype = {
	activate: function() {
		this.active = true;
	},
	
	update: function() {
		if (this.entity.body) {
			vgp.draw.collider(this.entity.body, this.color);
		}
	},
	
	disable: function() {
		this.active = false;
	},
	
	dispose: function() {
		this.position = null;
		this.entity = null;
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = View2;
	}
	exports.View2 = View2;
} else if (typeof define !== 'undefined' && define.amd) {
	define(View2);
} else {
	root.View2 = View2;
}
}).call(this);