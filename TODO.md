# What's next?

Currently I'm stealing from two different guys and while their algorithms are similar, their implementations are a bit different for circle collision resolution. The balls guy only uses an MTD while the tutsplus guy uses a manifold.

* try the tutsplus version of ball reaction

## 3js adaptation

Move into the 3rd dimension.
* convert equations to 3d
* create an abstraction class that holds AABBs and 3d stuffs
* add dynamic objects to the scene
* add a player-controlled object
* have a separate array for voxels, with inlined collision (use a single AABB that gets repositioned accordingly)

maybe the best approach is a hybrid. position and velocity are vectors now, so those need to be an integral part of the object. physics and collision are done outside objects anyway, so a collisionHull property would be perfect--just define it once... although we'd have to update it according to current position (update its min/max).

fuck. i really like mixing things, and flat, network-like architectures. but the overhead is too high (update each component of each entity in turn??) and it will complicate things a bit. i can't think of a component, besides AI behaviors, that would work better as such. AI is a completely different thing anyway, and will be component-based. for the rest, well... no.