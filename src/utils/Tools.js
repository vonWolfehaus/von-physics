
// JavaScript utility functions

define(function() {
	return {
		isPlainObject: function(obj) {
			// Not plain objects:
			// - Any object or value whose internal [[Class]] property is not "[object Object]"
			// - DOM nodes
			// - window
			if (typeof(obj) !== "object" || obj.nodeType || obj === obj.window) {
				return false;
			}

			// Support: Firefox <20
			// The try/catch suppresses exceptions thrown when attempting to access
			// the "constructor" property of certain host objects, ie. |window.location|
			// https://bugzilla.mozilla.org/show_bug.cgi?id=814622
			try {
				if (obj.constructor && !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
					return false;
				}
			} catch (e) {
				return false;
			}

			// If the function hasn't returned already, we're confident that
			// |obj| is a plain object, created by {} or constructed with new Object
			return true;
		},
		
		merge: function() {
			/*host, augment var prop;
			for (prop in augment) {
				if (!host.hasOwnProperty(prop)) {
					host[prop] = augment[prop];
				}
			}
			
			return host;*/
			var options, name, src, copy, copyIsArray, clone,
				target = arguments[0] || {},
				i = 1,
				length = arguments.length,
				deep = false;

			// Handle a deep copy situation
			if (typeof target === "boolean")
			{
				deep = target;
				target = arguments[1] || {};
				// skip the boolean and the target
				i = 2;
			}

			// extend Phaser if only one argument is passed
			if (length === i)
			{
				target = this;
				--i;
			}

			for ( ; i < length; i++ )
			{
				// Only deal with non-null/undefined values
				if ((options = arguments[i]) != null)
				{
					// Extend the base object
					for (name in options)
					{
						src = target[name];
						copy = options[name];

						// Prevent never-ending loop
						if (target === copy)
						{
							continue;
						}

						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (this.isPlainObject(copy) || (copyIsArray = Array.isArray(copy))))
						{
							if (copyIsArray)
							{
								copyIsArray = false;
								clone = src && Array.isArray(src) ? src : [];
							}
							else
							{
								clone = src && this.isPlainObject(src) ? src : {};
							}

							// Never move original objects, clone them
							target[name] = this.extend(deep, clone, copy);

						// Don't bring in undefined values
						}
						else if (copy !== undefined)
						{
							target[name] = copy;
						}
					}
				}
			}

			// Return the modified object
			return target;
		}
	};
});