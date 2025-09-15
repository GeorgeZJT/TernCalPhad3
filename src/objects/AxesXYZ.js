import * as THREE from 'three';
import { createPointAndLabel, createLine } from './PointAndLabel';

/**
 * Returns a THREE.Group containing three 2-unit axis lines:
 *   X → red, Y → green, Z → blue (positive directions only).
 */
export function createAxes() {
  const group = new THREE.Group();

  // Create axes lines
  const Origin = new THREE.Vector3(0, 0, 0);
  const Xdir = new THREE.Vector3(2, 0, 0);
  const Ydir = new THREE.Vector3(0, 2, 0);
  const Zdir = new THREE.Vector3(0, 0, 2);

  const Xpath = new THREE.LineCurve3(Origin, Xdir);
  const Ypath = new THREE.LineCurve3(Origin, Ydir);
  const Zpath = new THREE.LineCurve3(Origin, Zdir);

  group.add(createLine(Xpath, 0.01, false, 0xff0000)); // +X red
  group.add(createLine(Ypath, 0.01, false, 0x00ff00)); // +Y green
  group.add(createLine(Zpath, 0.01, false, 0x0000ff)); // +Z blue


  // Create axis labels
  group.add(createPointAndLabel(new THREE.Vector3(2, 0, 0), 'X', 0.05, 0xff0000));
  group.add(createPointAndLabel(new THREE.Vector3(0, 2, 0), 'Y', 0.05, 0x00ff00));
  group.add(createPointAndLabel(new THREE.Vector3(0, 0, 2), 'Z', 0.05, 0x0000ff));

  return group;
}
