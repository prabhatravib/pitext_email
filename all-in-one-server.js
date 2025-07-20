import express from 'express';
import cors from 'cors';
import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

console.log('🚀 Starting PiText Email Server...');
console.log('📁 Data directory:', DATA_DIR);
console.log('🔧 Port:', PORT);

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Ensure data directory exists
try {
  await fsPromises.mkdir(DATA_DIR, { recursive: true });
  console.log('Data directory ready:', DATA_DIR);
} catch (error) {
  console.error('Error creating data directory:', error);
}

// Initialize data files if they don't exist
const initDataFile = async (filename, defaultData) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    await fsPromises.access(filepath);
  } catch {
    await fsPromises.writeFile(filepath, JSON.stringify(defaultData, null, 2));
    console.log(`Created data file: ${filename}`);
  }
};

// Initialize default data
await initDataFile('threads.json', [
  {
    id: 'welcome_thread',
    subject: 'Welcome to PiText Email! 🎉',
    snippet: 'Thanks for trying PiText Email. This is a demo email to help you get started...',
    folder: 'inbox',
    unread: true,
    starred: false,
    important: true,
    participants: ['welcome@pitext.email', 'demo@pitext.email'],
    messageCount: 1,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  }
]);

await initDataFile('messages.json', [
  {
    id: 'welcome_msg',
    threadId: 'welcome_thread',
    from: 'welcome@pitext.email',
    to: ['demo@pitext.email'],
    subject: 'Welcome to PiText Email! 🎉',
    body: 'Thanks for trying PiText Email! This is a demo email to help you get started.\n\nYou can:\n- Read and manage emails\n- Star important messages\n- Move emails between folders\n- Search your inbox\n\nTo connect your Gmail account, click on Settings and add your Google account.',
    html: '<p>Thanks for trying PiText Email! This is a demo email to help you get started.</p><p>You can:</p><ul><li>Read and manage emails</li><li>Star important messages</li><li>Move emails between folders</li><li>Search your inbox</li></ul><p>To connect your Gmail account, click on Settings and add your Google account.</p>',
    date: new Date().toISOString(),
    unread: true,
    starred: false
  }
]);

await initDataFile('folders.json', {
  inbox: { id: 'inbox', name: 'Inbox', type: 'system' },
  sent: { id: 'sent', name: 'Sent', type: 'system' },
  drafts: { id: 'drafts', name: 'Drafts', type: 'system' },
  trash: { id: 'trash', name: 'Trash', type: 'system' },
  spam: { id: 'spam', name: 'Spam', type: 'system' }
});

// Helper functions
const readData = async (filename) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const data = await fsPromises.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return filename === 'folders.json' ? {} : [];
  }
};

const writeData = async (filename, data) => {
  const filepath = path.join(DATA_DIR, filename);
  await fsPromises.writeFile(filepath, JSON.stringify(data, null, 2));
};

// ==========================================
// API ENDPOINTS
// ==========================================

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'PiText Email is running',
    mode: 'all-in-one',
    hasData: fs.existsSync(DATA_DIR)
  });
});

// Mock auth endpoints
app.post('/api/auth/callback/google', (req, res) => {
  res.json({
    user: {
      id: '1',
      email: 'demo@pitext.email',
      name: 'Demo User',
      image: null
    },
    token: 'demo-token'
  });
});

app.get('/api/user', (req, res) => {
  res.json({
    id: '1',
    email: 'demo@pitext.email',
    name: 'Demo User',
    providers: ['demo']
  });
});

// Get folders
app.get('/api/folders', async (req, res) => {
  const folders = await readData('folders.json');
  res.json(Object.values(folders));
});

// Get threads
app.get('/api/threads', async (req, res) => {
  const { folder = 'inbox', page = 1, limit = 50 } = req.query;
  const threads = await readData('threads.json');
  
  const filteredThreads = threads.filter(thread => thread.folder === folder);
  const startIndex = (parseInt(page) - 1) * parseInt(limit);
  const paginatedThreads = filteredThreads.slice(startIndex, startIndex + parseInt(limit));
  
  res.json({
    threads: paginatedThreads,
    total: filteredThreads.length,
    page: parseInt(page),
    limit: parseInt(limit)
  });
});

// Get single thread
app.get('/api/threads/:id', async (req, res) => {
  const threads = await readData('threads.json');
  const thread = threads.find(t => t.id === req.params.id);
  
  if (!thread) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  res.json(thread);
});

// Get messages for thread
app.get('/api/threads/:id/messages', async (req, res) => {
  const messages = await readData('messages.json');
  const threadMessages = messages.filter(m => m.threadId === req.params.id);
  res.json(threadMessages);
});

// Create new email
app.post('/api/emails', async (req, res) => {
  const { to, subject, body, from = 'demo@pitext.email' } = req.body;
  
  const threads = await readData('threads.json');
  const messages = await readData('messages.json');
  
  const newThread = {
    id: `thread_${Date.now()}`,
    subject: subject || '(no subject)',
    snippet: body.substring(0, 100),
    folder: 'sent',
    unread: false,
    starred: false,
    important: false,
    participants: [from, ...to],
    messageCount: 1,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
  
  const newMessage = {
    id: `msg_${Date.now()}`,
    threadId: newThread.id,
    from: from,
    to: to,
    subject: subject,
    body: body,
    html: `<p>${body.replace(/\n/g, '<br>')}</p>`,
    date: new Date().toISOString(),
    unread: false,
    starred: false
  };
  
  threads.push(newThread);
  messages.push(newMessage);
  
  await writeData('threads.json', threads);
  await writeData('messages.json', messages);
  
  res.json({ thread: newThread, message: newMessage });
});

// Update thread
app.patch('/api/threads/:id', async (req, res) => {
  const threads = await readData('threads.json');
  const threadIndex = threads.findIndex(t => t.id === req.params.id);
  
  if (threadIndex === -1) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  threads[threadIndex] = { ...threads[threadIndex], ...req.body };
  await writeData('threads.json', threads);
  
  res.json(threads[threadIndex]);
});

// Move thread
app.post('/api/threads/:id/move', async (req, res) => {
  const { folder } = req.body;
  const threads = await readData('threads.json');
  const threadIndex = threads.findIndex(t => t.id === req.params.id);
  
  if (threadIndex === -1) {
    return res.status(404).json({ error: 'Thread not found' });
  }
  
  threads[threadIndex].folder = folder;
  await writeData('threads.json', threads);
  
  res.json(threads[threadIndex]);
});

// Search
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const threads = await readData('threads.json');
  const messages = await readData('messages.json');
  
  if (!q) {
    return res.json({ threads: [], messages: [] });
  }
  
  const query = q.toLowerCase();
  
  const matchedThreads = threads.filter(thread => 
    thread.subject.toLowerCase().includes(query) ||
    thread.snippet.toLowerCase().includes(query)
  );
  
  const matchedMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(query) ||
    message.body?.toLowerCase().includes(query)
  );
  
  res.json({
    threads: matchedThreads,
    messages: matchedMessages
  });
});

// Catch-all for unimplemented API endpoints
app.all('/api/*', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented',
    message: 'This endpoint is not available in demo mode'
  });
});

// ==========================================
// FRONTEND SERVING
// ==========================================

// Serve static files from the build directory
const buildPath = path.join(__dirname, 'apps/mail/build/client');
const indexPath = path.join(buildPath, 'index.html');

if (fs.existsSync(buildPath) && fs.existsSync(indexPath)) {
  app.use(express.static(buildPath));
  
  // Handle all routes by serving index.html (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(indexPath);
  });
} else {
  // Serve a simple HTML interface for the API
  app.get('*', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PiText Email - API Demo</title>
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            background: #0a0a0a;
            color: #fff;
          }
          .container { 
            text-align: center; 
            padding: 3rem; 
            background: #1a1a1a; 
            border-radius: 12px; 
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            max-width: 600px;
            width: 100%;
          }
          h1 { 
            color: #fff; 
            margin-bottom: 1rem;
          }
          p { 
            color: #888; 
            line-height: 1.6;
          }
          .api-section {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #2a2a2a;
            border-radius: 8px;
            text-align: left;
          }
          .api-endpoint {
            margin: 1rem 0;
            padding: 1rem;
            background: #333;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
          }
          .method {
            color: #4a9eff;
            font-weight: bold;
          }
          .url {
            color: #fff;
          }
          .description {
            color: #888;
            margin-top: 0.5rem;
          }
          .status {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #2a2a2a;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            font-size: 0.9rem;
            text-align: left;
          }
          .health-link {
            color: #4a9eff;
            text-decoration: none;
          }
          .health-link:hover {
            text-decoration: underline;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PiText Email API</h1>
          <p>Welcome to PiText Email! This is a demo API server with local data storage.</p>
          
          <div class="api-section">
            <h3>📧 Available Endpoints</h3>
            
            <div class="api-endpoint">
              <div><span class="method">GET</span> <span class="url">/api/threads</span></div>
              <div class="description">Get all email threads</div>
            </div>
            
            <div class="api-endpoint">
              <div><span class="method">GET</span> <span class="url">/api/threads/:id</span></div>
              <div class="description">Get a specific thread by ID</div>
            </div>
            
            <div class="api-endpoint">
              <div><span class="method">POST</span> <span class="url">/api/threads</span></div>
              <div class="description">Create a new thread</div>
            </div>
            
            <div class="api-endpoint">
              <div><span class="method">GET</span> <span class="url">/api/messages</span></div>
              <div class="description">Get all messages</div>
            </div>
            
            <div class="api-endpoint">
              <div><span class="method">GET</span> <span class="url">/api/search?q=query</span></div>
              <div class="description">Search threads and messages</div>
            </div>
            
            <div class="api-endpoint">
              <div><span class="method">GET</span> <span class="url">/health</span></div>
              <div class="description">Server health check</div>
            </div>
          </div>
          
          <div class="status">
            <strong>Status:</strong> API Server Running<br>
            <strong>Server:</strong> Running on port ${PORT}<br>
            <strong>Health:</strong> <a href="/health" class="health-link">/health</a><br>
            <strong>Mode:</strong> Demo with local JSON data<br>
            <strong>Data:</strong> Stored in ${DATA_DIR}
          </div>
          
          <p style="margin-top: 2rem; font-size: 0.9rem; color: #666;">
            💡 <strong>Next Steps:</strong> Set up Gmail OAuth for email import functionality
          </p>
        </div>
      </body>
      </html>
    `);
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 PiText Email Server Started
==============================
✅ Port: ${PORT}
✅ Health: http://localhost:${PORT}/health
✅ Mode: All-in-one (Frontend + API)
✅ Data: ${DATA_DIR}

📧 Demo email available in inbox
🔧 Gmail import requires OAuth setup
  `);
}); 