import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface HotkeyRecorderProps {
  isOpen: boolean;
  onClose: () => void;
  onHotkeyRecorded: (keys: string[]) => void;
  currentKeys?: string[];
}

export function HotkeyRecorder({
  isOpen,
  onClose,
  onHotkeyRecorded,
  currentKeys,
}: HotkeyRecorderProps) {
  const [recordedKeys, setRecordedKeys] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    // Safety check: ensure we're in a browser environment
    if (typeof window === 'undefined' || !window.addEventListener) {
      console.warn('window.addEventListener is not available');
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault();
      if (!isRecording) return;

      const key = e.key === ' ' ? 'Space' : e.key;

      const formattedKey = key.length === 1 ? key.toUpperCase() : key;

      if (!recordedKeys.includes(formattedKey)) {
        setRecordedKeys((prev) => [...prev, formattedKey]);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      if (isRecording) {
        setIsRecording(false);
        if (recordedKeys.length > 0) {
          onHotkeyRecorded(recordedKeys);
          onClose();
        }
      }
    };

    try {
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        try {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
        } catch (error) {
          console.error('Error removing hotkey recorder listeners:', error);
        }
      };
    } catch (error) {
      console.error('Error adding hotkey recorder listeners:', error);
    }
  }, [isOpen, isRecording, recordedKeys, onHotkeyRecorded, onClose]);

  useEffect(() => {
    if (isOpen) {
      setRecordedKeys([]);
      setIsRecording(true);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Record Hotkey</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Press the keys you want to use for this shortcut. Press any key to start recording.
          </p>
          <div className="flex flex-wrap gap-2">
            {recordedKeys.map((key, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-muted rounded text-sm font-mono"
              >
                {key}
              </span>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
