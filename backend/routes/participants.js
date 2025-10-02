import express from 'express';
import Partner from '../models/Partner.js';
import ParticipantFormation from '../models/ParticipantFormation.js';
import ParticipantProject from '../models/ParticipantProject.js';
import ParticipantResource from '../models/ParticipantResource.js';
import ParticipantNotification from '../models/ParticipantNotification.js';

const router = express.Router();

// Helper function to generate participant ID
const generateParticipantId = () => {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(100000 + Math.random() * 900000);
  return `PART-${timestamp}-${random.toString().slice(0, 3)}`;
};

// POST /api/participants - Create new participant
router.post('/', async (req, res) => {
  try {
    const { partnerId, fullName, firstName, lastName, email, phone, address, avatar, status, notes } = req.body;
  
  // Check if email already exists
  const existingEmail = await Partner.findOne({ email });
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: `Un participant avec l'email ${email} existe déjà`
    });
  }

  // Use provided participantId or generate a new one
  let finalParticipantId;
  if (partnerId) {
    // Check if provided ID already exists
    const existingParticipant = await Partner.findOne({ partnerId });
    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        message: `Participant ID ${partnerId} existe déjà`
      });
    }
    finalParticipantId = partnerId;
  } else {
    // Generate unique participant ID
    let existingParticipant;
    do {
      finalParticipantId = generateParticipantId();
      existingParticipant = await Partner.findOne({ partnerId: finalParticipantId });
    } while (existingParticipant);
  }
    
    // Create participant in Partner collection
    const participant = new Partner({
      partnerId: finalParticipantId,
      fullName: fullName || `${firstName || ''} ${lastName || ''}`.trim(),
      email,
      phone: phone || '',
      address: address || '',
      type: 'participant',
      isActive: true,
      // Store additional participant-specific data in description field
      description: JSON.stringify({
        firstName: firstName || fullName?.split(' ')[0] || '',
        lastName: lastName || fullName?.split(' ').slice(1).join(' ') || '',
        avatar: avatar || '',
        status: status || 'active',
        notes: notes || '',
        totalProgress: 0,
        enrollmentDate: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      })
    });
    
    await participant.save();
    
    res.status(201).json({
      success: true,
      message: 'Participant créé avec succès',
      data: {
        id: finalParticipantId,
        partnerId: finalParticipantId,
        fullName: participant.fullName,
        email: participant.email,
        phone: participant.phone,
        address: participant.address,
        type: participant.type,
        isActive: participant.isActive,
        createdAt: participant.createdAt,
        ...JSON.parse(participant.description || '{}')
      }
    });
  } catch (error) {
    console.error('Erreur lors de la création du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du participant',
      error: error.message
    });
  }
});

// GET /api/participants - Get all participants
router.get('/', async (req, res) => {
  try {
    console.log('📥 GET /api/participants - Get all participants request');
    const { status, page = 1, limit = 50 } = req.query;
    
    const filter = { type: 'participant', isActive: true };
    if (status && status !== 'all') {
      // We'll need to parse the description field to filter by status
      // For now, return all and let frontend filter
    }
    
    const participants = await Partner.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Partner.countDocuments(filter);
    console.log(`📊 Found ${participants.length} participants, getting related data...`);
    
    // Transform data to match frontend expectations and get related data
    const transformedParticipants = await Promise.all(participants.map(async (p) => {
      const additionalData = JSON.parse(p.description || '{}');
      
      // Get participant's formations, projects, resources, notifications
      const [formations, projects, resources, notifications] = await Promise.all([
        ParticipantFormation.find({ participantId: p.partnerId, isActive: true }).sort({ createdAt: -1 }),
        ParticipantProject.find({ participantId: p.partnerId, isActive: true }).sort({ createdAt: -1 }),
        ParticipantResource.find({ participantId: p.partnerId, isActive: true }).sort({ assignedDate: -1 }),
        ParticipantNotification.find({ participantId: p.partnerId, isActive: true }).sort({ date: -1 })
      ]);
      
      // Calculate total progress
      const totalProgress = formations.length > 0 
        ? Math.round(formations.reduce((sum, f) => sum + f.progress, 0) / formations.length)
        : 0;
      
      console.log(`👤 ${p.partnerId}: ${formations.length} formations, ${projects.length} projects, ${notifications.length} notifications`);
      
      // Transform resources to match Frontend expectations
      const transformedResources = resources.map(resource => {
        console.log('🔄 Transforming resource:', resource);
        
        const transformed = {
          id: resource._id,
          title: resource.title,
          description: resource.description || '',
          icon: resource.icon && resource.icon.trim() ? resource.icon.trim() : '📄', // Use saved icon or default
          category: 'Ressources',
          type: 'Guide',
          assignedDate: resource.assignedDate,
          isCompleted: false,
          dataLinks: resource.url ? [{
            id: `link-${Date.now()}`,
            title: 'Lien principal',
            url: resource.url,
            type: 'external'
          }] : []
        };
        
        console.log('✅ Transformed resource:', transformed);
        return transformed;
      });

      return {
        id: p.partnerId,
        partnerId: p.partnerId,
        fullName: p.fullName,
        email: p.email,
        phone: p.phone,
        type: p.type,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        totalProgress,
        formations,
        projects,
        resources: transformedResources,
        notifications,
        ...additionalData
      };
    }));
    
    res.json({
      success: true,
      data: transformedParticipants,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des participants',
      error: error.message
    });
  }
});

// GET /api/participants/:id - Get specific participant
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant', 
      isActive: true 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    // Get participant's formations, projects, resources, notifications
    console.log(`🔍 GET ${id}: Searching for formations with participantId: ${id}`);
    const [formations, projects, resources, notifications] = await Promise.all([
      ParticipantFormation.find({ participantId: id, isActive: true }).sort({ createdAt: -1 }),
      ParticipantProject.find({ participantId: id, isActive: true }).sort({ createdAt: -1 }),
      ParticipantResource.find({ participantId: id, isActive: true }).sort({ createdAt: -1 }),
      ParticipantNotification.find({ participantId: id, isActive: true }).sort({ date: -1 })
    ]);
    console.log(`📊 GET ${id}: Found ${formations.length} formations, ${projects.length} projects, ${notifications.length} notifications`);
    
    // Calculate total progress
    const totalProgress = formations.length > 0 
      ? Math.round(formations.reduce((sum, f) => sum + f.progress, 0) / formations.length)
      : 0;
    
    const additionalData = JSON.parse(participant.description || '{}');
    
    // Transform resources to match Frontend expectations
    const transformedResources = resources.map(resource => {
      console.log('🔄 Transforming single participant resource:', {
        title: resource.title,
        icon: resource.icon,
        url: resource.url,
        hasUrl: !!resource.url,
        urlLength: resource.url ? resource.url.length : 0
      });
      
      const transformed = {
        id: resource._id,
        title: resource.title,
        description: resource.description || '',
        icon: resource.icon && resource.icon.trim() ? resource.icon.trim() : '📄', // Use saved icon or default
        category: 'Ressources',
        type: 'Guide',
        assignedDate: resource.assignedDate,
        isCompleted: false,
        dataLinks: resource.url && resource.url.trim() ? [{
          id: `link-${Date.now()}`,
          title: 'Lien principal',
          url: resource.url.trim(),
          type: 'external'
        }] : []
      };
      
      console.log('✅ Transformed single participant resource:', {
        title: transformed.title,
        icon: transformed.icon,
        dataLinksCount: transformed.dataLinks.length,
        firstDataLink: transformed.dataLinks[0] || 'none'
      });
      return transformed;
    });
    
    const participantData = {
      id: participant.partnerId,
      partnerId: participant.partnerId,
      fullName: participant.fullName,
      email: participant.email,
      phone: participant.phone,
      address: participant.address,
      type: participant.type,
      isActive: participant.isActive,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
      totalProgress,
      formations,
      projects,
      coachingResources: transformedResources,
      notifications,
      ...additionalData
    };
    
    res.json({
      success: true,
      data: participantData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du participant',
      error: error.message
    });
  }
});

// POST /api/participants/:id/login - Authenticate participant
router.post('/:id/login', async (req, res) => {
  try {
    const { id } = req.params;
    
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant', 
      isActive: true 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    // Update last login
    await Partner.updateOne(
      { partnerId: id },
      { lastLogin: new Date() }
    );
    
    const additionalData = JSON.parse(participant.description || '{}');
    
    res.json({
      success: true,
      message: 'Connexion réussie',
      data: {
        id: participant.partnerId,
        partnerId: participant.partnerId,
        fullName: participant.fullName,
        email: participant.email,
        phone: participant.phone,
        type: participant.type,
        ...additionalData
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la connexion',
      error: error.message
    });
  }
});

// GET /api/participants/:id/formations - Get participant's formations
router.get('/:id/formations', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify participant exists
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant', 
      isActive: true 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    const formations = await ParticipantFormation.find({ 
      participantId: id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: formations
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des formations',
      error: error.message
    });
  }
});

// POST /api/participants/:id/formations - Create formation for participant
router.post('/:id/formations', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify participant exists
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant', 
      isActive: true 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    const cleanFormation = {
      participantId: id,
      ...req.body
    };
    
    const newFormation = new ParticipantFormation(cleanFormation);
    await newFormation.save();
    console.log(`✅ Formation saved: ${cleanFormation.title} for ${id}`);
    
    res.status(201).json({
      success: true,
      message: 'Formation créée avec succès',
      data: formation
    });
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la formation',
      error: error.message
    });
  }
});

// GET /api/participants/:id/projects - Get participant's projects
router.get('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    
    const projects = await ParticipantProject.find({ 
      participantId: id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des projets:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des projets',
      error: error.message
    });
  }
});

// POST /api/participants/:id/projects - Create project for participant
router.post('/:id/projects', async (req, res) => {
  try {
    const { id } = req.params;
    
    const project = new ParticipantProject({
      participantId: id,
      ...req.body
    });
    
    await project.save();
    
    res.status(201).json({
      success: true,
      message: 'Projet créé avec succès',
      data: project
    });
  } catch (error) {
    console.error('Erreur lors de la création du projet:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du projet',
      error: error.message
    });
  }
});

// GET /api/participants/:id/resources - Get participant's coaching resources
router.get('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resources = await ParticipantResource.find({ 
      participantId: id, 
      isActive: true 
    }).sort({ assignedDate: -1 });
    
    res.json({
      success: true,
      data: resources
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des ressources:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ressources',
      error: error.message
    });
  }
});

// POST /api/participants/:id/resources - Create resource for participant
router.post('/:id/resources', async (req, res) => {
  try {
    const { id } = req.params;
    
    const resource = new ParticipantResource({
      participantId: id,
      ...req.body
    });
    
    await resource.save();
    
    res.status(201).json({
      success: true,
      message: 'Ressource créée avec succès',
      data: resource
    });
  } catch (error) {
    console.error('Erreur lors de la création de la ressource:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la ressource'
    });
  }
});

// GET /api/participants/:id/notifications - Get participant notifications
router.get('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔔 GET notifications for participant: ${id}`);
    
    const notifications = await ParticipantNotification.find({ 
      participantId: id, 
      isActive: true 
    }).sort({ date: -1 });
    
    console.log(`📊 Found ${notifications.length} notifications for ${id}`);
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des notifications'
    });
  }
});

// POST /api/participants/:id/notifications - Create participant notification
router.post('/:id/notifications', async (req, res) => {
  try {
    const { id } = req.params;
    const notificationData = req.body;
    
    console.log(`🔔 Creating notification for participant: ${id}`);
    
    const notification = new ParticipantNotification({
      participantId: id,
      ...notificationData,
      isActive: true
    });
    
    await notification.save();
    
    console.log(`✅ Notification created: ${notification._id}`);
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de la notification'
    });
  }
});

// PUT /api/participants/:id - Update participant
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    console.log(`🔄 PUT /api/participants/${id} - Update request received`);
    console.log(`📊 Update data keys: ${Object.keys(updateData).join(', ')}`);
    console.log(`📊 Formations count: ${updateData.formations?.length || 0}`);
    console.log(`📊 Projects count: ${updateData.projects?.length || 0}`);
    
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant', 
      isActive: true 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    // Update basic fields
    if (updateData.fullName) participant.fullName = updateData.fullName;
    if (updateData.email) participant.email = updateData.email;
    if (updateData.phone) participant.phone = updateData.phone;
    if (updateData.address) participant.address = updateData.address;
    
    // Update additional data in description field
    const currentAdditionalData = JSON.parse(participant.description || '{}');
    const newAdditionalData = {
      ...currentAdditionalData,
      firstName: updateData.firstName || currentAdditionalData.firstName,
      lastName: updateData.lastName || currentAdditionalData.lastName,
      avatar: updateData.avatar || currentAdditionalData.avatar,
      status: updateData.status || currentAdditionalData.status,
      notes: updateData.notes || currentAdditionalData.notes,
      // Add new progress fields
      totalProgress: updateData.totalProgress !== undefined ? updateData.totalProgress : currentAdditionalData.totalProgress,
      completedCourses: updateData.completedCourses !== undefined ? updateData.completedCourses : currentAdditionalData.completedCourses,
      studyTime: updateData.studyTime !== undefined ? updateData.studyTime : currentAdditionalData.studyTime,
      achievedGoals: updateData.achievedGoals !== undefined ? updateData.achievedGoals : currentAdditionalData.achievedGoals,
      totalGoals: updateData.totalGoals !== undefined ? updateData.totalGoals : currentAdditionalData.totalGoals,
      lastActivity: new Date().toISOString()
    };
    
    console.log(`📊 Updating progress data for ${id}:`, {
      totalProgress: newAdditionalData.totalProgress,
      completedCourses: newAdditionalData.completedCourses,
      studyTime: newAdditionalData.studyTime,
      achievedGoals: newAdditionalData.achievedGoals,
      totalGoals: newAdditionalData.totalGoals
    });
    
    participant.description = JSON.stringify(newAdditionalData);
    await participant.save();

    // Handle formations, projects, resources, and notifications
    if (updateData.formations && Array.isArray(updateData.formations)) {
      console.log(`🔄 Processing ${updateData.formations.length} formations for ${id}`);
      // Delete existing formations for this participant
      await ParticipantFormation.deleteMany({ participantId: id });
      
      // Create new formations
      for (const formation of updateData.formations) {
        // Clean and prepare formation data
        const cleanFormation = {
          participantId: id,
          title: formation.title,
          description: formation.description || '',
          domain: formation.domain || 'Général',
          level: formation.level || 'Débutant',
          duration: formation.duration || '0 heures',
          progress: formation.progress || 0,
          status: formation.status || 'not_started',
          enrollmentDate: formation.enrollmentDate ? new Date(formation.enrollmentDate) : new Date(),
          completionDate: formation.completionDate ? new Date(formation.completionDate) : undefined,
          thumbnail: formation.thumbnail || '',
          courses: formation.courses || [],
          isActive: true
        };

        // Handle links - الفورم يبعث objects مباشرة
        console.log('🔍 Processing links for formation:', formation.title);
        console.log('🔍 Links type:', typeof formation.links);
        console.log('🔍 Links value:', formation.links);
        
        // الفورم يبعث links كـ array of objects مباشرة
        if (formation.links && Array.isArray(formation.links)) {
          cleanFormation.links = formation.links;
          console.log('✅ Links array accepted directly from form');
        } else {
          cleanFormation.links = [];
          console.log('ℹ️ No links provided or invalid format, using empty array');
        }
        
        console.log('🎯 Final links array:', cleanFormation.links);

        const newFormation = new ParticipantFormation(cleanFormation);
        await newFormation.save();
        console.log(`✅ Formation saved: ${cleanFormation.title} for ${id}`);
      }
    }

    if (updateData.projects && Array.isArray(updateData.projects)) {
      console.log(`🔄 Processing ${updateData.projects.length} projects for ${id}`);
      // Delete existing projects for this participant
      await ParticipantProject.deleteMany({ participantId: id });
      
      // Create new projects
      for (const project of updateData.projects) {
        // 🔍 Debug: Log incoming project data
        console.log(`🔍 Processing project "${project.title}" for ${id}:`);
        console.log(`   📥 Incoming projectUrl: "${project.projectUrl || 'UNDEFINED'}"`);
        console.log(`   📋 Full project data:`, JSON.stringify(project, null, 2));

        const cleanProject = {
          participantId: id,
          title: project.title,
          description: project.description || '',
          formationId: project.formationId || '',
          formationTitle: project.formationTitle || '',
          dueDate: project.dueDate ? new Date(project.dueDate) : undefined,
          feedback: project.feedback || '',
          note: project.note || '',
          isVisible: project.isVisible !== undefined ? project.isVisible : true,
          grade: project.grade || undefined,
          status: project.status || 'not_started',
          projectUrl: project.projectUrl || '',
          isActive: true
        };

        // 🔍 Debug: Log cleaned project data
        console.log(`   📤 Cleaned projectUrl: "${cleanProject.projectUrl}"`);
        console.log(`   💾 About to save to MongoDB:`, JSON.stringify(cleanProject, null, 2));

        const newProject = new ParticipantProject(cleanProject);
        const savedProject = await newProject.save();
        
        console.log(`✅ Project saved: ${cleanProject.title} for ${id}`);
        console.log(`🔗 Project URL saved: ${cleanProject.projectUrl || 'EMPTY'}`);
        console.log(`💾 MongoDB document ID: ${savedProject._id}`);
        console.log(`🔍 Saved projectUrl in DB: "${savedProject.projectUrl || 'EMPTY'}"`);
      }
    }

    if (updateData.coachingResources && Array.isArray(updateData.coachingResources)) {
      console.log(`🔄 Processing ${updateData.coachingResources.length} resources for ${id}`);
      console.log('📋 Incoming coaching resources payload:', JSON.stringify(updateData.coachingResources, null, 2));
      
      // Delete existing resources for this participant
      await ParticipantResource.deleteMany({ participantId: id });
      
      // Create new resources
      for (const resource of updateData.coachingResources) {
        console.log('🔍 Processing resource:', resource);
        
        // Extract URL from dataLinks if available
        let resourceUrl = resource.url || '';
        if (resource.dataLinks && resource.dataLinks.length > 0) {
          resourceUrl = resource.dataLinks[0].url || '';
        }
        
        const cleanResource = {
          participantId: id,
          title: resource.title || 'Ressource',
          description: resource.description || '',
          url: resourceUrl,
          icon: resource.icon || '',
          type: resource.type || 'Guide',
          category: resource.category || 'Ressources',
          thumbnail: resource.thumbnail || '',
          downloadUrl: resource.downloadUrl || '',
          duration: resource.duration || '',
          assignedDate: resource.assignedDate ? new Date(resource.assignedDate) : new Date(),
          accessedDate: resource.accessedDate ? new Date(resource.accessedDate) : null,
          isCompleted: resource.isCompleted || false,
          dataLinks: resource.dataLinks || [],
          isActive: true
        };
        
        console.log('💾 Saving resource with data:', cleanResource);

        const newResource = new ParticipantResource(cleanResource);
        await newResource.save();
        console.log(`✅ Resource saved: ${cleanResource.title} for ${id}`);
      }
    }
    // Handle notifications
    if (updateData.notifications && Array.isArray(updateData.notifications)) {
      console.log(`🔔 Processing ${updateData.notifications.length} notifications for ${id}`);
      
      // Delete existing notifications for this participant
      await ParticipantNotification.deleteMany({ participantId: id });
      console.log(`🗑️ Deleted existing notifications for ${id}`);
      
      // Create new notifications
      for (const notification of updateData.notifications) {
        const cleanNotification = {
          participantId: id,
          title: notification.title || '',
          message: notification.message || '',
          type: notification.type || 'information',
          date: notification.date ? new Date(notification.date) : new Date(),
          isRead: notification.isRead || false,
          actionUrl: notification.actionUrl || notification.link || '',
          priority: notification.priority || 'medium',
          // Legacy fields
          company: notification.company || '',
          jobTitle: notification.jobTitle || '',
          salary: notification.salary || '',
          contractType: notification.contractType || '',
          contact: notification.contact || '',
          environment: notification.environment || '',
          benefits: notification.benefits || '',
          // New fields
          description: notification.description || '',
          link: notification.link || '',
          phone: notification.phone || '',
          email: notification.email || '',
          uploadLink: notification.uploadLink || '',
          dataLinks: notification.dataLinks || [],
          isActive: true
        };
        
        const newNotification = new ParticipantNotification(cleanNotification);
        await newNotification.save();
        console.log(`✅ Notification saved: ${newNotification._id}`);
      }
    }
    
    res.json({
      success: true,
      message: 'Participant mis à jour avec succès',
      data: {
        id: participant.partnerId,
        partnerId: participant.partnerId,
        fullName: participant.fullName,
        email: participant.email,
        phone: participant.phone,
        address: participant.address,
        type: participant.type,
        isActive: participant.isActive,
        updatedAt: participant.updatedAt,
        ...newAdditionalData
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour du participant:', error);
    console.error('❌ Stack trace:', error.stack);
    console.error('❌ Error name:', error.name);
    console.error('❌ Error message:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du participant',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// DELETE /api/participants/:id - Soft delete participant
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const participant = await Partner.findOne({ 
      partnerId: id, 
      type: 'participant' 
    });
    
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant non trouvé'
      });
    }
    
    // Soft delete - set isActive to false
    participant.isActive = false;
    await participant.save();
    
    // Also soft delete all related data
    await Promise.all([
      ParticipantFormation.updateMany({ participantId: id }, { isActive: false }),
      ParticipantProject.updateMany({ participantId: id }, { isActive: false }),
      ParticipantResource.updateMany({ participantId: id }, { isActive: false })
    ]);
    
    res.json({
      success: true,
      message: 'Participant supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du participant:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du participant',
      error: error.message
    });
  }
});

// POST /api/participants/verify - Verify participant credentials (ID + Email)
router.post('/verify', async (req, res) => {
  try {
    const { participantId, email } = req.body;
    
    console.log(`🔐 VERIFY: Checking credentials for ${participantId} with email ${email}`);
    
    if (!participantId || !email) {
      return res.status(400).json({
        success: false,
        message: 'ID participant et email requis'
      });
    }

    // Find participant by ID and email
    const participant = await Partner.findOne({ 
      partnerId: participantId.trim(),
      email: email.trim().toLowerCase(),
      type: 'participant',
      isActive: true 
    });

    if (participant) {
      console.log(`✅ VERIFY: Participant trouvé: ${participant.fullName}`);
      res.json({
        success: true,
        message: 'Identifiants valides',
        data: {
          id: participant.partnerId,
          fullName: participant.fullName,
          email: participant.email
        }
      });
    } else {
      console.log(`❌ VERIFY: Participant non trouvé pour ${participantId} / ${email}`);
      res.status(401).json({
        success: false,
        message: 'ID ou email incorrect'
      });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
});

export default router;
