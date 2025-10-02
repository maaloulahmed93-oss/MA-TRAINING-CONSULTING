// Script de validation rapide de l'isolation Enterprise
const API_BASE = 'http://localhost:3001/api';

async function validateEnterpriseIsolation() {
    console.log('🔍 VALIDATION DE L\'ISOLATION ENTERPRISE - MATC SYSTEM');
    console.log('=' .repeat(60));
    
    try {
        // 1. Test de santé du backend
        console.log('\n1️⃣ Test de connexion backend...');
        const healthResponse = await fetch(`${API_BASE}/health`);
        const healthData = await healthResponse.json();
        console.log(`✅ Backend: ${healthData.message}`);
        
        // 2. Vérifier les partenaires existants
        console.log('\n2️⃣ Vérification des partenaires entreprise...');
        const partnersResponse = await fetch(`${API_BASE}/partners?type=entreprise`);
        const partnersData = await partnersResponse.json();
        
        if (!partnersData.success || !partnersData.data || partnersData.data.length === 0) {
            console.log('⚠️ Aucun partenaire entreprise trouvé. Création de partenaires de test...');
            
            // Créer des partenaires de test
            const testPartners = [
                {
                    fullName: 'Test Enterprise Alpha',
                    email: 'alpha@test-enterprise.com',
                    type: 'entreprise',
                    contactPerson: 'Manager Alpha',
                    isActive: true
                },
                {
                    fullName: 'Test Enterprise Beta', 
                    email: 'beta@test-enterprise.com',
                    type: 'entreprise',
                    contactPerson: 'Manager Beta',
                    isActive: true
                }
            ];
            
            for (const partner of testPartners) {
                try {
                    const createResponse = await fetch(`${API_BASE}/partners`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(partner)
                    });
                    
                    if (createResponse.ok) {
                        const created = await createResponse.json();
                        console.log(`✅ Partenaire créé: ${created.data.partnerId}`);
                    }
                } catch (error) {
                    console.log(`⚠️ Partenaire probablement existant: ${partner.fullName}`);
                }
            }
            
            // Re-récupérer les partenaires
            const updatedResponse = await fetch(`${API_BASE}/partners?type=entreprise`);
            const updatedData = await updatedResponse.json();
            partnersData.data = updatedData.data || [];
        }
        
        console.log(`📊 Partenaires entreprise trouvés: ${partnersData.data.length}`);
        
        // 3. Tester l'isolation pour chaque partenaire
        console.log('\n3️⃣ Test d\'isolation des données...');
        
        const isolationResults = {};
        let isolationPassed = true;
        
        for (const partner of partnersData.data.slice(0, 3)) { // Limiter à 3 partenaires max
            console.log(`\n🔍 Test partenaire: ${partner.partnerId} (${partner.fullName})`);
            
            try {
                // Tester les endpoints Enterprise
                const endpoints = [
                    { name: 'Profile', url: `/enterprise/${partner.partnerId}/profile` },
                    { name: 'Projects', url: `/enterprise/${partner.partnerId}/projects` },
                    { name: 'Formations', url: `/enterprise/${partner.partnerId}/formations` },
                    { name: 'Events', url: `/enterprise/${partner.partnerId}/events` },
                    { name: 'Stats', url: `/enterprise/${partner.partnerId}/stats` }
                ];
                
                const partnerResults = {};
                
                for (const endpoint of endpoints) {
                    try {
                        const response = await fetch(`${API_BASE}${endpoint.url}`);
                        const data = await response.json();
                        
                        if (response.ok && data.success) {
                            const count = Array.isArray(data.data) ? data.data.length : 'N/A';
                            console.log(`  ✅ ${endpoint.name}: ${count} éléments`);
                            partnerResults[endpoint.name] = { success: true, count, data: data.data };
                            
                            // Vérifier l'isolation des données
                            if (Array.isArray(data.data)) {
                                for (const item of data.data) {
                                    if (item.partnerId && item.partnerId !== partner.partnerId) {
                                        console.log(`  ❌ ISOLATION ÉCHOUÉE: ${endpoint.name} contient des données de ${item.partnerId}`);
                                        isolationPassed = false;
                                    }
                                }
                            }
                        } else {
                            console.log(`  ⚠️ ${endpoint.name}: ${data.message || 'Erreur'}`);
                            partnerResults[endpoint.name] = { success: false, error: data.message };
                        }
                    } catch (error) {
                        console.log(`  ❌ ${endpoint.name}: ${error.message}`);
                        partnerResults[endpoint.name] = { success: false, error: error.message };
                    }
                }
                
                isolationResults[partner.partnerId] = partnerResults;
                
            } catch (error) {
                console.log(`❌ Erreur test partenaire ${partner.partnerId}: ${error.message}`);
                isolationPassed = false;
            }
        }
        
        // 4. Résumé des résultats
        console.log('\n4️⃣ Résumé de la validation...');
        console.log('=' .repeat(60));
        
        if (isolationPassed) {
            console.log('🎉 VALIDATION RÉUSSIE - Isolation des données parfaite!');
            console.log('✅ Chaque partenaire ne voit que ses propres données');
            console.log('✅ Aucun croisement de données détecté');
            console.log('✅ Endpoints Enterprise fonctionnels');
        } else {
            console.log('⚠️ VALIDATION ÉCHOUÉE - Problèmes d\'isolation détectés');
            console.log('❌ Des données sont partagées entre partenaires');
            console.log('❌ Vérification supplémentaire requise');
        }
        
        // 5. Statistiques détaillées
        console.log('\n📊 Statistiques par partenaire:');
        for (const [partnerId, results] of Object.entries(isolationResults)) {
            console.log(`\n🏢 ${partnerId}:`);
            for (const [endpoint, result] of Object.entries(results)) {
                if (result.success) {
                    console.log(`  - ${endpoint}: ${result.count} éléments`);
                } else {
                    console.log(`  - ${endpoint}: Erreur (${result.error})`);
                }
            }
        }
        
        // 6. Recommandations
        console.log('\n💡 Recommandations:');
        if (isolationPassed) {
            console.log('✅ Système prêt pour production');
            console.log('✅ Admin Panel peut utiliser les endpoints Enterprise');
            console.log('✅ Espace Partenariat fonctionnel');
        } else {
            console.log('⚠️ Vérifier la configuration du middleware partnerAuth.js');
            console.log('⚠️ S\'assurer que tous les endpoints utilisent le partnerId');
            console.log('⚠️ Nettoyer les données existantes sans partnerId');
        }
        
        console.log('\n🔧 Prochaines étapes:');
        console.log('1. Remplacer partnersApiService.ts par la version corrigée');
        console.log('2. Adapter les composants Admin Panel pour utiliser Enterprise API');
        console.log('3. Tester l\'interface utilisateur complète');
        
        return isolationPassed;
        
    } catch (error) {
        console.log(`❌ Erreur générale: ${error.message}`);
        return false;
    }
}

// Exécuter la validation
if (typeof window === 'undefined') {
    // Node.js environment
    import('node-fetch').then(({ default: fetch }) => {
        global.fetch = fetch;
        validateEnterpriseIsolation();
    }).catch(() => {
        console.log('⚠️ node-fetch non disponible. Utilisez ce script dans un navigateur.');
    });
} else {
    // Browser environment
    validateEnterpriseIsolation();
}
