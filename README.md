# Judge Finder

A comprehensive web application for attorneys to research and analyze federal judges using CourtListener data and AI-powered insights.

## Features

- **Judge Search**: Search for judges by name with real-time results
- **Judge Profiles**: Detailed profiles with AI-analyzed ruling tendencies
- **CourtListener Integration**: Real-time data from CourtListener API
- **Supabase Database**: Secure data storage and user management
- **Responsive Design**: Mobile-optimized interface

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: Supabase (PostgreSQL)
- **Styling**: TailwindCSS
- **AI**: OpenAI GPT-4 for judge analysis
- **APIs**: CourtListener REST API

## Environment Variables

The following environment variables are required for production deployment:

### Required Variables
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `COURTLISTENER_TOKEN` - Your CourtListener API token
- `OPENAI_API_KEY` - Your OpenAI API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET` - Your Stripe webhook secret
- `SENDGRID_API_KEY` - Your SendGrid API key
- `FRONTEND_URL` - Your production domain URL

### Optional Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (default: production)
- `FROM_EMAIL` - Email sender address
- `GITHUB_TOKEN` - GitHub API token (for backups)
- `GITHUB_REPO_OWNER` - GitHub repository owner
- `GITHUB_REPO_NAME` - GitHub repository name

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables in your deployment platform
4. Start development server: `npm run dev`
5. Build for production: `npm run build`

## API Endpoints

### Judge Search & Profiles
- `GET /api/judges/search-courtlistener?q=name` - Search judges with advanced filters
- `GET /api/judges/judge/:id` - Get detailed judge profile with positions, opinions, education
- `GET /api/judges/judge/slug/:slug` - Get judge by slug
- `GET /api/judges/courts` - Get list of courts
- `GET /api/judges/search-by-court/:courtId` - Search judges by specific court
- `POST /api/judges/clear-cache` - Clear API cache (development)

### Judge Analysis
- `GET /api/judge-profile/:id` - Get judge profile with AI analysis
- `GET /api/judge-profile/:id/basic` - Get basic judge information

### Authentication & User Management
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/create-checkout` - Create Stripe checkout session

### Webhooks & Payments
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `GET /api/subscriptions/:userId` - Get user subscriptions

## Production Deployment

The application is configured for deployment on Netlify with serverless functions for the API layer.

## License

MIT License
