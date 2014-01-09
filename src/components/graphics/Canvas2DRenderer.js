define(function(require) {
	
// imports
var Kai = require('core/Kai');
// var Tools = require('utils/Tools');
var DOMTools = require('utils/DOMTools');

/**
 * @constructor
 * @param {HTMLElement} [canvasId=null] - The element id of the primary canvas element.
 * @param {int} [width] - The width of the canvas in pixels.
 * @param {int} [height] - The height of the canvas in pixels.
 */
var Canvas2DRenderer = function(canvasId, width, height) {
	// attributes
	this.canvas = null;
	this.ctx = null;
	
	Kai.width = width || null;
	Kai.height = height || null;
	
	var canvas;
	if (!!canvasId) {
		// use the canvas user gave us
		canvas = document.getElementById(this.canvas);
		// if user provided an id, assume they already specified dimensions in the markup too
		if (!Kai.width || !Kai.height) {
			Kai.width = canvas.width;
			Kai.height = canvas.height;
		}
		
	} else {
		// no? get the first canvas in the document
		canvas = document.getElementsByTagName('canvas')[0];
		if (!canvas) {
			// still nothing? make our own then
			canvas = document.createElement('canvas');
			document.body.appendChild(canvas);
		}
		// if we're using an anonymous canvas, let's assume full view
		if (!Kai.width || !Kai.height) {
			Kai.width = window.innerWidth;
			Kai.height = window.innerHeight;
		}
	}
	
	canvas.width = Kai.width;
	canvas.height = Kai.height;
	
	this.canvas = canvas;
	
	var debugCanvas = document.getElementById('debug');
	
	Kai.debugCtx = debugCanvas.getContext('2d');
	
	DOMTools.copySpatial(canvas, debugCanvas);
};

Canvas2DRenderer.prototype = {
	constructor: Canvas2DRenderer,
	
	reset: function() {
		this.ctx = this.canvas.getContext('2d');
	},
	
	update: function() {
		
	},
	
	dispose: function() {
		this.canvas = null;
		this.ctx = null;
	}
};

return Canvas2DRenderer;

});