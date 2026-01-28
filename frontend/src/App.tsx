/**
 * Croppa v2 - Main Application
 */

import { useEffect, useCallback } from 'react';
import { UploadZone } from '@/components/UploadZone';
import { PreviewGrid } from '@/components/PreviewGrid';
import { EditPanel } from '@/components/EditPanel';
import { ImagePreview } from '@/components/ImagePreview';
import { DownloadButton } from '@/components/DownloadButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { HotkeyGuide } from '@/components/HotkeyGuide';
import { Card, CardContent } from '@/components/ui/card';
import { useImageStore } from '@/stores/image-store';
import { applyTheme, initThemeListener, useThemeStore } from '@/stores/theme-store';

export default function App() {
  const { images, selectedId, selectImage } = useImageStore();
  const { theme } = useThemeStore();
  const hasImages = images.length > 0;

  // Initialize theme
  useEffect(() => {
    applyTheme(theme);
    return initThemeListener();
  }, []);

  // Apply theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Arrow key navigation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (images.length === 0) return;

    const currentIndex = images.findIndex(img => img.id === selectedId);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      selectImage(images[nextIndex].id);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      selectImage(images[prevIndex].id);
    }
  }, [images, selectedId, selectImage]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b shrink-0">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Croppa</h1>
            <div className="flex items-center gap-1">
              <HotkeyGuide />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 container mx-auto px-4 py-4 overflow-hidden">
        {!hasImages ? (
          <div className="max-w-md mx-auto mt-20">
            <UploadZone />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4 h-full">
            {/* Left: Thumbnails */}
            <div className="flex flex-col gap-3 min-h-0">
              <UploadZone />
              <div className="flex-1 overflow-y-auto min-h-0">
                <PreviewGrid />
              </div>
            </div>

            {/* Center: Preview */}
            <div className="flex items-start justify-center pt-4">
              <ImagePreview />
            </div>

            {/* Right: Controls */}
            <div className="flex flex-col gap-3">
              <Card className="flex-1">
                <CardContent className="pt-4">
                  <EditPanel />
                </CardContent>
              </Card>
              <DownloadButton />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
