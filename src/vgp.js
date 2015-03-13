(function(){
	var root = this;
	
	var vgp = {
		Boundary: {
			BOUNDARY_DISABLE: 'disable',
			BOUNDARY_BOUNCE: 'bounce',
			BOUNDARY_WRAP: 'wrap',
		},
		Type: {
			AABB2: 'AABB2',
			AABB3: 'AABB3',
			CIRCLE: 'Circle',
			SPHERE: 'Sphere'
		}
	};
	
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = vgp;
		}
		exports.vgp = vgp;
	} else if (typeof define !== 'undefined' && define.amd) {
		define(vgp);
	} else {
		root.vgp = vgp;
	}
}).call(this);