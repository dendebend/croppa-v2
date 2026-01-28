/**
 * PreviewGrid - Thumbnail grid of uploaded images
 */

import { X, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useImageStore, ImageItem } from '@/stores/image-store';
import { CONFIG } from '@/config';

function Thumbnail({ image }: { image: ImageItem }) {
  const { selectedId, selectImage, removeImage } = useImageStore();
  const isSelected = selectedId === image.id;

  return (
    <div
      className={cn(
        'relative group rounded-md overflow-hidden cursor-pointer transition-all',
        'border-2',
        isSelected ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-muted-foreground/25'
      )}
      style={{ width: CONFIG.THUMBNAIL_SIZE, height: CONFIG.THUMBNAIL_SIZE }}
      onClick={() => selectImage(image.id)}
    >
      {/* Image */}
      <img
        src={image.objectUrl}
        alt={image.name}
        className="w-full h-full object-cover"
      />

      {/* Status overlay */}
      {image.detecting && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-white animate-spin" />
        </div>
      )}

      {!image.detecting && !image.faceDetected && (
        <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-white" />
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeImage(image.id);
        }}
        className={cn(
          'absolute top-1 right-1 p-1 rounded-full',
          'bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity',
          'hover:bg-red-500'
        )}
      >
        <X className="h-3 w-3" />
      </button>

      {/* Name tooltip on hover */}
      <div className={cn(
        'absolute bottom-0 left-0 right-0 p-1',
        'bg-gradient-to-t from-black/70 to-transparent',
        'opacity-0 group-hover:opacity-100 transition-opacity'
      )}>
        <p className="text-white text-xs truncate">{image.name}</p>
      </div>
    </div>
  );
}

export function PreviewGrid() {
  const { images, clearAll } = useImageStore();

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          {images.length} image{images.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-muted-foreground hover:text-destructive transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {images.map((image) => (
          <Thumbnail key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
}
