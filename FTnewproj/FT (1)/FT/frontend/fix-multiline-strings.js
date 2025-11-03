const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files
function findAllTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAllTsxFiles(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Find all .tsx files
const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';
const allTsxFiles = findAllTsxFiles(basePath);

let fixedCount = 0;

allTsxFiles.forEach(fullPath => {
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Fix multi-line packageName strings
    const packageNamePattern = /packageName:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*\n\s*([^"]*)\s*Travel Packages"/g;
    if (packageNamePattern.test(content)) {
      content = content.replace(packageNamePattern, (match, part1, part2, part3) => {
        const cleanName = `${part1.trim()} ${part2.trim()} ${part3.trim()}`.replace(/\s+/g, ' ').trim();
        return `packageName: "${cleanName} Travel Packages"`;
      });
      hasChanges = true;
    }
    
    // Fix multi-line destination strings
    const destinationPattern = /destination:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*\n\s*([^"]*)\s*"/g;
    if (destinationPattern.test(content)) {
      content = content.replace(destinationPattern, (match, part1, part2, part3) => {
        const cleanDestination = `${part1.trim()} ${part2.trim()} ${part3.trim()}`.replace(/\s+/g, ' ').trim();
        return `destination: "${cleanDestination}"`;
      });
      hasChanges = true;
    }
    
    // Fix specific patterns that might have been missed
    const specificPatterns = [
      {
        search: /packageName:\s*"\s*\n\s*Multi City\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Multi City Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Multi City\s*\n\s*"/g,
        replace: 'destination: "Multi City"'
      },
      {
        search: /packageName:\s*"\s*\n\s*Europe\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Europe Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Europe\s*\n\s*"/g,
        replace: 'destination: "Europe"'
      },
      {
        search: /packageName:\s*"\s*\n\s*Middle East\s*\n\s*Travel Packages"/g,
        replace: 'packageName: "Middle East Travel Packages"'
      },
      {
        search: /destination:\s*"\s*\n\s*Middle East\s*\n\s*"/g,
        replace: 'destination: "Middle East"'
      }
    ];
    
    specificPatterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        hasChanges = true;
      }
    });
    
    // Add missing blank lines after imports if needed
    if (content.includes('import { useEnquiryModal } from "@/hooks/useEnquiryModal"\nconst ')) {
      content = content.replace(
        'import { useEnquiryModal } from "@/hooks/useEnquiryModal"\nconst ',
        'import { useEnquiryModal } from "@/hooks/useEnquiryModal"\n\nconst '
      );
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      fixedCount++;
      console.log(`Fixed: ${fullPath.replace(basePath, '')}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${fullPath}:`, error.message);
  }
});

console.log(`\nFixed ${fixedCount} files with multi-line string issues!`);
