# Devil's Advocate AI - Technical Stack Documentation

## Stack Overview

A modern, full-stack TypeScript application built for scalable AI-powered conversations with comprehensive caching, rate limiting, and real-time capabilities.

## Core Technologies

### Frontend Framework
**Next.js 14+ (App Router)**
- **Version:** Latest stable
- **Features:** Server Components, Server Actions, API Routes
- **Benefits:** SSR for SEO, optimized performance, integrated backend
- **Configuration:** TypeScript, ESLint, Tailwind CSS

### UI Framework
**Shadcn/ui + Tailwind CSS**
- **Components:** Pre-built chat interfaces, forms, modals
- **Theming:** CSS variables for consistent design system
- **Icons:** Lucide React for consistent iconography
- **Styling:** Utility-first CSS with custom component variants

### Backend Infrastructure
**Supabase (Backend-as-a-Service)**
- **Database:** PostgreSQL with real-time subscriptions
- **Authentication:** Built-in auth with social providers
- **Storage:** File uploads for documents and media
- **Edge Functions:** Serverless functions for complex operations
- **Real-time:** WebSocket connections for live features

### AI Integration
**Vercel AI SDK + OpenAI**
- **Primary API:** OpenAI GPT-4 Turbo
- **SDK Benefits:** Streaming responses, React hooks, type safety
- **Features:** Chat completions, function calling, embeddings
- **Streaming:** Real-time response generation for better UX

### Type Safety & Validation
**TypeScript + Zod**
- **TypeScript:** Strict mode enabled, end-to-end type safety
- **Zod:** Runtime validation for API requests/responses
- **Integration:** Form validation, AI response parsing, database schemas

### State Management
**TanStack Query (React Query)**
- **Purpose:** Server state management, caching, synchronization
- **Features:** Background updates, optimistic updates, error handling
- **AI Integration:** Streaming query support, conversation persistence

### Caching & Rate Limiting
**Upstash Redis**
- **Rate Limiting:** User-based API request throttling
- **Caching:** AI response caching, conversation snippets
- **Session Storage:** Temporary data, user preferences
- **Integration:** Edge-compatible, serverless-friendly

## Detailed Architecture

### Database Schema (Supabase)

```sql
-- Enable RLS (Row Level Security)
-- Enable real-time for conversations and messages

-- Users table (managed by Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_tier TEXT DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('challenge', 'debate', 'analysis', 'document')),
  system_prompt TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  tokens_used INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  analysis_status TEXT DEFAULT 'pending',
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### API Architecture

```typescript
// Core API structure
app/api/
├── auth/                 // Authentication helpers
├── ai/
│   ├── chat/            // Main chat endpoint
│   ├── challenge/       // Challenge mode
│   ├── debate/          // Debate mode
│   └── analyze/         // Document analysis
├── conversations/       // CRUD operations
├── documents/          // File upload/management
└── webhooks/           // Stripe, auth webhooks
```

### Key Dependencies

```json
{
  "dependencies": {
    // Core Framework
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    
    // UI & Styling
    "@shadcn/ui": "latest",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.300.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    
    // Backend & Database
    "@supabase/supabase-js": "^2.38.0",
    "@supabase/ssr": "^0.1.0",
    
    // AI Integration
    "ai": "^2.2.0",
    "openai": "^4.20.0",
    "@ai-sdk/openai": "^0.0.9",
    
    // State Management
    "@tanstack/react-query": "^5.0.0",
    "@tanstack/query-devtools": "^5.0.0",
    
    // Validation & Forms
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    
    // Caching & Rate Limiting
    "@upstash/redis": "^1.25.0",
    "@upstash/ratelimit": "^0.4.0",
    
    // Utilities
    "date-fns": "^2.30.0",
    "uuid": "^9.0.0",
    "pdf-parse": "^1.1.1"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/uuid": "^9.0.0",
    "eslint": "^8.54.0",
    "eslint-config-next": "^14.0.0",
    "prettier": "^3.1.0"
  }
}
```

## Configuration Files

### Environment Variables
```bash
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_key

# Upstash Redis
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token

# Stripe (optional)
STRIPE_SECRET_KEY=your_stripe_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
```

### TailwindCSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        // ... shadcn color system
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## Development Workflow

### Project Structure
```
devil-advocate-ai/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Auth route group
│   ├── (dashboard)/       # Protected routes
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Shadcn components
│   ├── chat/             # Chat-specific components
│   └── forms/            # Form components
├── lib/                  # Utility functions
│   ├── supabase/         # Database client
│   ├── ai/               # AI utilities
│   ├── redis/            # Cache utilities
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript definitions
├── schemas/              # Zod validation schemas
└── public/               # Static assets
```

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Database migrations
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts

# Build for production
npm run build

# Type checking
npm run type-check

# Linting
npm run lint
```

## Deployment Strategy

### Hosting Platform
**Vercel** (Recommended)
- Optimized for Next.js applications
- Edge functions for global performance
- Automatic deployments from Git
- Built-in analytics and monitoring

### Alternative: Self-hosted
- Docker containerization
- AWS/GCP deployment
- Custom monitoring setup

### Environment Setup
```bash
# Production environment variables
NEXT_PUBLIC_SUPABASE_URL=prod_url
SUPABASE_SERVICE_ROLE_KEY=prod_key
OPENAI_API_KEY=prod_key
UPSTASH_REDIS_REST_URL=prod_redis_url
```

## Performance Optimizations

### Caching Strategy
- **Redis:** API responses, user sessions, rate limits
- **Supabase:** Real-time data synchronization
- **Next.js:** Static page generation, image optimization
- **CDN:** Asset delivery via Vercel Edge Network

### Rate Limiting
```typescript
// Rate limiting configuration
const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 requests per minute
  analytics: true,
});
```

### Monitoring & Analytics
- **Vercel Analytics:** Page views, performance metrics
- **Supabase Dashboard:** Database performance
- **OpenAI Usage:** Token consumption tracking
- **Error Tracking:** Built-in Next.js error boundaries

## Security Considerations

### Authentication & Authorization
- Supabase RLS (Row Level Security) policies
- JWT token validation
- Protected API routes
- Secure session management

### Data Protection
- Environment variable encryption
- API key rotation strategy
- User data anonymization options
- GDPR compliance features

### API Security
- Rate limiting per user/IP
- Input validation with Zod
- CORS configuration
- Request sanitization

## Scalability Plan

### Horizontal Scaling
- Vercel Edge Functions for global distribution
- Supabase read replicas for database scaling
- Redis clustering for cache distribution

### Cost Optimization
- Intelligent caching to reduce API calls
- Usage-based billing implementation
- Resource monitoring and alerts
- Automated scaling policies

This technical stack provides a robust foundation for building a production-ready AI application with excellent developer experience, performance, and scalability.