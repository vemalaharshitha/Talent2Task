import { WebSocketServer, WebSocket } from 'ws';
import type { IncomingMessage, ServerResponse } from 'http';
import type { ViteDevServer, PreviewServer } from 'vite';
import { translateText, translateMulti, detectLanguage, chatWithGemini } from './geminiService.ts';

export interface SyncPayload {
  type: 
    | 'INITIAL_SYNC_REQUEST'
    | 'INITIAL_SYNC_RESPONSE'
    | 'JOB_CREATED'
    | 'JOB_CLAIMED'
    | 'JOB_STATUS_UPDATED'
    | 'JOB_DELETED'
    | 'USER_UPSERTED'
    | 'NOTIFICATION_ADDED'
    | 'REVIEW_ADDED'
    | 'CONNECTED_DEVICES_UPDATE'
    | 'PING'
    | 'PONG';
  senderId?: string;
  senderDevice?: string;
  timestamp: string;
  data?: any;
}

// In-memory master sync storage for Vite server session
let masterState = {
  jobs: [] as any[],
  users: [] as any[],
  reviews: [] as any[],
  notifications: [] as any[],
  lastUpdated: new Date().toISOString()
};

const clients = new Set<WebSocket>();

function broadcast(payload: SyncPayload, excludeWs?: WebSocket) {
  const jsonStr = JSON.stringify(payload);
  clients.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonStr);
      } catch (err) {
        console.warn('Error broadcasting to client:', err);
      }
    }
  });
}

function broadcastDeviceCount() {
  const payload: SyncPayload = {
    type: 'CONNECTED_DEVICES_UPDATE',
    timestamp: new Date().toISOString(),
    data: {
      count: clients.size
    }
  };
  broadcast(payload);
}

export function handleSyncEvent(payload: SyncPayload, senderWs?: WebSocket) {
  switch (payload.type) {
    case 'INITIAL_SYNC_REQUEST': {
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        const response: SyncPayload = {
          type: 'INITIAL_SYNC_RESPONSE',
          timestamp: new Date().toISOString(),
          data: masterState
        };
        senderWs.send(JSON.stringify(response));
      }
      break;
    }

    case 'JOB_CREATED': {
      const job = payload.data;
      if (job && job.id) {
        masterState.jobs = [job, ...masterState.jobs.filter(j => j.id !== job.id)];
        masterState.lastUpdated = new Date().toISOString();
        broadcast(payload, senderWs);
      }
      break;
    }

    case 'JOB_CLAIMED': {
      const { jobId, seekerId, seekerName, seekerPhone } = payload.data || {};
      const job = masterState.jobs.find(j => j.id === jobId);
      if (job) {
        job.status = 'CLAIMED';
        job.claimed_by = seekerId;
        if (seekerName) job.claimed_by_name = seekerName;
        if (seekerPhone) job.claimed_by_phone = seekerPhone;
        masterState.lastUpdated = new Date().toISOString();
      }
      broadcast(payload, senderWs);
      break;
    }

    case 'JOB_STATUS_UPDATED': {
      const { jobId, status } = payload.data || {};
      const job = masterState.jobs.find(j => j.id === jobId);
      if (job) {
        job.status = status;
        masterState.lastUpdated = new Date().toISOString();
      }
      broadcast(payload, senderWs);
      break;
    }

    case 'JOB_DELETED': {
      const { jobId } = payload.data || {};
      masterState.jobs = masterState.jobs.filter(j => j.id !== jobId);
      masterState.lastUpdated = new Date().toISOString();
      broadcast(payload, senderWs);
      break;
    }

    case 'USER_UPSERTED': {
      const user = payload.data;
      if (user && user.id) {
        const idx = masterState.users.findIndex(u => u.id === user.id);
        if (idx >= 0) {
          masterState.users[idx] = user;
        } else {
          masterState.users.unshift(user);
        }
        masterState.lastUpdated = new Date().toISOString();
        broadcast(payload, senderWs);
      }
      break;
    }

    case 'NOTIFICATION_ADDED': {
      const notif = payload.data;
      if (notif && notif.id) {
        masterState.notifications.unshift(notif);
        masterState.lastUpdated = new Date().toISOString();
        broadcast(payload, senderWs);
      }
      break;
    }

    case 'REVIEW_ADDED': {
      const review = payload.data;
      if (review && review.id) {
        masterState.reviews.unshift(review);
        masterState.lastUpdated = new Date().toISOString();
        broadcast(payload, senderWs);
      }
      break;
    }

    case 'PING': {
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
      break;
    }

    default:
      break;
  }
}

export function setupSyncServer(server: ViteDevServer | PreviewServer) {
  const httpServer = server.httpServer;
  if (!httpServer) return;

  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (req, socket, head) => {
    const pathname = new URL(req.url || '', `http://${req.headers.host}`).pathname;
    if (pathname === '/ws-sync') {
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req);
      });
    }
  });

  wss.on('connection', (ws) => {
    clients.add(ws);
    broadcastDeviceCount();

    ws.on('message', (message) => {
      try {
        const parsed: SyncPayload = JSON.parse(message.toString());
        handleSyncEvent(parsed, ws);
      } catch (err) {
        console.warn('Sync server JSON parse error:', err);
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
      broadcastDeviceCount();
    });

    ws.on('error', (err) => {
      console.warn('Sync server client error:', err);
      clients.delete(ws);
      broadcastDeviceCount();
    });
  });

  // Attach HTTP middleware for REST sync & translation endpoints
  server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    const url = req.url || '';

    // Enable CORS for all API endpoints
    if (url.startsWith('/api/')) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      
      if (req.method === 'OPTIONS') {
        res.statusCode = 204;
        res.end();
        return;
      }
    }

    if (url.startsWith('/api/sync/state') && req.method === 'GET') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({
        success: true,
        connectedDevices: clients.size,
        state: masterState
      }));
      return;
    }

    if (url.startsWith('/api/sync/event') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', () => {
        try {
          const payload: SyncPayload = JSON.parse(body);
          handleSyncEvent(payload);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true }));
        } catch (e: any) {
          res.statusCode = 400;
          res.end(JSON.stringify({ error: e.message }));
        }
      });
      return;
    }

    // POST /api/translate
    if (url.startsWith('/api/translate') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const { text, targetLanguage, targetLanguages, sourceLanguage } = JSON.parse(body || '{}');

          if (!text || typeof text !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing or invalid "text" field' }));
            return;
          }

          if (Array.isArray(targetLanguages) && targetLanguages.length > 0) {
            const multiRes = await translateMulti(text, targetLanguages, sourceLanguage);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              translations: multiRes.translations,
              detectedLanguage: multiRes.detectedLanguage,
              source: multiRes.source
            }));
            return;
          }

          const target = targetLanguage || 'en';
          const singleRes = await translateText(text, target, sourceLanguage);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            text: singleRes.text,
            detectedLanguage: singleRes.detectedLanguage,
            source: singleRes.source
          }));
        } catch (err: any) {
          console.error('[syncServer] /api/translate error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // POST /api/detect-language
    if (url.startsWith('/api/detect-language') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const { text } = JSON.parse(body || '{}');
          const lang = await detectLanguage(text || '');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, language: lang }));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // POST /api/chat
    if (url.startsWith('/api/chat') && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk;
      });
      req.on('end', async () => {
        try {
          const chatReq = JSON.parse(body || '{}');
          if (!chatReq.message || typeof chatReq.message !== 'string') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing or invalid "message" field' }));
            return;
          }

          if (chatReq.context && !chatReq.userContext) {
            chatReq.userContext = {
              role: chatReq.context.role,
              name: chatReq.context.userName || chatReq.context.name,
              city: chatReq.context.userLocation || chatReq.context.city,
              skills: chatReq.context.userSkills || chatReq.context.skills
            };
            chatReq.platformContext = {
              openGigsCount: chatReq.context.openGigsCount,
              workersCount: chatReq.context.verifiedWorkersCount || chatReq.context.workersCount,
              topDemandSkills: chatReq.context.topDemandedSkills || chatReq.context.topDemandSkills
            };
          }

          const response = await chatWithGemini(chatReq);
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, ...response }));
        } catch (err: any) {
          console.error('[syncServer] /api/chat error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });
      return;
    }

    // GET or POST /api/tts
    if (url.startsWith('/api/tts')) {
      const parsedUrl = new URL(req.url || '', 'http://localhost');
      const paramText = parsedUrl.searchParams.get('text') || '';
      const paramLang = parsedUrl.searchParams.get('lang') || 'en';

      const handleTts = async (txt: string, l: string) => {
        try {
          const cleanTxt = txt.replace(/[*#`_•]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${encodeURIComponent(l)}&q=${encodeURIComponent(cleanTxt)}`;
          const ttsRes = await fetch(ttsUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Referer': 'https://translate.google.com/'
            }
          });

          if (ttsRes.ok) {
            const arrayBuffer = await ttsRes.arrayBuffer();
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 'public, max-age=86400');
            res.end(Buffer.from(arrayBuffer));
            return;
          }
          res.statusCode = 502;
          res.end('TTS stream unavailable');
        } catch (err: any) {
          res.statusCode = 500;
          res.end('TTS error: ' + err.message);
        }
      };

      if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', async () => {
          try {
            const parsed = JSON.parse(body || '{}');
            await handleTts(parsed.text || paramText, parsed.lang || paramLang);
          } catch {
            await handleTts(paramText, paramLang);
          }
        });
      } else {
        handleTts(paramText, paramLang);
      }
      return;
    }

    next();
  });
}

