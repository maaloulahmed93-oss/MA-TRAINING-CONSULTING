import Joi from 'joi';

// Program validation schema
const programSchema = Joi.object({
  title: Joi.string().required().trim().min(3).max(200),
  description: Joi.string().required().trim().min(10).max(1000),
  category: Joi.string().required(),
  level: Joi.string().default('Débutant').valid('Débutant', 'Intermédiaire', 'Avancé'),
  price: Joi.number().default(0).min(0),
  duration: Joi.string().required().trim().min(3).max(100),
  maxParticipants: Joi.alternatives().try(
    Joi.number().min(1).max(1000),
    Joi.string().trim().pattern(/^\d+-\d+$/) // Accept range format like "1-10"
  ).default(10),
  sessionsPerYear: Joi.number().default(1).min(1).max(100),
  modules: Joi.array().items(
    Joi.object({
      title: Joi.string().required().trim().min(3).max(200)
    })
  ).min(1).required(),
  sessions: Joi.array().items(
    Joi.object({
      title: Joi.string().required().trim().min(3).max(200),
      date: Joi.string().required().trim()
    })
  ).min(1).required(),
  isActive: Joi.boolean().default(true)
});

// Program update validation schema (all fields optional)
const programUpdateSchema = Joi.object({
  title: Joi.string().trim().min(3).max(200),
  description: Joi.string().trim().min(10).max(1000),
  category: Joi.string(),
  level: Joi.string().valid('Débutant', 'Intermédiaire', 'Avancé'),
  price: Joi.number().min(0),
  duration: Joi.string().trim().min(3).max(100),
  maxParticipants: Joi.number().min(1).max(1000),
  sessionsPerYear: Joi.number().min(1).max(100),
  modules: Joi.array().items(
    Joi.object({
      title: Joi.string().required().trim().min(3).max(200)
    })
  ).min(1),
  sessions: Joi.array().items(
    Joi.object({
      title: Joi.string().required().trim().min(3).max(200),
      date: Joi.string().required().trim()
    })
  ).min(1),
  isActive: Joi.boolean()
});

// Validation middleware for creating programs
export const validateProgramCreation = (req, res, next) => {
  console.log('🔍 Validation des données reçues:', req.body);
  
  const { error, value } = programSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    console.log('❌ Erreur de validation:', error.details);
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  console.log('✅ Validation réussie, données nettoyées:', value);
  req.body = value;
  next();
};

// Validation middleware for updating programs
export const validateProgramUpdate = (req, res, next) => {
  const { error, value } = programUpdateSchema.validate(req.body, { 
    abortEarly: false,
    stripUnknown: true 
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: 'Données invalides',
      errors: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  req.body = value;
  next();
};
