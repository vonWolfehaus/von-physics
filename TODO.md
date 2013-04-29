# What's next?

Currently I'm stealing from two different guys and while their algorithms are similar, their implementations are a bit different for circle collision resolution. The balls guy only uses an MTD while the tutsplus guy uses a manifold.

* try the tutsplus version of ball reaction

## 3js adaptation

Move into the 3rd dimension.
* convert equations to 3d
* create an abstraction class that holds AABBs
* add dynamic objects to the scene
* add a player-controlled object
* have a separate array for voxels, with inlined collision (use a single AABB that gets repositioned accordingly)