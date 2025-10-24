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
import { LogOut, RefreshCw, Music2, Volume2, Radio, Activity, Music, Settings } from 'lucide-react';
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
      console.log('[Device update]', updatedDevice);
      setDevice(updatedDevice);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
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

  const sendCommand = async (type: 'play' | 'pause' | 'stop' | 'restart' | 'volume' | 'update', volume?: number) => {
    if (!device) return;

    setCommandLoading(true);

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
        update: 'Updating system',
      };

      if (type !== 'volume') {
        toast.success(messages[type]);
      }
    } catch (error) {
      toast.error('Command failed');
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
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bashify</h1>
              <p className="text-sm text-muted-foreground">Music System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm font-medium text-success">Online</span>
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
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold">
            Welcome to your <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">music world</span>
          </h2>
          <p className="text-foreground text-3xl font-bold">
            {device.name}
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Device Control */}
          <Card className="bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm border-primary/20 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <Settings className="h-6 w-6 text-primary" />
                Device Control
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
              
              <VolumeControl
                volume={device.volume}
                onChange={(volume) => sendCommand('volume', volume)}
                disabled={!(device.status === 'online' || (device as any).isOnline === true || (device as any).online === true || device.playbackStatus === 'playing' || (device as any).isPlaying === true) || commandLoading}
              />

              {/* System Controls */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-medium text-muted-foreground">System Controls</h3>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => sendCommand('update')}
                  disabled={!(device.status === 'online' || (device as any).isOnline === true || (device as any).online === true || device.playbackStatus === 'playing' || (device as any).isPlaying === true) || commandLoading}
                  className="w-full h-12"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Update System
                </Button>
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={() => sendCommand('restart')}
                  disabled={!(device.status === 'online' || (device as any).isOnline === true || (device as any).online === true || device.playbackStatus === 'playing' || (device as any).isPlaying === true) || commandLoading}
                  className="w-full h-12"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Restart Device
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Column - Device Information */}
          <Card className="bg-gradient-to-br from-card to-card/50 backdrop-blur-sm border-border/50 animate-fade-in">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DeviceStatus device={device} />
            </CardContent>
          </Card>
        </div>
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
