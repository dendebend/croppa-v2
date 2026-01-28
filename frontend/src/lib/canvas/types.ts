/**
 * Canvas processing types
 */

export interface FaceCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface CropBox {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export interface CropSettings {
  face: FaceCoords;
  imgWidth: number;
  imgHeight: number;
  padding: number;
  offsetX: number;
  offsetY: number;
}
