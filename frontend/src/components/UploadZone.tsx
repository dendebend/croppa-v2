/**
 * UploadZone - Drag and drop file upload component
 */

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageStore } from '@/stores/image-store';
import { detectFace } from '@/lib/api';
import { CONFIG } from '@/config';

export function UploadZone() {
  const { addImages, setImageDetecting, updateImageFace, images } = useImageStore();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      await addImages(acceptedFiles);

      const store = useImageStore.getState();
      const newImages = store.images.slice(-acceptedFiles.length);

      for (const img of newImages) {
        setImageDetecting(img.id, true);
        try {
          const result = await detectFace(img.file);
          updateImageFace(img.id, result.face, result.error ?? undefined);
        } catch (error) {
          updateImageFace(img.id, null, 'Failed to detect face');
        }
      }
    },
    [addImages, setImageDetecting, updateImageFace]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: CONFIG.MAX_FILE_SIZE,
  });

  const isEmpty = images.length === 0;

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg transition-colors cursor-pointer',
        isEmpty ? 'p-16' : 'p-3',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      )}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center text-center">
        {isEmpty ? (
          <Upload className={cn(
            "text-muted-foreground",
            isDragActive ? "h-16 w-16 text-primary" : "h-12 w-12"
          )} />
        ) : (
          <Plus className={cn(
            "h-5 w-5",
            isDragActive ? "text-primary" : "text-muted-foreground"
          )} />
        )}
      </div>
    </div>
  );
}
