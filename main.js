import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

let camera, scene, renderer, controls;

init();
animate();

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
}

// Shooting stand dimensions
const standWidth = 10;
const standHeight = 1;
const standDepth = 5;
// Shooting stand material
const standMaterial = new THREE.MeshBasicMaterial({ color: 8407424 });
// Create the shooting stand geometry
const standGeometry = new THREE.BoxGeometry(standWidth, standHeight, standDepth);
// Create the shooting stand mesh
const shootingStand = new THREE.Mesh(standGeometry, standMaterial);
// Position the shooting stand in the scene
shootingStand.position.set(0, 0.5, -2); // Adjust the position as needed
// Add the shooting stand to the scene
scene.add(shootingStand);


function animate() {
  	renderer.setAnimationLoop(render);
}

function render() {
  	renderer.render(scene, camera);
}
