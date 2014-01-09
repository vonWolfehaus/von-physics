define(function(require) {
	
// imports
var Kai = require('core/Kai');
var Tools = require('utils/Tools');

// constructor
var THREECube = function(entity, settings) {
	// augment with Base
	require('core/Base').call(this);
	
	// attributes
	this.size = 50;
	this.dynamic = false;
	this.color = 0xfeb74c;
	this.textureUrl = 'img/square-outline-textured.png';
	
	// attribute override
	Tools.merge(this, settings);
	
	// private properties
	this._entity = entity;
	this._display = null;
	
	// NEVER do this in production! geo and materials should be cached!
	// But I'm on vacation and this is prototype code so whatevs man
	var cubeGeo = new THREE.CubeGeometry(this.size, this.size, this.size);
	var cubeMaterial = new THREE.MeshLambertMaterial({
		color: this.color,
		ambient: this.color,//0x00ff80,
		shading: THREE.FlatShading,
		map: this.dynamic ? null : THREE.ImageUtils.loadTexture(this.textureUrl)
	});
	
	this._display = new THREE.Mesh(cubeGeo, cubeMaterial);
	
	if (!this.dynamic) {
		this._display.matrixAutoUpdate = false;
		this._display.position.copy(entity.position);
		this._display.updateMatrix();
	}
	
	// prerequisite components
	this.position = entity.position;
	
	// init
	Kai.view.add(this._display);
};

// required statics for component system
THREECube.accessor = 'view'; // property name as it sits on an entity
THREECube.className = 'THREE_CUBE'; // name of component on the ComponenDef object
THREECube.priority = 10; // general position in the engine's component array; highest updated first


THREECube.prototype = {
	constructor: THREECube,
	
	reset: function() {
		
	},
	
	update: function() {
		this._display.position.x = this.position.x;
		this._display.position.y = this.position.y;
		this._display.position.z = this.position.z;
	},
	
	dispose: function() {
		Kai.view.remove(this._display);
		
		// null references
		this._entity = null;
		this.position = null;
		this._display = null;
	}
};

return THREECube;

});