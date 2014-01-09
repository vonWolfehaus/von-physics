define(['core/Kai'], function(Kai) {

return function MouseController() {
	
	this.position = new Vec2();
	
	this.onDown = new Signal();
	this.onUp = new Signal();
	
	this.down = false;
	this.shift = false;
	this.ctrl = false;
	
	var _self = this,
		_downPrev = false;
	
	function onDown(evt) {
		if (Kai.inputBlocked) {
			return;
		}
		
		_self.position.x = evt.pageX;
		_self.position.y = evt.pageY;
		_self.down = true;
		
		_self.shift = !!evt.shiftKey;
		_self.ctrl = !!evt.ctrlKey;
		
		_self.onDown.dispatch(_self.position);
	}
	
	function onUp(evt) {
		if (!_self.down || Kai.inputBlocked) {
			return;
		}
		
		_self.position.x = evt.pageX;
		_self.position.y = evt.pageY;
		_self.down = false;
		
		_self.shift = !!evt.shiftKey;
		_self.ctrl = !!evt.ctrlKey;
		
		_self.onUp.dispatch(_self.position);
	}
	
	function onMove(evt) {
		evt.preventDefault();
		
		_self.position.x = evt.pageX;
		_self.position.y = evt.pageY;
		
		_self.shift = !!evt.shiftKey;
		_self.ctrl = !!evt.ctrlKey;
	}
	
	function onContext(evt) {
		evt.preventDefault();
		return false;
	}
	
	(function init() {
		document.addEventListener('mousedown', onDown, false);
		document.addEventListener('mouseup', onUp, false);
		document.addEventListener('mouseout', onUp, false);
		document.addEventListener('mousemove', onMove, false);
		document.addEventListener('contextmenu', onContext, false);
	}());
	
} // class

});