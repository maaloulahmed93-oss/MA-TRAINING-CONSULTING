import express from 'express';
import SiteConfig from '../models/SiteConfig.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration multer pour upload des fichiers
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = file.fieldname === 'favicon' ? 'favicon' : 'logo';
    cb(null, `${name}-${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: function (req, file, cb) {
    if (file.fieldname === 'favicon') {
      // Pour favicon: .ico, .png, .jpg, .svg
      if (file.mimetype.match(/^image\/(x-icon|png|jpeg|jpg|svg\+xml)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de favicon non supporté. Utilisez .ico, .png, .jpg ou .svg'));
      }
    } else if (file.fieldname === 'logo') {
      // Pour logo: .png, .jpg, .svg
      if (file.mimetype.match(/^image\/(png|jpeg|jpg|svg\+xml)$/)) {
        cb(null, true);
      } else {
        cb(new Error('Format de logo non supporté. Utilisez .png, .jpg ou .svg'));
      }
    } else {
      cb(new Error('Champ de fichier non reconnu'));
    }
  }
});

// GET /api/site-config - Obtenir la configuration active
router.get('/', async (req, res) => {
  try {
    const config = await SiteConfig.getActiveConfig();
    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error.message
    });
  }
});

// PUT /api/site-config - Mettre à jour la configuration
router.put('/', async (req, res) => {
  try {
    const config = await SiteConfig.getActiveConfig();
    
    // Mettre à jour les champs fournis
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'createdAt' && key !== '__v') {
        if (key === 'socialMedia' || key === 'seo') {
          // Pour les objets imbriqués
          config[key] = { ...config[key], ...req.body[key] };
        } else {
          config[key] = req.body[key];
        }
      }
    });

    await config.save();

    res.json({
      success: true,
      message: 'Configuration mise à jour avec succès',
      data: config
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la configuration:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour de la configuration',
      error: error.message
    });
  }
});

// PUT /api/site-config/images - Update favicon and logo URLs
router.put('/images', async (req, res) => {
  try {
    const { favicon, logo } = req.body;
    const config = await SiteConfig.getActiveConfig();
    
    // Validate URLs if provided
    if (favicon && !isValidImageUrl(favicon)) {
      return res.status(400).json({
        success: false,
        message: 'URL favicon invalide'
      });
    }
    
    if (logo && !isValidImageUrl(logo)) {
      return res.status(400).json({
        success: false,
        message: 'URL logo invalide'
      });
    }
    
    // Update the configuration
    if (favicon !== undefined) config.favicon = favicon;
    if (logo !== undefined) config.logo = logo;
    
    await config.save();

    res.json({
      success: true,
      message: 'URLs des images mises à jour avec succès',
      data: {
        favicon: config.favicon,
        logo: config.logo
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des images:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour des images',
      error: error.message
    });
  }
});

// Helper function to validate image URLs
function isValidImageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  // Allow relative paths or valid HTTP/HTTPS URLs
  if (url.startsWith('/')) return true;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

// GET /api/site-config/public - Configuration publique (pour le site principal)
router.get('/public', async (req, res) => {
  try {
    const config = await SiteConfig.getActiveConfig();
    
    // Retourner seulement les données publiques
    const publicConfig = {
      siteName: config.siteName,
      siteTitle: config.siteTitle,
      siteDescription: config.siteDescription,
      favicon: config.favicon,
      logo: config.logo,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      contactEmail: config.contactEmail,
      contactPhone: config.contactPhone,
      address: config.address,
      socialMedia: config.socialMedia,
      seo: {
        keywords: config.seo.keywords,
        googleAnalytics: config.seo.googleAnalytics,
        googleTagManager: config.seo.googleTagManager
      }
    };

    res.json({
      success: true,
      data: publicConfig
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la configuration publique:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération de la configuration',
      error: error.message
    });
  }
});

// POST /api/site-config/reset - Réinitialiser à la configuration par défaut
router.post('/reset', async (req, res) => {
  try {
    const config = await SiteConfig.getActiveConfig();
    
    // Réinitialiser aux valeurs par défaut
    config.siteName = '3d MA-TRAINING-CONSULTING';
    config.siteTitle = '3d MA-TRAINING-CONSULTING - Formation et Consulting';
    config.siteDescription = 'Centre de formation professionnelle et consulting en Tunisie';
    config.favicon = '/favicon.ico';
    config.logo = '/logo.png';
    config.primaryColor = '#3B82F6';
    config.secondaryColor = '#1E40AF';
    config.contactEmail = 'contact@ma-training-consulting.com';
    config.contactPhone = '+216 XX XXX XXX';
    config.address = 'Tunis, Tunisie';
    config.socialMedia = {
      facebook: '',
      linkedin: '',
      twitter: '',
      instagram: ''
    };
    config.seo = {
      keywords: 'formation, consulting, tunisie, professionnelle',
      googleAnalytics: '',
      googleTagManager: ''
    };

    await config.save();

    res.json({
      success: true,
      message: 'Configuration réinitialisée avec succès',
      data: config
    });
  } catch (error) {
    console.error('Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation de la configuration',
      error: error.message
    });
  }
});

export default router;
