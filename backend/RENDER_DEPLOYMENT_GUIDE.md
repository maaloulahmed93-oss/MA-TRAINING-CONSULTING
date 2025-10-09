# 🚀 MATC Backend Deployment Guide for Render

## Overview
This guide covers deploying the MATC Node.js backend API to Render.com, with the frontend and admin panel already deployed on Vercel.

## Pre-Deployment Checklist

### ✅ Completed Configurations
- [x] Server configured to bind to `0.0.0.0` for Render networking
- [x] CORS updated for production Vercel URLs
- [x] Environment variables documented in `.env.example`
- [x] Node.js engines specified in `package.json`
- [x] Production-ready error handling and logging

## Environment Variables for Render

Set these environment variables in your Render dashboard:

### Required Variables
```env
# Database Configuration
MONGODB_URI=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc
DB_NAME=matc_database

# Server Configuration
PORT=3001
NODE_ENV=production

# Security Configuration (Generate new secrets for production)
JWT_SECRET=your_secure_jwt_secret_here
SESSION_SECRET=your_secure_session_secret_here
```

### Optional Variables
```env
# CORS Configuration (for additional origins)
ALLOWED_ORIGINS=https://ma-training-consulting.vercel.app,https://matc-admin.vercel.app

# Rate Limiting Configuration
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=1000

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
```

## Render Deployment Steps

### 1. Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Select the repository containing your backend

### 2. Configure Build Settings
```yaml
# Build Settings
Build Command: npm install
Start Command: npm start
Environment: Node
Node Version: 18.x (or latest LTS)
```

### 3. Advanced Settings
```yaml
# Advanced Settings
Root Directory: backend
Auto-Deploy: Yes (recommended)
Health Check Path: /api/health
```

### 4. Environment Variables
Add all the environment variables listed above in the Render dashboard under "Environment" tab.

### 5. Deploy
Click "Create Web Service" to start the deployment.

## Post-Deployment Verification

### Health Check
Your API should be accessible at: `https://your-app-name.onrender.com/api/health`

Expected response:
```json
{
  "success": true,
  "message": "MATC Backend API is running",
  "timestamp": "2024-XX-XXTXX:XX:XX.XXXZ",
  "environment": "production"
}
```

### API Endpoints
Test key endpoints:
- `GET /api/health` - Health check
- `GET /api/programs` - Programs list
- `GET /api/partners` - Partners list
- `GET /api/testimonials` - Testimonials

## Frontend Integration

### Update Frontend URLs
Once deployed, update your frontend applications to use the new Render URL:

#### Main Site (Vercel)
Update API base URL from `http://localhost:3001` to `https://your-app-name.onrender.com`

#### Admin Panel (Vercel)
Update API base URL from `http://localhost:3001` to `https://your-app-name.onrender.com`

### CORS Verification
The backend is already configured to accept requests from:
- `https://ma-training-consulting.vercel.app`
- `https://matc-admin.vercel.app`

## Monitoring and Maintenance

### Logs
Access logs in Render dashboard under "Logs" tab to monitor:
- MongoDB connection status
- API request patterns
- Error tracking

### Performance
Monitor:
- Response times
- Memory usage
- Database connection health

### Scaling
Render automatically handles:
- Load balancing
- SSL certificates
- Health checks
- Auto-restarts

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
- Verify `MONGODB_URI` is correct
- Check MongoDB Atlas network access settings
- Ensure database user has proper permissions

#### 2. CORS Errors
- Verify frontend URLs in CORS configuration
- Check that requests include proper headers
- Test with browser developer tools

#### 3. Environment Variables
- Double-check all required variables are set
- Ensure no trailing spaces in values
- Verify sensitive values are properly escaped

#### 4. Build Failures
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Review build logs for specific errors

### Debug Commands
```bash
# Local testing
npm install
npm start

# Check environment
node -e "console.log(process.env.NODE_ENV)"

# Test MongoDB connection
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected')).catch(console.error)"
```

## Security Considerations

### Production Secrets
- Generate strong, unique secrets for `JWT_SECRET` and `SESSION_SECRET`
- Never commit `.env` files to version control
- Use Render's environment variable encryption

### Database Security
- Use MongoDB Atlas with IP whitelisting
- Enable database authentication
- Regular backup strategy

### API Security
- Rate limiting is enabled (1000 requests per 15 minutes)
- Helmet.js for security headers
- CORS properly configured for production domains

## Support

### Resources
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Contact
For deployment issues, check:
1. Render service logs
2. MongoDB Atlas monitoring
3. Frontend console errors
4. Network connectivity

---

## Quick Deployment Checklist

- [ ] Repository connected to Render
- [ ] Environment variables configured
- [ ] Build and start commands set
- [ ] Health check endpoint working
- [ ] Frontend URLs updated
- [ ] CORS configuration verified
- [ ] MongoDB connection tested
- [ ] SSL certificate active
- [ ] Monitoring setup complete

**Deployment Status**: Ready for Production 🚀
