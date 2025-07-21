<p align="center">
  <picture>
    <source srcset="apps/mail/public/white-icon.svg" media="(prefers-color-scheme: dark)">
    <img src="apps/mail/public/black-icon.svg" alt="Zero Logo" width="64" style="background-color: #000; padding: 10px;"/>
  </picture>
</p>

# PiText Email - Gmail-Only Email Client

A modern, AI-powered email client focused exclusively on Gmail integration.There is no back end at all by design. So this is a fork of the zero email repo. here the source of this email repo is only supposed to be Gmail.

## Features

- **Gmail Integration**: Connect your Gmail account via OAuth
- **AI-Powered**: Intelligent email composition and management
- **Modern UI**: Clean, responsive interface
- **Real-time Sync**: Live email synchronization with Gmail

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm
- Google OAuth credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/pitext_email.git
   cd pitext_email
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   - Copy `env/mail.env.example` to `env/mail.env`
   - Fill in your Google OAuth credentials:
     ```
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     NEXTAUTH_SECRET=your_nextauth_secret
     NEXTAUTH_URL=https://your-service.onrender.com
     ```

4. **Google OAuth Setup**
   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Gmail API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Add redirect URIs for your deployment

5. **Run the application**
   ```bash
   pnpm dev
   ```

## Development

### Project Structure

```
pitext_email/
├── apps/
│   ├── mail/          # Frontend email client
│   └── server/        # Backend API server
├── packages/          # Shared packages
└── env/              # Environment configuration
```

### Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build for production
- `pnpm lint` - Run linting
- `pnpm test` - Run tests

## Deployment

### Render.com

1. Connect your GitHub repository
2. Set environment variables from `env/mail.env.example`
3. Deploy automatically on push

### Environment Variables

Required environment variables:

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-service.onrender.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details.
