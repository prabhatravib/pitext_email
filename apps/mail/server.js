import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Add logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Frontend server is running' });
});

// API proxy for development (if backend is not available)
app.get('/api/trpc/*', (req, res) => {
  console.log('TRPC request intercepted:', req.path);
  res.status(503).json({ 
    error: 'Backend not available',
    message: 'Please ensure the backend service is running'
  });
});

// Serve static files from the build directory
const buildPath = path.join(__dirname, 'build/client');
app.use(express.static(buildPath));

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.error('❌ Build directory not found:', buildPath);
  console.error('Available directories:', fs.readdirSync(__dirname));
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(buildPath, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html not found at:', indexPath);
  console.error('Available files in build/client:', fs.readdirSync(buildPath));
  process.exit(1);
}

// Handle all routes by serving the index.html file (for SPA routing)
app.get('*', (req, res) => {
  console.log('Serving index.html for route:', req.path);
  res.sendFile(indexPath);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server is running on port ${PORT}`);
  console.log(`📁 Serving static files from: ${buildPath}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Backend URL: ${process.env.VITE_PUBLIC_BACKEND_URL || 'Not set'}`);
}); 