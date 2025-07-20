import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8787;

// Enable CORS
app.use(cors({
  origin: process.env.VITE_PUBLIC_APP_URL || 'http://localhost:3000',
  credentials: true
}));

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// API routes placeholder
app.get('/api/*', (req, res) => {
  res.json({ 
    error: 'Backend API not fully implemented for Render deployment',
    message: 'This application is designed for Cloudflare Workers deployment'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
}); 