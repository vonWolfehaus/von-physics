define(function(require) {
	
// imports
var Kai = require('core/Kai');
var ComponentDef = require('components/ComponentDef');
var MathTools = require('math/MathTools');

// constructor
var Circle = function(posx, posy) {
	require('core/Base').call(this);
	
	// attributes
	this.speed = 20;
	this.radius = 30;
	
	var sharedAttr = {
		radius: this.radius
	};
	
	// base components
	this.position = new Vec2(posx, posy);
	this.velocity = new Vec2(MathTools.random(this.speed), MathTools.random(this.speed));
	
	// complex components
	Kai.addComponent(this, ComponentDef.OCAN_CIRCLE, sharedAttr); // view
	Kai.addComponent(this, ComponentDef.RADIAL_COLLIDER2, sharedAttr); // body
	
};


Circle.prototype = {
	constructor: Circle,
	
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
		Kai.removeComponent(this, ComponentDef.OCAN_CIRCLE);
		Kai.removeComponent(this, ComponentDef.RADIAL_COLLIDER2);
		
		// null references
		this.position = null;
		this.velocity = null;
	}
	
};

return Circle;

});