# Physics

I fucking hate physics. See Fiddle of Fail: http://jsfiddle.net/vJtUr/

These people don't, and they know what they're doing:
* Simplest I could find: http://bluethen.com/wordpress/index.php/processing-app/do-you-like-balls/

Other neat things that deal with vectors and or physics:
* Flocking done well: http://bluethen.com/wordpress/index.php/processing-app/flock-ai/

## Full engines with readable code

* Cannonjs: https://github.com/schteppe/cannon.js
* Coffee physics: https://github.com/soulwire/Coffee-Physics/blob/master/source/behaviour/Collision.coffee

## Algorithms

Would this work? Source: http://gamedev.stackexchange.com/questions/53669/help-with-aabb-collision-detection
	Vector2 Diff = Obj1.getPosition() - Obj2.getPosition();
	Vector2 Normal = Diff.normalize()

	Vector2 AbsNormal = new Vector2(abs(Normal.x), abs(Normal.y)); // (A)

	if (AbsNormal.x > AbsNormal.y) {
		// code for horizontal collision
	} else {
		// code for vertical collision
	}