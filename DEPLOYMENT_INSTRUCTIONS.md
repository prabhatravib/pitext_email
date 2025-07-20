# Mail-0/Zero Simple Deployment Instructions

This is a simplified version of Mail-0/Zero that uses JSON files for data storage instead of requiring Cloudflare Workers.

## Architecture

- **Frontend**: Next.js app (React-based email UI)
- **Backend**: Simple Express server with JSON file storage

## Quick Deploy to Render

1. **Fork this repository** to your GitHub account

2. **Deploy on Render**:
   - Go to [Render Dashboard](https://dashboard.render.com)
   - Click "New +" → "Blueprint"
   - Connect your GitHub account and select this repository
   - Render will automatically detect `render.yaml` and create both services:
     - `zero-email-frontend` - The web interface
     - `zero-email-backend-simple` - The API server

3. **Access your email app**:
   - Frontend: `https://zero-email-frontend.onrender.com`
   - Backend API: `https://zero-email-backend-simple.onrender.com`

## Features

This simplified version includes:
- ✅ Email inbox view
- ✅ Read/unread status
- ✅ Star emails
- ✅ Search functionality
- ✅ Compose new emails
- ✅ Folder organization (Inbox, Sent, Drafts, Trash)
- ✅ Sample data for testing

## Limitations

This simplified version does NOT include:
- ❌ Real email provider integration (Gmail, Outlook, etc.)
- ❌ Actual email sending/receiving
- ❌ OAuth authentication
- ❌ AI features
- ❌ Real-time sync
- ❌ Multi-user support

## Testing

After deployment, you can add sample data:

```bash
curl -X POST https://zero-email-backend-simple.onrender.com/api/sample-data
```

This will create some test emails in your inbox.

## Local Development

To run locally:

```bash
# Install dependencies
pnpm install

# Start the backend
cd apps/server
node simple-server.js

# In another terminal, start the frontend
pnpm run dev
```

## Data Storage

All data is stored in JSON files in `apps/server/data/`:
- `threads.json` - Email threads/conversations
- `messages.json` - Individual email messages
- `folders.json` - Email folders
- `users.json` - User information

**Note**: On Render's free tier, data will be lost when the service restarts. For persistent storage, consider upgrading or using a database.

## Upgrading to Full Version

To use the full Mail-0/Zero with real email integration:
1. Deploy the backend to Cloudflare Workers
2. Set up PostgreSQL database
3. Configure OAuth providers
4. Follow the original [Mail-0/Zero documentation](https://github.com/Mail-0/Zero)

## Support

- Original Mail-0/Zero: https://github.com/Mail-0/Zero
- This simplified version: Create an issue in your fork 