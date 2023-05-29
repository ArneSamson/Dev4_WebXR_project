import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer, controls;
let vrDisplay, vrFrameData;
let balloon;
let activeDarts = [];

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

//baloon_______________________________________________________________
function loadBalloonModel() {
  const loader = new GLTFLoader();

  loader.load('assets/balloon/scene.gltf', function (gltf) {
    balloon = gltf.scene;

    balloon.scale.set(0.005, 0.005, 0.005);
    balloon.position.set(0, 0, -2);
    scene.add(balloon);

    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        const materials = child.material;

        if (Array.isArray(materials)) {
          materials.forEach(function (material) {
            material.color = new THREE.Color(material.color);
            child.material = material;
          });
        } else {
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
  animateBalloon();
}

function render() {
  const delta = vrFrameData ? vrFrameData.deltaTime : 0.01;

  activeDarts.forEach((activeDart) => {
    const { dart, controller } = activeDart;

    dart.position.addScaledVector(dart.velocity, delta);

    if (dart.position.distanceTo(balloon.position) < 0.1) {
      scene.remove(dart);
      activeDarts.splice(activeDarts.indexOf(activeDart), 1);
      console.log('Dart hit the balloon!');
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
