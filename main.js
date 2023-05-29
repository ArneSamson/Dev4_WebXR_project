import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

//balloon
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
//balloon

//set the scene, camera, renderer and controls
let camera, scene, renderer, controls;
let vrDisplay, vrFrameData;
let balloon;


let dart;

let direction = new THREE.Vector3();
const dartSpeed = 0.1;


//execute the main functions
init();
animate();

//define the main functions

//init function: initialize the scene, camera, renderer and controls
function init() {
	scene = new THREE.Scene();
	scene.background = new THREE.Color(0x808080);

	camera = new THREE.PerspectiveCamera(
		80,
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
	navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
		if (supported) {
		  renderer.xr.enabled = true;
		  renderer.xr.setReferenceSpaceType('local');
		  renderer.xr.setSession('immersive-vr').then((session) => {
			vrDisplay = session.display;
			vrFrameData = new VRFrameData();
		  });
		}
	  });
	//balloon
	loadBalloonModel();
	//balloon
	//dart
	loadDartModel("blue");
	loadDartModel("red");
	//dart

	window.addEventListener('resize', onWindowResize, false);

	renderer.domElement.addEventListener('click', shootDart);

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
const missingFaceGeometry = new THREE.BoxGeometry(standWidth, standHeight / 4, standDepth/6);
const missingFaceMaterial = new THREE.MeshBasicMaterial({ map: whiteRedTexture });
const missingFace = new THREE.Mesh(missingFaceGeometry, missingFaceMaterial);
missingFace.position.set(0, 0.25, -1); // Adjust the position as needed
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
	  balloon = gltf.scene;

		balloon.scale.set(0.005, 0.005, 0.005);
		balloon.position.set(0, 0, -2); // Adjust the position as needed
		scene.add(balloon);
		// Iterate over the materials defined in the GLTF model
		gltf.scene.traverse(function (child) {
		if (child.isMesh) {
		  const materials = child.material;
  
		  if (Array.isArray(materials)) {
			// Iterate over multiple materials (if applicable)
			materials.forEach(function (material) {
			  // Apply the material to the corresponding object
			  material.color = new THREE.Color(material.color);
			  child.material = material;
			});
		  } else {
			// Single material case
			materials.color = new THREE.Color(materials.color);
			child.material = materials;
		  }
		}
	  });

	});
  }
  function animateBalloon() {
	if (balloon) {
	  // Calculate the vertical position offset using a sine wave
	  const time = performance.now() * 0.001; // Convert time to seconds
	  const yOffset = Math.sin(time * 2) * 0.25; // Adjust the amplitude and speed as needed
	  const xOffset = (time * 2) * 0.25; // Adjust the amplitude and speed as needed
	  // Update the balloon's position
	  balloon.position.y = 0 + yOffset;
	  balloon.position.x = 2 - xOffset;
	  if(balloon.position.x < -2){
		balloon.position.x = 2;
	  }
	}
  }
  
//  balloon 

//  Dart
function loadDartModel(color) {
	return new Promise((resolve, reject) => {
		const loader = new GLTFLoader();
		if (color === "blue") {
			loader.load('assets/darts/blue/scene.gltf', function (gltf) {
				const dart = gltf.scene;
				dart.scale.set(0.005, 0.005, 0.005);
				// Adjust the position and other properties of the dart if needed
				resolve(dart);
			}, undefined, reject);
		} else if (color === "red") {
			loader.load('assets/darts/red/scene.gltf', function (gltf) {
				const dart = gltf.scene;
				dart.scale.set(0.005, 0.005, 0.005);
				// Adjust the position and other properties of the dart if needed
				resolve(dart);
			}, undefined, reject);
		} else {
			reject(new Error('Invalid color for dart'));
		}
	});
}

function shootDart() {
	// Create the dart
	loadDartModel("red")
		.then((loadedDart) => {
			dart = loadedDart;
			// Set the dart's initial position and direction based on the controller's position and orientation
			const controller = renderer.xr.getController(0);
			dart.position.copy(controller.position);
			dart.quaternion.copy(controller.quaternion);

			// Set the dart's velocity
			const velocity = new THREE.Vector3();
			const direction = new THREE.Vector3();
			controller.getWorldDirection(direction);
			velocity.copy(direction).multiplyScalar(-0.5);

			// Add the dart to the scene
			scene.add(dart);

			// Update the dart's position and velocity every frame
			const clock = new THREE.Clock();
			clock.start();
			const tick = () => {
				const delta = clock.getDelta();
				dart.position.add(velocity.clone().multiplyScalar(delta));
				velocity.y -= 0.01;
				if (dart.position.y < 0) {
					scene.remove(dart);
				} else {
					requestAnimationFrame(tick);
				}
			};

			tick();

			// Cleanup dart after 5 seconds
			setTimeout(() => {
				scene.remove(dart);
			}, 5000);
		})
		.catch((error) => {
			console.error(error);
		});
}


//Dart

//animate function: animate the scene and the camera
function animate() {
  	renderer.setAnimationLoop(render);
	  animateBalloon();
}

//render function: render the scene and the camera
function render() {

	if(dart){
		//animate dart's movement
		dart.position.addScaledVector(direction, dartSpeed);
	}

  renderer.render(scene, camera);
	animateBalloon();
	if (vrDisplay && renderer.xr.isPresenting) {
		vrDisplay.submitFrame();
	}
}
function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
  }