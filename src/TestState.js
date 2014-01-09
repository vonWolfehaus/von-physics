define(function(require) {

// imports
var Kai = require('core/Kai');
var TemplateEntity = require('./TemplateEntity');

var TestState = function() {
	
	this.things = [];
	// console.log('TestState');
};

TestState.prototype = {
	
	preload: function () {
		// console.log('[TestState.preload]');
		// Kai.load.image('preloaderBackground', 'images/preloader_background.jpg');
		// Kai.load.image('preloaderBar', 'images/preloadr_bar.png');
		
	},

	create: function () {
		console.log('[TestState.create]');
		var debugCanvas = document.getElementById('debug');
		debugCanvas.width = window.innerWidth;
		debugCanvas.height = window.innerHeight;
		
		
		Kai.debugCtx = debugCanvas.getContext('2d');
		
		var thing = new TemplateEntity(0, 0, {ohman:false});
		console.log(thing);
		// thing.update();
		console.log('[TestState.create] is running');
	},
	
	update: function () {
		
	},
	
	draw: function () {
		
	},
	
	dispose: function() {
		console.log('[TestState.dispose]');
	}
};

return TestState;

});