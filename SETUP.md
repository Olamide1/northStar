# Northstar Setup Guide

## Prerequisites

- Node.js 18+ and npm/yarn
- MongoDB (local or cloud like MongoDB Atlas)
- OpenAI API key

## Installation

1. **Install dependencies:**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

2. **Environment variables are already created!** Just update the values:

Backend (`backend/.env`):
```env
MONGODB_URI=mongodb://localhost:27017/northstar
OPENAI_API_KEY=your_openai_api_key_here
JWT_SECRET=change_this_to_a_random_secret_in_production
```

Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Start MongoDB:**
```bash
# If using local MongoDB
mongod

# Or use MongoDB Atlas (cloud) - update MONGODB_URI in .env
```

4. **Run development servers:**

From root directory:
```bash
npm run dev
```

Or separately:
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Why MongoDB?

- ✅ No migrations needed - schemas are flexible
- ✅ Easier setup - just start MongoDB
- ✅ Better for rapid development
- ✅ Native JSON support
- ✅ Scales well for this use case

## Project Structure

```
northStar/
├── backend/              # Express API server
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── models/      # Mongoose models
│   │   ├── services/    # Business logic (OpenAI, crawler)
│   │   └── middleware/  # Auth middleware
├── frontend/             # Next.js frontend
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   └── lib/             # Utilities and API client
└── README.md
```

## Key Features

### Phase 1 MVP (Current)

✅ Landing page with URL input (no auth required)
✅ Product understanding engine (crawl + analyze)
✅ Generate 10 SEO articles per project
✅ Generate lead magnets
✅ Authentication (email/password)
✅ Dashboard with articles, lead magnets, and leads
✅ Article editor with markdown preview
✅ Lead magnet embed code generation
✅ Export leads to CSV

## API Endpoints

### Public
- `POST /api/projects` - Create project (no auth required for MVP)
- `POST /api/lead-magnets/:embedCode/capture` - Capture lead
- `GET /api/lead-magnets/:embedCode/data` - Get lead magnet data

### Authenticated
- `POST /api/auth/register` - Register
- `POST /api/auth/login` - Login
- `GET /api/projects` - Get user's projects
- `POST /api/articles/generate` - Generate articles
- `GET /api/articles` - List articles
- `GET /api/lead-magnets` - List lead magnets
- `GET /api/analytics/dashboard` - Dashboard stats
- `GET /api/analytics/leads/export` - Export leads CSV

## Troubleshooting

**MongoDB connection issues:**
- Ensure MongoDB is running (`mongod` or MongoDB Atlas)
- Check MONGODB_URI format: `mongodb://localhost:27017/northstar`
- For MongoDB Atlas, use: `mongodb+srv://user:password@cluster.mongodb.net/northstar`

**OpenAI API errors:**
- Verify OPENAI_API_KEY is set correctly
- Check API quota/limits
- Ensure you have GPT-4 access

**CORS issues:**
- Ensure FRONTEND_URL matches your frontend URL
- Check backend CORS configuration

## Production Deployment

1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Use MongoDB Atlas (managed MongoDB)
4. Configure environment variables in hosting platform
5. Build frontend: `cd frontend && npm run build`
6. Build backend: `cd backend && npm run build`
