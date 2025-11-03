const fs = require('fs');
const path = require('path');

// Files that need fixing based on the grep search results
const filesToFix = [
  'packages/the-caribbean/page.tsx',
  'packages/the-caribbean/anguilla/page.tsx', 
  'packages/the-caribbean/antigua-and-barbuda/page.tsx',
  'packages/the-caribbean/bahamas/page.tsx',
  'packages/south-america/page.tsx',
  'packages/group-tours/turkey-georgia-azerbaijan/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix broken multi-line strings in packageName
    content = content.replace(
      /packageName:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*\n\s*([^"]*)\s*Travel Packages"/g,
      (match, part1, part2, part3) => {
        const cleanName = `${part1.trim()} ${part2.trim()} ${part3.trim()}`.replace(/\s+/g, ' ').trim();
        return `packageName: "${cleanName} Travel Packages"`;
      }
    );
    
    // Fix broken multi-line strings in destination
    content = content.replace(
      /destination:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*\n\s*([^"]*)\s*"/g,
      (match, part1, part2, part3) => {
        const cleanDestination = `${part1.trim()} ${part2.trim()} ${part3.trim()}`.replace(/\s+/g, ' ').trim();
        return `destination: "${cleanDestination}"`;
      }
    );
    
    // More specific patterns for different cases
    const patterns = [
      {
        // The Caribbean pattern
        search: /packageName:\s*"\s*\n\s*The Caribbean\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "The Caribbean Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*The Caribbean\s*\n\s*"/g,
        replace: 'destination: "The Caribbean"'
      },
      {
        // Anguilla pattern
        search: /packageName:\s*"\s*\n\s*Anguilla\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Anguilla Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Anguilla\s*\n\s*"/g,
        replace: 'destination: "Anguilla"'
      },
      {
        // Antigua & Barbuda pattern
        search: /packageName:\s*"\s*\n\s*Antigua & Barbuda\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Antigua & Barbuda Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Antigua & Barbuda\s*\n\s*"/g,
        replace: 'destination: "Antigua & Barbuda"'
      },
      {
        // Bahamas pattern
        search: /packageName:\s*"\s*\n\s*Bahamas\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Bahamas Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Bahamas\s*\n\s*"/g,
        replace: 'destination: "Bahamas"'
      },
      {
        // South America pattern
        search: /packageName:\s*"\s*\n\s*South America\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "South America Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*South America\s*\n\s*"/g,
        replace: 'destination: "South America"'
      },
      {
        // Turkey - Georgia - Azerbaijan pattern
        search: /packageName:\s*"\s*\n\s*Turkey - Georgia - Azerbaijan\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Turkey - Georgia - Azerbaijan Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Turkey - Georgia - Azerbaijan\s*\n\s*"/g,
        replace: 'destination: "Turkey - Georgia - Azerbaijan"'
      }
    ];
    
    patterns.forEach(pattern => {
      content = content.replace(pattern.search, pattern.replace);
    });
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${file}`);
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('All syntax errors fixed!');
