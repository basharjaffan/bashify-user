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
    <Slider
      value={[volume]}
      onValueChange={handleVolumeChange}
      max={100}
      step={1}
      disabled={disabled}
      className="w-full"
    />
  );
};
