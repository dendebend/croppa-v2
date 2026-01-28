/**
 * DownloadButton - Process and download cropped images
 */

import { useState } from 'react';
import JSZip from 'jszip';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useImageStore } from '@/stores/image-store';
import { getCropCoords, applyCrop, applyCircularMask } from '@/lib/canvas';

export function DownloadButton() {
  const [processing, setProcessing] = useState(false);

  const { images, outputSize, circularMask } = useImageStore();

  const processableImages = images.filter((img) => img.faceDetected || img.face);

  async function handleDownload() {
    if (processableImages.length === 0) return;

    setProcessing(true);

    try {
      if (processableImages.length === 1) {
        // Single image - direct download
        const blob = await processImage(processableImages[0]);
        downloadBlob(blob, `${processableImages[0].name}_cropped.png`);
      } else {
        // Multiple images - zip download
        const zip = new JSZip();

        for (const img of processableImages) {
          const blob = await processImage(img);
          zip.file(`${img.name}_cropped.png`, blob);
        }

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        downloadBlob(zipBlob, 'croppa_output.zip');
      }
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setProcessing(false);
    }
  }

  async function processImage(image: typeof processableImages[0]): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const face = image.face || {
            x: img.width / 4,
            y: img.height / 4,
            w: img.width / 2,
            h: img.height / 2,
          };

          const cropBox = getCropCoords({
            face,
            imgWidth: img.width,
            imgHeight: img.height,
            padding: image.padding,
            offsetX: image.offsetX,
            offsetY: image.offsetY,
          });

          const cropped = applyCrop(img, cropBox, outputSize);

          if (circularMask) {
            applyCircularMask(cropped);
          }

          cropped.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          }, 'image/png');
        } catch (error) {
          reject(error);
        }
      };
      img.onerror = reject;
      img.src = image.objectUrl;
    });
  }

  function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={processing || processableImages.length === 0}
      className="w-full"
      size="lg"
    >
      {processing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Download {processableImages.length > 1 ? `${processableImages.length} images` : 'image'}
        </>
      )}
    </Button>
  );
}
