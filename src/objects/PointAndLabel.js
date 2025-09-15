import * as THREE from 'three';
/**
 * Create a labeled 3D point with a sphere and a text label sprite.
 *
 * @param {THREE.Vector3} position - The position of the point in 3D space (required).
 * @param {String} label - The text to display as the label (required).
 * @param {Object} [options] - Optional parameters for customizing the point and label.
 * @param {Number} [options.size=0.05] - The radius of the sphere.
 * @param {Number|String|THREE.Color} [options.color=0xffffff] - The color of the sphere.
 * @param {Number|String|THREE.Color} [options.textColor=0xffffff] - The color of the label text.
 * @param {Number|String|THREE.Color} [options.backgroundColor=0x808000] - The background color of the label.
 * @param {Boolean} [options.transparentBackground=false] - Whether the label background should be transparent.
 * @param {Number} [options.labelSize] - The scale factor for the label sprite (defaults to size if not provided).
 * @param {THREE.Vector3} [options.labelPosition=new THREE.Vector3(0.1, 0.1, 0.1)] - Offset of the label relative to the point.
 * @returns {THREE.Group} A THREE.Group containing the sphere and label sprite.
 */
export function createPointAndLabel(
  position, 
  label, 
  {
    size = 0.05, 
    color = 0xffffff,
    textColor = 0x000000,
    backgroundColor = 0x808000,
    transparentBackground = false,
    labelSize = 1,
    labelPosition = new THREE.Vector3(0.05, 0.05, 0.05),
  } = {}
) {


  const group = new THREE.Group();

  // Create a small sphere at the point
  const sphereGeometry = new THREE.SphereGeometry(size, 16, 16);
  const sphereMaterial = new THREE.MeshBasicMaterial({ color });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.name = 'point';
  sphere.position.copy(position);
  group.add(sphere);

  
  // Create a text label
  const { texture, canvasWidth, canvasHeight } = createLabelTexture({
    label,
    textColor,
    backgroundColor,
    transparentBackground,
  });

  let parameters = {
    map: texture,
    transparent: transparentBackground,
    depthWrite: true,
  };

  const labelMaterial = new THREE.SpriteMaterial(parameters);
  const labelSprite = new THREE.Sprite(labelMaterial);
  labelSprite.name = 'label';
  
  labelSprite.position.copy(position);
  labelSprite.position.add(labelPosition);
  const labelScale = labelSize * .001;
  labelSprite.scale.set(labelScale * canvasWidth, labelScale * canvasHeight, 1); // scale down the label
  group.add(labelSprite);

  return group;
}



export function createLabelTexture({
  label,
  textColor = 0x000000,
  backgroundColor = 0x808000,
  transparentBackground = false,
} = {}){
  const measureCanvas = document.createElement('canvas');
  const mctx = measureCanvas.getContext('2d');

  const fontSize = 64;
  const fontSpec = `bold ${fontSize}px monospace`;
  mctx.font = fontSpec;

  const lines = String(label).split('\n');
  let maxWidth = 0;
  let ascent = fontSize * 0.8; // approximate ascent
  let descent = fontSize * 0.2; // approximate descent

  for (const line of lines) {
    const metrics = mctx.measureText(line);
    const w = metrics.width;
    maxWidth = Math.max(maxWidth, w);

    if ('actualBoundingBoxAscent' in metrics &&
        'actualBoundingBoxDescent' in metrics
    ) {ascent = Math.max(ascent, metrics.actualBoundingBoxAscent);
      descent = Math.max(descent, metrics.actualBoundingBoxDescent);
    }
  }

  const lineHeight = Math.max(ascent + descent, fontSize * 1.2);
  const totalTextHeight = lineHeight * lines.length;

  const padding = fontSize / 4;
  let canvasWidth  = Math.ceil(maxWidth + padding * 2);
  let canvasHeight = Math.ceil(totalTextHeight + padding * 2);

  const pow2 = false;
  if (pow2) {
    // make the canvas width and height a power of 2 for better GPU performance
    canvasWidth  = Math.pow(2, Math.ceil(Math.log2(canvasWidth)));
    canvasHeight = Math.pow(2, Math.ceil(Math.log2(canvasHeight)));
  }

  const canvas = document.createElement('canvas');
  canvas.width  = canvasWidth;
  canvas.height = canvasHeight;
  //console.log('canvas size:', canvasWidth, canvasHeight);
  const ctx = canvas.getContext('2d');

  if (!transparentBackground) {
    ctx.fillStyle = '#' + backgroundColor.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  }

  ctx.font = fontSpec;
  ctx.fillStyle = '#' + textColor.toString(16).padStart(6, '0');
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  
  const startX = padding;
  const centerY = canvasHeight / 2;

  lines.forEach((line, i) => {
    const y = centerY - totalTextHeight / 2 + (i + 0.5) * lineHeight;
    ctx.fillText(line, startX, y);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return { texture, canvasWidth, canvasHeight };
}

// helper to make a line using TubeGeometry
export function createLine(path, radius = 0.01, closed = false, color = 0xffffff) {
  const tubularSegments = 20;   // number of segments along the length
  const radialSegments  = 8;    // number of segments around the radius

  const geometry = new THREE.TubeGeometry(
    path,
    tubularSegments,
    radius,
    radialSegments,
    closed
  );
  
  const material = new THREE.MeshBasicMaterial({ color });
  const mesh     = new THREE.Mesh(geometry, material);

  return mesh;
};