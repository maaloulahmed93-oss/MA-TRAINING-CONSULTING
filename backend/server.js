import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// Rate limiting - more permissive for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // increased limit for development
  message: {
    success: false,
    message: 'Trop de requêtes, veuillez réessayer plus tard.'
  }
});
app.use('/api/', limiter);

// CORS configuration - More permissive for development
app.use(cors({
  origin: [
    'http://localhost:5173', // Main site
    'http://localhost:5174', // Main site (alternate port)
    'http://localhost:8536', // Admin panel (original port)
    'http://localhost:8537', // Admin panel (new port)
    'http://localhost:3000', // React dev server default
    'http://localhost:3001', // Backend self
    'http://127.0.0.1:8536', // Admin panel IP
    'http://127.0.0.1:5173', // Main site IP
    'file://', // Local file access
    'https://ma-training-consulting.vercel.app', // Production main site
    'https://matc-admin.vercel.app' // Production admin panel
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Additional CORS headers for problematic requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).json({ success: true, message: 'CORS preflight successful' });
    return;
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files serving for uploads
app.use('/uploads', express.static('uploads'));

// MongoDB connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db?retryWrites=true&w=majority&appName=matc';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Atlas connecté avec succès');
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Routes
import programRoutes from './routes/programs.js';
import packRoutes from './routes/packs.js';
import categoryRoutes from './routes/categories.js';
import attestationRoutes from './routes/attestations.js';
import partnersRoutes from './routes/partners.js';
import enterpriseRoutes from './routes/enterpriseRoutes.js';
import formateurSessionRoutes from './routes/formateurSessions.js';
import commercialDealRoutes from './routes/commercialDeals.js';
import formateurProgrammesRoutes from './routes/formateurProgrammes.js';
import formateurSeancesRoutes from './routes/formateurSeances.js';
import formateurParticipantsRoutes from './routes/formateurParticipants.js';
import formateurEvenementsRoutes from './routes/formateurEvenements.js';
import commercialNewRoutes from './routes/commercialNew.js';
import commercialServicesRoutes from './routes/commercialServices.js';
import registrationRoutes from './routes/registrations.js';
import participantRoutes from './routes/participants.js';
import freelancerOffersRoutes from './routes/freelancerOffers.js';

app.use('/api/programs', programRoutes);
app.use('/api/packs', packRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/attestations', attestationRoutes);
app.use('/api/partners', partnersRoutes);
app.use('/api/enterprise', enterpriseRoutes);
app.use('/api/formateur-sessions', formateurSessionRoutes);
app.use('/api/commercial-deals', commercialDealRoutes);
app.use('/api/formateur-programmes', formateurProgrammesRoutes);
app.use('/api/formateur-seances', formateurSeancesRoutes);
app.use('/api/formateur-participants', formateurParticipantsRoutes);
app.use('/api/formateur-evenements', formateurEvenementsRoutes);
app.use('/api/commercial-new', commercialNewRoutes);
app.use('/api/commercial-services', commercialServicesRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/freelancer-offers', freelancerOffersRoutes);

// Import freelancer projects routes
import freelancerProjectsRoutes from './routes/freelancerProjects.js';
app.use('/api/freelancer-projects', freelancerProjectsRoutes);

// Import freelancer decisions routes
import freelancerDecisionsRoutes from './routes/freelancerDecisions.js';
app.use('/api/freelancer-decisions', freelancerDecisionsRoutes);

// Import freelancer meetings routes
import freelancerMeetingsRoutes from './routes/freelancerMeetings.js';
app.use('/api/freelancer-meetings', freelancerMeetingsRoutes);

// Import freelancer deliverables routes
import freelancerDeliverablesRoutes from './routes/freelancerDeliverables.js';
app.use('/api/freelancer-deliverables', freelancerDeliverablesRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'MATC Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MATC Backend API',
    version: '1.0.0',
    endpoints: {
      programs: '/api/programs',
      categories: '/api/categories',
      packs: '/api/packs',
      attestations: '/api/attestations',
      partners: '/api/partners',
      formateurSessions: '/api/formateur-sessions',
      registrations: '/api/registrations',
      participants: '/api/participants',
      health: '/api/health'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 API disponible sur: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
