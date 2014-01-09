define(function(require) {
	
// imports
var Kai = require('core/Kai');
var Tools = require('utils/Tools');

// constructor
var OCANCircle = function(entity, settings) {
	// augment with Base
	require('core/Base').call(this);
	
	// attributes
	this.radius = 25;
	
	// attribute override
	Tools.merge(this, settings);
	
	// private properties
	this._entity = entity;
	this._display = Kai.view.display.arc({
		x: entity.position.x,
		y: entity.position.y,
		start: 0,
		end: 360,
		radius: this.radius,
		fill: '#079'
	});
	
	// prerequisite components
	this.position = entity.position;
	
	// init
	Kai.view.addChild(this._display);
};

// required statics for component system
OCANCircle.accessor = 'view'; // property name as it sits on an entity
OCANCircle.className = 'OCAN_CIRCLE'; // name of component on the ComponenDef object
OCANCircle.priority = 10; // general position in the engine's component array; highest updated first


OCANCircle.prototype = {
	constructor: OCANCircle,
	
	reset: function() {
		this.active = true;
	},
	
	update: function() {
		this._display.x = this.position.x;
		this._display.y = this.position.y;
	},
	
	dispose: function() {
		Kai.view.removeChild(this._display);
		
		// null references
		this._entity = null;
		this.position = null;
		this._display = null;
	}
};

return OCANCircle;

});