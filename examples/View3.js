(function(){
var root = this;

var View3 = function(entity, settings) {
	this.active = false;
	this.entity = entity || null;
	this.uniqueID = vgp.utils.generateID();
	
	this.color = 'rgb(9, 150, 232)';
	this.material = null;
	this.geometry = null;
	
	// attribute override
	vgp.utils.merge(this, settings);
	
	this.mesh = new THREE.Mesh(this.geometry, this.material);
	this.mesh.castShadow = true;
	this.mesh.receiveShadow = true;
	
	this.entity = entity;
	this.position = entity && entity.position ? entity.position : new vgp.Vec();
};

View3.prototype = {
	activate: function() {
		this.active = true;
		this.mesh.position.copy(this.position);
		this.entity.position = this.mesh.position;
		game.scene.add(this.mesh);
	},
	
	update: function() {
		// threejs handles it for us
	},
	
	disable: function() {
		this.active = false;
		game.scene.remove(this.mesh);
	},
	
	dispose: function() {
		this.position = null;
		this.entity = null;
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = View3;
	}
	exports.View3 = View3;
} else if (typeof define !== 'undefined' && define.amd) {
	define(View3);
} else {
	root.View3 = View3;
}
}).call(this);