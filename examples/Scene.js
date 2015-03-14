(function(){
var root = this;
/*
	Sets up and manages a THREEjs container, camera, and light, making it easy to get going.
	Also provides camera control.
	
	Assumes full screen.
 */
var Scene = function(sceneConfig, controlConfig) {
	var sceneSettings = {
		element: document.body,
		alpha: false,
		antialias: true,
		clearColor: '#fff',
		sortObjects: false,
		fog: null,
		light: new THREE.DirectionalLight(0xffffff),
		lightPosition: null,
		cameraType: 'PerspectiveCamera',
		cameraPosition: null // {x, y, z}
	};
	
	var controlSettings = {
		minDistance: 100,
		maxDistance: 1000,
		zoomSpeed: 2,
		noZoom: false
	};
	
	vgp.utils.merge(sceneSettings, sceneConfig);
	vgp.utils.merge(controlSettings, controlConfig);
	
	this.renderer = new THREE.WebGLRenderer({
		alpha: sceneSettings.alpha,
		antialias: sceneSettings.antialias
	});
	this.renderer.setClearColor(sceneSettings.clearColor, 0);
	this.renderer.sortObjects = sceneSettings.sortObjects;
	
	this.width = window.innerWidth;
	this.height = window.innerHeight;
	
	this.orthoZoom = 4;
	
	this.container = new THREE.Scene();
	this.container.fog = sceneSettings.fog;
	
	this.container.add(new THREE.AmbientLight(0xbbbbbb));
	
	if (!sceneSettings.lightPosition) {
		sceneSettings.light.position.set(2, 3, 1).normalize();
	}
	this.container.add(sceneSettings.light);
	this.light = sceneSettings.light;
	
	if (sceneSettings.cameraType === 'OrthographicCamera') {
		var width = window.innerWidth / this.orthoZoom;
		var height = window.innerHeight / this.orthoZoom;
		this.camera = new THREE.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, 1, 5000);
	}
	else {
		this.camera = new THREE.PerspectiveCamera(50, this.width / this.height, 1, 5000);
	}
	
	this.contolled = !!controlConfig;
	if (this.contolled) {
		this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
		this.controls.minDistance = controlSettings.minDistance;
		this.controls.maxDistance = controlSettings.maxDistance;
		this.controls.zoomSpeed = controlSettings.zoomSpeed;
		this.controls.noZoom = controlSettings.noZoom;
	}
	
	if (sceneSettings.cameraPosition) {
		this.camera.position.copy(sceneSettings.cameraPosition);
	}
	
	window.addEventListener('resize', function onWindowResize() {
		this.width = window.innerWidth;
		this.height = window.innerHeight;
		if (this.camera.type === 'OrthographicCamera') {
			var width = this.width / this.orthoZoom;
			var height = this.height / this.orthoZoom;
			this.camera.left = width / -2;
			this.camera.right = width / 2;
			this.camera.top = height / 2;
			this.camera.bottom = height / -2;
		}
		else {
			this.camera.aspect = this.width / this.height;
		}
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(this.width, this.height);
	}.bind(this), false);
	
	this.attachTo(sceneSettings.element);
};

Scene.prototype = {
	
	enableShadows: function() {
		this.light.castShadow = true;
		this.light.shadowDarkness = 0.4;
		this.light.shadowBias = 0.0001;
		this.light.shadowMapWidth = 2048;
		this.light.shadowMapHeight = 2048;
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapType = THREE.PCFShadowMap;
		// this.light.shadowCameraVisible = true;
	},
	
	attachTo: function(element) {
		element.style.width = this.width + 'px';
		element.style.height = this.height + 'px';
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(this.width, this.height);
		element.appendChild(this.renderer.domElement);
	},
	
	add: function(mesh) {
		this.container.add(mesh);
	},
	
	render: function() {
		if (this.contolled) this.controls.update();
		this.renderer.render(this.container, this.camera);
	},
	
	updateOrthoZoom: function() {
		if (this.orthoZoom <= 0) {
			this.orthoZoom = 0;
			return;
		}
		var width = this.width / this.orthoZoom;
		var height = this.height / this.orthoZoom;
		this.camera.left = width / -2;
		this.camera.right = width / 2;
		this.camera.top = height / 2;
		this.camera.bottom = height / -2;
		this.camera.updateProjectionMatrix();
	},
	
	focusOn: function(obj) {
		this.camera.lookAt(obj.position);
	},
	
	createGround: function(width, depth, color) {
		var geometry = new THREE.PlaneBufferGeometry(width, depth, 1, 1);
		var planeMaterial = new THREE.MeshPhongMaterial({color: color || 0xffffff});
		planeMaterial.ambient = planeMaterial.color;

		var ground = new THREE.Mesh(geometry, planeMaterial);
		ground.rotation.x = - Math.PI / 2;
		ground.castShadow = false;
		ground.receiveShadow = true;
		ground.scale.set(2, 2, 2);

		this.container.add(ground);
		
		return ground;
	}
};

if (typeof exports !== 'undefined') {
	if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = Scene;
	}
	exports.Scene = Scene;
} else if (typeof define !== 'undefined' && define.amd) {
	define(Scene);
} else {
	root.Scene = Scene;
}
}).call(this);
