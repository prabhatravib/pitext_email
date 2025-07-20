import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;
const DATA_DIR = path.join(__dirname, 'data');

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Ensure data directory exists
try {
  await fs.mkdir(DATA_DIR, { recursive: true });
  console.log('Data directory created/verified:', DATA_DIR);
} catch (error) {
  console.error('Error creating data directory:', error);
}

// Initialize data files if they don't exist
const initDataFile = async (filename, defaultData) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    await fs.access(filepath);
    console.log(`Data file exists: ${filename}`);
  } catch {
    await fs.writeFile(filepath, JSON.stringify(defaultData, null, 2));
    console.log(`Created data file: ${filename}`);
  }
};

// Initialize default data files
try {
  await initDataFile('threads.json', []);
  await initDataFile('messages.json', []);
  await initDataFile('users.json', {});
  await initDataFile('folders.json', {
    inbox: { id: 'inbox', name: 'Inbox', type: 'system' },
    sent: { id: 'sent', name: 'Sent', type: 'system' },
    drafts: { id: 'drafts', name: 'Drafts', type: 'system' },
    trash: { id: 'trash', name: 'Trash', type: 'system' },
    spam: { id: 'spam', name: 'Spam', type: 'system' }
  });
} catch (error) {
  console.error('Error initializing data files:', error);
}

// Middleware
app.use(cors({
  origin: process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Helper functions
const readData = async (filename) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filepath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
};

const writeData = async (filename, data) => {
  const filepath = path.join(DATA_DIR, filename);
  try {
    await fs.writeFile(filepath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
};

// Mock authentication endpoint
app.post('/api/auth/callback/google', (req, res) => {
  // Simple mock response for Google OAuth
  res.json({
    user: {
      id: '1',
      email: 'user@example.com',
      name: 'Test User',
      image: null
    },
    token: 'mock-token'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Simple email server is running' });
});

// Get user info
app.get('/api/user', (req, res) => {
  res.json({
    id: '1',
    email: 'user@example.com',
    name: 'Test User',
    providers: ['google']
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
  
  // Filter by folder
  const filteredThreads = threads.filter(thread => thread.folder === folder);
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const paginatedThreads = filteredThreads.slice(startIndex, startIndex + limit);
  
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

// Get messages for a thread
app.get('/api/threads/:id/messages', async (req, res) => {
  const messages = await readData('messages.json');
  const threadMessages = messages.filter(m => m.threadId === req.params.id);
  res.json(threadMessages);
});

// Create new email/thread
app.post('/api/emails', async (req, res) => {
  const { to, subject, body, from = 'user@example.com' } = req.body;
  
  const threads = await readData('threads.json');
  const messages = await readData('messages.json');
  
  // Create new thread
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
  
  // Create new message
  const newMessage = {
    id: `msg_${Date.now()}`,
    threadId: newThread.id,
    from: from,
    to: to,
    subject: subject,
    body: body,
    html: `<p>${body}</p>`,
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

// Update thread (mark as read, star, etc.)
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

// Move thread to folder
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

// Search emails
app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  const threads = await readData('threads.json');
  const messages = await readData('messages.json');
  
  if (!q) {
    return res.json({ threads: [], messages: [] });
  }
  
  const query = q.toLowerCase();
  
  // Search in threads
  const matchedThreads = threads.filter(thread => 
    thread.subject.toLowerCase().includes(query) ||
    thread.snippet.toLowerCase().includes(query) ||
    thread.participants.some(p => p.toLowerCase().includes(query))
  );
  
  // Search in messages
  const matchedMessages = messages.filter(message =>
    message.subject?.toLowerCase().includes(query) ||
    message.body?.toLowerCase().includes(query) ||
    message.from?.toLowerCase().includes(query) ||
    message.to?.some(t => t.toLowerCase().includes(query))
  );
  
  res.json({
    threads: matchedThreads,
    messages: matchedMessages
  });
});

// Add sample data endpoint (for testing)
app.post('/api/sample-data', async (req, res) => {
  const sampleThreads = [
    {
      id: 'thread_1',
      subject: 'Welcome to Zero Email!',
      snippet: 'Thanks for trying out Zero Email. This is a sample email to get you started...',
      folder: 'inbox',
      unread: true,
      starred: false,
      important: true,
      participants: ['welcome@zero.email', 'user@example.com'],
      messageCount: 1,
      lastMessageAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    },
    {
      id: 'thread_2',
      subject: 'Your account is ready',
      snippet: 'Your Zero Email account has been set up successfully. You can now start...',
      folder: 'inbox',
      unread: false,
      starred: true,
      important: false,
      participants: ['noreply@zero.email', 'user@example.com'],
      messageCount: 1,
      lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ];
  
  const sampleMessages = [
    {
      id: 'msg_1',
      threadId: 'thread_1',
      from: 'welcome@zero.email',
      to: ['user@example.com'],
      subject: 'Welcome to Zero Email!',
      body: 'Thanks for trying out Zero Email. This is a sample email to get you started. Zero Email is an open-source email client that puts your privacy first.',
      html: '<p>Thanks for trying out Zero Email. This is a sample email to get you started.</p><p>Zero Email is an open-source email client that puts your privacy first.</p>',
      date: new Date().toISOString(),
      unread: true,
      starred: false
    },
    {
      id: 'msg_2',
      threadId: 'thread_2',
      from: 'noreply@zero.email',
      to: ['user@example.com'],
      subject: 'Your account is ready',
      body: 'Your Zero Email account has been set up successfully. You can now start sending and receiving emails.',
      html: '<p>Your Zero Email account has been set up successfully. You can now start sending and receiving emails.</p>',
      date: new Date(Date.now() - 86400000).toISOString(),
      unread: false,
      starred: true
    }
  ];
  
  await writeData('threads.json', sampleThreads);
  await writeData('messages.json', sampleMessages);
  
  res.json({ message: 'Sample data added successfully' });
});

// Catch-all for unimplemented endpoints
app.all('/api/*', (req, res) => {
  res.status(501).json({ 
    error: 'Not implemented',
    message: 'This endpoint is not available in the simple server'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Simple email server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Add sample data: POST http://localhost:${PORT}/api/sample-data`);
  console.log(`CORS origin: ${process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000'}`);
}); 