import { Wifi, WifiOff, Activity, Cpu, HardDrive } from 'lucide-react';
import { Device } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface DeviceStatusProps {
  device: Device;
}

const formatUptime = (uptime: any): string => {
  if (!uptime) return 'N/A';
  
  // Uptime from Firebase is in seconds
  const seconds = Number(uptime);
  if (isNaN(seconds)) return String(uptime);
  
  return seconds.toFixed(2);
};

const formatLastSeen = (lastSeen: any): string => {
  if (!lastSeen) return 'N/A';
  
  try {
    const date = lastSeen instanceof Date ? lastSeen : new Date(lastSeen);
    return date.toLocaleString('sv-SE', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  } catch {
    return 'N/A';
  }
};

export const DeviceStatus = ({ device }: DeviceStatusProps) => {
  const isOnline = device.status === 'online' || (device as any).isOnline === true || (device as any).online === true || device.playbackStatus === 'playing';
  
  return (
    <div className="space-y-6">
      {/* Connection Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Connection</p>
            <p className="font-medium">{isOnline ? 'WiFi' : 'Offline'}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3">
          <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Network</p>
            <p className="font-medium">{device.network || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* IP Address */}
      <div className="flex items-start gap-3">
        <Wifi className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">IP Address</p>
          <p className="font-medium">{device.ipAddress}</p>
        </div>
      </div>

      {/* Group */}
      {device.group && (
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Group</p>
            <p className="font-medium">{device.group}</p>
          </div>
        </div>
      )}

      {/* Uptime */}
      <div className="flex items-start gap-3">
        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Uptime</p>
          <p className="font-medium text-primary">{formatUptime(device.uptime)}</p>
        </div>
      </div>

      {/* Last Seen */}
      <div className="flex items-start gap-3">
        <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">Last Seen</p>
          <p className="font-medium text-primary">{formatLastSeen(device.lastSeen)}</p>
        </div>
      </div>

      {/* Version */}
      {device.version && (
        <div className="flex items-start gap-3">
          <Activity className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">Version</p>
            <p className="font-medium">{device.version}</p>
          </div>
        </div>
      )}

      {/* System Performance */}
      <div className="pt-6 border-t border-border/50">
        <h3 className="text-sm text-muted-foreground mb-4">System Performance</h3>
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Cpu className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">{device.cpu !== undefined ? `${device.cpu.toFixed(1)}%` : '0.0%'}</p>
              <p className="text-xs text-muted-foreground">CPU</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 text-warning mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">{device.ram !== undefined ? `${device.ram.toFixed(1)}%` : '0.0%'}</p>
              <p className="text-xs text-muted-foreground">RAM</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50 border-border/50">
            <CardContent className="p-4 text-center">
              <HardDrive className="h-8 w-8 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold mb-1">{device.disk !== undefined ? `${device.disk.toFixed(0)}%` : '0%'}</p>
              <p className="text-xs text-muted-foreground">Disk</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
