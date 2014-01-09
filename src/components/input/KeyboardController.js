define(['core/Kai'], function(Kai) {
/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2013 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */
var KeyboardController = function() {
	this.key = -1;
	
	this.onDown = new Signal();
	this.onUp = new Signal();
	
	this.shift = false;
	this.ctrl = false;
	
	this._keys = {};
	this._prev = null;
	// this._capture = {};
	
	document.addEventListener('keydown', this._processDown.bind(this), false);
	document.addEventListener('keyup', this._processUp.bind(this), false);
};

KeyboardController.prototype = {
	
	_processDown: function(evt) {
		var key = this._keys[evt.keyCode];
		// evt.preventDefault();
		if (Kai.inputBlocked || this.key === this._prev) {
			return;
		}
		
		this.shift = !!evt.shiftKey;
		this.ctrl = !!evt.ctrlKey;
		this.key = evt.keyCode;
		
		if (key && key.isDown) {
			//  Key already down and still down, so update
			this._keys[evt.keyCode].duration = performance.now() - key.timeDown;
			
		} else {
			if (!key) {
				//  Not used this key before, so register it
				this._keys[evt.keyCode] = {
					isDown: true,
					timeDown: performance.now(),
					timeUp: 0,
					duration: 0
				};
			} else {
				//  Key used before but freshly down
				this._keys[evt.keyCode].isDown = true;
				this._keys[evt.keyCode].timeDown = performance.now();
				this._keys[evt.keyCode].duration = 0;
			}
		}
		
		this.onDown.dispatch(this.key);
		this._prev = this.key;
	},
	
	_processUp: function(evt) {
		// evt.preventDefault();
		if (Kai.inputBlocked) {
			return;
		}
		
		this.key = -1;
		this.shift = false;
		this.ctrl = false;
		
		if (this._keys[evt.keyCode]) {
			this._keys[evt.keyCode].isDown = false;
			this._keys[evt.keyCode].timeUp = performance.now();
		} else {
			//  Not used this key before, so register it
			this._keys[evt.keyCode] = {
				isDown: false,
				timeDown: performance.now(),
				timeUp: performance.now(),
				duration: 0
			};
		}
		
		this.onUp.dispatch(evt.keyCode, this._keys[evt.keyCode].timeUp - this._keys[evt.keyCode].timeDown);
	},
	
	/**
	 * Reset the "isDown" state of all keys.
	 * @method Phaser.Keyboard#reset
	 */
	reset: function() {
		for (var key in this._keys) {
			this._keys[key].isDown = false;
		}
	},

	/**
	 * Returns the "just pressed" state of the key. Just pressed is considered true if the key was pressed down within the duration given (default 250ms)
	 * @param {number} keycode - The keycode of the key to remove, i.e. Kai.keys.UP or Kai.keys.SPACE_BAR
	 * @param {number} [duration=100] - The duration below which the key is considered as being just pressed.
	 * @return {boolean} True if the key is just pressed otherwise false.
	 */
	justPressed: function(keycode, duration) {
		if (typeof duration === 'undefined') {
			duration = 100;
		}

		if (this._keys[keycode] && this._keys[keycode].isDown && this._keys[keycode].duration < duration) {
			return true;
		}

		return false;

	},

	/**
	 * Returns the "just released" state of the Key. Just released is considered as being true if the key was released within the duration given (default 250ms)
	 * @method Phaser.Keyboard#justPressed
	 * @param {number} keycode - The keycode of the key to remove, i.e. Kai.keys.UP or Kai.keys.SPACE_BAR
	 * @param {number} [duration=100] - The duration below which the key is considered as being just released.
	 * @return {boolean} True if the key is just released otherwise false.
	 */
	justReleased: function(keycode, duration) {
		if (typeof duration === 'undefined') {
			duration = 100; 
		}
		
		if (this._keys[keycode] && this._keys[keycode].isDown === false && (performance.now() - this._keys[keycode].timeUp < duration)) {
			return true;
		}

		return false;

	},
	
	/**
	 * Returns true of the key is currently pressed down. Note that it can only detect key presses on the web browser.
	 * @param {number} keycode - The keycode of the key to remove, i.e. Kai.keys.UP or Kai.keys.SPACE_BAR
	 * @return {boolean} True if the key is currently down.
	 */
	isDown: function (keycode) {
		if (this._keys[keycode]) {
			return this._keys[keycode].isDown;
		}
		return false;
	},
	
	A: "A".charCodeAt(0),
	B: "B".charCodeAt(0),
	C: "C".charCodeAt(0),
	D: "D".charCodeAt(0),
	E: "E".charCodeAt(0),
	F: "F".charCodeAt(0),
	G: "G".charCodeAt(0),
	H: "H".charCodeAt(0),
	I: "I".charCodeAt(0),
	J: "J".charCodeAt(0),
	K: "K".charCodeAt(0),
	L: "L".charCodeAt(0),
	M: "M".charCodeAt(0),
	N: "N".charCodeAt(0),
	O: "O".charCodeAt(0),
	P: "P".charCodeAt(0),
	Q: "Q".charCodeAt(0),
	R: "R".charCodeAt(0),
	S: "S".charCodeAt(0),
	T: "T".charCodeAt(0),
	U: "U".charCodeAt(0),
	V: "V".charCodeAt(0),
	W: "W".charCodeAt(0),
	X: "X".charCodeAt(0),
	Y: "Y".charCodeAt(0),
	Z: "Z".charCodeAt(0),
	ZERO: "0".charCodeAt(0),
	ONE: "1".charCodeAt(0),
	TWO: "2".charCodeAt(0),
	THREE: "3".charCodeAt(0),
	FOUR: "4".charCodeAt(0),
	FIVE: "5".charCodeAt(0),
	SIX: "6".charCodeAt(0),
	SEVEN: "7".charCodeAt(0),
	EIGHT: "8".charCodeAt(0),
	NINE: "9".charCodeAt(0),
	NUMPAD_0: 96,
	NUMPAD_1: 97,
	NUMPAD_2: 98,
	NUMPAD_3: 99,
	NUMPAD_4: 100,
	NUMPAD_5: 101,
	NUMPAD_6: 102,
	NUMPAD_7: 103,
	NUMPAD_8: 104,
	NUMPAD_9: 105,
	NUMPAD_MULTIPLY: 106,
	NUMPAD_ADD: 107,
	NUMPAD_ENTER: 108,
	NUMPAD_SUBTRACT: 109,
	NUMPAD_DECIMAL: 110,
	NUMPAD_DIVIDE: 111,
	F1: 112,
	F2: 113,
	F3: 114,
	F4: 115,
	F5: 116,
	F6: 117,
	F7: 118,
	F8: 119,
	F9: 120,
	F10: 121,
	F11: 122,
	F12: 123,
	F13: 124,
	F14: 125,
	F15: 126,
	COLON: 186,
	EQUALS: 187,
	UNDERSCORE: 189,
	QUESTION_MARK: 191,
	TILDE: 192,
	OPEN_BRACKET: 219,
	BACKWARD_SLASH: 220,
	CLOSED_BRACKET: 221,
	QUOTES: 222,
	BACKSPACE: 8,
	TAB: 9,
	CLEAR: 12,
	ENTER: 13,
	SHIFT: 16,
	CONTROL: 17,
	ALT: 18,
	CAPS_LOCK: 20,
	ESC: 27,
	SPACEBAR: 32,
	PAGE_UP: 33,
	PAGE_DOWN: 34,
	END: 35,
	HOME: 36,
	LEFT: 37,
	UP: 38,
	RIGHT: 39,
	DOWN: 40,
	INSERT: 45,
	DELETE: 46,
	HELP: 47,
	NUM_LOCK: 144
	
};

return KeyboardController;

});