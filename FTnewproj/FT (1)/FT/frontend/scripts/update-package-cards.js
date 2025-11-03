const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

// Function to recursively find all .tsx files in a directory
async function findTsxFiles(dir) {
  const dirents = fs.readdirSync(dir, { withFileTypes: true });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = path.resolve(dir, dirent.name);
    return dirent.isDirectory() ? findTsxFiles(res) : res;
  }));
  return Array.prototype.concat(...files)
    .filter(file => file.endsWith('page.tsx') && !file.includes('[id]'));
}

// Function to update a file to make package cards clickable
async function updateFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    let content = await readFile(filePath, 'utf8');
    
    // Check if the file contains package cards
    if (!content.includes('className="bg-white rounded-lg overflow-hidden shadow-lg')) {
      console.log(`Skipping ${filePath} - no package cards found`);
      return false;
    }
    
    // Check if the file is already updated
    if (content.includes('onClick={() => window.location.href = `/packages/details/')) {
      console.log(`Skipping ${filePath} - already updated`);
      return false;
    }
    
    // Update package card to be clickable
    content = content.replace(
      /<div key=\{pkg\.id\} className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">/g,
      `<div 
              key={pkg.id} 
              className="bg-white rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 cursor-pointer"
              onClick={() => window.location.href = \`/packages/details/\${pkg.id}\`}
            >`
    );
    
    // Update Book Now button to navigate to booking page and prevent event propagation
    content = content.replace(
      /<Button className="w-full bg-\[#002147\] hover:bg-\[#001a38\] text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0\.5">\s*Book Now\s*<\/Button>/g,
      `<Button 
                  className="w-full bg-[#002147] hover:bg-[#001a38] text-white transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = \`/packages/booking/\${pkg.id}\`;
                  }}
                >
                  Book Now
                </Button>`
    );
    
    await writeFile(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  const packagesDir = path.resolve(__dirname, '../app/packages');
  const tsxFiles = await findTsxFiles(packagesDir);
  
  console.log(`Found ${tsxFiles.length} TSX files`);
  
  let updatedCount = 0;
  for (const file of tsxFiles) {
    const updated = await updateFile(file);
    if (updated) updatedCount++;
  }
  
  console.log(`Updated ${updatedCount} files successfully`);
}

main().catch(console.error);
