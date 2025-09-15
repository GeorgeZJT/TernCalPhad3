// loadBrillouin.js

import * as THREE from 'three';

/**
 * Load a JSON of Brillouin‐zone lines (array of [[x,y,z],[x,y,z]] pairs)
 * and convert it into a THREE.BufferGeometry suitable for LineSegments.
 *
 * @param {string} jsonUrl — URL or path to your JSON file
 * @returns {Promise<THREE.BufferGeometry>}
 */
export async function loadBrillouinGeometry(jsonUrl) {
  // 1. Fetch & parse
  const res = await fetch(jsonUrl);
  if (!res.ok) {
    throw new Error(`Failed to load Brillouin data from "${jsonUrl}": ${res.status} ${res.statusText}`);
  }
  const lines = await res.json();
  // 2. Flatten into a Float32Array: 2 points × 3 coords each × number of lines
  const positions = new Float32Array(lines.length * 2 * 3);
  let ptr = 0;
  for (const [[x1, y1, z1], [x2, y2, z2]] of lines) {
    positions[ptr++] = y1;
    positions[ptr++] = z1;
    positions[ptr++] = x1;
    positions[ptr++] = y2;
    positions[ptr++] = z2;
    positions[ptr++] = x2;
  }

  // 3. Build BufferGeometry
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.computeBoundingSphere();
  geometry.name = 'BrillouinLinesGeometry';

  return geometry;
}
