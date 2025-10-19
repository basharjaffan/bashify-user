import { Device, Command } from '@/types';

// Mock Firebase API - replace with actual Firebase implementation
class FirebaseAPI {
  private devices: Map<string, Device> = new Map([
    ['device-1', {
      id: 'device-1',
      name: 'Butik Norrmalm',
      ipAddress: '192.168.1.100',
      status: 'online',
      playbackStatus: 'playing',
      volume: 75,
      streamUrl: 'https://stream.example.com/jazz',
      uptime: '5d 12h 30m',
      lastSeen: new Date(),
    }],
    ['device-2', {
      id: 'device-2',
      name: 'Butik Södermalm',
      ipAddress: '192.168.1.101',
      status: 'offline',
      playbackStatus: 'stopped',
      volume: 50,
      uptime: '0d 0h 0m',
      lastSeen: new Date(Date.now() - 3600000),
    }],
  ]);

  async getDevice(deviceId: string): Promise<Device | null> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.devices.get(deviceId) || null;
  }

  async sendCommand(deviceId: string, command: Command): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const device = this.devices.get(deviceId);
    if (!device) throw new Error('Device not found');

    // Update device state based on command
    switch (command.type) {
      case 'play':
        device.playbackStatus = 'playing';
        if (command.streamUrl) device.streamUrl = command.streamUrl;
        if (command.volume !== undefined) device.volume = command.volume;
        break;
      case 'pause':
        device.playbackStatus = 'paused';
        break;
      case 'stop':
        device.playbackStatus = 'stopped';
        break;
      case 'volume':
        if (command.volume !== undefined) device.volume = command.volume;
        break;
      case 'restart':
        device.playbackStatus = 'stopped';
        setTimeout(() => {
          device.playbackStatus = 'playing';
        }, 3000);
        break;
    }

    this.devices.set(deviceId, device);
  }

  subscribeToDevice(deviceId: string, callback: (device: Device) => void): () => void {
    // Mock real-time updates
    const interval = setInterval(() => {
      const device = this.devices.get(deviceId);
      if (device) {
        callback(device);
      }
    }, 2000);

    return () => clearInterval(interval);
  }
}

export const firebaseAPI = new FirebaseAPI();
