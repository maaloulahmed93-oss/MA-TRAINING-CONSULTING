// CORRECTION: Remplacer la logique delete/recreate par upsert intelligent
// À intégrer dans participants.js lignes 772-812

// AVANT (PROBLÉMATIQUE):
// await ParticipantNotification.deleteMany({ participantId: id });
// for (const notification of updateData.notifications) {
//   const newNotification = new ParticipantNotification(cleanNotification);
//   await newNotification.save();
// }

// APRÈS (SOLUTION):
if (updateData.notifications && Array.isArray(updateData.notifications)) {
  console.log(`🔔 Processing ${updateData.notifications.length} notifications for ${id}`);
  
  // Récupérer les notifications existantes
  const existingNotifications = await ParticipantNotification.find({ participantId: id });
  const existingIds = new Set(existingNotifications.map(n => n._id.toString()));
  
  // Traiter chaque notification
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
    
    if (notification.id && existingIds.has(notification.id)) {
      // UPDATE: Notification existe déjà
      await ParticipantNotification.findByIdAndUpdate(
        notification.id,
        cleanNotification,
        { new: true, runValidators: true }
      );
      console.log(`✅ Notification updated: ${notification.id}`);
      existingIds.delete(notification.id); // Marquer comme traité
    } else {
      // CREATE: Nouvelle notification
      const newNotification = new ParticipantNotification(cleanNotification);
      await newNotification.save();
      console.log(`✅ Notification created: ${newNotification._id}`);
    }
  }
  
  // CLEANUP: Supprimer les notifications qui ne sont plus dans la liste
  const notificationsToDelete = Array.from(existingIds);
  if (notificationsToDelete.length > 0) {
    await ParticipantNotification.deleteMany({ 
      _id: { $in: notificationsToDelete },
      participantId: id 
    });
    console.log(`🗑️ Deleted ${notificationsToDelete.length} obsolete notifications`);
  }
}
