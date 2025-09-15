import * as THREE from 'three';
import GUI from 'lil-gui';

//import { controllers } from '../controllers.js'

export const slicePlanes = [];

/**
 * @typedef {Object} SlicePlaneOptions
 * @property {GUI}                            gui          - The lil-gui instance for controls.
 * @property {THREE.Group}                    world        - The group/scene to which the helper will be added.
 * @property {THREE.Vector3}                  direction    - Base normal vector of the slice plane.
 * @property {number}                         [constant=0] - Initial plane constant (offset).
 * @property {number}                         [helperSize=2] - Edge length of the helper plane.
 * @property {THREE.Color|string|number}      [helperColor=0x00ff00] - Mesh color or hex code.
 * @property {function(SlicePlane):void}      [onRemove]    - Called upon plane removal.
 */

/**
 * Class representing an interactive slice plane with GUI controls.
 */
export class SlicePlane {
  /**
   * @param {SlicePlaneOptions} options
   */
	constructor({
		gui,
		world,
		direction,
		constant = 0,
		helperSize = 2,
		helperColor = 0x00ff00,
		onRemove = () => {}
	}){

		// Input validation
		if (!(gui instanceof GUI)) {
			throw new TypeError('gui must be a lil-gui GUI instance');
		}
		if (!(world instanceof THREE.Object3D)) {
			throw new TypeError('world must be a THREE.Object3D');
		}
		if (!(direction instanceof THREE.Vector3)) {
			throw new TypeError('direction must be a THREE.Vector3');
		}

		/** @private */this.gui = gui;
		/** @private */this.world = world;
		this.DIRECTION = direction.clone().normalize();
		this.CONSTANT = constant;
		this.helperSize = helperSize;
		this.helperColor = helperColor;

		// Properties for GUI controls
		this.relPos = 0;
		this.reverse = false;

		this.slicePlane = new THREE.Plane(direction.clone(), constant);
		
		const geometry = new THREE.PlaneGeometry(helperSize, helperSize);
		const material = new THREE.MeshBasicMaterial({
			color: helperColor,
			side: THREE.DoubleSide,
			wireframe: true
		});
		this.helperPlane = new THREE.Mesh(geometry, material);
		this.helperPlane.quaternion.setFromUnitVectors(
			new THREE.Vector3(0, 0, 1),
			this.DIRECTION
		)


		this.folder = gui.addFolder('Slice Plane');
		this.folder.add(this, 'reverse')
			.name('Reverse the Slice Plane')
			.onChange(boolInput => {
				this.slicePlane.normal.multiplyScalar(-1);
				this.reverse = boolInput;
				this.update();
			});
		this.folder.add(this, 'relPos', -1, 1)
			.name('Slice Plane Position')
			.onChange(value => {
				this.relPos = value;
				this.update();
			})
			.listen();
		this.folder.add({ remove: () => {
			this.remove();
			if (onRemove) onRemove(this); // Notify main.js
		}}, 'remove').name('Remove Slice Plane');
		
	}

	/**
	 * Funciton to update SlicePlane when changed
	 * Call SlicePlaneObj.update() in render loop
	 * Function to update SlicePlane when changed	 */
	update(isInVR){
		const worldPan = this.world.position;
		const worldScale = this.world.scale.y;
		let relPos = this.relPos;
		const reverse = this.reverse ? -1 : 1; // if the slice plane is reversed, come constant need to change sign

		if (isInVR && this.helperPlane.userData.selected === true) {
			const grabInitial = this.helperPlane.userData.grabInitial;
			const controller = this.helperPlane.userData.grabController;
			const grabCurrent = controller.position;
			const planeInitial = this.helperPlane.userData.planeInitial;
			const relPosInitial = planeInitial.dot(this.DIRECTION);

			const moveVector = new THREE.Vector3();
				  moveVector.subVectors(grabCurrent, grabInitial);
			
			
			const dotProduct = moveVector.dot(this.slicePlane.normal);

			this.relPos = 
				relPosInitial + (dotProduct / worldScale);
			relPos = this.relPos;

		}

		// STEP 1: zoom
		this.slicePlane.constant = (-relPos) * worldScale;

		// STEP 2: rotate
		this.slicePlane.normal
			.copy(this.DIRECTION)
			.applyQuaternion(this.world.quaternion);

		// STEP 3: pan(translate)
		this.slicePlane.translate(worldPan);

		this.helperPlane.position.copy(this.DIRECTION)
			.multiplyScalar(relPos);
		
	}

	/**
	 * Remove helper plane and GUI folder
	 */
	remove() {
		if (this.helperPlane.parent) {
			this.helperPlane.parent.remove(this.helperPlane);
		}
		if (this.folder && this.gui) {
			this.folder.destroy();
		}
	}

}

async function tryUpdateGuiVR() {
	try {
	  const { updateGuiVR } = await import('./guiMesh.js');
	  updateGuiVR();
	} catch (error) {
	  // guiMesh.js is optional, so we can ignore the error if it doesn't exist.
	  // console.log('guiMesh.js not found, skipping VR GUI update.');
	}
}

export function initSlicePlanes({ gui, world, slicePlaneGroup, updateClippingPlanes }) {
  
	let slicePlaneParams = {
	  a: 0,
	  b: 1,
	  c: 0,
	};
  
	function addSlicePlane({
	  a = 0,
	  b = -1,
	  c = 0,
	} = {}) {
	  if (a === 0 && b === 0 && c === 0) {
		console.log('Normal vector must not be (0, 0, 0) !');
		return;
	  }
	  const normal = new THREE.Vector3(a, b, c);
	  const slicePlaneObj = new SlicePlane({
		gui,
		world,
		direction: normal,
		constant: 0,
		helperSize: 4,
		helperColor: 0x00ff00,
		onRemove: (planeObj) => {
		  const idx = slicePlanes.indexOf(planeObj);
		  if (idx !== -1) {
			slicePlanes.splice(idx, 1);
			updateClippingPlanes(slicePlanes.map(p => p.slicePlane));
		  }
		  tryUpdateGuiVR();
		},
	  });
	  slicePlanes.push(slicePlaneObj);
	  updateClippingPlanes(slicePlanes.map(p => p.slicePlane));
	  slicePlaneGroup.add(slicePlaneObj.helperPlane);
	  tryUpdateGuiVR();
	}
  
	const addSlicePlaneButton = { addSlicePlane: () => addSlicePlane(slicePlaneParams) };
	const folder = gui.addFolder('Slice Plane Controls');
	folder.add(slicePlaneParams, 'a', -4, 4, 1).name('Slice Plane Normal X');
	folder.add(slicePlaneParams, 'b', -4, 4, 1).name('Slice Plane Normal Y');
	folder.add(slicePlaneParams, 'c', -4, 4, 1).name('Slice Plane Normal Z');
	folder.add(addSlicePlaneButton, 'addSlicePlane').name('Add Slice Plane');
  
	function update(isInVR) {
	  slicePlanes.forEach((planeObj) => planeObj.update(isInVR));
	}
  
	return update;
}