
define(function(require) {

// imports
var Kai = require('core/Kai');
// var Tower = require('core/CommTower');
var StateManager = require('core/StateManager');

var RAF = require('utils/RequestAnimationFrame');
var Loader = require('utils/Loader');
var Cache = require('utils/Cache');

var MouseController = require('components/input/MouseController');
var KeyboardController = require('components/input/KeyboardController');

/**
 * This is where we watch for doc load, setup essential components, and run the main loop.
 * Essentially ties everything together.
 * 
 * @author Corey Birnbaum
 */
var Engine = function() {
	this.state = new StateManager();
	this.raf = new RAF(this);
	
	this._paused = false;
	
	// dom init
	var self = this;
	this._onInit = function () {
		return self.init();
	};
	
	if (document.readyState === 'complete' || document.readyState === 'interactive') {
		window.setTimeout(this._onInit, 0);
	} else {
		document.addEventListener('DOMContentLoaded', this._onInit, false);
		window.addEventListener('load', this._onInit, false);
	}
	
};


Engine.prototype = {
	constructor: Engine,
	
	init: function() {
		if (Kai.ready) {
			return;
		}

		if (!document.body) {
			window.setTimeout(this._onInit, 20);
			return;
		}
		
		console.log('[Engine.init] Ready');
		document.removeEventListener('DOMContentLoaded', this._onInit);
		window.removeEventListener('load', this._onInit);
		
		// init global components
		Kai.engine = this;
		Kai.mouse = new MouseController();
		Kai.keys = new KeyboardController();
		Kai.cache = new Cache();
		Kai.load = new Loader();
		
		Kai.ready = true;
		
		this.state.init();
		
		Kai.inputBlocked = false;
		
		this.raf.start();
	},
	
	/**
	 * Set the first state to be used when everything is ready.
	 */
	start: function(state) {
		if (Kai.ready) {
			// state init would have already been called in this case
			return;
		}
		this.state.switchState(state);
	},
	
	update: function() {
		var i, node, obj,
			list = Kai.components,
			len = list.length;
		
		if (this._paused) {
			// we check first because some states might simply be DOM only and not need this
			if (Kai.renderHook) {
				Kai.renderHook();
			}
			
		} else {
			// go through each list of components
			for (i = 0; i < len; i++) {
				if (!list[i]) continue;
				
				// and update each component within this list
				node = list[i].first;
				while (node) {
					obj = node.obj;
					if (obj.active) {
						obj.update();
					}
					node = node.next;
				}
			}
			
			if (this.state.ready) {
				// update the state now that all components are fresh
				this.state.update();
			}
			
			if (Kai.renderHook) {
				Kai.renderHook();
			}
		}

	},
	
	dispose: function() {
		// remove signal callbacks
		
		// dispose components
		
		// null references
	}
	
};

return Engine;

});