import { Device, Command } from '@/types';
import { 
  collection, 
  doc, 
  getDoc, 
  onSnapshot, 
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

class FirebaseAPI {
  async getDevice(deviceId: string): Promise<Device | null> {
    try {
      // Hämta device från Firebase
      const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
      const deviceSnap = await getDoc(deviceRef);
      
      if (!deviceSnap.exists()) {
        return null;
      }
      
      const deviceData = deviceSnap.data();
      
      // Hämta gruppens streamUrl
      const groupId = deviceData.groupId || deviceData.group;
      let streamUrl = deviceData.streamUrl || '';
      let groupName = groupId;
      
      if (groupId) {
        const groupRef = doc(db, 'config', 'groups', 'list', groupId);
        const groupSnap = await getDoc(groupRef);
        
        if (groupSnap.exists()) {
          const groupData = groupSnap.data();
          streamUrl = groupData.streamUrl || streamUrl;
          groupName = groupData.name || groupId;
        }
      }
      
      // Konvertera till Device format
      return {
        id: deviceId,
        name: deviceData.name || deviceId,
        ipAddress: deviceData.ipAddress || 'unknown',
        status: deviceData.status || 'offline',
        playbackStatus: deviceData.status === 'playing' ? 'playing' : 
                       deviceData.status === 'paused' ? 'paused' : 'stopped',
        volume: deviceData.volume || 50,
        streamUrl: streamUrl,
        groupName: groupName,
        uptime: deviceData.uptime ? this.formatUptime(deviceData.uptime) : '0d 0h 0m',
        lastSeen: deviceData.lastSeen?.toDate() || new Date(),
      };
    } catch (error) {
      console.error('Error getting device:', error);
      return null;
    }
  }

  async sendCommand(deviceId: string, command: Command): Promise<void> {
    try {
      // Skapa kommando i Firebase
      await addDoc(collection(db, 'config', 'commands', 'list'), {
        deviceId: deviceId,
        action: command.type,
        streamUrl: command.streamUrl || null,
        volume: command.volume || null,
        timestamp: serverTimestamp(),
        processed: false,
      });
      
      console.log('✅ Command sent:', command.type);
    } catch (error) {
      console.error('❌ Error sending command:', error);
      throw error;
    }
  }

  subscribeToDevice(deviceId: string, callback: (device: Device) => void): () => void {
    // Real-time updates från Firebase
    const deviceRef = doc(db, 'config', 'devices', 'list', deviceId);
    
    const unsubscribe = onSnapshot(deviceRef, async (snapshot) => {
      if (snapshot.exists()) {
        const device = await this.getDevice(deviceId);
        if (device) {
          callback(device);
        }
      }
    });
    
    return unsubscribe;
  }

  private formatUptime(seconds: number): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  }
}

export const firebaseAPI = new FirebaseAPI();
