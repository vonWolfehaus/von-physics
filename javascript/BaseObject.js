var von = von || {};
von.BaseObject = function() {
	// components
	this.aabb = null;
	this.motion = null;
	this.graphics = null;
	
	this.type = 'BaseObject';
	
	// internal
	var _self = this;
	
	this.addComponent = function(componentName) {
		if (typeof componentName !== )
		var factory = 
		von.ComponentList[componentName].call(this);
	};
	
	this.addAABB = function() {
		cubeGeo = new THREE.CubeGeometry( 50, 50, 50 );
		cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xfeb74c, ambient: 0x00ff80, shading: THREE.FlatShading, map: THREE.ImageUtils.loadTexture( "textures/square-outline-textured.png" ) } );
		cubeMaterial.ambient = cubeMaterial.color;
	};
	
	this.addGraphics = function() {
		
	};
	
	this.addMotion = function() {
		
	};
};