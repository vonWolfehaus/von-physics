define(function(require) {
	
// imports
var Kai = require('core/Kai');
var Tools = require('utils/Tools');

// constructor
var OCANSquare = function(entity, settings) {
	// augment with Base
	require('core/Base').call(this);
	
	// attributes
	this.width = 50;
	this.height = 50;
	
	// attribute override
	Tools.merge(this, settings);
	
	// private properties
	this._entity = entity;
	this._display = Kai.view.display.rectangle({
		x: entity.position.x,
		y: entity.position.y,
		origin: { x: 'center', y: 'center' },
		width: this.width,
		height: this.height,
		fill: '#079',
		// stroke: '5px #079',
		join: 'round'
	});
	
	// prerequisite components
	this.position = entity.position;
	
	// init
	Kai.view.addChild(this._display);
};

// required statics for component system
OCANSquare.accessor = 'view'; // property name as it sits on an entity
OCANSquare.className = 'OCAN_SQUARE'; // name of component on the ComponenDef object
OCANSquare.priority = 10; // general position in the engine's component array; highest updated first


OCANSquare.prototype = {
	constructor: OCANSquare,
	
	reset: function() {
		
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

return OCANSquare;

});