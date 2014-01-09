/**
 * All game objects must extend this, since many core components assume these properties exist on everything.
 */
define(function() {
	var Base = function() {
		// source: http://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
		this.uniqueId = Math.random().toString(36).slice(2) + Date.now();
		this.active = false;
	};
	return Base;
});