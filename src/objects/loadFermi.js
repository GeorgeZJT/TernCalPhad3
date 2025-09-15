import * as THREE from 'three';

/**
 * Turn parsed JSON mesh data → THREE.BufferGeometry
 * @param {Object} data        parsed JSON with .verts and .faces arrays
 * @returns {THREE.BufferGeometry}
 */
export function buildGeometry(data) {
  const positions = [];   // flat x,y,z…
  const indices   = [];   // triangle indices
  let offset = 0;         // running vertex-index offset

  data.verts.forEach((meshVerts, meshIdx) => {
    // add vertices
    meshVerts.forEach(([x, y, z]) => {
      positions.push(  y,  z, -x );   // convert from Z-up to Y-up
    });

    // add faces (with offset)
    (data.faces[meshIdx] || []).forEach(face =>
      indices.push(...face.map(i => i + offset))
    );

    offset += meshVerts.length;
  });

  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geo.setIndex(indices);
  geo.computeVertexNormals();       // lighting looks correct

  // If >65 535 vertices, enable 32-bit indices
  if (positions.length / 3 > 65535) {
    geo.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  }

  return geo;
}

/**
 * Fetch a mesh JSON by URL and build a geometry
 * @param {string} url   path or import URL to your JSON file
 * @returns {Promise<THREE.BufferGeometry>}
 */
export async function loadMesh(url) {
  if (!url) {
    throw new Error('loadMesh: you must pass a JSON file URL');
  }

  const res = await fetch(url);
  // if (!res.ok) {
  //   throw new Error(`loadMesh: failed to fetch ${url} – ${res.statusText}`);
  // }
  const data = await res.json();
  console.log(data);
  return buildGeometry(data);
}
