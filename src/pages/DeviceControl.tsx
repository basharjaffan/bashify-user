import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);

  useEffect(() => {
    // Load first device (skip auth for now)
    const deviceId = 'device-1';
    loadDevice(deviceId);

    // Subscribe to real-time updates
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
      const updatedDevice = await firebaseAPI.getDevice(device.id);
      if (updatedDevice) setDevice(updatedDevice);
    } catch (error) {
      toast.error('Kommandot misslyckades');
    } finally {
      setCommandLoading(false);
    }
  };

  const handleLogout = () => {
    toast.success('Utloggad');
  };

  if (isLoading || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Music2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Bashify</h1>
                <p className="text-xs text-muted-foreground">Music System</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logga ut
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-1">Device Control</h2>
            <p className="text-muted-foreground">Control your music device</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <p className="text-2xl font-bold text-foreground capitalize">{device.playbackStatus}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    device.playbackStatus === 'playing' ? 'bg-primary/20 text-primary' :
                    device.playbackStatus === 'paused' ? 'bg-warning/20 text-warning' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    <Music2 className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Volume</p>
                    <p className="text-2xl font-bold text-foreground">{device.volume}%</p>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                    <span className="text-2xl">🔊</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Connection</p>
                    <p className="text-2xl font-bold text-foreground capitalize">{device.status}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    device.status === 'online' ? 'bg-success/20 text-success' :
                    'bg-destructive/20 text-destructive'
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${device.status === 'online' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Player Card */}
          <Card className="border-border bg-card">
            <CardHeader>
              <DeviceStatus device={device} />
            </CardHeader>
            <CardContent className="space-y-6">
              <MusicPlayer
                device={device}
                onPlay={() => sendCommand('play')}
                onPause={() => sendCommand('pause')}
                onStop={() => sendCommand('stop')}
                onRestart={() => sendCommand('restart')}
                isLoading={commandLoading}
              />

              <div className="pt-4 border-t border-border">
                <VolumeControl
                  volume={device.volume}
                  onChange={(vol) => sendCommand('volume', vol)}
                  disabled={device.status === 'offline' || commandLoading}
                />
              </div>
            </CardContent>
          </Card>

          {/* Footer Info */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Device ID: device-1</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeviceControl;
