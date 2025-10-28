import express from 'express';
import Domain from '../models/Domain.js';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import FreeCourseAccess from '../models/FreeCourseAccess.js';

const router = express.Router();

// ==================== ROUTES PUBLIQUES ====================

// GET /api/free-courses/domains - Récupérer tous les domaines avec cours et modules
router.get('/domains', async (req, res) => {
  try {
    console.log('🔍 Récupération des domaines avec cours et modules...');
    
    // Récupérer tous les domaines actifs
    const domains = await Domain.find({ isActive: true }).sort({ order: 1, title: 1 });
    
    // Pour chaque domaine, récupérer les cours et modules
    const domainsWithCourses = await Promise.all(
      domains.map(async (domain) => {
        // Récupérer les cours du domaine
        const courses = await Course.find({ 
          domainId: domain.domainId, 
          isActive: true 
        }).sort({ order: 1, title: 1 });
        
        // Pour chaque cours, récupérer les modules
        const coursesWithModules = await Promise.all(
          courses.map(async (course) => {
            const modules = await CourseModule.find({ 
              courseId: course.courseId, 
              isActive: true 
            }).sort({ order: 1, moduleId: 1 });
            
            return {
              id: course.courseId,
              title: course.title,
              description: course.description,
              modules: modules.map(module => ({
                id: module.moduleId,
                title: module.title,
                duration: module.duration,
                url: module.url || undefined
              }))
            };
          })
        );
        
        return {
          id: domain.domainId,
          title: domain.title,
          icon: domain.icon,
          description: domain.description,
          courses: coursesWithModules
        };
      })
    );
    
    console.log(`✅ ${domainsWithCourses.length} domaines récupérés avec succès`);
    res.json({ 
      success: true, 
      data: domainsWithCourses,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des domaines:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la récupération des domaines',
      error: error.message 
    });
  }
});

// POST /api/free-courses/validate-access - Valider un ID d'accès
router.post('/validate-access', async (req, res) => {
  try {
    const { accessId } = req.body;
    
    if (!accessId || !accessId.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'accès requis' 
      });
    }
    
    console.log(`🔐 Validation de l'ID d'accès: ${accessId}`);
    
    // Rechercher l'ID d'accès
    const access = await FreeCourseAccess.findOne({ 
      accessId: accessId.toUpperCase().trim()
    });
    
    if (!access) {
      console.log(`❌ ID d'accès non trouvé: ${accessId}`);
      return res.status(401).json({ 
        success: false, 
        message: 'ID d\'accès invalide' 
      });
    }
    
    // Vérifier la validité
    if (!access.isValidAccess()) {
      console.log(`❌ ID d'accès non valide: ${accessId}`);
      return res.status(401).json({ 
        success: false, 
        message: 'ID d\'accès expiré ou limite atteinte' 
      });
    }
    
    // Incrémenter l'usage
    await access.incrementUsage();
    
    console.log(`✅ ID d'accès validé: ${accessId} (usage: ${access.usageCount + 1})`);
    res.json({ 
      success: true, 
      message: 'Accès autorisé',
      data: {
        accessId: access.accessId,
        domainId: access.domainId || '*',
        usageCount: access.usageCount + 1,
        maxUsage: access.maxUsage
      }
    });
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors de la validation',
      error: error.message 
    });
  }
});

// ==================== ROUTES ADMIN ====================

// GET /api/free-courses/admin/domains - Récupérer tous les domaines (admin)
router.get('/admin/domains', async (req, res) => {
  try {
    const domains = await Domain.find().sort({ order: 1, title: 1 });
    res.json({ success: true, data: domains });
  } catch (error) {
    console.error('❌ Erreur admin domains:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/free-courses/admin/domains - Créer un domaine
router.post('/admin/domains', async (req, res) => {
  try {
    const { domainId, title, icon, description, order } = req.body;
    
    // Validation
    if (!domainId || !title || !icon || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }
    
    const domain = new Domain({
      domainId: domainId.trim(),
      title: title.trim(),
      icon: icon.trim(),
      description: description.trim(),
      order: order || 0
    });
    
    await domain.save();
    console.log(`✅ Domaine créé: ${domain.title}`);
    
    res.status(201).json({ success: true, data: domain });
  } catch (error) {
    console.error('❌ Erreur création domaine:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'ID de domaine déjà existant' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// PUT /api/free-courses/admin/domains/:id - Modifier un domaine
router.put('/admin/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const domain = await Domain.findOneAndUpdate(
      { domainId: id },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domaine non trouvé' });
    }
    
    console.log(`✅ Domaine modifié: ${domain.title}`);
    res.json({ success: true, data: domain });
  } catch (error) {
    console.error('❌ Erreur modification domaine:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/free-courses/admin/domains/:id - Supprimer un domaine
router.delete('/admin/domains/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Supprimer d'abord tous les modules des cours du domaine
    const courses = await Course.find({ domainId: id });
    const courseIds = courses.map(c => c.courseId);
    
    if (courseIds.length > 0) {
      await CourseModule.deleteMany({ courseId: { $in: courseIds } });
      await Course.deleteMany({ domainId: id });
    }
    
    // Supprimer le domaine
    const domain = await Domain.findOneAndDelete({ domainId: id });
    
    if (!domain) {
      return res.status(404).json({ success: false, message: 'Domaine non trouvé' });
    }
    
    console.log(`✅ Domaine supprimé: ${domain.title}`);
    res.json({ success: true, message: 'Domaine supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression domaine:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/free-courses/admin/courses - Récupérer tous les cours
router.get('/admin/courses', async (req, res) => {
  try {
    const { domainId } = req.query;
    const filter = domainId ? { domainId } : {};
    
    const courses = await Course.find(filter).sort({ order: 1, title: 1 });
    res.json({ success: true, data: courses });
  } catch (error) {
    console.error('❌ Erreur admin courses:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/free-courses/admin/courses - Créer un cours
router.post('/admin/courses', async (req, res) => {
  try {
    const { courseId, domainId, title, description, order } = req.body;
    
    if (!courseId || !domainId || !title || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Tous les champs sont requis' 
      });
    }
    
    const course = new Course({
      courseId: courseId.trim(),
      domainId: domainId.trim(),
      title: title.trim(),
      description: description.trim(),
      order: order || 0
    });
    
    await course.save();
    console.log(`✅ Cours créé: ${course.title}`);
    
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    console.error('❌ Erreur création cours:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'ID de cours déjà existant' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// GET /api/free-courses/admin/modules - Récupérer tous les modules
router.get('/admin/modules', async (req, res) => {
  try {
    const { courseId } = req.query;
    const filter = courseId ? { courseId } : {};
    
    const modules = await CourseModule.find(filter).sort({ order: 1, moduleId: 1 });
    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('❌ Erreur admin modules:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/free-courses/admin/modules - Créer un module
router.post('/admin/modules', async (req, res) => {
  try {
    const { moduleId, courseId, title, duration, url, order } = req.body;
    
    if (!moduleId || !courseId || !title || !duration) {
      return res.status(400).json({ 
        success: false, 
        message: 'Champs requis: moduleId, courseId, title, duration' 
      });
    }
    
    const module = new CourseModule({
      moduleId: parseInt(moduleId),
      courseId: courseId.trim(),
      title: title.trim(),
      duration: duration.trim(),
      url: url ? url.trim() : '',
      order: order || 0
    });
    
    await module.save();
    console.log(`✅ Module créé: ${module.title}`);
    
    res.status(201).json({ success: true, data: module });
  } catch (error) {
    console.error('❌ Erreur création module:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'Module déjà existant pour ce cours' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// GET /api/free-courses/admin/access-ids - Récupérer tous les IDs d'accès
router.get('/admin/access-ids', async (req, res) => {
  try {
    const accessIds = await FreeCourseAccess.find().sort({ createdAt: -1 });
    res.json({ success: true, data: accessIds });
  } catch (error) {
    console.error('❌ Erreur admin access-ids:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/free-courses/admin/access-ids - Créer un ID d'accès
router.post('/admin/access-ids', async (req, res) => {
  try {
    const { accessId, description, maxUsage, expiresAt, domainId } = req.body;
    
    if (!accessId) {
      return res.status(400).json({ 
        success: false, 
        message: 'ID d\'accès requis' 
      });
    }
    
    const access = new FreeCourseAccess({
      accessId: accessId.toUpperCase().trim(),
      description: description ? description.trim() : '',
      maxUsage: maxUsage || -1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      createdBy: 'admin',
      domainId: (domainId && domainId.trim()) || '*'
    });
    
    await access.save();
    console.log(`✅ ID d'accès créé: ${access.accessId}`);
    
    res.status(201).json({ success: true, data: access });
  } catch (error) {
    console.error('❌ Erreur création access-id:', error);
    if (error.code === 11000) {
      res.status(400).json({ success: false, message: 'ID d\'accès déjà existant' });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
});

// DELETE /api/free-courses/admin/access-ids/:id - Supprimer un ID d'accès
router.delete('/admin/access-ids/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const access = await FreeCourseAccess.findOneAndDelete({ accessId: id.toUpperCase() });
    
    if (!access) {
      return res.status(404).json({ success: false, message: 'ID d\'accès non trouvé' });
    }
    
    console.log(`✅ ID d'accès supprimé: ${access.accessId}`);
    res.json({ success: true, message: 'ID d\'accès supprimé avec succès' });
  } catch (error) {
    console.error('❌ Erreur suppression access-id:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/free-courses/admin/stats - Statistiques admin
router.get('/admin/stats', async (req, res) => {
  try {
    const [domainsCount, coursesCount, modulesCount, accessIdsCount, totalUsage] = await Promise.all([
      Domain.countDocuments({ isActive: true }),
      Course.countDocuments({ isActive: true }),
      CourseModule.countDocuments({ isActive: true }),
      FreeCourseAccess.countDocuments({ isActive: true }),
      FreeCourseAccess.aggregate([
        { $group: { _id: null, total: { $sum: '$usageCount' } } }
      ])
    ]);
    
    const stats = {
      domains: domainsCount,
      courses: coursesCount,
      modules: modulesCount,
      accessIds: accessIdsCount,
      totalUsage: totalUsage[0]?.total || 0
    };
    
    res.json({ success: true, data: stats });
  } catch (error) {
    console.error('❌ Erreur stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
