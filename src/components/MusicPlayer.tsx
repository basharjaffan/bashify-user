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
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          variant={isPlaying ? "secondary" : "default"}
          onClick={isPlaying ? onPause : onPlay}
          disabled={disabled}
          className="h-20 w-20 rounded-full glow-effect transition-all hover:scale-110"
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8 ml-1" />
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="lg"
          onClick={onStop}
          disabled={disabled || device.playbackStatus === 'stopped'}
          className="h-16"
        >
          <Square className="h-5 w-5 mr-2" />
          Stoppa
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={onRestart}
          disabled={disabled}
          className="h-16"
        >
          <RotateCw className="h-5 w-5 mr-2" />
          Starta om
        </Button>
      </div>
    </div>
  );
};
