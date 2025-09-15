import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { createBox } from './objects/SpinningBox.js';
import GUI from 'lil-gui';
import { createAxes } from '../../threejs/src/objects/AxesXYZ.js';
import { loadImageStack } from './objects/loadTernarySlices.js';
import { initVRControls, updateVRControls } from './controllers.js';
import { initSlicePlanes } from './objects/slicePlane.js';

let scene, camera, renderer, controls, clock;
let world, imageStack, slicePlaneGroup;
let gui;

init();

async function init() {
    gui = new GUI();

    scene = new THREE.Scene();
    world = new THREE.Group();
    world.name = 'World';
    scene.add(world);

    slicePlaneGroup = new THREE.Group();
    slicePlaneGroup.position.set(0, 0, 0);
    slicePlaneGroup.rotation.set(0, 0, 0);
    world.add(slicePlaneGroup);

    camera = new THREE.PerspectiveCamera(
        75,                      // fov
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    )
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    console.log('Camera position:', camera.position);


    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType('local-floor');
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(VRButton.createButton(renderer));
    renderer.localClippingEnabled = true;

    initVRControls(renderer, world, slicePlaneGroup);
    initSlicePlanes({
        gui,
        world,
        slicePlaneGroup,
        updateClippingPlanes: () => {
        }
    })
    
    const axes = createAxes();
    world.add(axes);

    imageStack = await loadImageStack({ size: 1, spacing: 1 / 1000 });
    world.add(imageStack);

    // when VR starts:
    renderer.xr.addEventListener('sessionstart', () => {
    world.position.set(0, 1, -1);
    world.rotation.set(0, 0, 0);
    world.scale.set(1, 1, 1);
    });

    // when VR ends:
    renderer.xr.addEventListener('sessionend', () => {
    world.position.set(0, 0, 0);
    world.rotation.set(0, 0, 0);
    world.scale.set(1, 1, 1);
    camera.position.set(2, 2, 2);
    camera.lookAt(0, 0, 0);
    });




    const skyColor = 0xffffff;
    const groundColor = 0xB97A20;
    const intensity = 1;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.screenSpacePanning = false;
    controls.target.set(0, 0, 0);
    controls.update();

    window.addEventListener('resize', onWindowResize);

    

    clock = new THREE.Clock();
    renderer.setAnimationLoop(render);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function render(time, xrFrame) {
    const delta = clock.getDelta();
    const isInVR = renderer.xr.isPresenting;

    if (!isInVR) {
        controls.update();
    } else {
        updateVRControls(delta, world);
    }

    renderer.render(scene, camera);
}