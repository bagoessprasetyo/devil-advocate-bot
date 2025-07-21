# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Devil's Advocate AI** - An AI-powered platform that strengthens ideas through intelligent, constructive opposition and critical analysis. This is a Next.js 14 application with TypeScript, Tailwind CSS, and shadcn/ui components.

## Development Commands

```bash
# Start development server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linting
npm run lint
```

## Setup Instructions

### 1. Environment Variables
Copy `.env.example` to `.env.local` and fill in your values:
- Supabase project URL and keys
- OpenAI API key

### 2. Database Setup
Follow the instructions in `SUPABASE_SETUP.md` to:
- Create Supabase project
- Run the database schema SQL
- Configure authentication settings

### 3. First Run
1. `npm install` - Install dependencies
2. Set up Supabase project and environment variables
3. If you get "Database error saving new user", run `RLS_FIX.sql` in Supabase SQL Editor
4. `npm run dev` - Start development server
5. Visit `http://localhost:3000` and create an account

## Tech Stack & Architecture

### Core Framework
- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** with CSS variables for theming
- **shadcn/ui** components with Lucide React icons

### Key Dependencies
- `clsx` and `tailwind-merge` (via `cn()` utility in `lib/utils.ts`)
- `class-variance-authority` for component variants
- `tailwindcss-animate` for animations

### Project Structure
```
app/                    # Next.js App Router pages
├── fonts/             # Local fonts (Geist Sans & Mono)
├── globals.css        # Global CSS with CSS variables
├── layout.tsx         # Root layout with font configuration
└── page.tsx           # Home page (default Next.js template)

components.json        # shadcn/ui configuration
lib/
└── utils.ts          # Utility functions (cn() for class merging)
```

## Development Context

### Current State
✅ **MVP Implementation Complete** - The core Devil's Advocate AI features are fully implemented:

- ✅ Authentication system with Supabase
- ✅ AI chat interface with streaming responses
- ✅ Multiple challenge modes (Challenge, Debate, Analysis)
- ✅ Conversation persistence and management
- ✅ Credit system for free tier users
- ✅ Responsive UI with shadcn/ui components

### Implemented Features
- **AI-powered chat**: Full streaming chat interface using Vercel AI SDK + OpenAI
- **Authentication**: Complete auth flow with login/signup pages
- **Challenge modes**: Three distinct AI personas for different types of criticism
- **Conversation management**: Persistent chat history with Supabase
- **User management**: Profile system with credit tracking

### Tech Stack (Implemented)
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (auth, database, real-time)
- **AI**: OpenAI API via Vercel AI SDK with streaming
- **Database**: PostgreSQL with RLS policies

## Styling & Components

### CSS Variables
Uses HSL-based CSS variables defined in `app/globals.css` for theming:
- `--background`, `--foreground`
- `--primary`, `--secondary`, `--accent`
- `--muted`, `--destructive`
- `--border`, `--input`, `--ring`

### Component Conventions
- Use `cn()` utility from `lib/utils.ts` for conditional classes
- Follow shadcn/ui patterns with `cva()` for component variants
- Alias configuration: `@/components`, `@/lib`, `@/hooks`

### Font System
- **Primary**: Geist Sans (variable font, 100-900 weight)
- **Mono**: Geist Mono (variable font, 100-900 weight)
- CSS variables: `--font-geist-sans`, `--font-geist-mono`

## File Locations

Key configuration files:
- `components.json` - shadcn/ui settings (New York style, RSC enabled)
- `tailwind.config.ts` - Tailwind configuration with theme extensions
- `next.config.mjs` - Next.js configuration
- `tsconfig.json` - TypeScript configuration

The app follows Next.js App Router conventions with TypeScript and uses the "new-york" shadcn/ui style.