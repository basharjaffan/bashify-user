export interface Device {
  id: string;
  name: string;
  ipAddress: string;
  status: 'online' | 'offline';
  playbackStatus: 'playing' | 'paused' | 'stopped';
  volume: number;
  streamUrl?: string;
  uptime?: string;
  lastSeen?: Date;
  group?: string;
  network?: string;
  version?: string;
  cpu?: number;
  ram?: number;
  disk?: number;
}

export interface User {
  id: string;
  email: string;
  deviceIds: string[];
}

export interface Command {
  type: 'play' | 'pause' | 'stop' | 'restart' | 'volume' | 'update';
  streamUrl?: string;
  volume?: number;
  timestamp: Date;
}
