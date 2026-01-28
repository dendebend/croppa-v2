/**
 * Croppa v2 Configuration
 * All magic numbers in one place
 */

export const CONFIG = {
  // API
  API_URL: import.meta.env.VITE_API_URL || '/api',

  // Output sizes available
  OUTPUT_SIZES: [200, 300, 400, 500] as const,
  DEFAULT_OUTPUT_SIZE: 300,

  // Crop settings
  DEFAULT_PADDING: 0.3,      // 30% padding around face
  MIN_PADDING: 0,
  MAX_PADDING: 0.5,          // 50% max
  PADDING_STEP: 0.01,

  // Offset range (relative to face size)
  MAX_OFFSET: 0.5,           // 50% of face size
  OFFSET_STEP: 0.01,

  // Circular mask settings
  SUPERSAMPLE: 4,
  BLUR_RADIUS: 3.2,          // SUPERSAMPLE * 0.8
  GAMMA: 0.8,

  // Preview
  PREVIEW_SIZE: 400,         // Preview canvas size
  THUMBNAIL_SIZE: 80,        // Grid thumbnail size

  // File validation
  ACCEPTED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  MAX_FILE_SIZE: 20 * 1024 * 1024,  // 20MB
} as const;

export type OutputSize = typeof CONFIG.OUTPUT_SIZES[number];
