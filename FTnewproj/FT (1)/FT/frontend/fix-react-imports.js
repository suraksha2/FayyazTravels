const fs = require('fs');
const path = require('path');

// Files that are failing with "Unexpected token `main`" errors
const filesToFix = [
  'packages/multi-city/austria-switzerland/page.tsx',
  'packages/multi-city/bulgaria-greece/page.tsx',
  'packages/multi-city/panama-costa-rica/page.tsx',
  'packages/multi-city/paris-switzerland/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Add React import if missing and file uses JSX
    if (!content.includes('import React from "react"') && content.includes('<main')) {
      content = content.replace(
        '"use client"\n\nimport',
        '"use client"\n\nimport React from "react"\nimport'
      );
      hasChanges = true;
    }
    
    // Fix any remaining multi-line strings
    const multilinePatterns = [
      {
        search: /packageName:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*Travel Packages"/g,
        replace: (match, part1, part2) => {
          const cleanName = `${part1.trim()} ${part2.trim()}`.replace(/\s+/g, ' ').trim();
          return `packageName: "${cleanName} Travel Packages"`;
        }
      },
      {
        search: /destination:\s*"\s*\n\s*([^"]+)\s*\n\s*([^"]*)\s*"/g,
        replace: (match, part1, part2) => {
          const cleanDestination = `${part1.trim()} ${part2.trim()}`.replace(/\s+/g, ' ').trim();
          return `destination: "${cleanDestination}"`;
        }
      }
    ];
    
    multilinePatterns.forEach(pattern => {
      if (pattern.search.test(content)) {
        content = content.replace(pattern.search, pattern.replace);
        hasChanges = true;
      }
    });
    
    // Add missing blank lines after imports
    if (content.includes('import { useEnquiryModal } from "@/hooks/useEnquiryModal"\nconst ')) {
      content = content.replace(
        'import { useEnquiryModal } from "@/hooks/useEnquiryModal"\nconst ',
        'import { useEnquiryModal } from "@/hooks/useEnquiryModal"\n\nconst '
      );
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed: ${file}`);
    } else {
      console.log(`No changes needed: ${file}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('React imports and final fixes completed!');
