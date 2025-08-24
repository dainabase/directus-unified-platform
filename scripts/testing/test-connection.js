#!/usr/bin/env node

import axios from 'axios';

const API_URL = 'http://localhost:8055';
const TOKEN = 'e6Vt5LRHnYhq7-78yzoSxwdgjn2D6-JW';

async function testConnection() {
  console.log('🔗 Testing Directus API connection...');
  
  try {
    // Test 1: Ping
    const pingResponse = await axios.get(`${API_URL}/server/ping`);
    console.log('✅ Ping successful:', pingResponse.data);
    
    // Test 2: Collections avec auth
    const collectionsResponse = await axios.get(`${API_URL}/collections`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log(`✅ Collections retrieved: ${collectionsResponse.data.data.length} found`);
    console.log('📋 Sample collections:', collectionsResponse.data.data.slice(0, 5).map(c => c.collection).join(', '));
    
    // Test 3: Test sur projects
    const projectsResponse = await axios.get(`${API_URL}/items/projects?limit=1`, {
      headers: { Authorization: `Bearer ${TOKEN}` }
    });
    
    console.log(`✅ Projects test: ${projectsResponse.data.data.length} projects found`);
    
    console.log('🎉 All connection tests passed!');
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection();