import * as THREE from 'three';
import { createPointAndLabel, createLine } from './PointAndLabel';

export async function loadHSPointsGeometry(hsPointURL, hsPathURL) {
	const world = new THREE.Group();
	try {
		const response = await fetch(hsPointURL);
		if (!response.ok) {
			throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
		}
		const data = await response.json();
		const [pointsArray, labels] = data;

		if (!Array.isArray(pointsArray) || !Array.isArray(labels)) {
			throw new Error('Invalid HS points JSON format: expected [ [coords...], [labels...] ]');
		}

		const responsePath = await fetch(hsPathURL);
		if (!responsePath.ok) {
			throw new Error(`Failed to fetch ${hsPathURL}: ${responsePath.status} ${responsePath.statusText}`);
		}
		const pathData = await responsePath.json();
		const paths = pathData

		let hsPointMap = new Map();
		pointsArray.forEach((coords, index) => {
			const [z, x, y] = coords; // change from z up to y up
			const coord = new THREE.Vector3(x, y, z);
			const label = labels[index] || '';
			if (hsPointMap.has(label)) {
				console.warn(`Duplicate label found: ${label}. Skipping.`);
			} else {
				hsPointMap.set(label, coord);
			}
			const HSPoint = createPointAndLabel(coord, label);
			world.add(HSPoint);
		});

		let point1 = new THREE.Vector3(0, 0, 0);
		let point2 = new THREE.Vector3(0, 0, 0);
		let segmant = new THREE.Line3(point1, point2);
		paths.forEach((path) => {
			const point1name = path[0];
			const point2name = path[1];

			point1.copy(hsPointMap.get(point1name));
			point2.copy(hsPointMap.get(point2name));
			segmant = new THREE.LineCurve3(point1, point2);

			const line = createLine(segmant);
			world.add(line);
		});

	} catch (error) {
		console.error('Error loading HS points:', error);
	}
	return world;
}