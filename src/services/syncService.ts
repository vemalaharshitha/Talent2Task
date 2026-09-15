import type { Job, User, NotificationItem, FeedbackReview } from '../types';

export type SyncEventType =
  | 'INITIAL_SYNC_REQUEST'
  | 'INITIAL_SYNC_RESPONSE'
  | 'JOB_CREATED'
  | 'JOB_CLAIMED'
  | 'JOB_STATUS_UPDATED'
  | 'JOB_DELETED'
  | 'USER_UPSERTED'
  | 'NOTIFICATION_ADDED'
  | 'REVIEW_ADDED'
  | 'PAYMENT_PROCESSED'
  | 'SAFEGIG_UPDATE'
  | 'CONNECTED_DEVICES_UPDATE'
  | 'PING'
  | 'PONG';

export interface SyncMessage {
  type: SyncEventType;
  senderId: string;
  senderDevice: string;
  timestamp: string;
  data?: any;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'fallback' | 'offline';

type SyncListener = (event: SyncMessage) => void;

const MQTT_TOPIC = 'talent2task/production/vellore_gigs_v2';
const PUBLIC_MQTT_BROKERS = [
  'wss://broker.emqx.io:8084/mqtt',
  'wss://broker.hivemq.com:8000/mqtt'
];

/**
 * Encode UTF-8 string into byte array with length prefix
 */
function encodeUTF8WithLength(str: string): number[] {
  const enc = new TextEncoder();
  const bytes = enc.encode(str);
  const len = bytes.length;
  return [len >> 8, len & 0xFF, ...Array.from(bytes)];
}

/**
 * Encode variable-length remaining length field (MQTT 3.1.1 spec)
 */
function encodeRemainingLength(length: number): number[] {
  const bytes: number[] = [];
  let num = length;
  do {
    let digit = num % 128;
    num = Math.floor(num / 128);
    if (num > 0) digit = digit | 0x80;
    bytes.push(digit);
  } while (num > 0);
  return bytes;
}

/**
 * Create MQTT 3.1.1 CONNECT packet
 */
function createMqttConnect(clientId: string): Uint8Array {
  const variableHeader = [0x00, 0x04, 0x4D, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3C]; // 'MQTT', v3.1.1, CleanSession, 60s
  const payload = encodeUTF8WithLength(clientId);
  const remaining = variableHeader.concat(payload);
  const remLenBytes = encodeRemainingLength(remaining.length);
  return new Uint8Array([0x10, ...remLenBytes, ...remaining]);
}

/**
 * Create MQTT 3.1.1 SUBSCRIBE packet
 */
function createMqttSubscribe(topic: string, packetId: number = 1): Uint8Array {
  const variableHeader = [packetId >> 8, packetId & 0xFF];
  const payload = [...encodeUTF8WithLength(topic), 0x00]; // QoS 0
  const remaining = variableHeader.concat(payload);
  const remLenBytes = encodeRemainingLength(remaining.length);
  return new Uint8Array([0x82, ...remLenBytes, ...remaining]);
}

/**
 * Create MQTT 3.1.1 PUBLISH packet
 */
function createMqttPublish(topic: string, messageStr: string): Uint8Array {
  const topicBytes = encodeUTF8WithLength(topic);
  const enc = new TextEncoder();
  const msgBytes = Array.from(enc.encode(messageStr));
  const remaining = topicBytes.concat(msgBytes);
  const remLenBytes = encodeRemainingLength(remaining.length);
  return new Uint8Array([0x30, ...remLenBytes, ...remaining]);
}

class SyncService {
  private ws: WebSocket | null = null;
  private isMqtt = false;
  private brokerIndex = 0;
  private broadcastChannel: BroadcastChannel | null = null;
  private listeners: Set<SyncListener> = new Set();
  private statusListeners: Set<(status: ConnectionStatus, deviceCount: number) => void> = new Set();
  private status: ConnectionStatus = 'connecting';
  private connectedDevicesCount = 1;
  private reconnectAttempts = 0;
  private reconnectTimer: any = null;
  private pingInterval: any = null;
  private readonly deviceId: string;
  private readonly deviceType: 'Mobile Phone' | 'Laptop' | 'Tablet' | 'Desktop';

  constructor() {
    this.deviceId = this.initDeviceId();
    this.deviceType = this.detectDeviceType();
    this.initBroadcastChannel();
    this.initConnection();
  }

  private initDeviceId(): string {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    }
    let id = localStorage.getItem('talent2task_device_id');
    if (!id) {
      id = `dev_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
      localStorage.setItem('talent2task_device_id', id);
    }
    return id;
  }

  private detectDeviceType(): 'Mobile Phone' | 'Laptop' | 'Tablet' | 'Desktop' {
    if (typeof window === 'undefined') return 'Desktop';
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return 'Tablet';
    }
    if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
      return 'Mobile Phone';
    }
    return 'Laptop';
  }

  public getDeviceId(): string {
    return this.deviceId;
  }

  public getDeviceType(): string {
    return this.deviceType;
  }

  public getConnectionStatus(): ConnectionStatus {
    return this.status;
  }

  public getConnectedDevicesCount(): number {
    return this.connectedDevicesCount;
  }

  public subscribeStatus(callback: (status: ConnectionStatus, deviceCount: number) => void): () => void {
    this.statusListeners.add(callback);
    callback(this.status, this.connectedDevicesCount);
    return () => {
      this.statusListeners.delete(callback);
    };
  }

  private updateStatus(status: ConnectionStatus, count?: number) {
    this.status = status;
    if (typeof count === 'number') {
      this.connectedDevicesCount = Math.max(1, count);
    }
    this.statusListeners.forEach(fn => fn(this.status, this.connectedDevicesCount));
  }

  private initBroadcastChannel() {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel('talent2task_device_sync_channel');
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && typeof event.data === 'object') {
            this.handleIncomingMessage(event.data, false);
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported:', err);
    }
  }

  private initConnection() {
    if (typeof window === 'undefined') return;

    const hostname = window.location.hostname;
    const isLocalServer = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.startsWith('192.168.') || hostname.startsWith('172.') || hostname.startsWith('10.');

    if (isLocalServer) {
      this.initLocalWebSocket();
    } else {
      this.initCloudMqttWebSocket();
    }
  }

  private initLocalWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws-sync`;

      this.updateStatus('connecting');
      this.isMqtt = false;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.updateStatus('connected');
        this.requestInitialSync();
      };

      this.ws.onmessage = (event) => {
        try {
          const parsed: SyncMessage = JSON.parse(event.data);
          this.handleIncomingMessage(parsed, false);
        } catch (err) {
          console.warn('Failed to parse local sync message:', err);
        }
      };

      this.ws.onclose = () => {
        // Fallback to cloud MQTT if local server is not active
        this.initCloudMqttWebSocket();
      };

      this.ws.onerror = () => {
        this.initCloudMqttWebSocket();
      };
    } catch {
      this.initCloudMqttWebSocket();
    }
  }

  private initCloudMqttWebSocket() {
    try {
      const brokerUrl = PUBLIC_MQTT_BROKERS[this.brokerIndex % PUBLIC_MQTT_BROKERS.length];
      this.updateStatus('connecting');
      this.isMqtt = true;

      this.ws = new WebSocket(brokerUrl, ['mqtt']);
      this.ws.binaryType = 'arraybuffer';

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        // Send MQTT CONNECT packet
        const connectPacket = createMqttConnect(`s2w_${this.deviceId}_${Date.now().toString(36)}`);
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(connectPacket.buffer as ArrayBuffer);
        }

        // Periodic MQTT Ping
        if (this.pingInterval) clearInterval(this.pingInterval);
        this.pingInterval = setInterval(() => {
          if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(new Uint8Array([0xC0, 0x00]).buffer as ArrayBuffer); // PINGREQ
          }
        }, 30000);
      };

      this.ws.onmessage = (event) => {
        try {
          const bytes = new Uint8Array(event.data as ArrayBuffer);
          const packetType = bytes[0] >> 4;

          if (packetType === 2) {
            // CONNACK received -> Send SUBSCRIBE to topic
            this.updateStatus('connected');
            const subPacket = createMqttSubscribe(MQTT_TOPIC, 1);
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
              this.ws.send(subPacket.buffer as ArrayBuffer);
            }
          } else if (packetType === 3) {
            // PUBLISH packet received -> Parse topic & payload
            let offset = 1;
            // Decode remaining length
            let multiplier = 1;
            let length = 0;
            let digit = 0;
            do {
              digit = bytes[offset++];
              length += (digit & 0x7F) * multiplier;
              multiplier *= 128;
            } while ((digit & 0x80) !== 0 && offset < bytes.length);

            const topicLen = (bytes[offset] << 8) | bytes[offset + 1];
            offset += 2;
            const topicBytes = bytes.subarray(offset, offset + topicLen);
            offset += topicLen;

            const dec = new TextDecoder();
            const topic = dec.decode(topicBytes);

            if (topic === MQTT_TOPIC) {
              const payloadBytes = bytes.subarray(offset);
              const payloadStr = dec.decode(payloadBytes);
              const parsed: SyncMessage = JSON.parse(payloadStr);
              this.handleIncomingMessage(parsed, false);
            }
          }
        } catch (err) {
          console.warn('Error parsing cloud sync packet:', err);
        }
      };

      this.ws.onclose = () => {
        this.updateStatus('fallback');
        this.scheduleReconnect();
      };

      this.ws.onerror = () => {
        this.updateStatus('fallback');
        this.scheduleReconnect();
      };
    } catch {
      this.updateStatus('fallback');
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);

    const delay = Math.min(2000 * Math.pow(1.3, this.reconnectAttempts), 8000);
    this.reconnectAttempts++;
    this.brokerIndex++; // Try next cloud broker

    this.reconnectTimer = setTimeout(() => {
      this.initConnection();
    }, delay);
  }

  public requestInitialSync() {
    this.send({
      type: 'INITIAL_SYNC_REQUEST',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString()
    });
  }

  public subscribe(callback: SyncListener): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private handleIncomingMessage(msg: SyncMessage, isLocalBroadcast: boolean = false) {
    if (!msg || typeof msg !== 'object') return;

    // Avoid re-processing messages sent by this exact device tab
    if (msg.senderId === this.deviceId && !isLocalBroadcast) {
      return;
    }

    // Handle connected devices count update
    if (msg.type === 'CONNECTED_DEVICES_UPDATE' && msg.data?.count) {
      this.updateStatus(this.status, msg.data.count);
      return;
    }

    // Trigger visual/audio notifications & mobile haptics for new gigs posted remotely
    if (msg.type === 'JOB_CREATED' && msg.senderId !== this.deviceId) {
      this.playRadarPingSound();
      this.triggerMobileHaptic();
    }

    // Notify all app listeners
    this.listeners.forEach(fn => {
      try {
        fn(msg);
      } catch (err) {
        console.error('Error in sync listener callback:', err);
      }
    });
  }

  private send(msg: SyncMessage) {
    // 1. Broadcast locally across tabs on same device
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(msg);
      } catch (err) {
        console.warn('BroadcastChannel postMessage error:', err);
      }
    }

    // 2. Broadcast across network to all devices (Phones, Tablets, Laptops)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        if (this.isMqtt) {
          const publishPacket = createMqttPublish(MQTT_TOPIC, JSON.stringify(msg));
          this.ws.send(publishPacket.buffer as ArrayBuffer);
        } else {
          this.ws.send(JSON.stringify(msg));
        }
      } catch (err) {
        console.warn('WebSocket send error:', err);
      }
    }
  }

  // --- PUBLIC BROADCAST API ---

  public broadcastJobCreated(job: Job) {
    this.send({
      type: 'JOB_CREATED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: job
    });
  }

  public broadcastJobClaimed(jobId: string, seekerId: string, seekerName?: string, seekerPhone?: string) {
    this.send({
      type: 'JOB_CLAIMED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: { jobId, seekerId, seekerName, seekerPhone }
    });
  }

  public broadcastJobStatusUpdated(jobId: string, status: 'OPEN' | 'CLAIMED' | 'COMPLETED') {
    this.send({
      type: 'JOB_STATUS_UPDATED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: { jobId, status }
    });
  }

  public broadcastJobDeleted(jobId: string) {
    this.send({
      type: 'JOB_DELETED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: { jobId }
    });
  }

  public broadcastUserUpserted(user: User) {
    this.send({
      type: 'USER_UPSERTED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: user
    });
  }

  public broadcastNotification(notification: NotificationItem) {
    this.send({
      type: 'NOTIFICATION_ADDED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: notification
    });
  }

  public broadcastReview(review: FeedbackReview) {
    this.send({
      type: 'REVIEW_ADDED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: review
    });
  }

  public broadcastPayment(txn: any) {
    this.send({
      type: 'PAYMENT_PROCESSED',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data: txn
    });
  }

  public broadcastSafeGigUpdate(data: any) {
    this.send({
      type: 'SAFEGIG_UPDATE',
      senderId: this.deviceId,
      senderDevice: this.deviceType,
      timestamp: new Date().toISOString(),
      data
    });
  }

  // --- MOBILE HAPTIC VIBRATION ---
  public triggerMobileHaptic() {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([120, 60, 180]);
      }
    } catch {
      // Ignore if not supported
    }
  }

  // --- REAL-TIME AUDIO RADAR CHIME (Web Audio API) ---
  public playRadarPingSound() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      // Dual harmonious tone: 587.33 Hz (D5) -> 880 Hz (A5)
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.18);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(1174.66, now);
      osc2.frequency.exponentialRampToValueAtTime(1760, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.65);
      osc2.stop(now + 0.65);
    } catch {
      // Audio autoplay policy fallback
    }
  }
}

export const syncService = new SyncService();
