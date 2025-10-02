// Quick check des partenaires existants
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:3001/api';

async function quickCheck() {
    try {
        console.log('🔍 Vérification rapide des partenaires...\n');
        
        // 1. Lister tous les partenaires
        const response = await fetch(`${API_BASE}/partners`);
        const data = await response.json();
        
        if (response.ok && data.data) {
            console.log(`📊 Total partenaires: ${data.data.length}`);
            
            // Filtrer par type
            const entreprises = data.data.filter(p => p.type === 'entreprise');
            console.log(`🏢 Entreprises: ${entreprises.length}`);
            
            if (entreprises.length > 0) {
                console.log('\n📋 Liste des entreprises:');
                entreprises.forEach(p => {
                    console.log(`- ${p.partnerId} | ${p.fullName} | Actif: ${p.isActive}`);
                });
                
                // Tester avec la première entreprise
                const firstEnterprise = entreprises[0];
                console.log(`\n🧪 Test avec ${firstEnterprise.partnerId}...`);
                
                const testResponse = await fetch(`${API_BASE}/enterprise/${firstEnterprise.partnerId}/profile`);
                const testData = await testResponse.json();
                
                if (testResponse.ok) {
                    console.log('✅ Endpoint Enterprise fonctionne!');
                    console.log('📊 Profil récupéré:', testData.data?.fullName);
                } else {
                    console.log('❌ Endpoint Enterprise échoue:', testData.message);
                }
            } else {
                console.log('❌ Aucune entreprise trouvée!');
                console.log('💡 Créons une entreprise test...');
                
                const newEnterprise = {
                    fullName: 'Test Enterprise Real',
                    email: 'test-real@enterprise.com',
                    type: 'entreprise',
                    contactPerson: 'Test Manager',
                    isActive: true
                };
                
                const createResponse = await fetch(`${API_BASE}/partners`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newEnterprise)
                });
                
                if (createResponse.ok) {
                    const created = await createResponse.json();
                    console.log('✅ Entreprise créée:', created.data?.partnerId);
                } else {
                    const error = await createResponse.json();
                    console.log('❌ Erreur création:', error.message);
                }
            }
        } else {
            console.log('❌ Erreur récupération partenaires:', data.message);
        }
        
    } catch (error) {
        console.log('❌ Erreur:', error.message);
    }
}

quickCheck();
