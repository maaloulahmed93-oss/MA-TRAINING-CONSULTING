import Joi from 'joi';

// Pack validation schemas
const packCreationSchema = Joi.object({
  packId: Joi.string().optional(),
  name: Joi.string().required().min(3).max(200),
  description: Joi.string().required().min(10).max(1000),
  image: Joi.string().required().uri(),
  details: Joi.object({
    price: Joi.number().required().min(0),
    originalPrice: Joi.number().required().min(0),
    savings: Joi.number().required().min(0),
    advantages: Joi.array().items(Joi.string().required()).min(1).required(),
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
        ).required()
      })
    ).min(1).required()
  }).required(),
  isActive: Joi.boolean().optional()
});

const packUpdateSchema = Joi.object({
  packId: Joi.string().optional(),
  name: Joi.string().optional().min(3).max(200),
  description: Joi.string().optional().min(10).max(1000),
  image: Joi.string().optional().uri(),
  details: Joi.object({
    price: Joi.number().optional().min(0),
    originalPrice: Joi.number().optional().min(0),
    savings: Joi.number().optional().min(0),
    advantages: Joi.array().items(Joi.string().required()).min(1).optional(),
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
        ).required()
      })
    ).min(1).optional()
  }).optional(),
  isActive: Joi.boolean().optional()
});

export const validatePackCreation = (req, res, next) => {
  console.log('🔍 Validation des données de création de pack...');
  console.log('📄 Données reçues:', JSON.stringify(req.body, null, 2));

  const { error, value } = packCreationSchema.validate(req.body, { abortEarly: false });
  
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

export const validatePackUpdate = (req, res, next) => {
  console.log('🔍 Validation des données de mise à jour de pack...');
  console.log('📄 Données reçues:', JSON.stringify(req.body, null, 2));

  const { error, value } = packUpdateSchema.validate(req.body, { abortEarly: false });
  
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

