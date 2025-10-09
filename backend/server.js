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

// CORS configuration - Production ready with development support
const allowedOrigins = [
  // Production URLs (Vercel deployments)
  'https://ma-training-consulting.vercel.app',
  'https://matc-admin.vercel.app',
  'https://admine-lake.vercel.app', // Admin Panel Vercel URL
  // Development URLs
  'http://localhost:5173', // Main site
  'http://localhost:5174', // Main site (alternate port)
  'http://localhost:8536', // Admin panel (original port)
  'http://localhost:8537', // Admin panel (new port)
  'http://localhost:3000', // React dev server default
  'http://localhost:3001', // Backend self
  'http://127.0.0.1:8536', // Admin panel IP
  'http://127.0.0.1:5173', // Main site IP
  'file://', // Local file access
];

// Add development origins only in development mode
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:4173'); // Vite preview
  allowedOrigins.push('http://localhost:8080'); // Alternative dev server
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // In development, be more permissive
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    const msg = `CORS policy violation: Origin ${origin} not allowed`;
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
}));

// Additional CORS headers for specific cases (production-safe)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Only set origin header if it's in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, be more permissive
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
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
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB Atlas connecté avec succès');
    
    // Créer les données par défaut
    try {
      const Testimonial = (await import('./models/Testimonial.js')).default;
      await Testimonial.createDefault();
    } catch (error) {
      console.log('ℹ️ Données par défaut des témoignages déjà créées ou erreur:', error.message);
    }

    // Créer les données par défaut pour Partner Testimonials
    try {
      const PartnerTestimonial = (await import('./models/PartnerTestimonial.js')).default;
      await PartnerTestimonial.createDefaults();
    } catch (error) {
      console.log('ℹ️ Données par défaut des témoignages partenaires déjà créées ou erreur:', error.message);
    }

    // Créer les pages par défaut du site
    try {
      const WebsitePage = (await import('./models/WebsitePage.js')).default;
      await WebsitePage.createDefaultPages();
    } catch (error) {
      console.log('ℹ️ Pages par défaut du site déjà créées ou erreur:', error.message);
    }
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
import newsletterRoutes from './routes/newsletter.js';
import digitalizationPortfolioRoutes from './routes/digitalizationPortfolio.js';
import digitalizationTestimonialsRoutes from './routes/digitalizationTestimonials.js';
import digitalizationContactRoutes from './routes/digitalizationContact.js';
import testimonialsRoutes from './routes/testimonials.js';
import partnerTestimonialsRoutes from './routes/partnerTestimonials.js';

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
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/digitalization-portfolio', digitalizationPortfolioRoutes);
app.use('/api/digitalization-testimonials', digitalizationTestimonialsRoutes);
app.use('/api/digitalization-contact', digitalizationContactRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/partner-testimonials', partnerTestimonialsRoutes);

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

// Import free courses routes
import freeCoursesRoutes from './routes/freeCourses.js';
app.use('/api/free-courses', freeCoursesRoutes);

// Import footer settings routes
import footerSettingsRoutes from './routes/footerSettings.js';
app.use('/api/footer-settings', footerSettingsRoutes);

// Import events routes
import eventsRoutes from './routes/events.js';
app.use('/api/events', eventsRoutes);

// Import partnerships routes
import partnershipsRoutes from './routes/partnerships.js';
app.use('/api/partnerships', partnershipsRoutes);

// Import digitalization services routes
import digitalizationServicesRoutes from './routes/digitalizationServices.js';
app.use('/api/digitalization-services', digitalizationServicesRoutes);

// Import digitalization products routes
import digitalizationProductsRoutes from './routes/digitalizationProducts.js';
app.use('/api/digitalization-products', digitalizationProductsRoutes);

// Import site config routes
import siteConfigRoutes from './routes/siteConfig.js';
app.use('/api/site-config', siteConfigRoutes);

// Import website pages routes
import websitePagesRoutes from './routes/websitePages.js';
app.use('/api/website-pages', websitePagesRoutes);

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
      freeCourses: '/api/free-courses',
      footerSettings: '/api/footer-settings',
      digitalizationServices: '/api/digitalization-services',
      digitalizationProducts: '/api/digitalization-products',
      digitalizationContact: '/api/digitalization-contact',
      testimonials: '/api/testimonials',
      partnerTestimonials: '/api/partner-testimonials',
      siteConfig: '/api/site-config',
      websitePages: '/api/website-pages',
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
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📍 API disponible sur: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
