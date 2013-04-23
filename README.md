# Physics

I fucking hate physics. See Fiddle of Fail: http://jsfiddle.net/vJtUr/

These people don't, and they know what they're doing:
* Simplest I could find: http://bluethen.com/wordpress/index.php/processing-app/do-you-like-balls/
* Simple but it doesn't work, still here for posterity: http://gamedev.tutsplus.com/tutorials/implementation/create-custom-2d-physics-engine-aabb-circle-impulse-resolution

Other neat things that deal with vectors and or physics:
* Flocking done well: http://bluethen.com/wordpress/index.php/processing-app/flock-ai/

## Full engines with readable code

* Cannonjs: https://github.com/schteppe/cannon.js
* Coffee physics: https://github.com/soulwire/Coffee-Physics/blob/master/source/behaviour/Collision.coffee
* Impulse: https://github.com/dubrowgn/Impulse.js/blob/master/src/Shape2D.js
* microphysics: https://github.com/jeromeetienne/microphysics.js

## Algorithms

Would this work? Source: http://gamedev.stackexchange.com/questions/53669/help-with-aabb-collision-detection

	Vector2 Diff = Obj1.getPosition() - Obj2.getPosition();
	Vector2 Normal = Diff.normalize()

	Vector2 AbsNormal = new Vector2(abs(Normal.x), abs(Normal.y));

	if (AbsNormal.x > AbsNormal.y) {
		// code for horizontal collision
	} else {
		// code for vertical collision
	}