// src/modules/photoPlane.js

import {
  TextureLoader,
  PlaneGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Euler
} from 'three';

/**
 * Adds a textured plane (showing a PNG) to the given scene.
 *
 * @param {Scene} scene         – your THREE.Scene instance
 * @param {string} url          – path or URL to your PNG (e.g. '/assets/myPhoto.png')
 * @param {Object} [options]    – optional settings:
 *   @param {number} [options.width=1]    – plane width
 *   @param {number} [options.height=1]   – plane height
 *   @param {Vector3} [options.position]  – where to place the plane
 *   @param {Euler}   [options.rotation]  – rotation of the plane
 *   @param {boolean} [options.transparent=true] – keep PNG transparency
 */
export function addPhotoPlane(
  scene,
  url,
  {
    width = 1,
    height = 1,
    position = new Vector3(0, 0, 0),
    rotation = new Euler(0, 0, 0),
    transparent = true
  } = {}
) {
  const loader = new TextureLoader();
  console.log('Loading texture from URL:', url);
  // begin loading the texture
  loader.load(
    url,
    texture => {
      // once loaded, create geometry + material + mesh
      const geometry = new PlaneGeometry(width, height);
      const material = new MeshBasicMaterial({
        map: texture,
        transparent: transparent
      });
      const plane = new Mesh(geometry, material);

      // apply transforms
      plane.position.copy(position);
      plane.rotation.copy(rotation);

      // add to scene
      scene.add(plane);
    },
    // onProgress callback (optional)
    undefined,
    // onError callback
    err => console.error(`Failed to load texture from ${url}:`, err)
  );
}
