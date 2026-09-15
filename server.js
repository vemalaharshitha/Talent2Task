import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, 'dist');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm'
};

// In-memory master state
let masterState = {
  jobs: [],
  users: [],
  reviews: [],
  notifications: [],
  lastUpdated: new Date().toISOString()
};

const clients = new Set();

function broadcast(payload, excludeWs) {
  const jsonStr = JSON.stringify(payload);
  clients.forEach(client => {
    if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
      try {
        client.send(jsonStr);
      } catch (err) {
        console.warn('Error broadcasting:', err);
      }
    }
  });
}

function broadcastDeviceCount() {
  broadcast({
    type: 'CONNECTED_DEVICES_UPDATE',
    timestamp: new Date().toISOString(),
    data: { count: clients.size }
  });
}

function handleSyncEvent(payload, senderWs) {
  switch (payload.type) {
    case 'INITIAL_SYNC_REQUEST':
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({
          type: 'INITIAL_SYNC_RESPONSE',
          timestamp: new Date().toISOString(),
          data: masterState
        }));
      }
      break;
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
        if (idx >= 0) masterState.users[idx] = user;
        else masterState.users.unshift(user);
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
    case 'PING':
      if (senderWs && senderWs.readyState === WebSocket.OPEN) {
        senderWs.send(JSON.stringify({ type: 'PONG', timestamp: new Date().toISOString() }));
      }
      break;
  }
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  // Sync API endpoints
  if (pathname.startsWith('/api/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }
  }

  if (pathname === '/api/sync/state' && req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      connectedDevices: clients.size,
      state: masterState
    }));
    return;
  }

  if (pathname === '/api/sync/event' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        handleSyncEvent(payload);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true }));
      } catch (err) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/translate' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { text, targetLanguage, targetLanguages, sourceLanguage } = JSON.parse(body || '{}');
        if (!text || typeof text !== 'string') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing or invalid "text" field' }));
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KgA4iByw13__efjczYVBa-uykgnshYGYjApIvxvzJW9g';
        const model = process.env.GEMINI_MODEL || 'gemini-3.6-flash';

        if (Array.isArray(targetLanguages) && targetLanguages.length > 0) {
          try {
            const prompt = `Translate this text accurately into: ${targetLanguages.join(', ')}. Return only valid JSON: {"detectedLanguage": "ISO-code", "translations": {${targetLanguages.map(l => `"${l}": "text"`).join(', ')}}}. Text: """${text}"""`;
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
              })
            });
            const data = await geminiRes.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(raw);
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              translations: parsed.translations,
              detectedLanguage: parsed.detectedLanguage,
              source: 'gemini'
            }));
            return;
          } catch (e) {
            console.warn('Gemini translate multi failed in server.js:', e);
          }
        }

        // Single translation
        const target = targetLanguage || targetLang || 'en';
        const source = sourceLanguage || sourceLang || 'auto';
        const langNames = { en: 'English', ta: 'Tamil', te: 'Telugu', hi: 'Hindi' };
        const targetFullName = langNames[target] || target;

        try {
          const prompt = `Translate the provided text accurately into ${targetFullName} (${target}). Preserve meaning, names, numbers, locations, currency values. Return ONLY the translated text in ${targetFullName} script, nothing else. Text: """${text}"""`;
          const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.1 }
            })
          });
          const data = await geminiRes.json();
          if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            const translated = data.candidates[0].content.parts[0].text.trim();
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              text: translated,
              detectedLanguage: source,
              source: 'gemini'
            }));
            return;
          }
        } catch (e) {
          console.warn('Gemini translate single failed in server.js:', e);
        }

        // Secondary fallback to free online translation endpoint
        try {
          const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`;
          const gRes = await fetch(gUrl);
          if (gRes.ok) {
            const gData = await gRes.json();
            const translated = gData[0]?.map(part => part[0]).join('') || text;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              success: true,
              text: translated,
              detectedLanguage: source,
              source: 'online_translation'
            }));
            return;
          }
        } catch (e) {
          console.warn('Secondary translate failed in server.js:', e);
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, text, detectedLanguage: 'en', source: 'fallback' }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/detect-language' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { text } = JSON.parse(body || '{}');
        let lang = 'en';
        if (text) {
          for (let i = 0; i < text.length; i++) {
            const code = text.charCodeAt(i);
            if (code >= 0x0b80 && code <= 0x0bff) { lang = 'ta'; break; }
            if (code >= 0x0c00 && code <= 0x0c7f) { lang = 'te'; break; }
            if (code >= 0x0900 && code <= 0x097f) { lang = 'hi'; break; }
          }
        }
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, language: lang }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (pathname === '/api/chat' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const parsedBody = JSON.parse(body || '{}');
        const { message, history, language } = parsedBody;
        let { userContext, platformContext, context } = parsedBody;

        if (context && !userContext) {
          userContext = {
            role: context.role,
            name: context.userName || context.name,
            city: context.userLocation || context.city,
            skills: context.userSkills || context.skills
          };
          platformContext = {
            openGigsCount: context.openGigsCount,
            workersCount: context.verifiedWorkersCount || context.workersCount,
            topDemandSkills: context.topDemandedSkills || context.topDemandSkills
          };
        }

        if (!message || typeof message !== 'string') {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing or invalid "message" field' }));
          return;
        }

        const apiKey = process.env.GEMINI_API_KEY || 'AQ.Ab8RN6KgA4iByw13__efjczYVBa-uykgnshYGYjApIvxvzJW9g';
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';
        const candidateModels = [
          primaryModel,
          'gemini-flash-lite-latest',
          'gemini-3.1-flash-lite',
          'gemini-3.5-flash',
          'gemini-3.8-flash',
          'gemini-3.7-flash'
        ];
        const uniqueModels = [...new Set(candidateModels)];

        const prompt = `You are Talent2Task AI, an expert, context-aware AI assistant for Talent2Task — a hyper-local informal gig and skill matching platform across Tamil Nadu.
Context: User Role: ${userContext?.role || 'Seeker'}, User City: ${userContext?.city || 'Tamil Nadu'}, Open Gigs: ${platformContext?.openGigsCount || 50}, Workers: ${platformContext?.workersCount || 100}
History: ${(history || []).slice(-6).map(h => `${h.sender || h.role || 'user'}: ${h.text}`).join('\n')}
USER: ${message}

Respond in the user's language (${language || 'auto'}) with clean Markdown formatting (bolding, lists). Return ONLY valid JSON:
{
  "reply": "Clear concise helpful answer",
  "intent": "FIND_WORKER | FIND_JOB | POST_GIG | SKILL_GAP | DEMAND_ANALYSIS | GENERAL_CHAT",
  "detectedLanguage": "en | ta | te | hi",
  "extractedParameters": { "skill": null, "location": null, "radiusKm": null, "minExperience": null, "availability": null, "isVerifiedOnly": false },
  "actions": [],
  "suggestedFollowUps": ["Follow up 1", "Follow up 2"]
}`;

        for (const mdl of uniqueModels) {
          try {
            const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${encodeURIComponent(apiKey)}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
              })
            });

            if (!geminiRes.ok) continue;

            const data = await geminiRes.json();
            const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (raw) {
              const parsed = JSON.parse(raw);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, ...parsed, source: 'gemini' }));
              return;
            }
          } catch (e) {
            console.warn(`Gemini chat attempt failed on model ${mdl}:`, e);
          }
        }

        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: true,
          reply: `I received your request: "${message}". Checking matching records...`,
          intent: 'GENERAL_CHAT',
          detectedLanguage: 'en',
          extractedParameters: {},
          actions: [],
          suggestedFollowUps: ['Find Workers', 'Find Gigs Near Me'],
          source: 'offline_fallback'
        }));
      } catch (err) {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // GET or POST /api/tts
  if (pathname === '/api/tts') {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    const paramText = parsedUrl.searchParams.get('text') || '';
    const paramLang = parsedUrl.searchParams.get('lang') || 'en';

    const handleTts = async (txt, l) => {
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
      } catch (err) {
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


  // Static File Serving
  let filePath = path.join(DIST_DIR, pathname === '/' ? 'index.html' : pathname);

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(DIST_DIR, 'index.html');
  }

  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (req, socket, head) => {
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
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
      const parsed = JSON.parse(message.toString());
      handleSyncEvent(parsed, ws);
    } catch (err) {
      console.warn('WebSocket message error:', err);
    }
  });

  ws.on('close', () => {
    clients.delete(ws);
    broadcastDeviceCount();
  });

  ws.on('error', () => {
    clients.delete(ws);
    broadcastDeviceCount();
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Talent2Task Production Server live on http://0.0.0.0:${PORT}`);
});
