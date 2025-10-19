import { useState, useEffect } from 'react';
import { useAuth } from '@/context/UserAuthContext';
import { firebaseAPI } from '@/services/firebase-api';
import { Device } from '@/types';
import { MusicPlayer } from '@/components/MusicPlayer';
import { DeviceStatus } from '@/components/DeviceStatus';
import { VolumeControl } from '@/components/VolumeControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { LogOut, RefreshCw, Music2 } from 'lucide-react';
import { toast } from 'sonner';

const DeviceControl = () => {
  const { user, logout } = useAuth();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);

  useEffect(() => {
    // Use real device ID - hardcode for now or get from user context
    const deviceId = '05d0dda82ffb5c5d'; // Your actual device ID
    loadDevice(deviceId);

    const unsubscribe = firebaseAPI.subscribeToDevice(deviceId, (updatedDevice) => {
      setDevice(updatedDevice);
    });

    return () => unsubscribe();
  }, []);

  const loadDevice = async (deviceId: string) => {
    setIsLoading(true);
    try {
      const deviceData = await firebaseAPI.getDevice(deviceId);
      if (deviceData) {
        setDevice(deviceData);
      }
    } catch (error) {
      toast.error('Kunde inte hämta enheten');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async (type: 'play' | 'pause' | 'stop' | 'restart' | 'volume', volume?: number) => {
    if (!device) return;

    setCommandLoading(true);
    try {
      await firebaseAPI.sendCommand(device.id, {
        type,
        streamUrl: type === 'play' ? device.streamUrl : undefined,
        volume,
        timestamp: new Date(),
      });

      const messages = {
        play: 'Startar uppspelning',
        pause: 'Pausar uppspelning',
        stop: 'Stoppar uppspelning',
        restart: 'Startar om enheten',
        volume: 'Uppdaterar volym',
      };

      toast.success(messages[type]);

      // Refresh device state
      setTimeout(async () => {
        const updatedDevice = await firebaseAPI.getDevice(device.id);
        if (updatedDevice) setDevice(updatedDevice);
      }, 1000);
    } catch (error) {
      toast.error('Kommandot misslyckades');
    } finally {
      setCommandLoading(false);
    }
  };

  if (isLoading || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Music2 className="h-6 w-6" />
            <h1 className="text-2xl font-bold">{device.name}</h1>
          </div>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Uppdatera
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <DeviceStatus device={device} />
          <MusicPlayer 
            device={device} 
            onCommand={sendCommand} 
            isLoading={commandLoading} 
          />
          <VolumeControl 
            volume={device.volume} 
            onVolumeChange={(v) => sendCommand('volume', v)} 
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceControl;
