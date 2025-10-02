const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3001/api';
const PARTICIPANT_ID = 'PART-177037';
const TEST_URL = 'https://tv.animerco.org/';

async function fixProjectURL() {
  try {
    console.log('🔄 Fixing project URL via API...');
    
    // 1. Test backend connection
    console.log('1. Testing backend connection...');
    const healthResponse = await fetch(`${API_BASE}/participants`);
    if (!healthResponse.ok) {
      throw new Error(`Backend not available - Status: ${healthResponse.status}`);
    }
    console.log('✅ Backend is running');

    // 2. Get participant data
    console.log('2. Getting participant data...');
    const getResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}`);
    const participantData = await getResponse.json();
    
    if (!participantData.success) {
      throw new Error('Participant not found');
    }
    
    console.log(`✅ Participant found: ${participantData.data.fullName}`);
    console.log(`📊 Projects count: ${participantData.data.projects.length}`);
    
    // 3. Show current projects
    console.log('3. Current projects:');
    participantData.data.projects.forEach((project, index) => {
      console.log(`  ${index + 1}. ${project.title}`);
      console.log(`     projectUrl: "${project.projectUrl || 'EMPTY'}"`);
    });

    // 4. Find target project
    let targetProject = participantData.data.projects.find(p => 
      p.title.toLowerCase().includes('cima')
    );
    
    if (!targetProject) {
      targetProject = participantData.data.projects[0];
      console.log(`⚠️ Project "cima" not found, updating: ${targetProject.title}`);
    } else {
      console.log(`🎯 Target project found: ${targetProject.title}`);
    }

    // 5. Update project
    console.log(`4. Updating project "${targetProject.title}"`);
    console.log(`  From: "${targetProject.projectUrl || 'EMPTY'}"`);
    console.log(`  To: "${TEST_URL}"`);
    
    const updatedProjects = participantData.data.projects.map(project => {
      if (project.title === targetProject.title) {
        return { ...project, projectUrl: TEST_URL };
      }
      return project;
    });

    // 6. Send update
    console.log('5. Sending update request...');
    const updateResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...participantData.data,
        projects: updatedProjects
      })
    });

    const updateResult = await updateResponse.json();
    
    if (updateResult.success) {
      console.log('✅ Update successful!');
      
      // 7. Verify update
      console.log('6. Verifying update...');
      const verifyResponse = await fetch(`${API_BASE}/participants/${PARTICIPANT_ID}/projects`);
      const verifyData = await verifyResponse.json();
      
      if (verifyData.success && verifyData.data.length > 0) {
        const updatedProject = verifyData.data.find(p => p.title === targetProject.title);
        
        if (updatedProject) {
          console.log(`📋 Project after update:`);
          console.log(`  Title: ${updatedProject.title}`);
          console.log(`  projectUrl: "${updatedProject.projectUrl || 'EMPTY'}"`);
          console.log(`  Update success: ${updatedProject.projectUrl === TEST_URL ? '✅ YES' : '❌ NO'}`);
          
          if (updatedProject.projectUrl === TEST_URL) {
            console.log('\n🎉 Fix completed successfully!');
            console.log('📋 Next steps:');
            console.log('  1. Refresh Frontend page (F5)');
            console.log('  2. Test participant space');
            console.log('  3. Look for "Lien du projet" section in project card');
            console.log('  4. Check for blue link section');
            console.log(`  5. Click the link: ${TEST_URL}`);
            
            console.log('\n📝 Expected Frontend Console Logs:');
            console.log(`  🔍 Analyzing project data: {projectUrl: "${TEST_URL}", hasProjectUrl: true}`);
            console.log(`  ✅ Transformed project: {projectUrl: "${TEST_URL}", hasUrl: true}`);
            console.log(`  🔗 Ouverture du lien projet: ${TEST_URL}`);
          }
        }
      }
      
    } else {
      throw new Error(updateResult.message || 'Update failed');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🛠️ Solutions:');
    console.log('  • Make sure Backend is running on localhost:3001');
    console.log('  • Restart Backend: npm run dev');
    console.log('  • Check Backend console logs');
    console.log('  • Try again in a minute');
  }
}

fixProjectURL();
