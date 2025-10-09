import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Domain from '../models/Domain.js';
import Course from '../models/Course.js';
import CourseModule from '../models/CourseModule.js';
import FreeCourseAccess from '../models/FreeCourseAccess.js';

// Charger les variables d'environnement
dotenv.config();

// Données statiques à migrer (copie de coursesData.ts)
const coursesData = {
  domains: [
    {
      id: 'marketing',
      title: 'Marketing',
      icon: '📊',
      description: 'Stratégies marketing modernes',
      courses: [
        {
          id: 'marketing-digital',
          title: 'Marketing Digital Avancé',
          description: 'Maîtrisez les outils du marketing digital moderne',
          modules: [
            { id: 1, title: 'Introduction au Marketing Digital', duration: '45 min' },
            { id: 2, title: 'Stratégies SEO et SEM', duration: '60 min' },
            { id: 3, title: 'Réseaux Sociaux et Community Management', duration: '50 min' },
            { id: 4, title: 'Email Marketing et Automation', duration: '40 min' },
            { id: 5, title: 'Projet Pratique : Campagne Complète', duration: '90 min' }
          ]
        },
        {
          id: 'brand-strategy',
          title: 'Stratégie de Marque',
          description: 'Construisez une identité de marque forte et mémorable',
          modules: [
            { id: 1, title: 'Fondements de l\'Identité de Marque', duration: '40 min' },
            { id: 2, title: 'Positionnement et Différenciation', duration: '55 min' },
            { id: 3, title: 'Design et Communication Visuelle', duration: '65 min' },
            { id: 4, title: 'Stratégie de Contenu de Marque', duration: '45 min' },
            { id: 5, title: 'Cas Pratique : Refonte de Marque', duration: '80 min' }
          ]
        },
        {
          id: 'analytics',
          title: 'Analytics et Performance',
          description: 'Analysez et optimisez vos performances marketing',
          modules: [
            { id: 1, title: 'Introduction aux Analytics', duration: '35 min' },
            { id: 2, title: 'Google Analytics 4 Avancé', duration: '70 min' },
            { id: 3, title: 'KPIs et Tableaux de Bord', duration: '50 min' },
            { id: 4, title: 'A/B Testing et Optimisation', duration: '60 min' },
            { id: 5, title: 'Rapport d\'Analyse Complet', duration: '75 min' }
          ]
        },
        {
          id: 'content-marketing',
          title: 'Content Marketing',
          description: 'Créez du contenu qui convertit et engage',
          modules: [
            { id: 1, title: 'Stratégie de Contenu', duration: '45 min' },
            { id: 2, title: 'Création de Contenu Viral', duration: '55 min' },
            { id: 3, title: 'Storytelling et Narration', duration: '50 min' },
            { id: 4, title: 'Distribution et Amplification', duration: '40 min' },
            { id: 5, title: 'Calendrier Editorial Complet', duration: '70 min' }
          ]
        },
        {
          id: 'ecommerce-marketing',
          title: 'E-commerce Marketing',
          description: 'Boostez vos ventes en ligne avec des stratégies éprouvées',
          modules: [
            { id: 1, title: 'Optimisation de Boutique en Ligne', duration: '50 min' },
            { id: 2, title: 'Publicité Facebook et Instagram Ads', duration: '65 min' },
            { id: 3, title: 'Google Ads pour E-commerce', duration: '60 min' },
            { id: 4, title: 'Remarketing et Fidélisation', duration: '45 min' },
            { id: 5, title: 'Projet : Campagne E-commerce Complète', duration: '85 min' }
          ]
        }
      ]
    },
    {
      id: 'management-iso',
      title: 'Management ISO',
      icon: '🏆',
      description: 'Normes et certifications ISO',
      courses: [
        {
          id: 'iso-9001',
          title: 'ISO 9001 : Management de la Qualité',
          description: 'Maîtrisez la norme ISO 9001 et ses exigences',
          modules: [
            { id: 1, title: 'Introduction à la Norme ISO 9001', duration: '40 min' },
            { id: 2, title: 'Système de Management Qualité', duration: '55 min' },
            { id: 3, title: 'Processus et Amélioration Continue', duration: '60 min' },
            { id: 4, title: 'Audit Interne et Certification', duration: '50 min' },
            { id: 5, title: 'Mise en Pratique : Plan Qualité', duration: '75 min' }
          ]
        },
        {
          id: 'iso-14001',
          title: 'ISO 14001 : Management Environnemental',
          description: 'Implémentez un système de management environnemental',
          modules: [
            { id: 1, title: 'Enjeux Environnementaux et ISO 14001', duration: '45 min' },
            { id: 2, title: 'Analyse Environnementale', duration: '50 min' },
            { id: 3, title: 'Objectifs et Programmes Environnementaux', duration: '55 min' },
            { id: 4, title: 'Surveillance et Mesure', duration: '40 min' },
            { id: 5, title: 'Cas Pratique : SME Complet', duration: '80 min' }
          ]
        },
        {
          id: 'iso-45001',
          title: 'ISO 45001 : Santé et Sécurité au Travail',
          description: 'Gérez efficacement la santé et sécurité au travail',
          modules: [
            { id: 1, title: 'Principes de la Santé-Sécurité', duration: '35 min' },
            { id: 2, title: 'Évaluation des Risques Professionnels', duration: '65 min' },
            { id: 3, title: 'Plans de Prévention et Formation', duration: '55 min' },
            { id: 4, title: 'Gestion des Incidents et Accidents', duration: '45 min' },
            { id: 5, title: 'Document Unique et Conformité', duration: '70 min' }
          ]
        },
        {
          id: 'iso-27001',
          title: 'ISO 27001 : Sécurité de l\'Information',
          description: 'Protégez vos informations avec ISO 27001',
          modules: [
            { id: 1, title: 'Cybersécurité et ISO 27001', duration: '40 min' },
            { id: 2, title: 'Analyse des Risques Informatiques', duration: '60 min' },
            { id: 3, title: 'Contrôles de Sécurité', duration: '55 min' },
            { id: 4, title: 'Gestion des Incidents de Sécurité', duration: '50 min' },
            { id: 5, title: 'Plan de Continuité d\'Activité', duration: '75 min' }
          ]
        },
        {
          id: 'audit-iso',
          title: 'Audit des Systèmes ISO',
          description: 'Devenez auditeur interne certifié',
          modules: [
            { id: 1, title: 'Méthodologie d\'Audit', duration: '45 min' },
            { id: 2, title: 'Préparation et Planification', duration: '50 min' },
            { id: 3, title: 'Conduite d\'Audit et Techniques', duration: '65 min' },
            { id: 4, title: 'Rapport d\'Audit et Suivi', duration: '40 min' },
            { id: 5, title: 'Simulation d\'Audit Complet', duration: '90 min' }
          ]
        }
      ]
    },
    {
      id: 'design',
      title: 'Design & UX/UI',
      icon: '🎨',
      description: 'Design moderne et expérience utilisateur',
      courses: [
        {
          id: 'ui-ux-design',
          title: 'UI/UX Design Moderne',
          description: 'Créez des interfaces utilisateur exceptionnelles',
          modules: [
            { id: 1, title: 'Principes du Design UX', duration: '45 min' },
            { id: 2, title: 'Recherche Utilisateur et Personas', duration: '50 min' },
            { id: 3, title: 'Wireframing et Prototypage', duration: '60 min' },
            { id: 4, title: 'Design System et Composants', duration: '55 min' },
            { id: 5, title: 'Tests Utilisateur et Itération', duration: '40 min' }
          ]
        },
        {
          id: 'graphic-design',
          title: 'Design Graphique Professionnel',
          description: 'Maîtrisez les outils et techniques du design graphique',
          modules: [
            { id: 1, title: 'Théorie des Couleurs et Typographie', duration: '40 min' },
            { id: 2, title: 'Composition et Mise en Page', duration: '50 min' },
            { id: 3, title: 'Adobe Creative Suite Avancé', duration: '70 min' },
            { id: 4, title: 'Identité Visuelle et Branding', duration: '55 min' },
            { id: 5, title: 'Portfolio Professionnel', duration: '65 min' }
          ]
        },
        {
          id: 'motion-design',
          title: 'Motion Design et Animation',
          description: 'Donnez vie à vos créations avec l\'animation',
          modules: [
            { id: 1, title: 'Principes de l\'Animation', duration: '35 min' },
            { id: 2, title: 'After Effects pour Débutants', duration: '60 min' },
            { id: 3, title: 'Animation de Logos et Textes', duration: '55 min' },
            { id: 4, title: 'Motion Graphics Avancé', duration: '70 min' },
            { id: 5, title: 'Projet : Vidéo Promotionnelle', duration: '80 min' }
          ]
        }
      ]
    },
    {
      id: 'business',
      title: 'Business & Entrepreneuriat',
      icon: '💼',
      description: 'Compétences entrepreneuriales et business',
      courses: [
        {
          id: 'startup-creation',
          title: 'Création de Startup',
          description: 'De l\'idée au lancement de votre startup',
          modules: [
            { id: 1, title: 'Validation d\'Idée et Market Fit', duration: '50 min' },
            { id: 2, title: 'Business Model Canvas', duration: '45 min' },
            { id: 3, title: 'Financement et Levée de Fonds', duration: '60 min' },
            { id: 4, title: 'MVP et Lancement Produit', duration: '55 min' },
            { id: 5, title: 'Scaling et Croissance', duration: '65 min' }
          ]
        },
        {
          id: 'project-management',
          title: 'Gestion de Projet Agile',
          description: 'Maîtrisez les méthodes agiles et Scrum',
          modules: [
            { id: 1, title: 'Introduction aux Méthodes Agiles', duration: '40 min' },
            { id: 2, title: 'Framework Scrum en Détail', duration: '55 min' },
            { id: 3, title: 'Kanban et Lean Management', duration: '45 min' },
            { id: 4, title: 'Outils de Gestion de Projet', duration: '50 min' },
            { id: 5, title: 'Leadership d\'Équipe Agile', duration: '60 min' }
          ]
        },
        {
          id: 'sales-techniques',
          title: 'Techniques de Vente Modernes',
          description: 'Développez vos compétences commerciales',
          modules: [
            { id: 1, title: 'Psychologie de la Vente', duration: '45 min' },
            { id: 2, title: 'Prospection et Lead Generation', duration: '50 min' },
            { id: 3, title: 'Négociation et Closing', duration: '55 min' },
            { id: 4, title: 'CRM et Suivi Client', duration: '40 min' },
            { id: 5, title: 'Vente Consultative B2B', duration: '65 min' }
          ]
        }
      ]
    },
    {
      id: 'data-science',
      title: 'Data Science & IA',
      icon: '📊',
      description: 'Analyse de données et intelligence artificielle',
      courses: [
        {
          id: 'python-data-analysis',
          title: 'Analyse de Données avec Python',
          description: 'Maîtrisez l\'analyse de données avec Python',
          modules: [
            { id: 1, title: 'Python pour Data Science', duration: '50 min' },
            { id: 2, title: 'Pandas et NumPy Avancé', duration: '60 min' },
            { id: 3, title: 'Visualisation avec Matplotlib/Seaborn', duration: '55 min' },
            { id: 4, title: 'Statistiques et Probabilités', duration: '65 min' },
            { id: 5, title: 'Projet d\'Analyse Complète', duration: '80 min' }
          ]
        },
        {
          id: 'machine-learning',
          title: 'Machine Learning Pratique',
          description: 'Implémentez des modèles de machine learning',
          modules: [
            { id: 1, title: 'Introduction au Machine Learning', duration: '45 min' },
            { id: 2, title: 'Algorithmes Supervisés', duration: '70 min' },
            { id: 3, title: 'Algorithmes Non-Supervisés', duration: '60 min' },
            { id: 4, title: 'Évaluation et Optimisation', duration: '55 min' },
            { id: 5, title: 'Déploiement de Modèles', duration: '65 min' }
          ]
        },
        {
          id: 'ai-chatbots',
          title: 'IA et Chatbots Intelligents',
          description: 'Créez des chatbots avec l\'IA moderne',
          modules: [
            { id: 1, title: 'NLP et Traitement du Langage', duration: '50 min' },
            { id: 2, title: 'Architectures de Chatbots', duration: '45 min' },
            { id: 3, title: 'OpenAI API et GPT Integration', duration: '60 min' },
            { id: 4, title: 'Chatbots Conversationnels', duration: '55 min' },
            { id: 5, title: 'Déploiement et Monitoring', duration: '50 min' }
          ]
        }
      ]
    },
    {
      id: 'web-development',
      title: 'Développement Web',
      icon: '💻',
      description: 'Technologies web modernes',
      courses: [
        {
          id: 'react-advanced',
          title: 'React.js Avancé',
          description: 'Maîtrisez React et ses écosystèmes modernes',
          modules: [
            { id: 1, title: 'Hooks Avancés et Custom Hooks', duration: '50 min' },
            { id: 2, title: 'Context API et State Management', duration: '60 min' },
            { id: 3, title: 'Performance et Optimisation', duration: '55 min' },
            { id: 4, title: 'Testing avec Jest et React Testing Library', duration: '65 min' },
            { id: 5, title: 'Projet : Application React Complète', duration: '95 min' }
          ]
        },
        {
          id: 'nodejs-backend',
          title: 'Node.js & Backend Development',
          description: 'Développez des APIs robustes avec Node.js',
          modules: [
            { id: 1, title: 'Express.js et Architecture RESTful', duration: '45 min' },
            { id: 2, title: 'Base de Données et MongoDB', duration: '60 min' },
            { id: 3, title: 'Authentification JWT et Sécurité', duration: '55 min' },
            { id: 4, title: 'Déploiement et DevOps', duration: '50 min' },
            { id: 5, title: 'API Complète avec Documentation', duration: '85 min' }
          ]
        },
        {
          id: 'fullstack-modern',
          title: 'Full-Stack Modern (MERN)',
          description: 'Stack complète MongoDB, Express, React, Node.js',
          modules: [
            { id: 1, title: 'Architecture Full-Stack', duration: '40 min' },
            { id: 2, title: 'Frontend React avec TypeScript', duration: '70 min' },
            { id: 3, title: 'Backend Node.js et API', duration: '65 min' },
            { id: 4, title: 'Intégration et Communication', duration: '55 min' },
            { id: 5, title: 'Déploiement Production Complète', duration: '80 min' }
          ]
        },
        {
          id: 'mobile-react-native',
          title: 'React Native & Mobile',
          description: 'Développement d\'applications mobiles cross-platform',
          modules: [
            { id: 1, title: 'Fondamentaux React Native', duration: '45 min' },
            { id: 2, title: 'Navigation et Interface Mobile', duration: '60 min' },
            { id: 3, title: 'APIs Natives et Fonctionnalités', duration: '55 min' },
            { id: 4, title: 'State Management et Performance', duration: '50 min' },
            { id: 5, title: 'Publication App Store/Play Store', duration: '75 min' }
          ]
        },
        {
          id: 'devops-ci-cd',
          title: 'DevOps & CI/CD',
          description: 'Automatisation et déploiement continu',
          modules: [
            { id: 1, title: 'Introduction DevOps et Git Avancé', duration: '40 min' },
            { id: 2, title: 'Docker et Containerisation', duration: '65 min' },
            { id: 3, title: 'CI/CD avec GitHub Actions', duration: '60 min' },
            { id: 4, title: 'Monitoring et Logging', duration: '45 min' },
            { id: 5, title: 'Pipeline Complet de A à Z', duration: '85 min' }
          ]
        }
      ]
    }
  ],
  validAccessIds: [
    'DEMO2024',
    'FREE-ACCESS',
    'STUDENT-2024',
    'TRIAL-COURSE',
    'GRATUIT-2024'
  ]
};

// Connexion à MongoDB
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

// Fonction de migration principale
const migrateFreeCoursesData = async () => {
  console.log('🚀 Début de la migration des cours gratuits...');
  console.log('📊 Statistiques des données à migrer:');
  console.log(`   - ${coursesData.domains.length} domaines`);
  console.log(`   - ${coursesData.domains.reduce((total, domain) => total + domain.courses.length, 0)} cours`);
  console.log(`   - ${coursesData.domains.reduce((total, domain) => 
    total + domain.courses.reduce((courseTotal, course) => courseTotal + course.modules.length, 0), 0)} modules`);
  console.log(`   - ${coursesData.validAccessIds.length} IDs d'accès`);
  console.log('');

  try {
    // 1. Migrer les domaines
    console.log('📁 Migration des domaines...');
    for (let i = 0; i < coursesData.domains.length; i++) {
      const domain = coursesData.domains[i];
      
      const domainDoc = await Domain.findOneAndUpdate(
        { domainId: domain.id },
        {
          domainId: domain.id,
          title: domain.title,
          icon: domain.icon,
          description: domain.description,
          isActive: true,
          order: i
        },
        { upsert: true, new: true }
      );
      
      console.log(`   ✅ Domaine: ${domain.title} (${domain.courses.length} cours)`);
      
      // 2. Migrer les cours du domaine
      for (let j = 0; j < domain.courses.length; j++) {
        const course = domain.courses[j];
        
        const courseDoc = await Course.findOneAndUpdate(
          { courseId: course.id },
          {
            courseId: course.id,
            domainId: domain.id,
            title: course.title,
            description: course.description,
            isActive: true,
            order: j
          },
          { upsert: true, new: true }
        );
        
        console.log(`      📚 Cours: ${course.title} (${course.modules.length} modules)`);
        
        // 3. Migrer les modules du cours
        for (let k = 0; k < course.modules.length; k++) {
          const module = course.modules[k];
          
          await CourseModule.findOneAndUpdate(
            { moduleId: module.id, courseId: course.id },
            {
              moduleId: module.id,
              courseId: course.id,
              title: module.title,
              duration: module.duration,
              url: module.url || '',
              order: k,
              isActive: true
            },
            { upsert: true, new: true }
          );
          
          console.log(`         📖 Module: ${module.title} (${module.duration})`);
        }
      }
    }
    
    // 4. Migrer les IDs d'accès
    console.log('');
    console.log('🔑 Migration des IDs d\'accès...');
    for (const accessId of coursesData.validAccessIds) {
      await FreeCourseAccess.findOneAndUpdate(
        { accessId },
        {
          accessId,
          isActive: true,
          usageCount: 0,
          maxUsage: -1, // Illimité
          description: `ID d'accès migré automatiquement`,
          createdBy: 'migration-script'
        },
        { upsert: true, new: true }
      );
      
      console.log(`   🔐 ID d'accès: ${accessId}`);
    }
    
    // 5. Afficher les statistiques finales
    console.log('');
    console.log('📊 Statistiques de migration:');
    const [domainsCount, coursesCount, modulesCount, accessIdsCount] = await Promise.all([
      Domain.countDocuments(),
      Course.countDocuments(),
      CourseModule.countDocuments(),
      FreeCourseAccess.countDocuments()
    ]);
    
    console.log(`   ✅ ${domainsCount} domaines migrés`);
    console.log(`   ✅ ${coursesCount} cours migrés`);
    console.log(`   ✅ ${modulesCount} modules migrés`);
    console.log(`   ✅ ${accessIdsCount} IDs d'accès migrés`);
    
    console.log('');
    console.log('🎉 Migration terminée avec succès !');
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    throw error;
  }
};

// Fonction de validation des données migrées
const validateMigration = async () => {
  console.log('');
  console.log('🔍 Validation de la migration...');
  
  try {
    // Vérifier que tous les domaines ont des cours
    const domainsWithoutCourses = await Domain.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'domainId',
          foreignField: 'domainId',
          as: 'courses'
        }
      },
      {
        $match: { 'courses.0': { $exists: false } }
      }
    ]);
    
    if (domainsWithoutCourses.length > 0) {
      console.log(`⚠️  ${domainsWithoutCourses.length} domaines sans cours détectés`);
    } else {
      console.log('✅ Tous les domaines ont des cours');
    }
    
    // Vérifier que tous les cours ont des modules
    const coursesWithoutModules = await Course.aggregate([
      {
        $lookup: {
          from: 'coursemodules',
          localField: 'courseId',
          foreignField: 'courseId',
          as: 'modules'
        }
      },
      {
        $match: { 'modules.0': { $exists: false } }
      }
    ]);
    
    if (coursesWithoutModules.length > 0) {
      console.log(`⚠️  ${coursesWithoutModules.length} cours sans modules détectés`);
    } else {
      console.log('✅ Tous les cours ont des modules');
    }
    
    // Vérifier les IDs d'accès
    const activeAccessIds = await FreeCourseAccess.find({ isActive: true });
    console.log(`✅ ${activeAccessIds.length} IDs d'accès actifs`);
    
    console.log('✅ Validation terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la validation:', error);
  }
};

// Script principal
const main = async () => {
  try {
    await connectDB();
    await migrateFreeCoursesData();
    await validateMigration();
    
    console.log('');
    console.log('🎯 Migration des cours gratuits terminée avec succès !');
    console.log('🚀 Le backend est maintenant prêt à servir les cours gratuits via l\'API');
    
  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter le script si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { migrateFreeCoursesData, validateMigration };
