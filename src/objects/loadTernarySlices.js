import * as THREE from 'three';

/**
 * Loads and stacks PNG images from a folder as textured square meshes along the y-axis.
 * @param {Object} options - Options for mesh size and spacing.
 * @param {number} [options.size=1] - Size of each square mesh (width and height).
 * @param {number} [options.spacing=0.01] - Spacing per unit T (default: 1 unit per 1000K).
 * @returns {Promise<THREE.Group>} - Promise resolving to a THREE.Group containing stacked meshes.
 */
export async function loadImageStack({
	size = 1,
	spacing = 1 / 1000,
} = {}) {

	// Use Vite's import.meta.glob to import all PNGs from output_images_2
	const modules = import.meta.glob('../assets/output_images_2/T=*.png', { eager: true });
	const imagesWithT = Object.keys(modules)
		.map(path => {
			const match = path.match(/T=(\d+)\.png$/);
			// Vite returns a module object, use .default for file URL
			return match ? { url: modules[path].default, T: parseInt(match[1], 10) } : null;
		})
		.filter(Boolean)
		.sort((a, b) => a.T - b.T);

	// Find minimum T value
	const firstT = imagesWithT.length > 0 ? imagesWithT[0].T : 0;

	const group = new THREE.Group();

	// Helper to load a texture
	function loadTexture(url) {
		return new Promise((resolve, reject) => {
			const loader = new THREE.TextureLoader();
			loader.load(url, resolve, undefined, reject);
		});
	}


	// Load textures sequentially to avoid browser overload
	for (const { url, T } of imagesWithT) {
		try {
			const texture = await loadTexture(url);
			texture.encoding = THREE.sRGBEncoding;
			texture.anisotropy = 8;
			const material = new THREE.MeshBasicMaterial({
				map: texture,
				transparent: true,
				side: THREE.DoubleSide,
			});
			const geometry = new THREE.PlaneGeometry(size, size);
			const mesh = new THREE.Mesh(geometry, material);
			mesh.rotation.x = -Math.PI / 2; // Rotate to lie flat on XZ plane
			mesh.position.set(0, spacing * (T - firstT), 0);
			mesh.name = `T=${T}`;
			group.add(mesh);
			console.log(`Loaded image for T=${T}K`);
		} catch (err) {
			console.warn(`Failed to load image: ${url}`);
		}
	}

	return group;
}
