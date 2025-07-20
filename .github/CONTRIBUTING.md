# Contributing to PiText Email

Thank you for your interest in contributing to PiText Email! This document provides guidelines for contributing to the project.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Git

### Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/pitext_email.git
   cd pitext_email
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   - Copy `env/mail.env.example` to `env/mail.env`
   - Fill in your Google OAuth credentials
   - Set up Google Cloud Console for OAuth

4. **Start Development**
   ```bash
   pnpm dev
   ```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow the existing code style and formatting
- Write meaningful commit messages
- Add tests for new features

### Pull Request Process

1. Create a feature branch from `main`
2. Make your changes
3. Add tests if applicable
4. Update documentation if needed
5. Submit a pull request

### Testing

- Run tests: `pnpm test`
- Run linting: `pnpm lint`
- Ensure all tests pass before submitting

## Questions?

If you have questions about contributing, please open an issue or reach out to the maintainers.
