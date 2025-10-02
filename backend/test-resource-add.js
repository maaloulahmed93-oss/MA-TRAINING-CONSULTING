import fetch from 'node-fetch';

async function testResourceAdd() {
  try {
    console.log('🔄 Testing resource addition via API...');
    
    // First, get current participant data
    console.log('📋 1. Getting current participant data...');
    const getResponse = await fetch('http://localhost:3001/api/participants/PART-550776');
    
    if (!getResponse.ok) {
      console.log('❌ Failed to get participant:', getResponse.status);
      return;
    }
    
    const currentData = await getResponse.json();
    if (!currentData.success) {
      console.log('❌ API returned error:', currentData.message);
      return;
    }
    
    console.log('✅ Current participant:', currentData.data.fullName);
    console.log('📚 Current resources:', currentData.data.coachingResources?.length || 0);
    
    // Prepare new resource data (exactly like Admin Panel would send)
    const newResource = {
      id: `RES-${Date.now()}`,
      title: 'Test Resource from API',
      description: 'This is a test resource added via direct API call',
      type: 'Guide',
      category: 'Ressources',
      thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
      downloadUrl: '',
      duration: '30 min',
      dataLinks: [{
        id: `link-${Date.now()}`,
        title: 'Lien principal',
        url: 'https://example.com/test-resource-api',
        type: 'external'
      }],
      assignedDate: new Date().toISOString(),
      accessedDate: null,
      isCompleted: false
    };
    
    // Add to existing resources
    const updatedResources = [...(currentData.data.coachingResources || []), newResource];
    
    const updatePayload = {
      ...currentData.data,
      coachingResources: updatedResources,
      updatedAt: new Date().toISOString()
    };
    
    console.log('📤 2. Sending update with new resource...');
    console.log('📋 Payload summary:');
    console.log(`   - Total resources: ${updatedResources.length}`);
    console.log(`   - New resource: ${newResource.title}`);
    console.log(`   - Type: ${newResource.type}`);
    console.log(`   - Category: ${newResource.category}`);
    
    // Send update
    const updateResponse = await fetch('http://localhost:3001/api/participants/PART-550776', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatePayload)
    });
    
    if (!updateResponse.ok) {
      console.log('❌ Update failed:', updateResponse.status);
      const errorText = await updateResponse.text();
      console.log('❌ Error details:', errorText);
      return;
    }
    
    const updateResult = await updateResponse.json();
    if (!updateResult.success) {
      console.log('❌ Update API returned error:', updateResult.message);
      return;
    }
    
    console.log('✅ Update successful!');
    
    // Verify the resource was saved
    console.log('🔍 3. Verifying resource was saved...');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
    
    const verifyResponse = await fetch('http://localhost:3001/api/participants/PART-550776');
    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      if (verifyData.success) {
        const resources = verifyData.data.coachingResources || [];
        console.log(`✅ Verification: Found ${resources.length} resources`);
        
        const addedResource = resources.find(r => r.title === 'Test Resource from API');
        if (addedResource) {
          console.log('✅ New resource found in database!');
          console.log(`   - Title: ${addedResource.title}`);
          console.log(`   - Type: ${addedResource.type}`);
          console.log(`   - Category: ${addedResource.category}`);
          console.log(`   - URL: ${addedResource.dataLinks?.[0]?.url || 'N/A'}`);
        } else {
          console.log('❌ New resource NOT found in database');
        }
      }
    }
    
    console.log('\n🎉 Test completed!');
    console.log('📝 Next steps:');
    console.log('1. Check Admin Panel to see if resource appears');
    console.log('2. Check Espace Participant to see if resource appears');
    console.log('3. If still not working, check browser console for errors');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testResourceAdd();
