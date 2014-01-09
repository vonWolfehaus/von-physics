define(function(require) {

// imports
var Kai = require('core/Kai');

var TemplateState = function() {
	// add properties
};

TemplateState.prototype = {
	
	preload: function () {
		// load stuff...
		
		Kai.load.image('preloaderBackground', 'images/preloader_background.jpg');
	},

	create: function () {
		// instantiate entities stuff here
	},
	
	update: function () {
		
	},
	
	draw: function () {
		
	},
	
	dispose: function() {
		// null references and dispose anything created
	}
};

return TemplateState;

});