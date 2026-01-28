/**
 * ImagePreview - Live preview canvas with mouse interactions
 * - Drag to adjust X/Y offset
 * - Scroll wheel to adjust padding
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useImageStore } from '@/stores/image-store';
import { getCropCoords, applyCrop, applyCircularMask } from '@/lib/canvas';
import { CONFIG } from '@/config';

export function ImagePreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const { images, selectedId, outputSize, circularMask, updateImageSettings } = useImageStore();
  const selectedImage = images.find((img) => img.id === selectedId);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, offsetX: 0, offsetY: 0 });

  // Render the preview
  const renderPreview = useCallback(() => {
    if (!imageRef.current || !selectedImage || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = imageRef.current;
    const previewSize = CONFIG.PREVIEW_SIZE;

    canvas.width = previewSize;
    canvas.height = previewSize;

    // If no face detected, use center crop
    const face = selectedImage.face || {
      x: img.width / 4,
      y: img.height / 4,
      w: img.width / 2,
      h: img.height / 2,
    };

    const cropBox = getCropCoords({
      face,
      imgWidth: img.width,
      imgHeight: img.height,
      padding: selectedImage.padding,
      offsetX: selectedImage.offsetX,
      offsetY: selectedImage.offsetY,
    });

    const cropped = applyCrop(img, cropBox, previewSize);

    if (circularMask) {
      applyCircularMask(cropped);
    }

    ctx.clearRect(0, 0, previewSize, previewSize);

    if (circularMask) {
      drawCheckerboard(ctx, previewSize);
    }

    ctx.drawImage(cropped, 0, 0);
  }, [selectedImage, circularMask]);

  // Load image when selection changes
  useEffect(() => {
    if (!selectedImage) return;

    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      renderPreview();
    };
    img.src = selectedImage.objectUrl;
  }, [selectedImage?.id, selectedImage?.objectUrl]);

  // Re-render when settings change
  useEffect(() => {
    renderPreview();
  }, [
    selectedImage?.padding,
    selectedImage?.offsetX,
    selectedImage?.offsetY,
    circularMask,
    renderPreview,
  ]);

  // Mouse drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!selectedImage) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: selectedImage.offsetX,
      offsetY: selectedImage.offsetY,
    };
  }, [selectedImage]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedImage) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Scale movement based on image vs preview size ratio
    const face = selectedImage.face || { w: selectedImage.width / 2, h: selectedImage.height / 2 };
    const scale = Math.max(face.w, face.h) / CONFIG.PREVIEW_SIZE * 2;

    // Invert direction: dragging right should move crop left (offset negative)
    const newOffsetX = dragStartRef.current.offsetX - Math.round(dx * scale);
    const newOffsetY = dragStartRef.current.offsetY - Math.round(dy * scale);

    // Clamp offsets
    const maxOffset = Math.round(Math.max(face.w, face.h) * 0.5);

    updateImageSettings(selectedImage.id, {
      offsetX: Math.max(-maxOffset, Math.min(maxOffset, newOffsetX)),
      offsetY: Math.max(-maxOffset, Math.min(maxOffset, newOffsetY)),
    });
  }, [isDragging, selectedImage, updateImageSettings]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse leave also ends drag
  const handleMouseLeave = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  // Scroll wheel for padding
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!selectedImage) return;

    e.preventDefault();

    // Scroll up = zoom in = less padding, scroll down = zoom out = more padding
    const delta = e.deltaY > 0 ? 0.02 : -0.02;
    const newPadding = Math.max(
      CONFIG.MIN_PADDING,
      Math.min(CONFIG.MAX_PADDING, selectedImage.padding + delta)
    );

    updateImageSettings(selectedImage.id, { padding: newPadding });
  }, [selectedImage, updateImageSettings]);

  if (!selectedImage) {
    return (
      <div
        className="flex items-center justify-center bg-muted rounded-lg"
        style={{ width: CONFIG.PREVIEW_SIZE, height: CONFIG.PREVIEW_SIZE }}
      >
        <p className="text-muted-foreground">No image selected</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className={`rounded-lg shadow-lg ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{ width: CONFIG.PREVIEW_SIZE, height: CONFIG.PREVIEW_SIZE }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        {outputSize}x{outputSize}
      </div>
      <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">
        {Math.round(selectedImage.padding * 100)}% padding
      </div>
    </div>
  );
}

function drawCheckerboard(ctx: CanvasRenderingContext2D, size: number) {
  const tileSize = 10;
  for (let x = 0; x < size; x += tileSize) {
    for (let y = 0; y < size; y += tileSize) {
      const isLight = ((x / tileSize) + (y / tileSize)) % 2 === 0;
      ctx.fillStyle = isLight ? '#ffffff' : '#e0e0e0';
      ctx.fillRect(x, y, tileSize, tileSize);
    }
  }
}
