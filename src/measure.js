import * as THREE from 'three';
import { createPointAndLabel, createLabelTexture, createLine } from './objects/PointAndLabel.js';

const DEADZONE = 0.1; // Deadzone for controller movement to start distance measurement

/**
 * Class representing ONE RULER MEASURE
 * Create multiple instances for each press-drag-release action.
 * In controllers.js, create a Measure instance when pressing the controller button.
 * Call Measure.release() when releasing the button.
 * Call Measure.update() in main.js render loop to update the measure each frame.
 * 
 */
export class Measure {
    constructor({
        event, // don't know what this is for yet
        world,
        controller,
} = {}) {
        this.world = world;
        this.controller = controller;

        console.log('measure start');
        this.measureGroup = new THREE.Group();
        this.measureGroup.name = 'measureGroupClass';
        this.world.add(this.measureGroup);
        this.active = true; // Change to false when this.release() is called
        this.measuring = false;
        
        const globalPosition = controller.position.clone();
        const localPosition = new THREE.Vector3();
        localPosition.copy( this.world.worldToLocal(globalPosition) );
        this.initialPosition = localPosition.clone();

        const text = prettyTextFromVector3(localPosition, 2);
        this.startPointAndLabel = createPointAndLabel(
            localPosition, 
            text, 
            {
                size: 0.02,
                labelSize: 0.5,
                labelPosition: new THREE.Vector3(0, 0.2, 0),
        });
        this.startPointAndLabel.name = 'startPointAndLabel';
        console.log('global:', globalPosition, 'local:', localPosition);

        this.measureGroup.add(this.startPointAndLabel);

        // Empty Endpoint
        this.endPointAndLabel = createPointAndLabel(
            new THREE.Vector3(0, 0, 0), 
            '', 
            {
                size: 0.02,
                labelSize: 0.5,
                labelPosition: new THREE.Vector3(0, 0.2, 0),
        });
        this.endPointAndLabel.name = 'endPointAndLabel';
        this.measureGroup.add(this.endPointAndLabel);
        this.endPointAndLabel.visible = false;

        // Empty MeasureLine (THREE.Line for efficient updates)
        const points = [localPosition.clone(), localPosition.clone()];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.measureLine = new THREE.Line(geometry, material);
        this.measureLine.name = 'measureLine';
        this.measureGroup.add(this.measureLine);
        this.measureLine.visible = false;

        // Empty MidPoint and length label
        this.midPointAndLabel = createPointAndLabel(
            new THREE.Vector3(0, 0, 0), 
            '', 
            {
                size: 0.02,
                labelSize: 0.5,
                labelPosition: new THREE.Vector3(0, 0.2, 0),
        });
        this.midPointAndLabel.name = 'midPointAndLabel';
        this.measureGroup.add(this.midPointAndLabel);
        this.midPointAndLabel.visible = false;
    }

    release(){
        this.active = false;
    }

    update(){
        if (!this.active) return;

        const globalPosition = this.controller.position.clone();
        const localPosition = new THREE.Vector3();
        localPosition.copy( this.world.worldToLocal(globalPosition) );
        const distance = localPosition.distanceTo(this.initialPosition);

        if (distance < DEADZONE) {
            if (this.measuring === true) {
                this.measuring = false;
                // TODO: remove measureline, midpoint, midpointlabel, endpoint, endpointlabel
                this.endPointAndLabel.visible = false;
                this.measureLine.visible = false;
                this.midPointAndLabel.visible = false;
            }
            return;
        } else {
            if (this.measuring === false) {
                this.measuring = true;
                // TODO: create measureline, midpoint, midpointlabel, endpoint, endpointlabel
                this.endPointAndLabel.visible = true;
                this.measureLine.visible = true;
                this.midPointAndLabel.visible = true;
            }

            // Update EndPointAndLabel
            const endPoint = this.endPointAndLabel.getObjectByName('point');
            const endLabel = this.endPointAndLabel.getObjectByName('label');
            endPoint.position.copy(localPosition);
            const text = prettyTextFromVector3(localPosition, 2);
            let { texture, canvasWidth, canvasHeight } = createLabelTexture( {label: text} );
            endLabel.material.map = texture;
            endLabel.scale.set(canvasWidth * 0.0005, canvasHeight * 0.0005, 1); // TODO: same as the initial size, maybe need to make PointAndLabel a class
            endLabel.position.copy(localPosition).add(new THREE.Vector3(0, 0.2, 0));

            // Update measureLine (update BufferGeometry positions)
            const positions = this.measureLine.geometry.attributes.position.array;
            positions[0] = this.initialPosition.x;
            positions[1] = this.initialPosition.y;
            positions[2] = this.initialPosition.z;
            positions[3] = localPosition.x;
            positions[4] = localPosition.y;
            positions[5] = localPosition.z;
            this.measureLine.geometry.attributes.position.needsUpdate = true;
            
            // Update MidPointAndLabel
            const midPoint = this.midPointAndLabel.getObjectByName('point');
            const midLabel = this.midPointAndLabel.getObjectByName('label');
            const midPosition = this.initialPosition.clone().add(localPosition).multiplyScalar(0.5);
            midPoint.position.copy(midPosition);
            const midText = prettyText([distance], ['Distance'], 2);
            let { texture: midTexture, canvasWidth: midCanvasWidth, canvasHeight: midCanvasHeight } = createLabelTexture( {label: midText} );
            midLabel.material.map = midTexture;
            midLabel.scale.set(midCanvasWidth * 0.0005, midCanvasHeight * 0.0005, 1); // TODO: same as the initial size, maybe need to make PointAndLabel a class
            midLabel.position.copy(midPosition).add(new THREE.Vector3(0, 0.2, 0));

        }
    }

    clear(){
        this.clearPointAndLabel(this.startPointAndLabel);
        // this.measureGroup.remove(this.startPoint);
        // this.world.remove(this.measureGroup);
        this.startPointAndLabel.removeFromParent();
        this.measureGroup.removeFromParent();

    }

    clearPointAndLabel(pointAndLabel) { // TODO: move it to PointAndLabel.js in the future
        pointAndLabel.getObjectByName('point').geometry.dispose();
        pointAndLabel.getObjectByName('point').material.dispose();
    }
}

export function prettyText(numberList, nameList, decimal = 2) {
    if (numberList.length !== nameList.length) {
        throw new Error('prettyText: numberList and nameList must have the same length');
    }
    
    let longestLeft = 0;
    for (const number of numberList) {
        const left = Math.abs(Math.trunc(number)).toString().length;
        if (left > longestLeft) {
            longestLeft = left;
        }
    }
    
    let longestName = 0;
    for (const name of nameList) {
        if (name.length > longestName) {
            longestName = name.length;
        }
    }
    
    let text = '';
    for (let i = 0; i < numberList.length; ++i) {
        const number = numberList[i];
        const name = nameList[i];
        const namePadding = ' '.repeat(longestName - name.length);
        const numberPadding = ' '.repeat(longestLeft - Math.abs(Math.trunc(number)).toString().length);
        const negativeSign = number > 0 ? ' ' : '-';
        const formattedNumber = Math.abs(number).toFixed(decimal);
        text += name + namePadding + ' = ' + negativeSign + numberPadding + formattedNumber;
        if (i !== numberList.length - 1) {
            text += '\n';
        }
    }

    return text;

}

export function prettyTextFromVector3(Vector3, decimal = 2) {
    const x = Vector3.x;
    const y = Vector3.y;
    const z = Vector3.z;
    return prettyText(
        [x, y, z],
        ['x', 'y', 'z'],
        decimal
    );
}