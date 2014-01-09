define(function(require) {

// imports
require('src/lib/ocanvas-2.5.1.min.js');

var Kai = require('core/Kai');

var Collision = require('physics/Physics2');

var World = require('entities/World');
var Circle = require('entities/Circle');

var Canvas2DRenderer = require('components/graphics/Canvas2DRenderer');

var RadialState = function() {
	this.objects = [];
	this.total = 12;
	this.renderer = null;
};

RadialState.prototype = {
	
	preload: function () {
		
	},

	create: function () {
		var i, o,
			tau = Math.PI * 2,
			a = 0, ao = tau / this.total,
			wx = 0, wy = 0;
		
		this.renderer = new Canvas2DRenderer();
		
		World.width = Kai.width;
		World.height = Kai.height - 100;
		wx = Kai.width/2;
		wy = Kai.height/2;
		
		Kai.view = oCanvas.create({
			canvas: this.renderer.canvas
		});
		
		for (i = 0; i < this.total; i++) {
			o = new Circle(Math.cos(a) * 200 + wx, Math.sin(a) * 200 + wy);
			o.reset();
			this.objects.push(o);
			a += ao;
		}
		
		Kai.renderHook = this.draw.bind(this);
		
		Kai.view.timeline.start();
	},
	
	update: function () {
		var i, j, a, b, m;
		Kai.debugCtx.clearRect(0, 0, Kai.width, Kai.height);
		
		// brute force collision check
		for (i = 0; i < (this.total-1); ++i) {
			a = this.objects[i].body;
			
			for (j = i + 1; j < this.total; ++j) {
				b = this.objects[j].body;
				
				m = Collision.separateCircleVsCircle(a, b);
				if (m) {
					Collision.resolve(a, b, m);
				}
			}
		}
	},
	
	draw: function () {
		Kai.view.redraw();
	},
	
	dispose: function() {
		var i, o;
		for (i = 0; i < this.total; i++) {
			o = this.objects[i];
			o.dispose();
		}
		this.objects.length = 0;
		
		Kai.view.timeline.stop();
		Kai.view.destroy();
	}
};

return RadialState;

});