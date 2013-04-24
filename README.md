# Physics

I fucking hate physics. That's why I had to write the tiniest library possible--so I didn't ever have to do this shit ever again!

These people fucking love physics, and they actually know what they're doing:
* My implementation is taken from: http://gamedev.tutsplus.com/tutorials/implementation/create-custom-2d-physics-engine-aabb-circle-impulse-resolution
* And for the circles, a combination of the above and: http://bluethen.com/wordpress/index.php/processing-app/do-you-like-balls/
* It's so simple I don't fucking understand: http://codepen.io/stuffit/pen/fhjvk (from this dude: http://lonely-pixel.com/)

Add gravity to any vector-based page (uncomment it in geom/*.js) and you'll see multi-body stuff just doesn't work. That shit is WAY more complicated. You'll see this isn't a problem with the balls because they're moved according to their MTD, while the AABB example only tries to correct for floating point error, which isn't enough.

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