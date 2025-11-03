const fs = require('fs');
const path = require('path');

// Files that have duplicate content issues
const filesToFix = [
  'packages/africa/malawi/page.tsx',
  'packages/africa/mauritius/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find the pattern where duplicate content starts
    // Look for the pattern: }\d+"use client" which indicates duplicate content
    const duplicatePattern = /}\s*\d+"use client"/;
    const match = content.match(duplicatePattern);
    
    if (match) {
      // Find the position where the duplicate starts
      const duplicateStart = content.indexOf(match[0]);
      // Keep only content up to the first closing brace
      const cleanContent = content.substring(0, duplicateStart + 1);
      
      fs.writeFileSync(fullPath, cleanContent);
      console.log(`Fixed duplicate content in: ${file}`);
    } else {
      console.log(`No duplicate pattern found in: ${file}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Duplicate content cleanup completed!');
