const fs = require('fs');
const path = require('path');

// Remaining files that need fixes
const filesToFix = [
  'packages/scandinavia/page.tsx',
  'packages/south-east-asia/page.tsx',
  'packages/south-east-europe/page.tsx',
  'packages/sri-lanka-discovery/page.tsx',
  'packages/the-caribbean/bahamas/page.tsx'
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
        '"use client"\n\n',
        '"use client"\n\nimport React from "react"\n'
      );
      hasChanges = true;
    }
    
    // Add useEnquiryModal hook if missing but EnquiryModal is used
    if (content.includes('<EnquiryModal') && !content.includes('useEnquiryModal()')) {
      // Find the function declaration and add the hook
      const functionMatch = content.match(/export default function (\w+)\(\) \{/);
      if (functionMatch) {
        content = content.replace(
          functionMatch[0],
          `${functionMatch[0]}\n  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();`
        );
        hasChanges = true;
      }
    }
    
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

console.log('Final fixes completed!');
