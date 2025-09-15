# MATC MongoDB Integration Setup Guide

## 🚀 Overview

This guide explains how to set up and run the complete MATC system with MongoDB Atlas integration, connecting the Admin Panel with the main website.

## 📋 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Main Website  │    │   Admin Panel   │    │  Backend API    │
│   (Port 5173)   │◄──►│   (Port 8536)   │◄──►│   (Port 3001)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                                ┌─────────────────┐
                                                │  MongoDB Atlas  │
                                                │     Database    │
                                                └─────────────────┘
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
# Install all dependencies (main, admin, backend)
npm run setup
```

### 2. Backend Configuration

Create the environment file for the backend:

```bash
# Navigate to backend folder
cd backend

# Copy environment template
copy .env.example .env
```

The `.env` file should contain:
```env
MONGODB_URI=mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc
PORT=3001
NODE_ENV=development
```

### 3. Start the Complete System

```bash
# Start all services (Main Website + Admin Panel + Backend API)
npm run dev:all
```

This will start:
- **Main Website**: http://localhost:5173
- **Admin Panel**: http://localhost:8536  
- **Backend API**: http://localhost:3001

## 🔧 Individual Services

You can also run services individually:

```bash
# Main website only
npm run dev:main

# Admin panel only  
npm run dev:admin

# Backend API only
npm run dev:backend
```

## 📊 Database Schema

### Program Model
```javascript
{
  title: String,           // Program title
  description: String,     // Program description  
  category: String,        // Technologies, Data Science, Marketing, Design, Business
  level: String,          // Débutant, Intermédiaire, Avancé
  price: Number,          // Price in DTN
  duration: String,       // e.g., "12 semaines"
  maxParticipants: Number, // Maximum participants
  sessionsPerYear: Number, // Sessions per year
  modules: [              // Program modules
    { title: String }
  ],
  sessions: [             // Available sessions
    { 
      title: String, 
      date: String 
    }
  ],
  isActive: Boolean,      // Active/inactive status
  createdAt: Date,        // Creation timestamp
  updatedAt: Date         // Last update timestamp
}
```

## 🔌 API Endpoints

### Programs API (`/api/programs`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/programs` | Get all active programs |
| GET | `/api/programs/:id` | Get single program by ID |
| POST | `/api/programs` | Create new program |
| PUT | `/api/programs/:id` | Update existing program |
| DELETE | `/api/programs/:id` | Soft delete program |
| GET | `/api/programs/categories/list` | Get available categories |

### Query Parameters for GET `/api/programs`
- `category`: Filter by category
- `level`: Filter by level  
- `search`: Text search in title/description

### Example API Usage

```javascript
// Fetch all programs
const response = await fetch('http://localhost:3001/api/programs');
const data = await response.json();

// Create new program
const newProgram = {
  title: "React Advanced",
  description: "Master React with advanced concepts",
  category: "Technologies",
  level: "Avancé",
  price: 2400,
  duration: "12 semaines",
  maxParticipants: 25,
  sessionsPerYear: 3,
  modules: [
    { title: "React Hooks" },
    { title: "State Management" }
  ],
  sessions: [
    { title: "Session 1", date: "Jan 2025 - Apr 2025" }
  ]
};

const response = await fetch('http://localhost:3001/api/programs', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newProgram)
});
```

## 🎯 Usage Workflow

### Admin Panel Workflow
1. Open Admin Panel at http://localhost:8536
2. Navigate to "Programmes" section
3. Click "Nouveau Programme" to create programs
4. Fill in all required fields:
   - Title, Description, Category, Level
   - Price, Duration, Max Participants
   - Modules and Sessions
5. Save to MongoDB Atlas

### Main Website Integration  
1. Programs are automatically fetched from MongoDB
2. Real-time updates when admin creates/modifies programs
3. Filtering and search work with live database data
4. Fallback to static data if API is unavailable

## 🔍 Testing the Integration

### 1. Test Backend API
```bash
# Health check
curl http://localhost:3001/api/health

# Get all programs
curl http://localhost:3001/api/programs
```

### 2. Test Admin Panel
1. Go to http://localhost:8536/programs
2. Create a test program
3. Verify it appears in the programs list

### 3. Test Main Website
1. Go to http://localhost:5173
2. Navigate to "Nos Programmes" section  
3. Verify programs from database are displayed
4. Test filtering and search functionality

## 🚨 Troubleshooting

### Common Issues

**Backend won't start:**
- Check if MongoDB URI is correct in `.env`
- Ensure port 3001 is not in use
- Run `npm install` in backend folder

**Admin Panel can't connect to API:**
- Verify backend is running on port 3001
- Check browser console for CORS errors
- Ensure API_BASE_URL is correct in ProgramManager.tsx

**Main website shows no programs:**
- Check if backend API is accessible
- Verify programs exist in MongoDB
- Check browser console for API errors

### Debug Commands

```bash
# Check backend logs
cd backend && npm run dev

# Test API directly
curl -X GET http://localhost:3001/api/programs

# Check database connection
# Look for "✅ MongoDB Atlas connecté avec succès" in backend logs
```

## 📈 Features Implemented

✅ **Backend API**
- Express.js server with MongoDB Atlas
- Full CRUD operations for programs
- Input validation with Joi
- Error handling and logging
- CORS configuration for frontend access

✅ **Admin Panel Integration**
- Complete program management interface
- Create, edit, delete programs
- Dynamic form with modules/sessions
- Real-time API communication
- Loading states and error handling

✅ **Main Website Integration**  
- Dynamic program loading from API
- Fallback to static data if API unavailable
- Filtering and search with live data
- Seamless user experience

✅ **Database Schema**
- Optimized MongoDB schema
- Indexing for performance
- Data validation at database level
- Soft delete functionality

## 🔄 Development Workflow

1. **Make changes in Admin Panel** → Data saved to MongoDB
2. **Main Website automatically reflects changes** → Real-time sync
3. **All data centralized** → Single source of truth
4. **Scalable architecture** → Easy to extend

## 🎉 Success Criteria

The integration is successful when:
- [ ] Backend API responds at http://localhost:3001/api/health
- [ ] Admin Panel can create/edit programs
- [ ] Main website displays programs from database
- [ ] Filtering/search works with live data
- [ ] No hardcoded mock data remains in frontend

---

**🎯 Your MATC Admin Panel is now fully connected to MongoDB Atlas!**
