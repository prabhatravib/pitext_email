import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

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

console.log('🔍 Build path:', buildPath);
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Build directory exists:', fs.existsSync(buildPath));

// Check if build directory exists
if (!fs.existsSync(buildPath)) {
  console.warn('⚠️ Build directory not found:', buildPath);
  console.warn('Creating temporary placeholder...');
  
  // Create a temporary HTML response for deployment
  app.get('*', (req, res) => {
    console.log('📝 Serving placeholder for route:', req.path);
    res.setHeader('Content-Type', 'text/html');
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>PiText Email - Deployment In Progress</title>
        <style>
          body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
          .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #333; }
          p { color: #666; }
          .status { margin-top: 2rem; padding: 1rem; background: #f0f0f0; border-radius: 4px; font-family: monospace; font-size: 0.9rem; }
          .refresh-btn { margin-top: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 PiText Email</h1>
          <p>Deployment in progress. The build is being compiled.</p>
          <p>Please refresh this page in a few moments.</p>
          <button class="refresh-btn" onclick="location.reload()">Refresh Page</button>
          <div class="status">
            Status: Build directory pending<br>
            Server: Running on port ${PORT}<br>
            Backend: ${process.env.VITE_PUBLIC_BACKEND_URL || 'Not configured'}
          </div>
        </div>
      </body>
      </html>
    `);
  });
} else {
  console.log('✅ Build directory found, serving static files');
  console.log('📁 Files in build directory:', fs.readdirSync(buildPath));
  
  // Serve static files with explicit options
  app.use(express.static(buildPath, {
    index: false, // Don't serve index.html automatically
    dotfiles: 'ignore',
    etag: true,
    lastModified: true
  }));
  
  // Check if index.html exists
  const indexPath = path.join(buildPath, 'index.html');
  console.log('🔍 Index path:', indexPath);
  console.log('🔍 Index file exists:', fs.existsSync(indexPath));
  
  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    console.error('Available files in build/client:', fs.readdirSync(buildPath));
  }
  
  // Handle all routes by serving the index.html file (for SPA routing)
  app.get('*', (req, res) => {
    console.log('📄 Serving index.html for route:', req.path);
    
    // Check if the file exists before sending
    if (!fs.existsSync(indexPath)) {
      console.error('❌ index.html not found, sending 404');
      res.setHeader('Content-Type', 'text/html');
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PiText Email - Build Error</title>
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #333; }
            p { color: #666; }
            .error { margin-top: 2rem; padding: 1rem; background: #ffe6e6; border-radius: 4px; font-family: monospace; font-size: 0.9rem; color: #d32f2f; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ PiText Email</h1>
            <p>Build files are missing. The application failed to build properly.</p>
            <div class="error">
              Error: index.html not found in build directory<br>
              Server: Running on port ${PORT}<br>
              Build Path: ${buildPath}
            </div>
          </div>
        </body>
        </html>
      `);
    }
    
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error('❌ Error sending index.html:', err);
        res.status(500).send('Internal server error');
      }
    });
  });
}

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