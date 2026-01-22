# Northstar

**Passive SEO & Lead Magnet Engine**

Northstar enables founders and small teams to automate user acquisition by generating thousands of programmatic SEO articles and smart, contextual lead magnets.

## Features

- **Product Understanding Engine**: Crawls your site and extracts positioning, keywords, and ICP
- **PSEO Article Generator**: Creates long-form SEO articles targeting high-intent queries
- **Smart Lead Magnets**: Contextual lead capture units embedded in articles
- **Autonomous Operation**: Runs entirely on autopilot post-setup
- **Beautiful UX**: Grid-based design system with minimal friction

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **AI**: OpenAI API (GPT-4 for content generation)
- **Auth**: NextAuth.js (email/password + Google OAuth)

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

3. Set up database:
```bash
cd backend
npx prisma migrate dev
```

4. Run development servers:
```bash
npm run dev
```

## Project Structure

```
northStar/
├── frontend/          # Next.js frontend application
├── backend/           # Express API server
└── README.md
```
