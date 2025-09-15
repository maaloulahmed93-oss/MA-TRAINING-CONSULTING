// MongoDB Playground pour tester la base de données MATC
// Connexion: mongodb+srv://matc:matc44172284@matc.so6zd1x.mongodb.net/matc_db

// Utiliser la base de données matc_db
use('matc_db');

// 1. Vérifier les collections existantes
db.runCommand("listCollections").cursor.firstBatch.forEach(
  function(collection) {
    print("Collection: " + collection.name);
  }
);

// 2. Compter le nombre de programmes
print("Nombre total de programmes: " + db.programs.countDocuments());

// 3. Afficher tous les programmes
print("=== TOUS LES PROGRAMMES ===");
db.programs.find().forEach(function(program) {
  print("ID: " + program._id);
  print("Titre: " + program.title);
  print("Prix: " + program.price + "€");
  print("Catégorie: " + program.category);
  print("---");
});

// 4. Rechercher des programmes avec prix = 0
print("=== PROGRAMMES AVEC PRIX 0€ ===");
db.programs.find({price: 0}).forEach(function(program) {
  print("Titre: " + program.title + " - Prix: " + program.price + "€");
});

// 5. Supprimer les programmes de test (optionnel - décommentez si nécessaire)
// db.programs.deleteMany({title: {$regex: /test/i}});

// 6. Insérer un programme de test
db.programs.insertOne({
  title: "Programme Test MongoDB",
  description: "Programme créé directement depuis MongoDB Playground",
  category: "Technologies",
  level: "Débutant",
  price: 150,
  duration: "2 semaines",
  maxParticipants: 15,
  sessionsPerYear: 6,
  modules: [
    { title: "Module 1: Introduction" },
    { title: "Module 2: Pratique" }
  ],
  sessions: [
    { title: "Session 1", date: "2024-02-01" },
    { title: "Session 2", date: "2024-02-08" }
  ],
  createdAt: new Date(),
  updatedAt: new Date()
});

print("Programme de test ajouté!");
