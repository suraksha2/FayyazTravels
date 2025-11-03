// Simple API test script
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3002';

async function apiFetch(path) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${path}:`, error);
    return null;
  }
}

async function testAPI() {
  console.log('Testing API connections...');
  
  // Test package categories
  console.log('\n1. Testing package categories:');
  const categories = await apiFetch('/packages/categories');
  console.log('Package categories:', categories);
  
  // Test package destinations
  console.log('\n2. Testing package destinations:');
  const packageDestinations = await apiFetch('/packages/destinations');
  console.log('Package destinations:', packageDestinations);
  
  // Test destination countries
  console.log('\n3. Testing destination countries:');
  const countries = await apiFetch('/destinations/countries');
  console.log('Destination countries:', countries);
  
  // Test packages
  console.log('\n4. Testing packages:');
  const packages = await apiFetch('/packages');
  console.log('Packages count:', packages?.length || 0);
  console.log('First package sample:', packages?.[0]);
  
  // Test destinations
  console.log('\n5. Testing destinations:');
  const destinations = await apiFetch('/destinations');
  console.log('Destinations count:', destinations?.length || 0);
  console.log('First destination sample:', destinations?.[0]);
}

testAPI().then(() => console.log('\nAPI testing complete!'));
