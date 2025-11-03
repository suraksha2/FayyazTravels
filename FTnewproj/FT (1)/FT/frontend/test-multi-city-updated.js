// Test script for Multi City API integration with updated endpoint
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
  console.log('Testing Multi City API integration with updated endpoint...');
  
  // Test the new multi-city endpoint
  console.log('\n1. Testing multi-city destinations endpoint:');
  const multiCityDestinations = await apiFetch('/packages/multi-city');
  
  console.log('Multi City destinations count:', multiCityDestinations?.length || 0);
  if (multiCityDestinations && multiCityDestinations.length > 0) {
    console.log('Multi City destinations:');
    multiCityDestinations.forEach(dest => console.log(`- ${dest}`));
  } else {
    console.log('No Multi City destinations found');
  }
  
  return { multiCityDestinations };
}

testMultiCityAPI().then(({ multiCityDestinations }) => {
  console.log('\nAPI testing complete!');
  
  if (!multiCityDestinations || multiCityDestinations.length === 0) {
    console.log('\nWARNING: No Multi City destinations found. Check the backend endpoint.');
  } else {
    console.log('\nSUCCESS: Multi City destinations are now available from the API!');
  }
});
