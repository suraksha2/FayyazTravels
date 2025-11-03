const fs = require('fs');
const path = require('path');

// Files with broken imports inside strings
const filesToFix = [
  'packages/group-tours/group-tour/page.tsx',
  'packages/group-tours/kashmir-group-tour/page.tsx', 
  'packages/group-tours/page.tsx',
  'packages/japan-explorer/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Fix broken fetch URLs
    content = content.replace(
      /const response = await fetch\('\s*import EnquiryModal.*?http:\/\/localhost:3003([^']+)'\)/gs,
      "const response = await fetch('http://localhost:3003$1')"
    );
    
    // Fix broken titles
    content = content.replace(
      /title: "\s*import EnquiryModal.*?([^"]+)"/gs,
      'title: "$1"'
    );
    
    // Fix broken Link imports
    content = content.replace(
      /import Link from "\s*import EnquiryModal.*?next\/link"/gs,
      'import Link from "next/link"'
    );
    
    // Remove any stray import statements that got inserted in wrong places
    content = content.replace(
      /import EnquiryModal from "@\/components\/EnquiryModal"\s*import \{ useEnquiryModal \} from "@\/hooks\/useEnquiryModal"/g,
      ''
    );
    
    // Ensure proper imports at the top
    if (!content.includes('import EnquiryModal from "@/components/EnquiryModal"')) {
      content = content.replace(
        'import Link from "next/link"',
        `import Link from "next/link"
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`
      );
    }
    
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${file}`);
    
  } catch (error) {
    console.error(`Error processing ${file}:`, error.message);
  }
});

console.log('Broken imports fixed!');
