/**
 * Hotkey guide popover
 */

import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const HOTKEYS = [
  { keys: ['←', '→'], action: 'Navigate images' },
  { keys: ['Drag'], action: 'Adjust position' },
  { keys: ['Scroll'], action: 'Adjust padding' },
];

export function HotkeyGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(!open)}
        title="Keyboard shortcuts"
      >
        <Keyboard className="h-4 w-4" />
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 z-50 bg-popover border rounded-lg shadow-lg p-3 min-w-[180px]">
            <div className="space-y-2">
              {HOTKEYS.map(({ keys, action }) => (
                <div key={action} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">{action}</span>
                  <div className="flex gap-1">
                    {keys.map((key) => (
                      <kbd
                        key={key}
                        className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
