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

// Handle Sentry monitoring requests to prevent 404 errors
app.post('/monitoring', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Monitoring endpoint' });
});

// API proxy for development (if backend is not available)
app.get('/api/trpc/*', (req, res) => {
  console.log('TRPC request intercepted:', req.path);
  res.status(503).json({ 
    error: 'Backend not available',
    message: 'Please ensure the backend service is running'
  });
});

// Try multiple possible build paths for different deployment environments
const possibleBuildPaths = [
  path.join(__dirname, 'build/client'),
  path.join(__dirname, '../build/client'),
  path.join(__dirname, '../../build/client'),
  '/opt/render/project/src/apps/mail/build/client',
  path.join(process.cwd(), 'apps/mail/build/client'),
  path.join(process.cwd(), 'build/client'),
  '/app/apps/mail/build/client', // Docker container path
  '/app/build/client' // Alternative Docker path
];

let buildPath = null;
let indexPath = null;
let fallbackPath = path.join(__dirname, 'fallback-index.html');

// Find the correct build path
console.log('🔍 Starting build path detection...');
console.log('🔍 Current directory:', __dirname);
console.log('🔍 Working directory:', process.cwd());
console.log('🔍 Environment:', process.env.NODE_ENV);

// List all files in current directory for debugging
try {
  const currentDirFiles = fs.readdirSync(__dirname);
  console.log('📁 Files in current directory:', currentDirFiles.slice(0, 20));
} catch (e) {
  console.log('❌ Could not read current directory:', e.message);
}

// List all files in working directory for debugging
try {
  const workingDirFiles = fs.readdirSync(process.cwd());
  console.log('📁 Files in working directory:', workingDirFiles.slice(0, 20));
} catch (e) {
  console.log('❌ Could not read working directory:', e.message);
}

for (const testPath of possibleBuildPaths) {
  console.log(`🔍 Testing build path: ${testPath}`);
  if (fs.existsSync(testPath)) {
    buildPath = testPath;
    indexPath = path.join(buildPath, 'index.html');
    console.log(`✅ Found build directory: ${buildPath}`);
    console.log(`✅ Index file exists: ${fs.existsSync(indexPath)}`);
    
    // List contents of build directory
    try {
      const buildFiles = fs.readdirSync(buildPath);
      console.log(`📁 Build directory contents:`, buildFiles.slice(0, 10));
    } catch (e) {
      console.log(`❌ Could not read build directory:`, e.message);
    }
    break;
  } else {
    console.log(`❌ Path not found: ${testPath}`);
  }
}

// If no build directory found, serve fallback
if (!buildPath) {
  console.error('❌ CRITICAL ERROR: No build directory found');
  console.error('Expected paths:', possibleBuildPaths);
  console.error('Current directory:', __dirname);
  console.error('Working directory:', process.cwd());
  
  // Serve fallback for all routes
  app.get('*', (req, res) => {
    console.log('📝 Serving fallback page for route:', req.path);
    
    if (fs.existsSync(fallbackPath)) {
      res.sendFile(fallbackPath);
    } else {
      res.setHeader('Content-Type', 'text/html');
      res.status(500).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>PiText Email - BUILD FAILED</title>
          <style>
            body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
            .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; }
            h1 { color: #d32f2f; }
            p { color: #666; }
            .error { margin-top: 2rem; padding: 1rem; background: #ffe6e6; border-radius: 4px; font-family: monospace; font-size: 0.9rem; color: #d32f2f; text-align: left; }
            .details { margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px; font-family: monospace; font-size: 0.8rem; text-align: left; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>❌ BUILD FAILED</h1>
            <p>The application failed to build properly. No build files were found.</p>
            <div class="error">
              <strong>Error:</strong> Build directory not found<br>
              <strong>Server:</strong> Running on port ${PORT}<br>
              <strong>Current Directory:</strong> ${__dirname}<br>
              <strong>Working Directory:</strong> ${process.cwd()}
            </div>
            <div class="details">
              <strong>Expected build paths:</strong><br>
              ${possibleBuildPaths.map(p => `• ${p}`).join('<br>')}
            </div>
            <div class="details">
              <strong>Environment:</strong><br>
              • NODE_ENV: ${process.env.NODE_ENV}<br>
              • PORT: ${process.env.PORT}<br>
              • Backend URL: ${process.env.VITE_PUBLIC_BACKEND_URL || 'Not configured'}
            </div>
          </div>
        </body>
        </html>
      `);
    }
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
      console.error('❌ index.html not found, serving fallback');
      if (fs.existsSync(fallbackPath)) {
        return res.sendFile(fallbackPath);
      } else {
        res.setHeader('Content-Type', 'text/html');
        return res.status(404).send(`
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>PiText Email - MISSING INDEX.HTML</title>
            <style>
              body { font-family: system-ui; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f5f5f5; }
              .container { text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); max-width: 800px; }
              h1 { color: #d32f2f; }
              p { color: #666; }
              .error { margin-top: 2rem; padding: 1rem; background: #ffe6e6; border-radius: 4px; font-family: monospace; font-size: 0.9rem; color: #d32f2f; text-align: left; }
              .details { margin-top: 1rem; padding: 1rem; background: #f0f0f0; border-radius: 4px; font-family: monospace; font-size: 0.8rem; text-align: left; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ MISSING INDEX.HTML</h1>
              <p>The build directory exists but index.html is missing.</p>
              <div class="error">
                <strong>Error:</strong> index.html not found at ${indexPath}<br>
                <strong>Build Path:</strong> ${buildPath}<br>
                <strong>Server:</strong> Running on port ${PORT}
              </div>
              <div class="details">
                <strong>Available files in build directory:</strong><br>
                ${fs.existsSync(buildPath) ? fs.readdirSync(buildPath).map(f => `• ${f}`).join('<br>') : 'No files found'}
              </div>
            </div>
          </body>
          </html>
        `);
      }
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
  console.log(`📁 Serving static files from: ${buildPath || 'NO BUILD DIRECTORY FOUND'}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Backend URL: ${process.env.VITE_PUBLIC_BACKEND_URL || 'Not set'}`);
}); 