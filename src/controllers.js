import * as THREE from 'three';
import { XRControllerModelFactory } from 'three/examples/jsm/Addons.js';
import { slicePlanes } from './objects/slicePlane.js';
import { createPointAndLabel, createLine } from './objects/PointAndLabel.js';
import { Measure } from './measure.js';

// Constants for movement and zoom speeds (units per second)
const MOVE_SPEED = 0.5;   // meters per second for panning
const ZOOM_SPEED = 1.0;   // scale units per second for zooming
const ROTATE_SPEED = 0.5; // radian per second for rotation
const DEADZONE = 0.01;

// Array to hold controller objects and associated world group
export let controllers = [];
let measures = [];
let raycaster = new THREE.Raycaster();
const measureGroup = new THREE.Group();
measureGroup.name = 'measureGroup';


/**
 * Initialize VR controller support.
 * Wires up left and right gamepads to move and zoom the world.
 * @param {THREE.WebGLRenderer} renderer - The WebGL renderer with XR enabled
 * @param {THREE.Group} world - The scene group to transform
 */
export function initVRControls(renderer, world, slicePlaneGroup) {
  // Access the parent scene from the world group
  const scene = world.parent;
  world.add(measureGroup);

  /**
   * Set up a controller at the given index (0 or 1).
   * Listens for connection events to track gamepad and handedness.
   * @param {number} index - Controller index: 0 (first slot), 1 (second slot)
   */
  function setupController(index) {
    let onSelectStart, onSelectEnd;
    let onSqueezeStart, onSqueezeEnd;

    // Global array to track all measure instances
    if (!window.allMeasures) window.allMeasures = [];

    const ctrl = renderer.xr.getController(index);
    const grip = renderer.xr.getControllerGrip(index);
    grip.add( new XRControllerModelFactory().createControllerModel(grip) );

    // When this controller connects, store its gamepad and handedness
    ctrl.addEventListener('connected', (event) => {
      ctrl.userData.gamepad = event.data.gamepad;
      ctrl.userData.handedness = event.data.handedness; // 'left' or 'right'
      ctrl.userData.prevStates = {};
      ctrl.userData.initialPosition = null;

      if (ctrl.userData.handedness == 'right') { // Right hand only
        onSelectStart = (event) => grabSlicePlane(event, slicePlaneGroup);
        onSelectEnd = (event) => releaseSlicePlane(event, slicePlaneGroup);
        ctrl.addEventListener('selectstart', onSelectStart);
        ctrl.addEventListener('selectend', onSelectEnd);

        onSqueezeStart = (event) => {
          const measure = new Measure({ event, world, controller: ctrl });
          measures.push(measure);
          ctrl.userData.activeMeasure = measure;
        };
        onSqueezeEnd = (event) => {
          ctrl.userData.activeMeasure.release();
          ctrl.userData.measure = null;
        }
        ctrl.addEventListener('squeezestart', onSqueezeStart);
        ctrl.addEventListener('squeezeend', onSqueezeEnd);
      }
      console.log('Controller connected:', ctrl.userData.handedness);
    });

    // Clean up when the controller disconnects
    ctrl.addEventListener('disconnected', () => {
      delete ctrl.userData.gamepad;
      delete ctrl.userData.handedness;
      delete ctrl.userData.prevStates;
      delete ctrl.userData.initialPosition;
      const selectedHelperPlane = ctrl.userData.selected;
      if (selectedHelperPlane){
        delete selectedHelperPlane.userData.selected
        
      }
      if (onSelectStart) ctrl.removeEventListener('selectstart', onSelectStart);
      if (onSelectEnd) ctrl.removeEventListener('selectend', onSelectEnd);
      if (onSqueezeStart) ctrl.removeEventListener('squeezestart', onSqueezeStart);
      if (onSqueezeEnd) ctrl.removeEventListener('squeezeend', onSqueezeEnd);
      console.log('Controller disconnected:', ctrl.userData.handedness);
    });

    // Add the controller object to the scene
    scene.add(ctrl);
    scene.add(grip);
    // Store reference for use in the update loop
    controllers.push({ controller: ctrl, grip });


    const geometry = new THREE.BufferGeometry().setFromPoints( [ new THREE.Vector3( 0, 0, 0 ), new THREE.Vector3( 0, 0, - 1 ) ] );

    const line = new THREE.Line( geometry );
    line.name = 'line';
    line.scale.z = 2;

    ctrl.add( line.clone() );

  }

  // Set up both controllers (typically 0=left, 1=right; but in Web Emulator 0=right, 1=left)
  setupController(0);
  setupController(1);
}

/**
 * Update VR controls each frame.
 * Reads thumbstick axes and applies movement or zoom on the world group.
 * 
 * gp.buttons[0] -> index-finger trigger
 * gp.buttons[1] -> middle-finger trigger
 * gp.buttons[2] -> always false
 * gp.buttons[3] -> thumbstick button
 * gp.buttons[4] -> X (left) or A (right) button
 * gp.buttons[5] -> Y (left) or B (right) button
 * 
 * gp.axes[0] -> always 0
 * gp.axes[1] -> always 0
 * gp.axes[2] -> X axis of thumbstick (left/right)
 * gp.axes[3] -> Y axis of thumbstick (up/down)
 * 
 * @param {number} delta - Time elapsed since last frame (in seconds)
 */
const worldQuat = new THREE.Quaternion();
const thumbstick = new THREE.Vector3();
export function updateVRControls(delta, world) {
  controllers.forEach(({ controller, grip }) => {
    const gp = controller.userData.gamepad;
    const hand = controller.userData.handedness;
    if (!gp || !hand) return; // skip if no gamepad or unknown hand

    const x = gp.axes[2]; // left/right input
    const y = gp.axes[3]; // up/down input. REMEMBER up is negative

    if (hand === 'right') {
      if (Math.abs(x) > DEADZONE || Math.abs(y) > DEADZONE){
        grip.getWorldQuaternion(worldQuat);
        thumbstick.set(x, 0, y);
        thumbstick.applyQuaternion(worldQuat);
        world.position.addScaledVector(thumbstick, MOVE_SPEED * delta);
      }

    } else if (hand === 'left') {
      // Left up/down for zoom
      // Left left/right for rotation
      // We don't want rotation and zoom to happen together, 
      // so we make diagonal movement having no effect


      if (Math.abs(x) > DEADZONE || Math.abs(y) > DEADZONE){

        let tan;
        if (Math.abs(x) < 10e-5){
          tan = 10e5
        } else {
          tan = Math.abs( y / x );
        }

        if (tan < 0.577) {
          // left/right input, rotate
          world.rotateY( x * ROTATE_SPEED * delta);
        } else if (1.732 < tan) {
          // up/down input, zoom
          const scaleFactor = 1 - y * ZOOM_SPEED * delta; // forward == negative y
          world.scale.multiplyScalar(scaleFactor);
          // Clamp scale to avoid inversion or disappearing
          world.scale.clampScalar(0.1, 10);
        }

      }

    }

    if (hand === 'right' && pressButton(controller, 4)) {
      // cycleNext(world);
    }

    if (hand === 'right' && pressButton(controller, 5)) {
      // cyclePrev(world);
    }

    if (hand === 'left' && pressButton(controller, 4)) {
      //measureGroup.clear();
      while (measures.length > 0) {
        const measure = measures.pop();
        measure.clear();
      }
    }

    if (hand === 'left' && pressButton(controller, 5)) {
      if (measures.length > 0) {
        const measure = measures.pop();
        measure.clear();
      }
    }

    for (const measure of measures) {
      measure.update();
    }
  });
}

function pressButton(controller, buttonIndex) { // TODO: support triggers by determine if it is pressed more than half of the travel
  const gp = controller.userData.gamepad;
  const pressed = gp.buttons[buttonIndex].pressed;
  const prevState = controller.userData.prevStates[buttonIndex] || false;
  if (pressed && !prevState) {
    controller.userData.prevStates[buttonIndex] = pressed;
    return true; // button was just pressed
  } else {
    controller.userData.prevStates[buttonIndex] = pressed;
    return false;
  }
}

//TODO: releaseButton


function grabSlicePlane(event, group) {
  console.log('grab');
  const controller = event.target;

  const intersections = getIntersections( controller, group );

  if ( intersections.length > 0 ) {

    const intersection = intersections[ 0 ];

    const object = intersection.object;
    try{ object.material.emissive.b = 1; } catch {};
    //controller.attach( object );

    // Link controller and object
    controller.userData.selected = object;
    object.userData.grabController = controller;

    // Store initial position for SlicePlane.update() in slicePlane.js
    object.userData.selected = true;
    object.userData.grabInitial = controller.position.clone();
    object.userData.planeInitial = object.position.clone();

  }

  controller.userData.targetRayMode = event.data.targetRayMode;

}

function releaseSlicePlane(event, group) {
  const controller = event.target;

  if ( controller.userData.selected !== undefined ) {

    const object = controller.userData.selected;
    try{ object.material.emissive.b = 0; } catch {};
    //group.attach( object );

    controller.userData.selected = undefined;
    object.userData.selected = false;
    // object.userData.grabInitial; //leave it as garbage data

  }
}

function getIntersections( controller, group ) {

  controller.updateMatrixWorld();

  raycaster.setFromXRController( controller );

  return raycaster.intersectObjects( group.children, false );

}

// // TODO: determine if controller is inside any slice plane
// function isControllerInAnySlicePlane(controller) {
//   // Get controller world position
//   const controllerPos = new THREE.Vector3();
//   controller.getWorldPosition(controllerPos);

//   //for (const planeMesh of slicePlaneGroup.children) {
//   for (const slicePlane of slicePlanes) {
//     const planeMesh = slicePlane.helperPlane;

//     // Get the plane's world position and orientation
//     const planeWorldPos = new THREE.Vector3();
//     planeMesh.getWorldPosition(planeWorldPos);

//     const planeWorldQuat = new THREE.Quaternion();
//     planeMesh.getWorldQuaternion(planeWorldQuat);

//     // Plane normal in world space (assuming plane geometry normal is +Z)
//     const planeNormal = new THREE.Vector3(0, 0, 1).applyQuaternion(planeWorldQuat);

//     // Vector from plane center to controller
//     const toController = controllerPos.clone().sub(planeWorldPos);

//     // Distance from controller to plane
//     const dist = toController.dot(planeNormal);

//     // Project controller position onto the plane
//     const projected = controllerPos.clone().sub(planeNormal.clone().multiplyScalar(dist));

//     // Convert projected point to plane local space
//     const projectedLocal = projected.clone().sub(planeWorldPos).applyQuaternion(planeWorldQuat.clone().invert());

//     // Get plane size (assuming square plane geometry)
//     const halfSize = slicePlane.helperSize / 2;

//     // Check if projected point is within plane bounds and close to the plane
//     if (
//       Math.abs(dist) < 0.01 && // within 1cm of the plane
//       Math.abs(projectedLocal.x) <= halfSize &&
//       Math.abs(projectedLocal.y) <= halfSize
//     ) {
//       return true; // Controller is in this slice plane
//     }
//   }
//   return false; // Not in any plane
// }


export function updateMeasurement(controller, world) {
  if (controller.userData.isMeasuring === false) return;

  // Get current position in local/world space
  const globalPosition = controller.position.clone();
  const currentPosition = new THREE.Vector3();
  currentPosition.copy(world.worldToLocal(globalPosition));

  // Remove previous measurement if it exists
  if (controller.userData.measurement) {
    world.remove(controller.userData.measurement.line);
    world.remove(controller.userData.measurement.label);
  }

  // Create line geometry
  const points = [
    controller.userData.initialPosition.clone(),
    currentPosition.clone()
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const line = new THREE.Line(geometry, material);

  // Calculate distance
  const distance = points[0].distanceTo(points[1]);
  const midPoint = points[0].clone().lerp(points[1], 0.5);
  const label = createPointAndLabel(
    midPoint,
    `d=${distance.toFixed(2)}`,
    { size: 0.02, labelSize: 0.5, labelPosition: new THREE.Vector3(0, 0.2, 0) }
  );

  // Add to world and store reference
  world.add(line);
  world.add(label);
  controller.userData.measurement = { line, label };
}