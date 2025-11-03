const fs = require('fs');
const path = require('path');

// Remaining files that need fixing
const filesToFix = [
  'packages/africa/egypt/page.tsx',
  'packages/africa/kenya/page.tsx',
  'packages/africa/south-africa/page.tsx',
  'packages/africa/tanzania/page.tsx',
  'packages/africa/tunisia/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // For Egypt - fix the broken fetch string
    if (file.includes('egypt')) {
      content = content.replace(
        /const response = await fetch\('\s*import EnquiryModal.*?http:\/\/localhost:3003\/destination\/africa\/africa-egypt'\)/gs,
        "const response = await fetch('http://localhost:3003/destination/africa/africa-egypt')"
      );
    }
    
    // Find where the duplicate content starts (look for the pattern with numbers + "use client")
    const duplicatePattern = /\d+"use client"/;
    const match = content.match(duplicatePattern);
    
    if (match) {
      // Find the position where the duplicate starts
      const duplicateStart = content.indexOf(match[0]);
      // Find the last proper closing of the function before the duplicate
      const beforeDuplicate = content.substring(0, duplicateStart);
      
      // Look for the last closing brace that should end the function
      const lines = beforeDuplicate.split('\n');
      let properEndLine = -1;
      
      // Find the line with just a closing brace or closing brace followed by whitespace
      for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() === '}' || lines[i].match(/^\s*}\s*$/)) {
          properEndLine = i;
          break;
        }
      }
      
      if (properEndLine !== -1) {
        // Keep content up to the proper function end
        const cleanLines = lines.slice(0, properEndLine + 1);
        let cleanContent = cleanLines.join('\n');
        
        // Add missing imports at the top if not present
        if (!cleanContent.includes('import EnquiryModal')) {
          cleanContent = cleanContent.replace(
            'import Image from \'next/image\';',
            `import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`
          );
        }
        
        fs.writeFileSync(fullPath, cleanContent);
        console.log(`Fixed: ${file}`);
      } else {
        console.log(`Could not find proper function end in: ${file}`);
      }
    } else {
      console.log(`No duplicate pattern found in: ${file}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Remaining Africa files processed!');
