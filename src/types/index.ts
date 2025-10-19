export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline';
  playbackStatus: 'playing' | 'paused' | 'stopped';
  volume: number;
  streamUrl?: string;
  groupName?: string;
  uptime: string;
  lastSeen: Date;
}

export interface Command {
  type: 'play' | 'pause' | 'stop' | 'restart' | 'volume';
  streamUrl?: string;
  volume?: number;
  timestamp: Date;
}
