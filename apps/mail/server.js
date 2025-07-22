import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: process.env.VITE_PUBLIC_APP_URL || 'https://pitext-email.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

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

// Better Auth API endpoints
app.get('/api/auth/session', (req, res) => {
  res.json({
    user: null,
    session: null,
    status: 'unauthenticated'
  });
});

app.get('/api/auth/use-session', (req, res) => {
  res.json({
    user: null,
    session: null,
    status: 'unauthenticated'
  });
});

app.post('/api/auth/sign-in', (req, res) => {
  res.json({
    user: null,
    session: null,
    status: 'unauthenticated'
  });
});

app.post('/api/auth/sign-out', (req, res) => {
  res.json({
    success: true,
    message: 'Signed out successfully'
  });
});

app.post('/api/auth/sign-up', (req, res) => {
  res.json({
    user: null,
    session: null,
    status: 'unauthenticated'
  });
});

app.get('/api/auth/providers', (req, res) => {
  res.json({
    providers: []
  });
});

app.get('/api/auth/callback/:provider', (req, res) => {
  res.json({
    user: null,
    session: null,
    status: 'unauthenticated'
  });
});

// Autumn API endpoints (for customer management)
app.get('/api/autumn/customers', (req, res) => {
  res.json({
    customers: [],
    total: 0,
    status: 'success'
  });
});

app.post('/api/autumn/customers', (req, res) => {
  res.json({
    customer: req.body,
    status: 'success'
  });
});

// Handle all other API routes that might be called
app.all('/api/*', (req, res) => {
  console.log(`API route not implemented: ${req.method} ${req.path}`);
  res.json({
    message: 'API endpoint not implemented in this version',
    status: 'not_implemented',
    path: req.path,
    method: req.method
  });
});

// tRPC API endpoints - provide basic responses for common queries
app.all('/api/trpc/*', (req, res) => {
  console.log(`tRPC request: ${req.method} ${req.path}`);
  
  // Handle different tRPC procedures
  const path = req.path.replace('/api/trpc/', '');
  
  switch (path) {
    case 'settings.get':
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
      break;
      
    case 'settings.save':
      res.json({
        result: {
          data: { success: true }
        }
      });
      break;
      
    case 'mail.listThreads':
      res.json({
        result: {
          data: {
            threads: [],
            nextCursor: null
          }
        }
      });
      break;
      
    case 'mail.count':
      res.json({
        result: {
          data: {
            total: 0,
            unread: 0,
            read: 0
          }
        }
      });
      break;
      
    case 'categories.defaults':
      res.json({
        result: {
          data: {
            categories: []
          }
        }
      });
      break;
      
    case 'notes.list':
      res.json({
        result: {
          data: {
            notes: []
          }
        }
      });
      break;
      
    default:
      res.json({
        result: {
          data: null,
          message: 'tRPC procedure not implemented in this version'
        }
      });
  }
});

// Try multiple possible build paths for different deployment environments
const possibleBuildPaths = [
  path.join(__dirname, 'build/client/client'),
  path.join(__dirname, 'build/client'),
  path.join(__dirname, '../build/client/client'),
  path.join(__dirname, '../build/client'),
  path.join(__dirname, '../../build/client/client'),
  path.join(__dirname, '../../build/client'),
  '/opt/render/project/src/apps/mail/build/client/client',
  '/opt/render/project/src/apps/mail/build/client',
  path.join(process.cwd(), 'apps/mail/build/client/client'),
  path.join(process.cwd(), 'apps/mail/build/client'),
  path.join(process.cwd(), 'build/client/client'),
  path.join(process.cwd(), 'build/client'),
  '/app/apps/mail/build/client/client', // Docker container path
  '/app/apps/mail/build/client', // Docker container path
  '/app/build/client/client', // Alternative Docker path
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

  // Serve static files with explicit options - this MUST come before the catch-all route
  app.use(express.static(buildPath, {
    index: false, // Don't serve index.html automatically
    dotfiles: 'ignore',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      // Set proper MIME types for JavaScript files
      if (path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));

  // Serve public directory files (favicon.ico, manifest.json, etc.)
  const publicPath = path.join(__dirname, 'public');
  if (fs.existsSync(publicPath)) {
    app.use(express.static(publicPath, {
      index: false,
      dotfiles: 'ignore',
      etag: true,
      lastModified: true,
      setHeaders: (res, filePath) => {
        // Set proper MIME types
        if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json');
        } else if (filePath.endsWith('.ico')) {
          res.setHeader('Content-Type', 'image/x-icon');
        } else if (filePath.endsWith('.svg')) {
          res.setHeader('Content-Type', 'image/svg+xml');
        } else if (filePath.endsWith('.png')) {
          res.setHeader('Content-Type', 'image/png');
        }
      }
    }));
  }

  // Handle the specific case where the script tag points to /app/entry.client.tsx
  app.get('/app/entry.client.tsx', (req, res) => {
    // Find the actual entry.client.js file in the assets directory
    const assetsDir = path.join(buildPath, 'assets');
    console.log(`🔍 Looking for entry client file in: ${assetsDir}`);
    
    if (fs.existsSync(assetsDir)) {
      const files = fs.readdirSync(assetsDir);
      console.log(`📁 Available files in assets directory:`, files);
      
      // Try to find the entry client file with different patterns
      const entryClientFile = files.find(file => 
        (file.startsWith('entry.client-') || file.startsWith('main-')) && file.endsWith('.js')
      );
      
      if (entryClientFile) {
        console.log(`📄 Serving entry.client.js as /app/entry.client.tsx: ${entryClientFile}`);
        const filePath = path.join(assetsDir, entryClientFile);
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(filePath);
        return;
      }
      
      // If not found, try to find any JavaScript file that might be the entry point
      const jsFiles = files.filter(file => file.endsWith('.js'));
      console.log(`📁 JavaScript files found:`, jsFiles);
      
      if (jsFiles.length > 0) {
        // Use the first JS file as fallback
        const fallbackFile = jsFiles[0];
        console.log(`📄 Serving fallback JS file as /app/entry.client.tsx: ${fallbackFile}`);
        const filePath = path.join(assetsDir, fallbackFile);
        res.setHeader('Content-Type', 'application/javascript');
        res.sendFile(filePath);
        return;
      }
    } else {
      console.log(`❌ Assets directory does not exist: ${assetsDir}`);
      console.log(`📁 Build directory contents:`, fs.existsSync(buildPath) ? fs.readdirSync(buildPath) : 'Build directory does not exist');
    }
    
    // If still not found, return 404
    console.log(`❌ No entry client file found in assets directory`);
    res.status(404).send('Entry client file not found');
  });

  // Handle favicon.ico specifically
  app.get('/favicon.ico', (req, res) => {
    // Try multiple possible favicon locations
    const faviconPaths = [
      path.join(publicPath, 'favicon.ico'),
      path.join(buildPath, 'favicon.ico'),
      path.join(__dirname, 'public', 'favicon.ico'),
      path.join(__dirname, 'favicon.ico')
    ];
    
    for (const faviconPath of faviconPaths) {
      if (fs.existsSync(faviconPath)) {
        console.log(`📄 Serving favicon.ico from: ${faviconPath}`);
        res.setHeader('Content-Type', 'image/x-icon');
        res.sendFile(faviconPath);
        return;
      }
    }
    
    console.log(`❌ favicon.ico not found in any location`);
    res.status(404).send('Favicon not found');
  });

  // Handle manifest.json specifically
  app.get('/manifest.json', (req, res) => {
    // Try multiple possible manifest locations
    const manifestPaths = [
      path.join(publicPath, 'manifest.json'),
      path.join(buildPath, 'manifest.json'),
      path.join(__dirname, 'public', 'manifest.json'),
      path.join(__dirname, 'manifest.json')
    ];
    
    for (const manifestPath of manifestPaths) {
      if (fs.existsSync(manifestPath)) {
        console.log(`📄 Serving manifest.json from: ${manifestPath}`);
        res.setHeader('Content-Type', 'application/json');
        res.sendFile(manifestPath);
        return;
      }
    }
    
    console.log(`❌ manifest.json not found in any location`);
    res.status(404).send('Manifest not found');
  });

  // Handle manifest.webmanifest (alternative manifest format)
  app.get('/manifest.webmanifest', (req, res) => {
    // Try multiple possible manifest locations
    const manifestPaths = [
      path.join(publicPath, 'manifest.json'),
      path.join(publicPath, 'manifest.webmanifest'),
      path.join(buildPath, 'manifest.json'),
      path.join(buildPath, 'manifest.webmanifest'),
      path.join(__dirname, 'public', 'manifest.json'),
      path.join(__dirname, 'public', 'manifest.webmanifest')
    ];
    
    for (const manifestPath of manifestPaths) {
      if (fs.existsSync(manifestPath)) {
        console.log(`📄 Serving manifest.webmanifest from: ${manifestPath}`);
        res.setHeader('Content-Type', 'application/manifest+json');
        res.sendFile(manifestPath);
        return;
      }
    }
    
    console.log(`❌ manifest.webmanifest not found in any location`);
    res.status(404).send('Manifest not found');
  });

  // Handle asset requests that might be missing
  app.get('/assets/*', (req, res) => {
    const assetPath = req.path.replace('/assets/', '');
    const fullPath = path.join(buildPath, 'assets', assetPath);
    
    if (fs.existsSync(fullPath)) {
      console.log(`📄 Serving asset: ${req.path}`);
      res.sendFile(fullPath);
    } else {
      console.log(`❌ Asset not found: ${req.path}`);
      res.status(404).send('Asset not found');
    }
  });

  // Handle favicon.svg
  app.get('/favicon.svg', (req, res) => {
    const faviconPath = path.join(buildPath, 'favicon.svg');
    if (fs.existsSync(faviconPath)) {
      console.log(`📄 Serving favicon.svg`);
      res.sendFile(faviconPath);
    } else {
      console.log(`❌ favicon.svg not found`);
      res.status(404).send('Favicon not found');
    }
  });

  // Check if index.html exists
  console.log('🔍 Index path:', indexPath);
  console.log('🔍 Index file exists:', fs.existsSync(indexPath));

  if (!fs.existsSync(indexPath)) {
    console.error('❌ index.html not found at:', indexPath);
    console.error('Available files in build/client:', fs.readdirSync(buildPath));
  }

  // Handle SPA routes by serving the index.html file - this MUST come AFTER static file serving
  app.get('*', (req, res) => {
    console.log('📄 Serving index.html for route:', req.path);

    // Don't serve HTML for JavaScript, CSS, or other asset files
    if (req.path.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|map)$/)) {
      console.log(`❌ Blocked HTML serving for asset: ${req.path}`);
      return res.status(404).send('Asset not found');
    }

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