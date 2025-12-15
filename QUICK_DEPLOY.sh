#!/bin/bash

# Quick deployment script for backend fixes
echo "🚀 Starting backend deployment..."

# Navigate to project root
cd "$(dirname "$0")"

# Check git status
echo "📋 Checking git status..."
git status

# Stage all backend changes
echo "📦 Staging backend changes..."
git add backend/models/Pack.js
git add backend/middleware/packValidation.js
git add backend/routes/packs.js

# Commit changes
echo "💾 Committing changes..."
git commit -m "fix: Add niveau and resourcesCount to Pack schema, update validation to allow unknown fields"

# Push to GitHub
echo "🔄 Pushing to GitHub..."
git push origin main

echo "✅ Deployment initiated!"
echo "📊 Monitor progress at: https://dashboard.render.com"
echo "⏱️  Deployment typically takes 2-3 minutes"
