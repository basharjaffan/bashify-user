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
  const isPlaying = device.playbackStatus === 'playing' || (device as any)?.isPlaying === true;
  const isOnline = device.status === 'online' || (device as any)?.isOnline === true || (device as any)?.online === true || isPlaying;
  const disabled = !isOnline || isLoading;

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
        <Button
          variant="secondary"
          size="lg"
          onClick={onStop}
          disabled={disabled}
          className="h-16 flex flex-col gap-1"
        >
          <Square className="h-6 w-6" />
          <span className="text-xs">Stop</span>
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onRestart}
          disabled={!isOnline || isLoading}
          className="h-16 flex flex-col gap-1"
        >
          <RotateCw className="h-6 w-6" />
          <span className="text-xs">Restart Device</span>
        </Button>
      </div>
    </div>
  );
};
