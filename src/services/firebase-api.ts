import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { Device } from '@/types';

export const firebaseAPI = {
  async getDevice(deviceId: string): Promise<Device | null> {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      return null;
    }
    
    return { id: deviceSnap.id, ...deviceSnap.data() } as Device;
  },

  subscribeToDevice(deviceId: string, callback: (device: Device) => void) {
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    
    return onSnapshot(deviceRef, (snapshot) => {
      if (snapshot.exists()) {
        callback({ id: snapshot.id, ...snapshot.data() } as Device);
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
