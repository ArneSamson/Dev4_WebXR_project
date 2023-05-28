import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//balloon
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//balloon

//set the scene, camera, renderer and controls
let camera, scene, renderer, controls;

//balloon
//balloon

//execute the main functions
init();
animate();

//define the main functions

//init function: initialize the scene, camera, renderer and controls
function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x808080);

	camera = new THREE.PerspectiveCamera(
		60,
		window.innerWidth / window.innerHeight,
		0.1,
		10
	);
	camera.position.set(0, 1.2, 0.3);

	scene.add(new THREE.HemisphereLight(0x808080, 0x606060));

	const light = new THREE.DirectionalLight(0xffffff);
	light.position.set(0, 6, 0);
	light.castShadow = true;
	light.shadow.camera.top = 2;
	light.shadow.camera.bottom = -2;
	light.shadow.camera.right = 2;
	light.shadow.camera.left = -2;
	light.shadow.mapSize.set(4096, 4096);
	scene.add(light);

	const floorGeometry = new THREE.PlaneGeometry(6, 6);
	const floorMaterial = new THREE.MeshPhongMaterial({ color: 0x595959 });
	const floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.rotation.x = -Math.PI / 2;
	floor.receiveShadow = true;
	scene.add(floor);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.shadowMap.enabled = true;

	document.body.appendChild(renderer.domElement);
	document.body.appendChild(VRButton.createButton(renderer));

	controls = new OrbitControls(camera, renderer.domElement);
	controls.target.set(0, 1.6, 0);
	controls.update();

	//balloon
	loadBalloonModel();
	//balloon

}

// Shooting stand dimensions
const standWidth = 4;
const standHeight = 2;
const standDepth = 2;

 
//TEXTURES_______________________________________________________________
const textureLoader = new THREE.TextureLoader();

//white-red texture for the missing face
const whiteRedTexture = textureLoader.load('textures/white-red_texture.jpg');
whiteRedTexture.repeat.set(3, 1);
whiteRedTexture.wrapS = THREE.RepeatWrapping;
//wood texture for the left and right wall
const woodTexture = textureLoader.load('textures/wood_texture.jpg');
woodTexture.repeat.set(1, 1);
woodTexture.wrapS = THREE.RepeatWrapping;
//______________________________________________________________________


// Create the missing half face
const missingFaceGeometry = new THREE.BoxGeometry(standWidth, standHeight / 4, standDepth);
const missingFaceMaterial = new THREE.MeshBasicMaterial({ map: whiteRedTexture });
const missingFace = new THREE.Mesh(missingFaceGeometry, missingFaceMaterial);
missingFace.position.set(0, 0.25, -1.90); // Adjust the position as needed
scene.add(missingFace);

// Create left wall
const leftWallGeometry = new THREE.BoxGeometry(standWidth / 16, standHeight, standDepth);
const leftWallMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
leftWall.position.set(-1.90, 0.5, -2); // Adjust the position as needed
scene.add(leftWall);

// Create right wall
const rightWallGeometry = new THREE.BoxGeometry(standWidth / 16, standHeight, standDepth);
const rightWallMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
rightWall.position.set(1.90, 0.5, -2); // Adjust the position as needed
scene.add(rightWall);

// Create roof
const roofGeometry = new THREE.BoxGeometry(standWidth, standHeight / 4, standDepth);
const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.set(0, 1.90, -2); // Adjust the position as needed
scene.add(roof);

// Create back wall
const backWallGeometry = new THREE.BoxGeometry(standWidth + 1, standHeight, standDepth / 4);
const backWallMaterial = new THREE.MeshBasicMaterial({ color: 8406838 });
const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
backWall.position.set(0, 0.5, -3.90); // Adjust the position as needed
scene.add(backWall);

//balloon
function loadBalloonModel() {
	const loader = new GLTFLoader();

	
  
	loader.load('assets/balloon/scene.gltf', function (gltf) {
	  const balloon = gltf.scene;

	  	// Find the material used by the balloon
		const balloonMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
		balloon.traverse(function (node) {
			if (node.isMesh) {
				node.material = balloonMaterial;
			}
		});

		// Load and set the texture for the balloon material
		const textureLoader = new THREE.TextureLoader();
		textureLoader.load('textures/white-red_texture.jpg', function (texture) {
			balloonMaterial.map = texture;
			balloonMaterial.needsUpdate = true;
		});


	  balloon.scale.set(0.005, 0.005, 0.005);
	  balloon.position.set(0, 2, 0); // Adjust the position as needed
	  scene.add(balloon);
	});
  }
 //balloon 

//animate function: animate the scene and the camera
function animate() {
  	renderer.setAnimationLoop(render);
}

//render function: render the scene and the camera
function render() {
  	renderer.render(scene, camera);
}
