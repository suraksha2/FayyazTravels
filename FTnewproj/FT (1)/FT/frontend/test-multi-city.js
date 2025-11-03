// Test script for Multi City API integration
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

async function testMultiCityAPI() {
  console.log('Testing Multi City API integration...');
  
  // Test packages with Multi City category
  console.log('\n1. Testing packages with Multi City category:');
  const queryParams = new URLSearchParams();
  queryParams.append('category', 'Multi City');
  const packages = await apiFetch(`/packages?${queryParams.toString()}`);
  
  console.log('Multi City packages count:', packages?.length || 0);
  if (packages && packages.length > 0) {
    console.log('Multi City destinations:');
    const destinations = [...new Set(packages.map(pkg => pkg.destination))];
    destinations.forEach(dest => console.log(`- ${dest}`));
  } else {
    console.log('No Multi City packages found');
  }
  
  // Test destination countries
  console.log('\n2. Testing destination countries:');
  const countries = await apiFetch('/destinations/countries');
  console.log('Countries count:', countries?.length || 0);
  console.log('Sample countries:', countries?.slice(0, 5));
  
  return { packages, countries };
}

testMultiCityAPI().then(({ packages }) => {
  console.log('\nAPI testing complete!');
  
  if (!packages || packages.length === 0) {
    console.log('\nWARNING: No Multi City packages found. The Multi City dropdown will fall back to default data.');
    console.log('To fix this, ensure there are packages with the "Multi City" category in the backend.');
  }
});
