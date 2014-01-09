/**
 * requirejs passes in the loaded classes into the callback's arguments pseudo-array,
 * so we take advantage of that and simply attach static properties to all components
 * which allows us to loop through each class and expose those static properties for
 * use at runtime by entities.
 *
 * The exported object is set to Kai.components, which the Engine grabs and loops through,
 * updating anything in it. A lot of assumptions must be made for this to work, so I
 * created the Templates to handle that (in the root folder).
 *
 * @author Corey Birnbaum
 */
define(['components/graphics/OCAN.Square',
	'components/physics/AABB2',
	'components/graphics/OCAN.Circle',
	'components/physics/RadialCollider2',
	'components/graphics/THREE.Cube',
	'components/physics/AABB3'],
	
	function() {
	
	var i, len = arguments.length,
		comp,
		exportedComponents = {};
	
	for (i = 0; i < len; i++) {
		comp = arguments[i];
		exportedComponents[comp.className] = {
			accessor: comp.accessor,
			proto: comp,
			index: i
		};
	}
	
	return exportedComponents;

});
