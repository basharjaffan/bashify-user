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
import { LogOut, RefreshCw, Music2, Volume2, Radio, Activity, Music } from 'lucide-react';
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
      toast.error('Could not load device');
    } finally {
      setIsLoading(false);
    }
  };

  const sendCommand = async (type: 'play' | 'pause' | 'stop' | 'restart' | 'volume', volume?: number) => {
    if (!device) return;

    setCommandLoading(true);
    
    // Optimistically update the UI immediately
    if (type === 'play') {
      setDevice({ ...device, playbackStatus: 'playing' });
    } else if (type === 'pause') {
      setDevice({ ...device, playbackStatus: 'paused' });
    } else if (type === 'stop') {
      setDevice({ ...device, playbackStatus: 'stopped' });
    } else if (type === 'volume' && volume !== undefined) {
      setDevice({ ...device, volume });
    }

    try {
      const streamUrl = type === 'play' ? (device.streamUrl || 'https://icecast.royalstreamingplay.com/de6652a0-cafc-4f13-b64d-ac68880b53d9.mp3') : undefined;
      await firebaseAPI.sendCommand(
        device.id, 
        type,
        streamUrl,
        volume
      );

      const messages = {
        play: 'Starting playback',
        pause: 'Pausing playback',
        stop: 'Stopping playback',
        restart: 'Restarting device',
      };

      if (type !== 'volume') {
        toast.success(messages[type]);
      }
    } catch (error) {
      toast.error('Command failed');
      // Revert optimistic update on error
      const revertedDevice = await firebaseAPI.getDevice(device.id);
      if (revertedDevice) setDevice(revertedDevice);
    } finally {
      setCommandLoading(false);
    }
  };

  const handleLogout = () => {
    toast.success('Logged out');
  };

  if (isLoading || !device) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center space-y-4">
          <div className="relative">
            <Music className="h-16 w-16 mx-auto text-primary glow-effect animate-pulse" />
            <div className="absolute inset-0 h-16 w-16 mx-auto bg-primary/20 rounded-full blur-xl animate-pulse" />
          </div>
          <p className="text-lg text-muted-foreground">Loading your music device...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Music className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Bashify</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Log out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Welcome to your <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">music world</span>
          </h2>
          <p className="text-foreground text-4xl font-bold">
            {device.name}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:scale-105 duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Radio className="h-3 w-3 text-primary" />
                </div>
                Device Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {device.status === 'online' ? (
                  <span className="text-success flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-success rounded-full animate-pulse" />
                    Online
                  </span>
                ) : (
                  <span className="text-destructive flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-destructive rounded-full" />
                    Offline
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:scale-105 duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Volume2 className="h-3 w-3 text-primary" />
                </div>
                Current Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{device.volume}%</div>
              <div className="mt-1.5 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-primary-glow transition-all duration-300"
                  style={{ width: `${device.volume}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all hover:scale-105 duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Activity className="h-3 w-3 text-primary" />
                </div>
                Playback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold">
                {device.playbackStatus === 'playing' ? (
                  <span className="text-primary flex items-center gap-2">
                    <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                    Playing
                  </span>
                ) : device.playbackStatus === 'paused' ? (
                  <span className="text-warning">Paused</span>
                ) : (
                  <span className="text-muted-foreground">Stopped</span>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Control Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Music Player */}
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border-primary/20 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Music className="h-6 w-6 text-primary" />
                Music Playback
              </CardTitle>
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
            </CardContent>
          </Card>

          {/* Volume Control */}
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border-primary/20 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Volume2 className="h-6 w-6 text-primary" />
                Volume Control
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
        </div>

        {/* Device Info */}
        <Card className="mt-8 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-3">
              <Radio className="h-5 w-5 text-primary" />
              Device Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeviceStatus device={device} />
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/20 backdrop-blur-xl mt-16">
        <div className="container mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
            <Music className="h-4 w-4 text-primary" />
            <span className="font-medium">Device ID:</span>
            <span className="font-mono text-primary">device-1</span>
          </div>
          <p className="text-xs text-muted-foreground/60">
            Bashify Music Control System © 2025
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DeviceControl;
