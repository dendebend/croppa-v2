/**
 * EditPanel - Controls for adjusting crop settings
 */

import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Circle, Copy } from 'lucide-react';
import { useImageStore } from '@/stores/image-store';
import { CONFIG, OutputSize } from '@/config';

export function EditPanel() {
  const {
    images,
    selectedId,
    outputSize,
    circularMask,
    setOutputSize,
    setCircularMask,
    updateImageSettings,
    applySettingsToAll,
  } = useImageStore();

  const selectedImage = images.find((img) => img.id === selectedId);

  if (!selectedImage) {
    return null;
  }

  const { padding, offsetX, offsetY, face } = selectedImage;
  const maxOffset = face ? Math.round(Math.max(face.w, face.h) * 0.5) : 100;

  return (
    <div className="space-y-5">
      {/* Image info */}
      <div className="flex items-center justify-between">
        <span className="font-medium truncate max-w-[180px]">{selectedImage.name}</span>
        <span className="text-xs text-muted-foreground">
          {selectedImage.width}×{selectedImage.height}
        </span>
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Padding</span>
          <span className="text-muted-foreground tabular-nums">{Math.round(padding * 100)}%</span>
        </div>
        <Slider
          value={[padding]}
          min={CONFIG.MIN_PADDING}
          max={CONFIG.MAX_PADDING}
          step={CONFIG.PADDING_STEP}
          onValueChange={([value]) => updateImageSettings(selectedImage.id, { padding: value })}
        />
      </div>

      {/* X Offset */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>X</span>
          <span className="text-muted-foreground tabular-nums">{offsetX}</span>
        </div>
        <Slider
          value={[offsetX]}
          min={-maxOffset}
          max={maxOffset}
          step={1}
          onValueChange={([value]) => updateImageSettings(selectedImage.id, { offsetX: value })}
        />
      </div>

      {/* Y Offset */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Y</span>
          <span className="text-muted-foreground tabular-nums">{offsetY}</span>
        </div>
        <Slider
          value={[offsetY]}
          min={-maxOffset}
          max={maxOffset}
          step={1}
          onValueChange={([value]) => updateImageSettings(selectedImage.id, { offsetY: value })}
        />
      </div>

      {/* Apply to all */}
      {images.length > 1 && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => applySettingsToAll({ padding, offsetX, offsetY })}
        >
          <Copy className="h-3 w-3 mr-2" />
          Apply to all
        </Button>
      )}

      <hr className="border-border" />

      {/* Output size */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm">Size</span>
        <Select
          value={outputSize.toString()}
          onValueChange={(v) => setOutputSize(parseInt(v) as OutputSize)}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONFIG.OUTPUT_SIZES.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}px
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Circular mask */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Circle className="h-3 w-3" />
          <span>Circular</span>
        </div>
        <Switch checked={circularMask} onCheckedChange={setCircularMask} />
      </div>
    </div>
  );
}
