define(function(require) {
	
// imports
var Kai = require('core/Kai');
var ComponentDef = require('components/ComponentDef');
var MathTools = require('math/MathTools');

// constructor
var Thing = function(posx, posy) {
	require('core/Base').call(this);
	
	// attributes
	this.speed = 1;
	
	// base components
	this.position = new Vec2(posx, posy);
	this.velocity = new Vec2(MathTools.random(this.speed), MathTools.random(this.speed));
	
	// complex components
	Kai.addComponent(this, ComponentDef.THING, {foo:2});
	
	console.log(this.componentThing);
};


Thing.prototype = {
	constructor: Thing,
	
	/*-------------------------------------------------------------------------------
									PUBLIC
	-------------------------------------------------------------------------------*/
	
	dispose: function() {
		// remove signal callbacks
		
		// dispose components
		Kai.removeComponent(this, ComponentDef.THING);
		
		// null references
		this.position = null;
		this.velocity = null;
	},
	
	/*-------------------------------------------------------------------------------
									PRIVATE: EVENTS
	-------------------------------------------------------------------------------*/
	
	_signalCallback: function() {
		
	}
	
};

return Thing;

});