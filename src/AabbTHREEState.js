define(function(require) {

// imports
require('src/lib/three.min.js');

var Kai = require('core/Kai');

// var Collision = require('physics/Physics3');

var World = require('entities/World');
var Box = require('entities/Box3');

var AabbTHREEState = function() {
	this.objects = [];
	this.player = null;
	this.renderer = null;
	
	this.boxSize = 50;
	
	this.scene = null;
	this.raycaster = null;
	this.camera = null;
	this.projector = null;
	
	this.plane = null;
	this.intersector = null;
	this.normalMatrix = null;
	this.tmpVec = null;
	this.voxelPosition = null;
	this.rollOverMesh = null;
	this.cubeGeo = null;
	this.cubeMaterial = null;
	
	this.mouse2D = null;
	this.theta = 0;
};

AabbTHREEState.prototype = {
	
	preload: function () {
		// Kai.load.image('box-texture', 'img/square-outline-textured.png');
	},

	create: function () {
		World.width = 100;
		World.height = 100;
		World.depth = 100;
		// console.log(World);
		this.objects = [];
		this.rebuildCanvas();
		var canvas = document.getElementsByTagName('canvas')[0];
		
		this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
		this.camera.position.y = 800;
		
		/*this.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 100, 3000 );
		this.camera.position.x = 200;
		this.camera.position.y = 900;
		this.camera.position.z = 100;*/

		this.scene = new THREE.Scene();

		// roll-over helpers
		var rollOverGeo = new THREE.CubeGeometry( this.boxSize, this.boxSize, this.boxSize );
		var rollOverMaterial = new THREE.MeshBasicMaterial({color: 0xff0000, opacity: 0.5, transparent: true});
		this.rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
		this.scene.add(this.rollOverMesh);
		
		// picking
		this.projector = new THREE.Projector();
		
		this.voxelPosition = new THREE.Vector3();
		this.tmpVec = new THREE.Vector3();
		this.normalMatrix = new THREE.Matrix3();

		// grid
		var size = this.boxSize * 10;
		var geometry = new THREE.Geometry();
		for (var i = -size; i <= size; i += this.boxSize) {
			geometry.vertices.push(new THREE.Vector3(-size, 0, i));
			geometry.vertices.push(new THREE.Vector3(size, 0, i));

			geometry.vertices.push(new THREE.Vector3(i, 0, -size));
			geometry.vertices.push(new THREE.Vector3(i, 0, size));
		}

		var material = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
		var line = new THREE.Line( geometry, material );
		line.type = THREE.LinePieces;
		this.scene.add( line );

		this.plane = new THREE.Mesh( new THREE.PlaneGeometry( 1000, 1000 ), new THREE.MeshBasicMaterial() );
		this.plane.rotation.x = -Math.PI / 2;
		this.plane.visible = false;
		this.scene.add(this.plane );

		this.mouse2D = new THREE.Vector3(0, 10000, 0.5);

		// Lights
		var ambientLight = new THREE.AmbientLight( 0x606060 );
		this.scene.add( ambientLight );

		var directionalLight = new THREE.DirectionalLight( 0xffffff );
		directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
		this.scene.add( directionalLight );

		this.renderer = new THREE.WebGLRenderer({
			canvas: canvas,
			antialias: true
		});
		this.renderer.setClearColor( 0xf0f0f0 );
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		
		// Action
		Kai.view = this.scene;
		Kai.renderHook = this.draw.bind(this);
		
		Kai.mouse.onDown.add(this.mouseDown, this);
		Kai.keys.onDown.add(this.keyDown, this);
		// Kai.keys.onUp.add(this.keyUp, this);
		
		this.player = new Box(new THREE.Vector3());
		this.player.position.y = size;
		this.player.reset();
		this.objects.push(this.player);
	},
	
	keyDown: function(key) {
		switch (key) {
			case Kai.keys.W:
				this.player.velocity.z = 10;
				break;
			case Kai.keys.S:
				this.player.velocity.z = 10;
				break;
			case Kai.keys.A:
				this.player.velocity.x = 10;
				break;
			case Kai.keys.D:
				this.player.velocity.x = 10;
				break;
			case Kai.keys.SPACEBAR:
				this.player.velocity.y = -50;
				break;
		}
	},
	
	keyUp: function(key, duration) {
		switch (key) {
			case Kai.keys.W:
				this.player.velocity.z = 0;
				break;
			case Kai.keys.S:
				this.player.velocity.z = 0;
				break;
			case Kai.keys.A:
				this.player.velocity.x = 0;
				break;
			case Kai.keys.D:
				this.player.velocity.x = 0;
				break;
		}
	},
	
	mouseDown: function(position) {
		var intersects = this.raycaster.intersectObjects(this.scene.children);
		
		if (intersects.length > 0) {
			this.intersector = this.getRealIntersector(intersects);
			
			// delete cube
			if (Kai.keys.ctrl) {
				if (this.intersector.object != this.plane) {
					this.scene.remove(this.intersector.object);
				}
			
			// create cube
			} else {
				this.intersector = this.getRealIntersector(intersects);
				this.setVoxelPosition(this.intersector);
				
				var voxel = new Box(this.voxelPosition, this.boxSize);
				voxel.reset();
				this.objects.push(voxel);
			}
		}
		// console.log(this.scene);
	},
	
	update: function () {
		var i, j, a, b, m;
		
		this.mouse2D.x = (Kai.mouse.position.x / window.innerWidth) * 2 - 1;
		this.mouse2D.y = -(Kai.mouse.position.y / window.innerHeight) * 2 + 1;
		
		if (Kai.keys.shift) {
			this.theta += this.mouse2D.x * 1.5;
		}

		this.raycaster = this.projector.pickingRay(this.mouse2D.clone(), this.camera);

		var intersects = this.raycaster.intersectObjects(this.scene.children);

		if (intersects.length > 0) {
			this.intersector = this.getRealIntersector(intersects);
			
			if (this.intersector) {
				this.setVoxelPosition(this.intersector);
				this.rollOverMesh.position = this.voxelPosition;
			}
		}
		
		this.camera.position.x = 1400 * Math.sin(this.theta * 0.017453292); // deg to rad
		this.camera.position.z = 1400 * Math.cos(this.theta * 0.017453292); // THREE.Math.degToRad() is wasteful!

		this.camera.lookAt(this.scene.position);
		
		// brute force collision check
		/*for (i = 0; i < (this.total-1); ++i) {
			a = this.objects[i].body;
			
			for (j = i + 1; j < this.total; ++j) {
				b = this.objects[j].body;
				
				m = Collision.separateAABBvsAABB(a, b);
				if (m) {
					Collision.resolve(a, b, m);
				}
			}
		}*/
		
	},
	
	draw: function() {
		this.renderer.render(this.scene, this.camera);
	},
	
	setVoxelPosition: function(intersector) {
		this.normalMatrix.getNormalMatrix(intersector.object.matrixWorld);
		this.tmpVec.copy(intersector.face.normal);
		this.tmpVec.applyMatrix3(this.normalMatrix).normalize();
		this.voxelPosition.addVectors(intersector.point, this.tmpVec);
		this.voxelPosition.x = Math.floor(this.voxelPosition.x / 50) * 50 + 25;
		this.voxelPosition.y = Math.floor(this.voxelPosition.y / 50) * 50 + 25;
		this.voxelPosition.z = Math.floor(this.voxelPosition.z / 50) * 50 + 25;
	},
	
	getRealIntersector: function(intersects) {
		var i, intersector;
		for (i = 0; i < intersects.length; i++) {
			intersector = intersects[i];
			if (intersector.object != this.rollOverMesh) {
				return intersector;
			}
		}
		return null;
	},
	
	rebuildCanvas: function() {
		// since we're coming from or going to a 2d context, we need to nuke the canvas
		var canvas = document.getElementsByTagName('canvas')[0];
		document.body.removeChild(canvas);
		canvas = document.createElement('canvas');
		document.body.insertBefore(canvas, document.getElementById('debug'));
	},
	
	dispose: function() {
		var i, o;
		for (i = 0; i < this.total; i++) {
			o = this.objects[i];
			o.dispose();
		}
		this.objects.length = 0;
		Kai.mouse.onDown.remove(this.mouseDown, this);
		
		Kai.view = null;
		this.scene = null;
		this.raycaster = null;
		this.camera = null;
		this.projector = null;
		
		this.plane = null;
		this.intersector = null;
		this.normalMatrix = null;
		this.tmpVec = null;
		this.voxelPosition = null;
		this.rollOverMesh = null;
		this.cubeGeo = null;
		this.cubeMaterial = null;
		
		this.mouse2D = null;
		this.rebuildCanvas();
	}
};

return AabbTHREEState;

});