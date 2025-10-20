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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Music className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Bashify</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">{device.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logga ut</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8 max-w-5xl">
        
        {/* Device Status Card */}
        <Card className="mb-8 bg-card/50 backdrop-blur border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${device.status === 'online' ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <Radio className={`h-8 w-8 ${device.status === 'online' ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{device.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`h-2 w-2 rounded-full ${device.status === 'online' ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
                    <span className={`text-sm font-medium ${device.status === 'online' ? 'text-success' : 'text-destructive'}`}>
                      {device.status === 'online' ? 'Enheten är online' : 'Enheten är offline'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{device.volume}%</div>
                <div className="text-sm text-muted-foreground mt-1">Volym</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playback Status */}
        <div className="mb-8 p-6 bg-gradient-to-br from-primary/10 to-transparent backdrop-blur border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Uppspelningsstatus</span>
          </div>
          <div className="text-3xl font-bold">
            {device.playbackStatus === 'playing' && (
              <span className="text-primary flex items-center gap-2">
                <span className="h-3 w-3 bg-primary rounded-full animate-pulse" />
                Spelar nu
              </span>
            )}
            {device.playbackStatus === 'paused' && (
              <span className="text-warning">Pausad</span>
            )}
            {device.playbackStatus === 'stopped' && (
              <span className="text-muted-foreground">Stoppad</span>
            )}
          </div>
        </div>

        {/* Control Buttons */}
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Kontroller</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Play/Pause Button */}
            <Button
              size="lg"
              variant={device.playbackStatus === 'playing' ? "secondary" : "default"}
              onClick={() => device.playbackStatus === 'playing' ? sendCommand('pause') : sendCommand('play')}
              disabled={device.status === 'offline' || commandLoading}
              className="h-20 text-lg font-semibold gap-3 hover:scale-105 transition-transform"
            >
              {device.playbackStatus === 'playing' ? (
                <>
                  <Pause className="h-6 w-6" />
                  Pausa uppspelning
                </>
              ) : (
                <>
                  <Play className="h-6 w-6" />
                  Starta uppspelning
                </>
              )}
            </Button>

            {/* Stop Button */}
            <Button
              size="lg"
              variant="secondary"
              onClick={() => sendCommand('stop')}
              disabled={device.status === 'offline' || commandLoading || device.playbackStatus === 'stopped'}
              className="h-20 text-lg font-semibold gap-3 hover:scale-105 transition-transform"
            >
              <Square className="h-6 w-6" />
              Stoppa uppspelning
            </Button>

            {/* Restart Button */}
            <Button
              size="lg"
              variant="outline"
              onClick={() => sendCommand('restart')}
              disabled={device.status === 'offline' || commandLoading}
              className="h-20 text-lg font-semibold gap-3 hover:scale-105 transition-transform md:col-span-2"
            >
              <RotateCw className="h-6 w-6" />
              Starta om enheten
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
              <Volume2 className="h-6 w-6 text-primary" />
              Volymkontroll
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {device.volume === 0 ? (
                  <VolumeX className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Volume2 className="h-8 w-8 text-primary" />
                )}
                <span className="text-lg font-medium">Justera ljudnivå</span>
              </div>
              <div className="text-4xl font-bold text-primary">{device.volume}%</div>
            </div>
            
            <VolumeControl
              volume={device.volume}
              onChange={(volume) => sendCommand('volume', volume)}
              disabled={device.status === 'offline' || commandLoading}
            />
            
            {/* Visual Volume Bar */}
            <div className="h-4 bg-secondary/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                style={{ width: `${device.volume}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tyst (0%)</span>
              <span>Max (100%)</span>
            </div>
          </CardContent>
        </Card>

        {/* Device Info */}
        <Card className="mt-8 bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
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
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl mt-12">
        <div className="container mx-auto px-4 md:px-6 py-6 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Music className="h-4 w-4 text-primary" />
              <span>Bashify Music Control System © 2025</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Device ID:</span>
              <span className="font-mono text-primary">{device.id}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeviceControl;
