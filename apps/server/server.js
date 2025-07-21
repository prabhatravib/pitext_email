import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Serve static files from the built frontend
app.use(express.static(path.join(__dirname, '../mail/build/client')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Gmail server is running' });
});

// Settings API for Gmail
app.get('/api/trpc/settings.get', (req, res) => {
  res.json({
    result: {
      data: {
        settings: {
          theme: 'system',
          language: 'en',
          notifications: true,
          autoSave: true
        }
      }
    }
  });
});

app.post('/api/trpc/settings.save', (req, res) => {
  // For Gmail-only version, settings are not persisted
  res.json({ result: { data: { success: true } } });
});

// Gmail-specific API endpoints
app.get('/api/gmail/auth', (req, res) => {
  res.json({ 
    message: 'Gmail authentication endpoint',
    status: 'ready'
  });
});

app.get('/api/gmail/messages', (req, res) => {
  res.json({ 
    message: 'Gmail messages endpoint',
    status: 'ready'
  });
});

// Fallback for any other API routes
app.get('/api/*', (req, res) => {
  res.json({ 
    message: 'Gmail API endpoint',
    status: 'ready'
  });
});

// Catch-all handler for SPA routing - serve index.html for any non-API route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../mail/build/client/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Gmail server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📧 Gmail API ready at: http://localhost:${PORT}/api/gmail`);
  console.log(`🌐 Frontend served from: ${path.join(__dirname, '../mail/build/client')}`);
}); 