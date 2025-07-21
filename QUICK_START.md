# Quick Start Guide - PiText Email

This is the quickest way to get PiText Email running with Gmail integration.

## 🚀 Deploy to Cloudflare Workers

1. **Fork this repo** to your GitHub account

2. **Set up Cloudflare Workers**:
   - Go to https://dash.cloudflare.com
   - Create a new Workers project
   - Configure your environment variables
   - Deploy using `pnpm run deploy:backend`

3. **Deploy Frontend**:
   - Use Vercel, Netlify, or any static hosting
   - Build with `pnpm run build:frontend`
   - Deploy the `apps/mail/build/client` directory

## 💻 Run Locally

```bash
# Clone your fork
git clone https://github.com/YOUR-USERNAME/pitext_email.git
cd pitext_email

# Install dependencies
pnpm install

# Terminal 1: Start the backend (Cloudflare Workers)
pnpm start:backend

# Terminal 2: Start the frontend
pnpm dev
```

Visit http://localhost:3000 to see your email app!

## 📧 What Can It Do?

- ✅ Connect to Gmail via OAuth
- ✅ View emails in a beautiful interface
- ✅ Mark emails as read/unread
- ✅ Star important emails
- ✅ Search through emails
- ✅ Compose new emails
- ✅ AI-powered email composition
- ✅ Organize with labels and folders

## ⚠️ Requirements

This version requires:
- Gmail account for email access
- Cloudflare Workers for backend hosting
- Proper OAuth configuration

## 🔧 Next Steps

Want to customize further?
- Check the [deployment instructions](DEPLOYMENT_INSTRUCTIONS.md)
- Configure additional email providers
- Add custom AI features

## 🆘 Need Help?

- Create an issue in your fork
- Check the [deployment instructions](DEPLOYMENT_INSTRUCTIONS.md)
- Visit the original PiText Email repo 