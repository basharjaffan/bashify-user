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
      <Button
        size="lg"
        variant={isPlaying ? "default" : "outline"}
        onClick={isPlaying ? onPause : onPlay}
        disabled={disabled}
        className="w-full h-20 text-lg"
      >
        {isPlaying ? (
          <>
            <Pause className="h-6 w-6 mr-2" />
            Pause
          </>
        ) : (
          <>
            <Play className="h-6 w-6 mr-2" />
            Play
          </>
        )}
      </Button>
    </div>
  );
};
