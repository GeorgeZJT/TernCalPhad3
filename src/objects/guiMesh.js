import * as THREE from 'three';
import GUI from 'lil-gui';
import { HTMLMesh } from 'three/examples/jsm/interactive/HTMLMesh.js';
import { InteractiveGroup } from 'three/examples/jsm/interactive/InteractiveGroup.js';

import { controllers } from '../controllers.js';


let guiGroup, htmlMesh;
let gui;

// Since this initialization depends on controllers been initialized first,
// run this after controllers have been set up.
// initVRControls should not be async to ensure proper order.
export function initGuiVR(
    scene, 
    guiInput, 
    {
        position = new THREE.Vector3(-0.75, 1.5, -0.5),
        rotation = new THREE.Euler(0, Math.PI / 4, 0),
        scale = 2,
}={}) {
    if (scene.getObjectByName('guiGroup')){
        scene.remove(scene.getObjectByName('guiGroup'));
    }
    gui = guiInput;

    guiGroup = new InteractiveGroup();
    guiGroup.name = 'guiGroup';
    //interactiveGroup.listenToPointerEvents( renderer, camera );
    controllers.forEach(({ controller, grip }) => {
        guiGroup.listenToXRControllerEvents( controller );
    });
    scene.add( guiGroup );

    htmlMesh = new HTMLMesh(gui.domElement);
    htmlMesh.name = 'guiMesh';
    htmlMesh.position.copy(position);
    htmlMesh.rotation.copy(rotation);
    htmlMesh.scale.setScalar(scale);
    guiGroup.add(htmlMesh);
    return { guiGroup, htmlMesh };
}

export function updateGuiVR({
    position = new THREE.Vector3(-0.75, 1.5, -0.5),
    rotation = new THREE.Euler(0, Math.PI / 4, 0),
    scale = 2,
}={}) {
    htmlMesh.dispose();
    guiGroup.remove(htmlMesh);
    htmlMesh = new HTMLMesh(gui.domElement);
    htmlMesh.name = 'guiMesh';
    htmlMesh.position.copy(position);
    htmlMesh.rotation.copy(rotation);
    htmlMesh.scale.setScalar(scale);
    guiGroup.add(htmlMesh);
    return { guiGroup, htmlMesh };
}