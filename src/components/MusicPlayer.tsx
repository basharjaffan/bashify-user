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
  const isPlaying = device.playbackStatus === 'playing';
  const disabled = device.status === 'offline' || isLoading;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Button
          size="lg"
          variant="default"
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          className="h-16 flex flex-col gap-1"
        >
          {isPlaying ? (
            <>
              <Pause className="h-6 w-6" />
              <span className="text-xs">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-6 w-6" />
              <span className="text-xs">Play</span>
            </>
          )}
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onRestart}
          disabled={disabled}
          className="h-16 flex flex-col gap-1"
        >
          <RotateCw className="h-6 w-6" />
          <span className="text-xs">Restart</span>
        </Button>
      </div>
    </div>
  );
};
