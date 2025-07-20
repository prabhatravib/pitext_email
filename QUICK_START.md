# Quick Start Guide - Mail-0/Zero Simple Version

This is the quickest way to get Mail-0/Zero running with a simple JSON-based backend.

## 🚀 Deploy to Render in 2 Minutes

1. **Fork this repo** to your GitHub account

2. **Deploy on Render**:
   - Go to https://dashboard.render.com
   - Click "New +" → "Blueprint"
   - Connect your GitHub and select your fork
   - Click "Apply" - Render will create both services automatically

3. **Done!** Your email app will be live at:
   - `https://zero-email-frontend.onrender.com`

## 💻 Run Locally

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/pitext_email.git
cd pitext_email

# Install dependencies
pnpm install

# Terminal 1: Start the backend
pnpm start:simple

# Terminal 2: Start the frontend
pnpm dev

# Terminal 3: Add sample data (optional)
pnpm setup:simple
```

Visit http://localhost:3000 to see your email app!

## 📧 What Can It Do?

- ✅ View emails in a beautiful interface
- ✅ Mark emails as read/unread
- ✅ Star important emails
- ✅ Search through emails
- ✅ Compose new emails (stored locally)
- ✅ Organize with folders

## ⚠️ Limitations

This is a demo version that:
- Stores data in JSON files (resets on free Render tier)
- Doesn't connect to real email providers
- Doesn't send actual emails
- Single user only

## 🔧 Next Steps

Want the full Mail-0/Zero experience?
- Check out the original: https://github.com/Mail-0/Zero
- Deploy to Cloudflare Workers for full features
- Add real email provider integration

## 🆘 Need Help?

- Create an issue in your fork
- Check the [deployment instructions](DEPLOYMENT_INSTRUCTIONS.md)
- Visit the original Mail-0/Zero repo 