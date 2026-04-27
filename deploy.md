# Deployment Guide

## Backend (Render)
1. Backend is deployed at: https://worldtoday.onrender.com
2. Make sure environment variables are set in Render dashboard
3. Check logs if backend is not responding

## Frontend (Vercel)
1. Use Command Prompt (not PowerShell)
2. Run: `cd client && npm install -g vercel && vercel --prod`
3. Follow prompts to deploy

## Local Development
1. Backend: `cd server && npm start` (runs on port 5000)
2. Frontend: `cd client && npm start` (runs on port 3000)

## Environment Files
- `client/.env` - Local development (localhost:5000)
- `client/.env.production` - Production deployment (worldtoday.onrender.com)