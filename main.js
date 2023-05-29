import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let vrDisplay, vrFrameData;

let balloon;
let activeDarts = [];

let dart;
let direction = new THREE.Vector3();
const dartSpeed = 0.1;

init();
animate();

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

  loadBalloonModel();
  loadDartModel("blue");
  loadDartModel("red");

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


//______________________________________________________________________
// Create the missing half face
const missingFaceGeometry = new THREE.BoxGeometry(standWidth * 1.01, standHeight / 2, standDepth/30);
const missingFaceMaterial = new THREE.MeshBasicMaterial({ map: whiteRedTexture });
const missingFace = new THREE.Mesh(missingFaceGeometry, missingFaceMaterial);
missingFace.position.set(0, 0.25, -1.03); // Adjust the position as needed
scene.add(missingFace);
// Create left wall
const leftWallGeometry = new THREE.BoxGeometry(standWidth / 16, standHeight * 1.5, standDepth);
const leftWallMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const leftWall = new THREE.Mesh(leftWallGeometry, leftWallMaterial);
leftWall.position.set(-1.90, 0.5, -2); // Adjust the position as needed
scene.add(leftWall);
// Create right wall
const rightWallGeometry = new THREE.BoxGeometry(standWidth / 16, standHeight * 1.5, standDepth);
const rightWallMaterial = new THREE.MeshBasicMaterial({ map: woodTexture });
const rightWall = new THREE.Mesh(rightWallGeometry, rightWallMaterial);
rightWall.position.set(1.90, 0.5, -2); // Adjust the position as needed
scene.add(rightWall);
// Create roof
const roofGeometry = new THREE.BoxGeometry(standWidth * 1.01, standHeight / 10, standDepth);
const roofMaterial = new THREE.MeshBasicMaterial({ color: 0x808080 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.set(0, 2.1, -2); // Adjust the position as needed
scene.add(roof);
// Create back wall
const backWallGeometry = new THREE.BoxGeometry(standWidth * 1.01, standHeight * 1.5, standDepth / 4);
const backWallMaterial = new THREE.MeshBasicMaterial({ color: 8406838 });
const backWall = new THREE.Mesh(backWallGeometry, backWallMaterial);
backWall.position.set(0, 0.5, -3.3); // Adjust the position as needed
scene.add(backWall);

//baloon_______________________________________________________________
function loadBalloonModel() {
	const loader = new GLTFLoader();
	loader.load('assets/balloon/scene.gltf', function (gltf) {
	  const newBalloon = gltf.scene;

	  	newBalloon.scale.set(0.005, 0.005, 0.005);
	  	newBalloon.position.set(0, 0, -2); // Adjust the position as needed
		scene.add(newBalloon);
		    // Update the reference to the new balloon
			balloon = newBalloon;

			// Restart the animation
			animate();
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
	if (!balloon) {
		return; // Stop the animation if balloon is not present
	  }
	if (balloon) {
		const loaded = 0;
		// Calculate the vertical position offset using a sine wave
		const time = performance.now() * 0.001; // Convert time to seconds
		const yOffset = Math.sin(time * 2) * 0.25; // Adjust the amplitude and speed as needed
		let xOffset = (time * 2) * 0.25; // Adjust the amplitude and speed as needed
		// Update the balloon's position
		balloon.position.y = 0 + yOffset;
		balloon.position.x = 2 - xOffset;
		if (balloon.position.x < leftWall.position.x + leftWall.geometry.parameters.width / 2) {
			// Remove the current balloon from the scene
			scene.remove(balloon);
			balloon = null; // Reset the balloon reference
			console.log("Game over!");
			// Create a new balloon and add it to the scene
			if (balloon = null) {
				loadBalloonModel();
				return; // Stop the animation if balloon is not present
			  }
		  }
	}
}

//dart_________________________________________________________________
function loadDartModel(color) {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();

    loader.load(`assets/darts/${color}/scene.gltf`, function (gltf) {
      const dart = gltf.scene;

      dart.scale.set(0.01, 0.01, 0.01);

      dart.traverse(function (child) {
        if (child.isMesh) {
          child.castShadow = true;
        }
      });

      resolve(dart);
    }, undefined, reject);
  });
}

function shootDart(event) {
  const controller = renderer.xr.getController(0);

  loadDartModel("red")
    .then((loadedDart) => {
      const dart = loadedDart;
      dart.position.copy(controller.position);
      dart.quaternion.copy(controller.quaternion);
      dart.velocity = new THREE.Vector3();
      dart.velocity.x = -dartSpeed;
      dart.velocity.applyQuaternion(controller.quaternion);

      scene.add(dart);
      activeDarts.push({ dart, controller });
    })
    .catch((error) => {
      console.error(error);
    });
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  	renderer.setAnimationLoop(render);
	  renderer.setAnimationLoop(() => {
		render();
		animateBalloon();
	  });
}

function render() {
  const delta = vrFrameData ? vrFrameData.deltaTime : 0.01;

  activeDarts.forEach((activeDart) => {
    const { dart, controller } = activeDart;

    dart.position.addScaledVector(dart.velocity, delta);
	if(balloon){
		if (dart.position.distanceTo(balloon.position) < 0.1) {
			scene.remove(dart);
			activeDarts.splice(activeDarts.indexOf(activeDart), 1);
			console.log('Dart hit the balloon!');
		  }
	}
    

    if (dart.position.y < 0 || Math.abs(dart.position.x) > 3 || Math.abs(dart.position.z) > 3) {
      scene.remove(dart);
      activeDarts.splice(activeDarts.indexOf(activeDart), 1);
      console.log('Dart went out of bounds!');
    }
  });

  renderer.render(scene, camera);
  animateBalloon();
}
