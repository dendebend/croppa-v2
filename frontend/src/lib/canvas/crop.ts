/**
 * Square crop logic with padding and offsets
 * Fixed version of v1 bugs
 */

import { FaceCoords, CropBox, CropSettings } from './types';

/**
 * Calculate crop coordinates for a square crop centered on face
 */
export function getCropCoords(settings: CropSettings): CropBox {
  const { face, imgWidth, imgHeight, padding, offsetX, offsetY } = settings;

  // Calculate face center with manual offsets
  const cx = face.x + face.w / 2 + offsetX;
  const cy = face.y + face.h / 2 + offsetY;

  // Calculate padded square size
  // FIX: v1 had this inverted. Padding ADDS to the crop, not subtracts
  const baseSize = Math.max(face.w, face.h);
  const paddedSize = Math.round(baseSize * (1 + padding * 2));
  const half = Math.round(paddedSize / 2);

  // Initial bounds centered on face
  let left = cx - half;
  let top = cy - half;
  let right = cx + half;
  let bottom = cy + half;

  // Clamp to image boundaries
  left = Math.max(0, left);
  top = Math.max(0, top);
  right = Math.min(imgWidth, right);
  bottom = Math.min(imgHeight, bottom);

  // Maintain square after clamping
  const w = right - left;
  const h = bottom - top;
  const size = Math.min(w, h);

  // FIX: v1 used floor which caused off-by-one errors
  if (w > size) {
    const excess = w - size;
    left += Math.round(excess / 2);
    right = left + size;
  } else if (h > size) {
    const excess = h - size;
    top += Math.round(excess / 2);
    bottom = top + size;
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    right: Math.round(right),
    bottom: Math.round(bottom),
  };
}

/**
 * Apply crop to an image and resize to output size
 */
export function applyCrop(
  sourceImage: HTMLImageElement,
  cropBox: CropBox,
  outputSize: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;

  const ctx = canvas.getContext('2d')!;

  const cropWidth = cropBox.right - cropBox.left;
  const cropHeight = cropBox.bottom - cropBox.top;

  ctx.drawImage(
    sourceImage,
    cropBox.left,
    cropBox.top,
    cropWidth,
    cropHeight,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas;
}

/**
 * Get maximum offset that keeps face in frame
 */
export function getMaxOffset(face: FaceCoords, padding: number): number {
  const baseSize = Math.max(face.w, face.h);
  const paddedSize = baseSize * (1 + padding * 2);
  // Allow offset up to half the padding on each side
  return Math.round(paddedSize * 0.25);
}
