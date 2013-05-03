var von = von || {};
von.GameObject = function() {
	this.collisionHull = null;
	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	
	this.type = 'BaseObject';
	
	// internal
	var _self = this;
	
	
	this.addAABB = function() {
		cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "textures/square-outline-textured.png" ) } );
		cubeMaterial.ambient = cubeMaterial.color;
	};
	
};