// Script to update package IDs in frontend pages to match backend IDs
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Backend package IDs and titles mapping
const backendPackages = [
  { id: 1, title: "Taiwan Odyssey", destination: "Taiwan" },
  { id: 2, title: "Serengeti Safari", destination: "Tanzania" },
  { id: 3, title: "Northern Lights Adventure", destination: "Sweden" },
  { id: 4, title: "Japan Explorer", destination: "Japan" },
  { id: 5, title: "Vietnam Discovery", destination: "Vietnam" },
  { id: 6, title: "Thailand Adventure", destination: "Thailand" },
  { id: 7, title: "Maldives Paradise", destination: "Maldives" }
  // Add more as needed
];

// Map destination to package ID
const destinationToIdMap = {};
backendPackages.forEach(pkg => {
  if (!destinationToIdMap[pkg.destination]) {
    destinationToIdMap[pkg.destination] = [];
  }
  destinationToIdMap[pkg.destination].push(pkg.id);
});

// Function to recursively find all page.tsx files
async function findPageFiles(dir) {
  const packagesDir = path.join(dir, 'app', 'packages');
  const results = [];
  
  async function scan(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        await scan(fullPath);
      } else if (entry.name === 'page.tsx' && !fullPath.includes('details') && !fullPath.includes('booking')) {
        results.push(fullPath);
      }
    }
  }
  
  await scan(packagesDir);
  return results;
}

// Function to update package IDs in a file
async function updatePackageIds(filePath) {
  try {
    console.log(`Processing ${filePath}`);
    let content = await readFile(filePath, 'utf8');
    
    // Extract destination from file path
    const pathParts = filePath.split(path.sep);
    const destinationIndex = pathParts.indexOf('packages') + 1;
    let destination = '';
    
    if (destinationIndex < pathParts.length) {
      destination = pathParts[destinationIndex + 1]; // Get the destination folder name
      destination = destination.charAt(0).toUpperCase() + destination.slice(1); // Capitalize
    }
    
    // Find matching backend IDs for this destination
    const matchingIds = destinationToIdMap[destination] || [];
    
    if (matchingIds.length > 0) {
      // Replace frontend IDs with backend IDs
      let idCounter = 0;
      content = content.replace(/id:\s*(\d+)/g, (match, id) => {
        if (idCounter < matchingIds.length) {
          return `id: ${matchingIds[idCounter++]}`;
        }
        return match;
      });
      
      await writeFile(filePath, content, 'utf8');
      console.log(`Updated ${filePath} with backend IDs`);
      return true;
    } else {
      console.log(`No matching backend IDs found for ${destination}`);
      return false;
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  const frontendDir = path.resolve(__dirname, '..');
  const pageFiles = await findPageFiles(frontendDir);
  
  console.log(`Found ${pageFiles.length} page files to process`);
  
  let updatedCount = 0;
  for (const file of pageFiles) {
    const updated = await updatePackageIds(file);
    if (updated) updatedCount++;
  }
  
  console.log(`Updated ${updatedCount} files successfully`);
}

main().catch(console.error);
