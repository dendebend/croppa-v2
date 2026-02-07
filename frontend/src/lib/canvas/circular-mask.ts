/**
 * Circular mask with feathered edges
 * Uses a radial gradient for smooth, anti-aliased falloff
 */

/**
 * Create anti-aliased circular mask at given size
 * The R channel carries the mask value (255 = keep, 0 = discard)
 */
export function createCircularMask(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext('2d')!;

  // Black background = fully masked outside the circle
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  const center = size / 2;
  const radius = (size - 2) / 2; // slight inset to prevent edge clipping
  const feather = Math.max(1.5, size * 0.015);

  // Radial gradient: solid white interior, fading to black at the edge
  const gradient = ctx.createRadialGradient(
    center, center, Math.max(0, radius - feather),
    center, center, radius
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#000000');

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

/**
 * Apply circular mask to an image canvas
 * Modifies the canvas in place
 */
export function applyCircularMask(canvas: HTMLCanvasElement): void {
  const size = canvas.width;
  const ctx = canvas.getContext('2d')!;

  // Get the mask (cached)
  const mask = getCachedMask(size);
  const maskCtx = mask.getContext('2d')!;
  const maskData = maskCtx.getImageData(0, 0, size, size);

  // Get the image data
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Apply mask to alpha channel using R channel as mask value
  for (let i = 0; i < data.length; i += 4) {
    const maskVal = maskData.data[i]; // R channel of mask
    // Multiply existing alpha by mask value
    data[i + 3] = Math.round((data[i + 3] * maskVal) / 255);
  }

  ctx.putImageData(imageData, 0, 0);
}

// Cache for mask canvases (keyed by size)
const maskCache = new Map<number, HTMLCanvasElement>();

/**
 * Get or create cached circular mask
 */
export function getCachedMask(size: number): HTMLCanvasElement {
  let mask = maskCache.get(size);
  if (!mask) {
    mask = createCircularMask(size);
    maskCache.set(size, mask);
  }
  return mask;
}
