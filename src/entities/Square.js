define(function(require) {
	
// imports
var Kai = require('core/Kai');
var ComponentDef = require('components/ComponentDef');
var MathTools = require('math/MathTools');

// constructor
var Square = function(posx, posy) {
	require('core/Base').call(this);
	
	// attributes
	this.speed = 20;
	this.width = 55;
	this.height = 55;
	
	var sharedAttr = {
		width: this.width,
		height: this.height
	};
	
	// base components
	this.position = new Vec2(posx, posy);
	this.velocity = new Vec2(MathTools.random(this.speed), MathTools.random(this.speed));
	// complex components
	Kai.addComponent(this, ComponentDef.OCAN_SQUARE, sharedAttr); // view
	Kai.addComponent(this, ComponentDef.AABB2, sharedAttr); // body
	
};


Square.prototype = {
	constructor: Square,
	
	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/
	
	reset: function() {
		this.view.active = true;
		this.body.active = true;
	},
	
	dispose: function() {
		// remove signal callbacks
		
		// dispose components
		Kai.removeComponent(this, ComponentDef.OCAN_SQUARE);
		Kai.removeComponent(this, ComponentDef.AABB2);
		
		// null references
		this.position = null;
		this.velocity = null;
	}
	
};

return Square;

});