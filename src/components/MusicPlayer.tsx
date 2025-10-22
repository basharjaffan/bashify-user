import { Play, Pause, Square, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Device } from '@/types';

interface MusicPlayerProps {
  device: Device;
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onRestart: () => void;
  isLoading?: boolean;
}

export const MusicPlayer = ({ 
  device, 
  onPlay, 
  onPause, 
  onStop, 
  onRestart,
  isLoading 
}: MusicPlayerProps) => {
  const isPlaying = device.isPlaying === true;
  const disabled = device.status === 'offline' || isLoading;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="default"
          onClick={onPlay}
          disabled={disabled || isPlaying}
          className="h-16 flex flex-col gap-1"
        >
          <Play className="h-6 w-6" />
          <span className="text-xs">Play</span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onPause}
          disabled={disabled || !isPlaying}
          className="h-16 flex flex-col gap-1"
        >
          <Pause className="h-6 w-6" />
          <span className="text-xs">Pause</span>
        </Button>
      </div>
    </div>
  );
};
