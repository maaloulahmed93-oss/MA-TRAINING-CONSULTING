// CORRECTION: Améliorer la gestion des IDs et la prévention des doublons
// À intégrer dans ParticipantFormEnhanced.tsx

// 1. CORRECTION: Génération d'IDs cohérents
const addNotification = () => {
  console.log('🔍 Adding notification with data:', {
    type: newNotification.type,
    title: newNotification.title,
    description: newNotification.description,
    link: newNotification.link,
    editingIndex: editingNotificationIndex,
    isEditing: editingNotificationIndex !== null
  });
  
  let notificationToAdd = null;

  if (newNotification.title && newNotification.description) {
    notificationToAdd = {
      // CORRECTION: Utiliser l'ID existant pour les updates, nouveau pour les créations
      id: editingNotificationIndex !== null 
        ? notifications[editingNotificationIndex].id 
        : `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newNotification.title,
      message: newNotification.description,
      type: "information",
      // CORRECTION: Préserver la date originale pour les updates
      date: editingNotificationIndex !== null 
        ? notifications[editingNotificationIndex].date 
        : new Date().toISOString(),
      // CORRECTION: Préserver le statut de lecture pour les updates
      isRead: editingNotificationIndex !== null 
        ? notifications[editingNotificationIndex].isRead 
        : false,
      description: newNotification.description,
      link: newNotification.link, // IMPORTANT: Assurer la sauvegarde du lien
      contact: newNotification.contact,
    };
    
    console.log(`✅ Information notification ${editingNotificationIndex !== null ? 'updated' : 'created'}:`, {
      id: notificationToAdd.id,
      title: notificationToAdd.title,
      description: notificationToAdd.description,
      link: notificationToAdd.link,
      contact: notificationToAdd.contact,
      isUpdate: editingNotificationIndex !== null
    });
  }

  if (notificationToAdd) {
    setNotifications((prev) => {
      // CORRECTION: Logique d'update améliorée
      if (editingNotificationIndex !== null) {
        console.log(`✅ Updating notification at index ${editingNotificationIndex}`);
        const updated = [...prev];
        updated[editingNotificationIndex] = notificationToAdd;
        return updated;
      }
      
      // CORRECTION: Prévention des doublons améliorée
      const isDuplicate = prev.some(existing => 
        existing.id === notificationToAdd.id ||
        (existing.title === notificationToAdd.title && 
         existing.description === notificationToAdd.description)
      );
      
      if (isDuplicate) {
        console.log('⚠️ Duplicate notification detected, skipping...');
        return prev;
      }
      
      console.log('✅ Adding unique notification');
      return [...prev, notificationToAdd];
    });
    
    // CORRECTION: Reset du formulaire
    setNewNotification({
      message: "",
      type: "information",
      company: "",
      jobTitle: "",
      salary: "",
      contractType: "",
      contact: "",
      description: "",
      uploadLink: "",
      link: "",
      phone: "",
      email: "",
      title: "",
    });
    
    setEditingNotificationIndex(null);
  }
};

// 2. CORRECTION: Fonction de nettoyage des doublons
const cleanDuplicateNotifications = () => {
  setNotifications(prev => {
    // Grouper par contenu (titre + description)
    const groups = {};
    prev.forEach(notif => {
      const key = `${notif.title}-${notif.description}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(notif);
    });
    
    // Garder le meilleur de chaque groupe
    const cleaned = Object.values(groups).map(group => {
      if (group.length === 1) return group[0];
      
      // Prioriser: avec lien > plus récent
      return group.sort((a, b) => {
        const aHasLink = !!(a.link && a.link.trim());
        const bHasLink = !!(b.link && b.link.trim());
        
        if (aHasLink && !bHasLink) return -1;
        if (!aHasLink && bHasLink) return 1;
        
        return new Date(b.date) - new Date(a.date);
      })[0];
    });
    
    if (cleaned.length !== prev.length) {
      console.log(`🧹 Cleaned ${prev.length - cleaned.length} duplicate notifications`);
    }
    
    return cleaned;
  });
};

// 3. CORRECTION: Sauvegarde avec nettoyage préventif
const handleSubmit = (e) => {
  // ... code existant ...
  
  // CORRECTION: Nettoyer avant sauvegarde
  const uniqueNotifications = notifications.filter((notif, index, arr) => 
    arr.findIndex(n => n.id === notif.id) === index
  );
  
  if (uniqueNotifications.length !== notifications.length) {
    console.log(`🧹 Cleaned ${notifications.length - uniqueNotifications.length} duplicates before saving`);
  }
  
  // Utiliser les notifications nettoyées
  const dataToSubmit = {
    ...formData,
    formations: mergedFormations,
    projects,
    coachingResources,
    notifications: uniqueNotifications // CORRECTION: Utiliser les données nettoyées
  };
  
  // ... reste du code ...
};
