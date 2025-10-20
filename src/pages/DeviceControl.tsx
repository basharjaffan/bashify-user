import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/UserAuthContext';
import { firebaseAPI } from '@/services/firebase-api';
import { Device } from '@/types';
import { MusicPlayer } from '@/components/MusicPlayer';
import { DeviceStatus } from '@/components/DeviceStatus';
import { VolumeControl } from '@/components/VolumeControl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut, RotateCw, Music2, Volume2, Radio, Activity, Music, Play, Pause, Square, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

const DeviceControl = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [device, setDevice] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commandLoading, setCommandLoading] = useState(false);

  useEffect(() => {
    // Load first device (skip auth for now)
    const deviceId = '05d0dda82ffb5c5d';
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
      await firebaseAPI.sendCommand(
        device.id, 
        type,
        type === 'play' ? device.streamUrl : undefined,
        volume
      );

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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="relative">
            <Music className="h-16 w-16 mx-auto text-primary glow-effect animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 mx-auto bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">Laddar din musikenhet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Compact Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <Music className="h-5 w-5 text-primary" />
            <span className="font-bold text-lg">Bashify</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section with Device Name */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-primary via-primary-glow to-primary bg-clip-text text-transparent">
              {device.name}
            </span>
          </h1>
          <p className="text-muted-foreground">Styr din musikupplevelse</p>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          
          {/* Status Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-xl ${device.status === 'online' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <Radio className={`h-6 w-6 ${device.status === 'online' ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Enhetsstatus</p>
                  <p className={`text-xl font-bold ${device.status === 'online' ? 'text-success' : 'text-destructive'}`}>
                    {device.status === 'online' ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              {device.status === 'online' && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                  Redo att spela
                </div>
              )}
            </CardContent>
          </Card>

          {/* Volume Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  {device.volume === 0 ? (
                    <VolumeX className="h-6 w-6 text-primary" />
                  ) : (
                    <Volume2 className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Volym</p>
                  <p className="text-xl font-bold text-primary">{device.volume}%</p>
                </div>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                  style={{ width: `${device.volume}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Playback Status Card */}
          <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all md:col-span-2 lg:col-span-1">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-xl bg-primary/10">
                  <Activity className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Uppspelning</p>
                  <p className="text-xl font-bold">
                    {device.playbackStatus === 'playing' && <span className="text-primary">Spelar</span>}
                    {device.playbackStatus === 'paused' && <span className="text-warning">Pausad</span>}
                    {device.playbackStatus === 'stopped' && <span className="text-muted-foreground">Stoppad</span>}
                  </p>
                </div>
              </div>
              {device.playbackStatus === 'playing' && (
                <div className="flex gap-1">
                  <div className="h-8 w-1 bg-primary rounded-full animate-pulse" />
                  <div className="h-8 w-1 bg-primary rounded-full animate-pulse animation-delay-100" />
                  <div className="h-8 w-1 bg-primary rounded-full animate-pulse animation-delay-200" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Playback Controls */}
        <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music2 className="h-5 w-5 text-primary" />
              Uppspelningskontroller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Play Button */}
              <Button
                size="lg"
                variant="default"
                onClick={() => sendCommand('play')}
                disabled={device.status === 'offline' || commandLoading || device.playbackStatus === 'playing'}
                className="h-24 flex-col gap-2 text-base font-semibold"
              >
                <Play className="h-6 w-6" />
                Spela
              </Button>

              {/* Pause Button */}
              <Button
                size="lg"
                variant="secondary"
                onClick={() => sendCommand('pause')}
                disabled={device.status === 'offline' || commandLoading || device.playbackStatus !== 'playing'}
                className="h-24 flex-col gap-2 text-base font-semibold"
              >
                <Pause className="h-6 w-6" />
                Pausa
              </Button>

              {/* Stop Button */}
              <Button
                size="lg"
                variant="secondary"
                onClick={() => sendCommand('stop')}
                disabled={device.status === 'offline' || commandLoading || device.playbackStatus === 'stopped'}
                className="h-24 flex-col gap-2 text-base font-semibold"
              >
                <Square className="h-6 w-6" />
                Stoppa
              </Button>

              {/* Restart Button */}
              <Button
                size="lg"
                variant="outline"
                onClick={() => sendCommand('restart')}
                disabled={device.status === 'offline' || commandLoading}
                className="h-24 flex-col gap-2 text-base font-semibold"
              >
                <RotateCw className="h-6 w-6" />
                Starta om
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Volume Slider */}
        <Card className="mb-8 bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-primary" />
              Volymjustering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VolumeControl
              volume={device.volume}
              onChange={(volume) => sendCommand('volume', volume)}
              disabled={device.status === 'offline' || commandLoading}
            />
          </CardContent>
        </Card>

        {/* Device Details */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radio className="h-5 w-5 text-primary" />
              Enhetsinformation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceStatus device={device} />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-border/50 bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-6xl">
          <p>Bashify © 2025 • Device: <span className="font-mono text-primary">{device.id}</span></p>
        </div>
      </footer>
    </div>
  );
};

export default DeviceControl;
