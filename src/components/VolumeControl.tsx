import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

interface VolumeControlProps {
  volume: number;
  onChange: (volume: number) => void;
  disabled?: boolean;
}

export const VolumeControl = ({ volume, onChange, disabled }: VolumeControlProps) => {
  const handleVolumeChange = (values: number[]) => {
    onChange(values[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {volume === 0 ? (
            <VolumeX className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Volume2 className="h-5 w-5 text-foreground" />
          )}
          <span className="text-sm font-medium">Volym</span>
        </div>
        <span className="text-sm font-bold text-primary">{volume}%</span>
      </div>
      <Slider
        value={[volume]}
        onValueChange={handleVolumeChange}
        max={100}
        step={1}
        disabled={disabled}
        className="w-full"
      />
    </div>
  );
};
