import { Wifi, WifiOff, Activity } from 'lucide-react';
import { Device } from '@/types';
import { Badge } from '@/components/ui/badge';

interface DeviceStatusProps {
  device: Device;
}

export const DeviceStatus = ({ device }: DeviceStatusProps) => {
  const getStatusColor = () => {
    if (device.status === 'offline') return 'bg-destructive/20 text-destructive border-destructive/50';
    if (device.playbackStatus === 'playing') return 'bg-accent/20 text-accent border-accent/50';
    return 'bg-success/20 text-success border-success/50';
  };

  const getStatusText = () => {
    if (device.status === 'offline') return 'Offline';
    if (device.playbackStatus === 'playing') return 'Playing';
    if (device.playbackStatus === 'paused') return 'Paused';
    return 'Stopped';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {device.status === 'online' ? (
            <Wifi className="h-5 w-5 text-success" />
          ) : (
            <WifiOff className="h-5 w-5 text-destructive" />
          )}
          <div>
            <h3 className="font-semibold">{device.name}</h3>
            <p className="text-sm text-muted-foreground">{device.ipAddress}</p>
          </div>
        </div>
        <Badge className={getStatusColor()}>
          {getStatusText()}
        </Badge>
      </div>

      {device.status === 'online' && (
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Uptime:</span>
            <span className="font-medium">{device.uptime}</span>
          </div>
          {device.group && (
            <div className="col-span-2">
              <span className="text-muted-foreground">Group: </span>
              <span className="font-medium text-accent truncate block">
                {device.group}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
