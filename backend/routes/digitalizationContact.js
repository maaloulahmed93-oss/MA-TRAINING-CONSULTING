import express from 'express';
import DigitalizationContact from '../models/DigitalizationContact.js';

const router = express.Router();

// GET /api/digitalization-contact - Pour le site principal
router.get('/', async (req, res) => {
  try {
    console.log('🔄 GET /api/digitalization-contact - Récupération des contacts pour le site principal');
    
    const contact = await DigitalizationContact.findOne({ isActive: true })
      .sort({ lastUpdated: -1 });
    
    if (!contact) {
      console.log('⚠️ Aucun contact trouvé, création du contact par défaut...');
      const defaultContact = await DigitalizationContact.createDefault();
      
      const response = {
        success: true,
        data: {
          email: defaultContact.email,
          phone: defaultContact.phone,
          whatsapp: defaultContact.whatsapp,
          companyName: defaultContact.companyName,
          supportHours: defaultContact.supportHours,
          responseTime: defaultContact.responseTime,
          buttons: defaultContact.buttons,
          links: {
            email: defaultContact.generateMailto(),
            phone: defaultContact.generatePhoneLink(),
            whatsapp: defaultContact.generateWhatsAppLink()
          }
        }
      };
      
      console.log('✅ Contact par défaut créé et retourné');
      return res.json(response);
    }
    
    const response = {
      success: true,
      data: {
        email: contact.email,
        phone: contact.phone,
        whatsapp: contact.whatsapp,
        companyName: contact.companyName,
        supportHours: contact.supportHours,
        responseTime: contact.responseTime,
        buttons: contact.buttons,
        links: {
          email: contact.generateMailto(),
          phone: contact.generatePhoneLink(),
          whatsapp: contact.generateWhatsAppLink()
        }
      }
    };
    
    console.log('✅ Contact récupéré avec succès pour le site principal');
    res.json(response);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contact',
      error: error.message
    });
  }
});

// GET /api/digitalization-contact/admin - Pour l'admin panel
router.get('/admin', async (req, res) => {
  try {
    console.log('🔄 GET /api/digitalization-contact/admin - Récupération des contacts pour l\'admin');
    
    const contact = await DigitalizationContact.findOne({ isActive: true })
      .sort({ lastUpdated: -1 });
    
    if (!contact) {
      console.log('⚠️ Aucun contact trouvé, création du contact par défaut...');
      const defaultContact = await DigitalizationContact.createDefault();
      
      console.log('✅ Contact par défaut créé et retourné pour l\'admin');
      return res.json({
        success: true,
        data: defaultContact
      });
    }
    
    console.log('✅ Contact récupéré avec succès pour l\'admin');
    res.json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du contact pour l\'admin:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du contact',
      error: error.message
    });
  }
});

// PUT /api/digitalization-contact - Mise à jour du contact
router.put('/', async (req, res) => {
  try {
    console.log('🔄 PUT /api/digitalization-contact - Mise à jour du contact');
    console.log('📝 Données reçues:', JSON.stringify(req.body, null, 2));
    
    const {
      email,
      phone,
      whatsapp,
      companyName,
      supportHours,
      responseTime,
      emailSubjectPrefix,
      emailTemplate,
      whatsappMessage,
      buttons
    } = req.body;
    
    // Validation des données requises
    if (!email || !phone || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Email, téléphone et WhatsApp sont requis'
      });
    }
    
    // Chercher le contact existant ou en créer un nouveau
    let contact = await DigitalizationContact.findOne({ isActive: true });
    
    if (!contact) {
      console.log('⚠️ Aucun contact existant, création d\'un nouveau contact');
      contact = new DigitalizationContact();
    }
    
    // Mise à jour des données
    contact.email = email;
    contact.phone = phone;
    contact.whatsapp = whatsapp;
    contact.companyName = companyName || contact.companyName;
    contact.supportHours = supportHours || contact.supportHours;
    contact.responseTime = responseTime || contact.responseTime;
    contact.emailSubjectPrefix = emailSubjectPrefix || contact.emailSubjectPrefix;
    contact.emailTemplate = emailTemplate || contact.emailTemplate;
    contact.whatsappMessage = whatsappMessage || contact.whatsappMessage;
    contact.buttons = buttons || contact.buttons;
    contact.lastUpdated = new Date();
    contact.updatedBy = 'admin';
    contact.isActive = true;
    
    await contact.save();
    
    console.log('✅ Contact mis à jour avec succès');
    res.json({
      success: true,
      message: 'Contact mis à jour avec succès',
      data: contact
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du contact:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du contact',
      error: error.message
    });
  }
});

// POST /api/digitalization-contact/test-links - Tester les liens générés
router.post('/test-links', async (req, res) => {
  try {
    console.log('🔄 POST /api/digitalization-contact/test-links - Test des liens');
    
    const { email, phone, whatsapp, customSubject } = req.body;
    
    if (!email || !phone || !whatsapp) {
      return res.status(400).json({
        success: false,
        message: 'Email, téléphone et WhatsApp sont requis pour le test'
      });
    }
    
    // Créer un contact temporaire pour tester les liens
    const tempContact = new DigitalizationContact({
      email,
      phone,
      whatsapp
    });
    
    const links = {
      email: tempContact.generateMailto(customSubject),
      phone: tempContact.generatePhoneLink(),
      whatsapp: tempContact.generateWhatsAppLink()
    };
    
    console.log('✅ Liens de test générés avec succès');
    res.json({
      success: true,
      message: 'Liens de test générés avec succès',
      data: {
        links,
        preview: {
          email: `mailto:${email}`,
          phone: `tel:${phone}`,
          whatsapp: `WhatsApp: ${whatsapp}`
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors du test des liens:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du test des liens',
      error: error.message
    });
  }
});

// DELETE /api/digitalization-contact/reset - Réinitialiser aux valeurs par défaut
router.delete('/reset', async (req, res) => {
  try {
    console.log('🔄 DELETE /api/digitalization-contact/reset - Réinitialisation');
    
    // Supprimer tous les contacts existants
    await DigitalizationContact.deleteMany({});
    
    // Créer un nouveau contact par défaut
    const defaultContact = await DigitalizationContact.createDefault();
    
    console.log('✅ Contact réinitialisé aux valeurs par défaut');
    res.json({
      success: true,
      message: 'Contact réinitialisé aux valeurs par défaut',
      data: defaultContact
    });
  } catch (error) {
    console.error('❌ Erreur lors de la réinitialisation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la réinitialisation',
      error: error.message
    });
  }
});

// GET /api/digitalization-contact/stats - Statistiques
router.get('/stats', async (req, res) => {
  try {
    console.log('🔄 GET /api/digitalization-contact/stats - Récupération des statistiques');
    
    const totalContacts = await DigitalizationContact.countDocuments();
    const activeContacts = await DigitalizationContact.countDocuments({ isActive: true });
    const lastUpdate = await DigitalizationContact.findOne({ isActive: true })
      .sort({ lastUpdated: -1 })
      .select('lastUpdated updatedBy');
    
    const stats = {
      totalContacts,
      activeContacts,
      lastUpdate: lastUpdate ? {
        date: lastUpdate.lastUpdated,
        by: lastUpdate.updatedBy
      } : null,
      systemStatus: 'operational'
    };
    
    console.log('✅ Statistiques récupérées avec succès');
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message
    });
  }
});

export default router;
