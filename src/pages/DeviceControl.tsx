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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10 backdrop-blur">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Bashify</h1>
              <p className="text-xs text-muted-foreground">{device.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {device.status === 'online' ? (
                <>
                  <span className="h-2 w-2 bg-success rounded-full animate-pulse" />
                  <span className="text-sm text-success font-medium">Online</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 bg-destructive rounded-full" />
                  <span className="text-sm text-destructive font-medium">Offline</span>
                </>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="container max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            
            {/* Left Side - Album Art / Visualizer */}
            <div className="lg:col-span-1 flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent backdrop-blur-xl border border-primary/30 flex items-center justify-center relative overflow-hidden">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent animate-pulse" />
                  
                  {/* Center Icon */}
                  <div className="relative z-10">
                    {device.playbackStatus === 'playing' ? (
                      <>
                        <Music2 className="h-24 w-24 text-primary glow-effect animate-pulse" />
                        {/* Animated circles */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-32 w-32 border-2 border-primary/30 rounded-full animate-ping" />
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-40 w-40 border border-primary/20 rounded-full animate-ping animation-delay-1000" />
                        </div>
                      </>
                    ) : (
                      <Music2 className="h-24 w-24 text-muted-foreground/50" />
                    )}
                  </div>
                  
                  {/* Corner decoration */}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-bl-full" />
                  <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary/10 rounded-tr-full" />
                </div>
                
                {/* Glow effect */}
                {device.playbackStatus === 'playing' && (
                  <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-2xl -z-10 animate-pulse" />
                )}
              </div>
            </div>

            {/* Center - Playback Controls */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Now Playing Info */}
              <div className="text-center lg:text-left space-y-2">
                <h2 className="text-3xl font-bold text-foreground">
                  {device.playbackStatus === 'playing' && 'Spelar nu'}
                  {device.playbackStatus === 'paused' && 'Pausad'}
                  {device.playbackStatus === 'stopped' && 'Stoppad'}
                </h2>
                <p className="text-lg text-muted-foreground">Radio Stream</p>
              </div>

              {/* Main Controls */}
              <div className="flex justify-center lg:justify-start items-center gap-6">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => sendCommand('restart')}
                  disabled={device.status === 'offline' || commandLoading}
                  className="h-14 w-14 rounded-full"
                >
                  <RotateCw className="h-5 w-5" />
                </Button>

                <Button
                  size="lg"
                  variant={device.playbackStatus === 'playing' ? "default" : "default"}
                  onClick={() => device.playbackStatus === 'playing' ? sendCommand('pause') : sendCommand('play')}
                  disabled={device.status === 'offline' || commandLoading}
                  className="h-24 w-24 rounded-full glow-effect-accent hover:scale-110 transition-transform duration-300"
                >
                  {device.playbackStatus === 'playing' ? (
                    <Pause className="h-10 w-10" />
                  ) : (
                    <Play className="h-10 w-10 ml-1" />
                  )}
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  onClick={() => sendCommand('stop')}
                  disabled={device.status === 'offline' || commandLoading || device.playbackStatus === 'stopped'}
                  className="h-14 w-14 rounded-full"
                >
                  <Square className="h-5 w-5" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="bg-card/50 backdrop-blur-xl rounded-2xl border border-border/50 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {device.volume === 0 ? (
                      <VolumeX className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Volume2 className="h-6 w-6 text-primary" />
                    )}
                    <span className="text-lg font-medium">Volym</span>
                  </div>
                  <span className="text-3xl font-bold text-primary">{device.volume}%</span>
                </div>
                
                <div className="space-y-2">
                  <VolumeControl
                    volume={device.volume}
                    onChange={(volume) => sendCommand('volume', volume)}
                    disabled={device.status === 'offline' || commandLoading}
                  />
                  
                  {/* Visual Volume Bar */}
                  <div className="h-3 bg-secondary/50 rounded-full overflow-hidden backdrop-blur">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300 rounded-full"
                      style={{ width: `${device.volume}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Device Info Compact */}
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-border/50">
                  <Radio className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">IP:</span>
                  <span className="font-medium">{device.ipAddress || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-card/50 rounded-full border border-border/50">
                  <Activity className="h-4 w-4 text-primary" />
                  <span className="text-muted-foreground">Group:</span>
                  <span className="font-medium">{device.group || 'None'}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between max-w-7xl text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Music className="h-4 w-4 text-primary" />
            <span>Bashify © 2025</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Device:</span>
            <span className="font-mono text-primary">{device.id}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DeviceControl;
