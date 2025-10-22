// @ts-nocheck
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDoc,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from '@/lib/firestore-ops';
import type { Device } from '@/types';

const normalizeDevice = (raw: any): Device => {
  const statusRaw = (raw?.status ?? raw?.online ?? raw?.isOnline ?? '').toString().toLowerCase();
  const status: 'online' | 'offline' = statusRaw === 'true' || statusRaw === 'online' ? 'online' : 'offline';

  const pbRaw = (raw?.playbackStatus ?? raw?.state ?? '').toString().toLowerCase();
  let playbackStatus: 'playing' | 'paused' | 'stopped' = 'stopped';
  if (pbRaw.includes('play')) playbackStatus = 'playing';
  else if (pbRaw.includes('pause')) playbackStatus = 'paused';
  else if (pbRaw.includes('stop')) playbackStatus = 'stopped';
  // Fallback från boolean isPlaying
  if (raw?.isPlaying === true) playbackStatus = 'playing';

  const volume = Math.max(0, Math.min(100, Number(raw?.volume ?? 0)));

  return {
    id: raw.id,
    name: raw?.name ?? 'Device',
    ipAddress: raw?.ipAddress ?? raw?.ip ?? 'N/A',
    status,
    playbackStatus,
    volume,
    streamUrl: raw?.streamUrl,
    uptime: raw?.uptime,
    lastSeen: raw?.lastSeen,
    group: raw?.group,
  } as Device;
};

export const firebaseAPI = {
  async getDevice(deviceId: string): Promise<Device | null> {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      return null;
    }
    
    return normalizeDevice({ id: deviceSnap.id, ...(deviceSnap.data() as any) });
  },

  subscribeToDevice(deviceId: string, callback: (device: Device) => void) {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    
    return onSnapshot(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(normalizeDevice({ id: snapshot.id, ...(snapshot.data() as any) }));
      }
    });
  },

  async sendCommand(deviceId: string, action: string, streamUrl?: string, volume?: number) {
    const commandsRef = collection(db, 'config', 'commands', 'list');
    
    await addDoc(commandsRef, {
      deviceId,
      action,
      streamUrl: streamUrl || null,
      volume: volume || null,
      processed: false,
      createdAt: serverTimestamp()
    });
  }
};
