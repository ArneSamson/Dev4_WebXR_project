import * as THREE from 'three';
		import { VRButton } from 'three/addons/webxr/VRButton.js';
        import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
		import { XRControllerModelFactory } from 'three/addons/webxr/XRControllerModelFactory.js';
		import { OculusHandModel } from 'three/addons/webxr/OculusHandModel.js';
		import { createText } from 'three/addons/webxr/Text2D.js';

		import { World, System, Component, TagComponent, Types } from 'three/addons/libs/ecsy.module.js';

		class Object3D extends Component { }

		Object3D.schema = {
			object: { type: Types.Ref }
		};


		Button.schema = {
			// button states: [resting, pressed, fully_pressed, recovering]
			currState: { type: Types.String, default: 'resting' },
			prevState: { type: Types.String, default: 'resting' },
			pressSound: { type: Types.Ref, default: null },
			releaseSound: { type: Types.Ref, default: null },
			restingY: { type: Types.Number, default: null },
			surfaceY: { type: Types.Number, default: null },
			recoverySpeed: { type: Types.Number, default: 0.4 },
			fullPressDistance: { type: Types.Number, default: null },
			action: { type: Types.Ref, default: () => { } }
		};


		ButtonSystem.queries = {
			buttons: {
				components: [ Button ]
			}
		};

		class Pressable extends TagComponent { }

		class FingerInputSystem extends System {

			init( attributes ) {

				this.hands = attributes.hands;

			}

			execute( delta/*, time*/ ) {

				this.queries.pressable.results.forEach( entity => {

					const button = entity.getMutableComponent( Button );
					const object = entity.getComponent( Object3D ).object;
					const pressingDistances = [];
					this.hands.forEach( hand => {

						if ( hand && hand.intersectBoxObject( object ) ) {

							const pressingPosition = hand.getPointerPosition();
							pressingDistances.push( button.surfaceY - object.worldToLocal( pressingPosition ).y );

						}

					} );
					if ( pressingDistances.length == 0 ) { // not pressed this frame

						if ( object.position.y < button.restingY ) {

							object.position.y += button.recoverySpeed * delta;
							button.currState = 'recovering';

						} else {

							object.position.y = button.restingY;
							button.currState = 'resting';

						}

					} else {

						button.currState = 'pressed';
						const pressingDistance = Math.max( pressingDistances );
						if ( pressingDistance > 0 ) {

							object.position.y -= pressingDistance;

						}

						if ( object.position.y <= button.restingY - button.fullPressDistance ) {

							button.currState = 'fully_pressed';
							object.position.y = button.restingY - button.fullPressDistance;

						}

					}

				} );

			}

		}

		FingerInputSystem.queries = {
			pressable: {
				components: [ Pressable ]
			}
		};

		class Rotating extends TagComponent { }

		class RotatingSystem extends System {

			execute( delta/*, time*/ ) {

				this.queries.rotatingObjects.results.forEach( entity => {

					const object = entity.getComponent( Object3D ).object;
					object.rotation.x += 2 * delta;
					object.rotation.y += 0.4 * delta;

				} );

			}

		}

		RotatingSystem.queries = {
			rotatingObjects: {
				components: [ Rotating ]
			}
		};

		class HandsInstructionText extends TagComponent { }

		class InstructionSystem extends System {

			init( attributes ) {

				this.controllers = attributes.controllers;

			}

			execute( /*delta, time*/ ) {

				let visible = false;
				this.controllers.forEach( controller => {

					if ( controller.visible ) {

						visible = true;

					}

				} );

				this.queries.instructionTexts.results.forEach( entity => {

					const object = entity.getComponent( Object3D ).object;
					object.visible = visible;

				} );

			}

		}

		InstructionSystem.queries = {
			instructionTexts: {
				components: [ HandsInstructionText ]
			}
		};

		class OffsetFromCamera extends Component { }

		OffsetFromCamera.schema = {
			x: { type: Types.Number, default: 0 },
			y: { type: Types.Number, default: 0 },
			z: { type: Types.Number, default: 0 },
		};

		class NeedCalibration extends TagComponent { }

		class CalibrationSystem extends System {

			init( attributes ) {

				this.camera = attributes.camera;
				this.renderer = attributes.renderer;

			}

			execute( /*delta, time*/ ) {

				this.queries.needCalibration.results.forEach( entity => {

					if ( this.renderer.xr.getSession() ) {

						const offset = entity.getComponent( OffsetFromCamera );
						const object = entity.getComponent( Object3D ).object;
						const xrCamera = this.renderer.xr.getCamera();
						object.position.x = xrCamera.position.x + offset.x;
						object.position.y = xrCamera.position.y + offset.y;
						object.position.z = xrCamera.position.z + offset.z;
						entity.removeComponent( NeedCalibration );

					}

				} );

			}

		}

		CalibrationSystem.queries = {
			needCalibration: {
				components: [ NeedCalibration ]
			}
		};

		const world = new World();
		const clock = new THREE.Clock();
		let camera, scene, renderer;

        let room;

		let controller1, controller2;

        let cursor = new THREE.Vector3();


		init();
		animate();

		function makeButtonMesh( x, y, z, color ) {

			const geometry = new THREE.BoxGeometry( x, y, z );
			const material = new THREE.MeshPhongMaterial( { color: color } );
			const buttonMesh = new THREE.Mesh( geometry, material );
			buttonMesh.castShadow = true;
			buttonMesh.receiveShadow = true;
			return buttonMesh;

		}

		function init() {

		

        }
        //end painting demo code____________________________________________________

		function animate() {

			renderer.setAnimationLoop( render );

		}

		function render() {

            handleController( controller1 );
            handleController( controller2 );

			renderer.render( scene, camera );

		}