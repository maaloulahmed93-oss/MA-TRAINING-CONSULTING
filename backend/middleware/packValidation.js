import Joi from 'joi';
import DOMPurify from 'isomorphic-dompurify';

// Utility function to sanitize string inputs
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  // Remove HTML tags and trim whitespace
  return DOMPurify.sanitize(str).trim();
};

// Pack validation schemas
const packCreationSchema = Joi.object({
  packId: Joi.string().optional(),
  name: Joi.string().required().min(1).max(200),
  description: Joi.string().required().min(1).max(1000),
  image: Joi.string().allow('').optional(),
  niveau: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé').optional().default('Débutant'),
  resourcesCount: Joi.number().min(0).optional().default(0),
  details: Joi.object({
    price: Joi.number().required().min(0),
    originalPrice: Joi.number().optional().min(0),
    savings: Joi.number().optional().min(0),
    advantages: Joi.array().items(Joi.string().required()).optional(),
    themes: Joi.array().items(
      Joi.object({
        themeId: Joi.string().required(),
        name: Joi.string().required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        modules: Joi.array().items(
          Joi.object({
            moduleId: Joi.string().required(),
            title: Joi.string().required()
          })
        ).min(1).required()
      })
    ).optional()
  }).required(),
  isActive: Joi.boolean().optional()
}).unknown(false);

const packUpdateSchema = Joi.object({
  _id: Joi.string().optional(),
  packId: Joi.string().optional(),
  name: Joi.string().optional().min(3).max(200),
  description: Joi.string().optional().min(10).max(1000),
  image: Joi.string().allow('').optional(),
  niveau: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé').optional(),
  resourcesCount: Joi.number().min(0).optional(),
  details: Joi.object({
    _id: Joi.string().optional(),
    price: Joi.number().optional().min(0),
    originalPrice: Joi.number().optional().min(0),
    savings: Joi.number().optional().min(0),
    advantages: Joi.array().items(Joi.string().required()).optional(),
    themes: Joi.array().items(
      Joi.object({
        _id: Joi.string().optional(),
        themeId: Joi.string().required(),
        name: Joi.string().required(),
        startDate: Joi.string().required(),
        endDate: Joi.string().required(),
        modules: Joi.array().items(
          Joi.object({
            _id: Joi.string().optional(),
            moduleId: Joi.string().required(),
            title: Joi.string().required()
          })
        ).required()
      })
    ).optional()
  }).optional(),
  isActive: Joi.boolean().optional(),
  createdAt: Joi.date().optional(),
  updatedAt: Joi.date().optional(),
  __v: Joi.number().optional()
}).unknown(true);

export const validatePackCreation = (req, res, next) => {
  console.log('🔍 Validation des données de création de pack...');
  console.log('📄 Données reçues:', JSON.stringify(req.body, null, 2));

  // Sanitize string inputs to prevent XSS
  if (req.body.name) {
    req.body.name = sanitizeString(req.body.name);
  }
  if (req.body.description) {
    req.body.description = sanitizeString(req.body.description);
  }
  if (req.body.image) {
    req.body.image = sanitizeString(req.body.image);
  }

  // Apply minimal defaults only for critical fields
  if (!req.body.image || req.body.image.trim() === '') {
    req.body.image = 'https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Pack';
  }
  
  if (!req.body.details) {
    req.body.details = {};
  }

  console.log('🔧 Données après application des défauts:', JSON.stringify(req.body, null, 2));

  const { error, value } = packCreationSchema.validate(req.body, { abortEarly: false, stripUnknown: true });
  
  if (error) {
    console.log('❌ Erreur de validation:', error.details);
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Données de pack invalides',
      errors: errorMessages
    });
  }

  console.log('✅ Validation réussie pour la création de pack');
  req.body = value;
  next();
};

// Fonction pour nettoyer les données MongoDB
const cleanPackData = (data) => {
  const cleanData = { ...data };
  
  // Supprimer les champs MongoDB
  delete cleanData._id;
  delete cleanData.createdAt;
  delete cleanData.updatedAt;
  delete cleanData.__v;
  
  // Nettoyer les details
  if (cleanData.details) {
    delete cleanData.details._id;
    
    // Nettoyer les themes
    if (cleanData.details.themes) {
      cleanData.details.themes = cleanData.details.themes.map(theme => {
        const cleanTheme = { ...theme };
        delete cleanTheme._id;
        
        // Nettoyer les modules
        if (cleanTheme.modules) {
          cleanTheme.modules = cleanTheme.modules.map(module => {
            const cleanModule = { ...module };
            delete cleanModule._id;
            return cleanModule;
          });
        }
        
        return cleanTheme;
      });
    }
  }
  
  return cleanData;
};

export const validatePackUpdate = (req, res, next) => {
  console.log('🔍 Validation des données de mise à jour de pack...');
  console.log('📄 Données reçues:', JSON.stringify(req.body, null, 2));

  // Sanitize string inputs to prevent XSS
  if (req.body.name) {
    req.body.name = sanitizeString(req.body.name);
  }
  if (req.body.description) {
    req.body.description = sanitizeString(req.body.description);
  }
  if (req.body.image) {
    req.body.image = sanitizeString(req.body.image);
  }

  // Nettoyer les données avant validation
  const cleanedData = cleanPackData(req.body);
  console.log('🧹 Données nettoyées:', JSON.stringify(cleanedData, null, 2));

  const { error, value } = packUpdateSchema.validate(cleanedData, { abortEarly: false, stripUnknown: true });
  
  if (error) {
    console.log('❌ Erreur de validation:', error.details);
    const errorMessages = error.details.map(detail => detail.message);
    return res.status(400).json({
      success: false,
      message: 'Données de pack invalides',
      errors: errorMessages
    });
  }

  console.log('✅ Validation réussie pour la mise à jour de pack');
  req.body = value;
  next();
};

