/**
 * Zustand store for image state management
 */

import { create } from 'zustand';
import { CONFIG, OutputSize } from '@/config';
import { FaceCoords } from '@/lib/api';

export interface ImageItem {
  id: string;
  file: File;
  name: string;
  objectUrl: string;
  width: number;
  height: number;
  face: FaceCoords | null;
  faceDetected: boolean;
  detecting: boolean;
  error: string | null;
  // Per-image edit settings
  padding: number;
  offsetX: number;
  offsetY: number;
}

interface ImageStore {
  // State
  images: ImageItem[];
  selectedId: string | null;

  // Global settings
  outputSize: OutputSize;
  circularMask: boolean;

  // Processing state
  processing: boolean;
  processedCount: number;

  // Actions
  addImages: (files: File[]) => Promise<void>;
  removeImage: (id: string) => void;
  clearAll: () => void;
  selectImage: (id: string | null) => void;

  updateImageFace: (id: string, face: FaceCoords | null, error?: string) => void;
  setImageDetecting: (id: string, detecting: boolean) => void;

  updateImageSettings: (id: string, settings: Partial<Pick<ImageItem, 'padding' | 'offsetX' | 'offsetY'>>) => void;
  applySettingsToAll: (settings: Partial<Pick<ImageItem, 'padding' | 'offsetX' | 'offsetY'>>) => void;

  setOutputSize: (size: OutputSize) => void;
  setCircularMask: (enabled: boolean) => void;

  setProcessing: (processing: boolean, count?: number) => void;

  // Selectors
  getSelectedImage: () => ImageItem | null;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

async function loadImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export const useImageStore = create<ImageStore>((set, get) => ({
  // Initial state
  images: [],
  selectedId: null,
  outputSize: CONFIG.DEFAULT_OUTPUT_SIZE,
  circularMask: false,
  processing: false,
  processedCount: 0,

  // Add images from file input/drop
  addImages: async (files: File[]) => {
    const validFiles = files.filter(
      (f) => (CONFIG.ACCEPTED_TYPES as readonly string[]).includes(f.type) && f.size <= CONFIG.MAX_FILE_SIZE
    );

    const newImages: ImageItem[] = await Promise.all(
      validFiles.map(async (file) => {
        const id = generateId();
        const objectUrl = URL.createObjectURL(file);
        const { width, height } = await loadImageDimensions(file);

        return {
          id,
          file,
          name: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          objectUrl,
          width,
          height,
          face: null,
          faceDetected: false,
          detecting: false,
          error: null,
          padding: CONFIG.DEFAULT_PADDING,
          offsetX: 0,
          offsetY: 0,
        };
      })
    );

    set((state) => ({
      images: [...state.images, ...newImages],
      selectedId: state.selectedId ?? newImages[0]?.id ?? null,
    }));
  },

  removeImage: (id: string) => {
    const state = get();
    const image = state.images.find((img) => img.id === id);
    if (image) {
      URL.revokeObjectURL(image.objectUrl);
    }

    set((state) => ({
      images: state.images.filter((img) => img.id !== id),
      selectedId: state.selectedId === id
        ? state.images.find((img) => img.id !== id)?.id ?? null
        : state.selectedId,
    }));
  },

  clearAll: () => {
    const state = get();
    state.images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    set({ images: [], selectedId: null });
  },

  selectImage: (id: string | null) => {
    set({ selectedId: id });
  },

  updateImageFace: (id: string, face: FaceCoords | null, error?: string) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id
          ? { ...img, face, faceDetected: face !== null, detecting: false, error: error ?? null }
          : img
      ),
    }));
  },

  setImageDetecting: (id: string, detecting: boolean) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, detecting } : img
      ),
    }));
  },

  updateImageSettings: (id: string, settings) => {
    set((state) => ({
      images: state.images.map((img) =>
        img.id === id ? { ...img, ...settings } : img
      ),
    }));
  },

  applySettingsToAll: (settings) => {
    set((state) => ({
      images: state.images.map((img) => ({ ...img, ...settings })),
    }));
  },

  setOutputSize: (size: OutputSize) => {
    set({ outputSize: size });
  },

  setCircularMask: (enabled: boolean) => {
    set({ circularMask: enabled });
  },

  setProcessing: (processing: boolean, count = 0) => {
    set({ processing, processedCount: count });
  },

  getSelectedImage: () => {
    const state = get();
    return state.images.find((img) => img.id === state.selectedId) ?? null;
  },
}));
