// Script pour créer un formateur de test
const API_BASE = 'http://localhost:3001/api';

async function createTestFormateur() {
    try {
        console.log('🔍 Vérification des formateurs existants...');
        
        // Vérifier les formateurs existants
        const listResponse = await fetch(`${API_BASE}/partners?type=formateur`);
        const listData = await listResponse.json();
        
        console.log(`📊 Formateurs trouvés: ${listData.data?.length || 0}`);
        
        if (listData.data && listData.data.length > 0) {
            console.log('✅ Formateurs existants:');
            listData.data.forEach(f => {
                console.log(`  - ${f.partnerId}: ${f.fullName} (${f.email}) - Actif: ${f.isActive}`);
            });
            
            // Tester la connexion avec le premier formateur
            const firstFormateur = listData.data[0];
            console.log(`\n🔐 Test de connexion avec ${firstFormateur.partnerId}...`);
            
            const loginResponse = await fetch(`${API_BASE}/partners/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    partnerId: firstFormateur.partnerId
                })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.success) {
                console.log('✅ Connexion réussie!');
                console.log(`   Formateur: ${loginData.data.fullName}`);
                console.log(`   Email: ${loginData.data.email}`);
                console.log(`   ID: ${loginData.data.partnerId}`);
            } else {
                console.log('❌ Échec de la connexion:', loginData.message);
            }
            
            return;
        }
        
        console.log('📝 Création d\'un nouveau formateur de test...');
        
        // Créer un nouveau formateur
        const createResponse = await fetch(`${API_BASE}/partners`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fullName: 'Ahmed Test Formateur',
                email: 'ahmed.formateur@matc.com',
                type: 'formateur',
                formateurInfo: {
                    specialites: ['Web Development', 'JavaScript', 'React'],
                    experience: 5,
                    tarifHoraire: 50,
                    certifications: ['React Developer', 'JavaScript Expert'],
                    disponibilite: 'Temps plein'
                }
            })
        });
        
        const createData = await createResponse.json();
        
        if (createResponse.ok && createData.success) {
            console.log('✅ Formateur créé avec succès!');
            console.log(`   ID: ${createData.data.partnerId}`);
            console.log(`   Nom: ${createData.data.fullName}`);
            console.log(`   Email: ${createData.data.email}`);
            
            // Tester la connexion immédiatement
            console.log(`\n🔐 Test de connexion avec le nouveau formateur...`);
            
            const loginResponse = await fetch(`${API_BASE}/partners/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    partnerId: createData.data.partnerId
                })
            });
            
            const loginData = await loginResponse.json();
            
            if (loginResponse.ok && loginData.success) {
                console.log('✅ Connexion réussie!');
                console.log('🎉 Le système formateur fonctionne correctement!');
            } else {
                console.log('❌ Échec de la connexion:', loginData.message);
            }
            
        } else {
            console.log('❌ Erreur lors de la création:', createData.message);
        }
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    }
}

// Tester la santé de l'API d'abord
async function testApiHealth() {
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        if (response.ok) {
            console.log('✅ API Health Check réussi:', data.message);
            return true;
        } else {
            console.log('❌ API Health Check échoué:', data.message);
            return false;
        }
    } catch (error) {
        console.log('❌ Impossible de se connecter à l\'API:', error.message);
        return false;
    }
}

// Exécution principale
async function main() {
    console.log('🚀 Test du système formateur MATC\n');
    
    const apiHealthy = await testApiHealth();
    if (!apiHealthy) {
        console.log('❌ L\'API n\'est pas disponible. Vérifiez que le backend est démarré sur le port 3001.');
        return;
    }
    
    console.log('');
    await createTestFormateur();
}

main();
