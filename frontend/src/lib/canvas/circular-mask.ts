/**
 * Anti-aliased circular mask implementation
 * Uses supersampling + blur for smooth edges
 */

import { CONFIG } from '@/config';

/**
 * Create a circular mask canvas
 */
function createMaskCanvas(size: number): HTMLCanvasElement {
  const hiRes = size * CONFIG.SUPERSAMPLE;
  const canvas = document.createElement('canvas');
  canvas.width = hiRes;
  canvas.height = hiRes;

  const ctx = canvas.getContext('2d')!;

  // Draw white circle on transparent background
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  // Slight inset to prevent edge artifacts
  ctx.arc(hiRes / 2, hiRes / 2, (hiRes - 8) / 2, 0, Math.PI * 2);
  ctx.fill();

  return canvas;
}

/**
 * Apply blur to a canvas (simple box blur approximation)
 */
function applyBlur(canvas: HTMLCanvasElement, radius: number): void {
  const ctx = canvas.getContext('2d')!;

  // Use CSS filter for blur (well supported in modern browsers)
  ctx.filter = `blur(${radius}px)`;
  ctx.drawImage(canvas, 0, 0);
  ctx.filter = 'none';
}

/**
 * Downscale canvas with quality
 */
function downscale(source: HTMLCanvasElement, targetSize: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = targetSize;
  canvas.height = targetSize;

  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(source, 0, 0, targetSize, targetSize);

  return canvas;
}

/**
 * Apply gamma correction to mask
 */
function applyGamma(canvas: HTMLCanvasElement, gamma: number): void {
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    // Use red channel as mask value (grayscale)
    const val = data[i] / 255;
    const corrected = Math.round(255 * Math.pow(val, gamma));
    data[i] = corrected;     // R
    data[i + 1] = corrected; // G
    data[i + 2] = corrected; // B
    // Alpha stays at 255
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Create anti-aliased circular mask at given size
 */
export function createCircularMask(size: number): HTMLCanvasElement {
  // Create high-res mask
  const maskHi = createMaskCanvas(size);

  // Apply blur at high res
  applyBlur(maskHi, CONFIG.BLUR_RADIUS);

  // Downscale to target size
  const mask = downscale(maskHi, size);

  // Apply gamma for better edge falloff
  applyGamma(mask, CONFIG.GAMMA);

  return mask;
}

/**
 * Apply circular mask to an image canvas
 * Modifies the canvas in place
 */
export function applyCircularMask(canvas: HTMLCanvasElement): void {
  const size = canvas.width;
  const ctx = canvas.getContext('2d')!;

  // Get the mask
  const mask = createCircularMask(size);
  const maskCtx = mask.getContext('2d')!;
  const maskData = maskCtx.getImageData(0, 0, size, size);

  // Get the image data
  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  // Apply mask to alpha channel
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
