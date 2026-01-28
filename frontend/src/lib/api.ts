/**
 * API client for face detection
 */

import { CONFIG } from '@/config';

export interface FaceCoords {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface DetectFaceResponse {
  success: boolean;
  face: FaceCoords | null;
  error: string | null;
}

/**
 * Send image to backend for face detection
 */
export async function detectFace(file: File): Promise<DetectFaceResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${CONFIG.API_URL}/detect-face`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
