# MA-TRAINING-CONSULTING - Vercel Deployment Guide

## Project Structure
This project contains two applications:
- **Frontend**: Main website (React + TypeScript + Vite)
- **Admin Panel**: Administration dashboard (React + TypeScript + Vite)

## Prerequisites
- Node.js 16+ installed
- Git repository initialized
- Vercel account

## Local Development

### Frontend (Main Website)
```bash
cd "c:\Users\ahmed\Desktop\MATC SITE"
npm install
npm run dev
```
Access at: http://localhost:5173

### Admin Panel
```bash
cd "c:\Users\ahmed\Desktop\MATC SITE\admin-panel"
npm install
npm run dev
```
Access at: http://localhost:8536

**Admin Login Credentials:**
- Email: Use VITE_ADMIN_EMAIL environment variable (default: admin@matc.com)
- Password: Use VITE_ADMIN_PASSWORD environment variable (default: admin123)

## Vercel Deployment Steps

### 1. Push to Git Repository
```bash
git init
git add .
git commit -m "chore: prepare for vercel deployment (mock)"
git remote add origin <your-repository-url>
git push -u origin main
```

### 2. Connect Repository to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Configure project settings:
   - **Framework Preset**: Other
   - **Root Directory**: ./
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3. Configure Environment Variables in Vercel
Add these environment variables in Vercel Dashboard → Project Settings → Environment Variables:

```
VITE_ADMIN_EMAIL=admin@matc.com
VITE_ADMIN_PASSWORD=admin123
VITE_APP_NAME=MA-TRAINING-CONSULTING
VITE_APP_VERSION=1.0.0
VITE_DEV_MODE=false
VITE_DEBUG=false
```

### 4. Deploy
- Vercel will automatically deploy when you push to the main branch
- Manual deployment: Click "Deploy" in Vercel dashboard

## Build Validation Commands

### Frontend Build
```bash
cd "c:\Users\ahmed\Desktop\MATC SITE"
npm install
npm run build
```

### Admin Panel Build
```bash
cd "c:\Users\ahmed\Desktop\MATC SITE\admin-panel"
npm install
npm run build
```

## URL Structure After Deployment
- **Main Website**: `https://your-project.vercel.app/`
- **Admin Panel**: `https://your-project.vercel.app/admin/`

## Important Notes

### Current Implementation
- ✅ Uses localStorage for data persistence (mock data)
- ✅ Admin authentication with environment variables
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Vite for fast builds

### Limitations (Mock Version)
- ⚠️ Data is stored in browser localStorage (not persistent across devices)
- ⚠️ No real backend API integration
- ⚠️ Authentication is client-side only
- ⚠️ No database persistence

### Future Enhancements Needed
- [ ] Backend API integration
- [ ] Real database (PostgreSQL/MongoDB)
- [ ] JWT-based authentication
- [ ] File upload functionality
- [ ] Email notifications
- [ ] Payment processing integration

## Troubleshooting

### Build Errors
If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npm run build`

### Environment Variables Not Working
1. Ensure variables are prefixed with `VITE_`
2. Restart development server after adding new variables
3. Check Vercel dashboard environment variables

### Admin Panel Not Accessible
1. Verify the `/admin` route is working
2. Check browser console for errors
3. Ensure environment variables are set correctly

## Support
For deployment issues, check:
- Vercel deployment logs
- Browser developer console
- Network tab for failed requests

---
**Last Updated**: 2025-09-10
**Version**: 1.0.0 (Mock Data MVP)
