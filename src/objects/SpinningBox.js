import * as THREE from 'three';

/**
 * Builds a coloured BoxGeometry mesh and returns it.
 * You can change material options or pass params in as you grow.
 */
export function createBox() {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x6699ff });
  return new THREE.Mesh(geometry, material);
}
