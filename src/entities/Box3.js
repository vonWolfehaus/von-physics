define(function(require) {
	
// imports
var Kai = require('core/Kai');
var ComponentDef = require('components/ComponentDef');
var MathTools = require('math/MathTools');
var Tools = require('utils/Tools');

// constructor
var Box3 = function(pos, settings) {
	require('core/Base').call(this);
	
	// attributes
	// this.size = 50;
	// this.dynamic = false;
	
	var sharedAttr = {
		size: this.size,
		dynamic: this.dynamic
	};
	
	Tools.merge(sharedAttr, settings);
	
	// base components
	this.position = pos.clone();
	this.velocity = new THREE.Vector3();
	
	// complex components
	Kai.addComponent(this, ComponentDef.THREE_CUBE, sharedAttr); // view
	Kai.addComponent(this, ComponentDef.AABB3, sharedAttr); // body
	
};


Box3.prototype = {
	constructor: Box3,
	
	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/
	
	reset: function() {
		this.view.active = true;
		this.body.active = true;
	},
	
	dispose: function() {
		// dispose components
		Kai.removeComponent(this, ComponentDef.THREE_CUBE);
		Kai.removeComponent(this, ComponentDef.AABB3);
		
		// null references
		this.position = null;
		this.velocity = null;
	}
	
};

return Box3;

});