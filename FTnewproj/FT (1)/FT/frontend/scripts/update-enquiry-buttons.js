#!/usr/bin/env node

/**
 * Script to update all "Enquire Now" buttons across the project
 * This script adds EnquiryModal integration to pages that have "Enquire Now" buttons
 */

const fs = require('fs');
const path = require('path');

// List of files that need to be updated (found from our grep search)
const filesToUpdate = [
  // Asia country pages
  'app/packages/asia/armenia/page.tsx',
  'app/packages/asia/pakistan/page.tsx', 
  'app/packages/asia/bangladesh/page.tsx',
  'app/packages/asia/iran/page.tsx',
  'app/packages/asia/india/page.tsx',
  'app/packages/asia/tibet/page.tsx',
  'app/packages/asia/japan/page.tsx',
  'app/packages/asia/south-korea/page.tsx',
  'app/packages/asia/taiwan/page.tsx',
  'app/packages/asia/mongolia/page.tsx',
  'app/packages/asia/bahrain/page.tsx',
  'app/packages/asia/azerbaijan/page.tsx',
  'app/packages/asia/georgia/page.tsx',
  'app/packages/asia/nepal/page.tsx',
  'app/packages/asia/sri-lanka/page.tsx',
  'app/packages/asia/bhutan/page.tsx',
  'app/packages/asia/uzbekistan/page.tsx',
  
  // Africa country pages
  'app/packages/africa/seychelles/page.tsx',
  'app/packages/africa/morocco/page.tsx',
  'app/packages/africa/mozambique/page.tsx',
  'app/packages/africa/egypt/page.tsx',
  'app/packages/africa/uganda/page.tsx',
  'app/packages/africa/zambia/page.tsx',
  'app/packages/africa/mauritius/page.tsx',
  'app/packages/africa/namibia/page.tsx',
  
  // Group tours
  'app/packages/group-tours/page.tsx',
  'app/packages/group-tours/group-tour/page.tsx',
  'app/packages/group-tours/kashmir-group-tour/page.tsx',
  
  // Special packages
  'app/packages/japan-explorer/page.tsx',
  'app/packages/sri-lanka-discovery/page.tsx'
];

const frontendDir = path.join(__dirname, '..');

function updateFile(filePath) {
  const fullPath = path.join(frontendDir, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let updated = false;

  // Check if already has EnquiryModal import
  if (!content.includes('import EnquiryModal')) {
    // Add imports after existing imports
    const importRegex = /(import.*from.*['"][^'"]*['"])/g;
    const imports = content.match(importRegex);
    
    if (imports && imports.length > 0) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport);
      const insertIndex = lastImportIndex + lastImport.length;
      
      const newImports = `
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`;
      
      content = content.slice(0, insertIndex) + newImports + content.slice(insertIndex);
      updated = true;
    }
  }

  // Add hook to component function
  if (!content.includes('useEnquiryModal')) {
    const functionRegex = /export default function (\w+)\(\) \{/;
    const match = content.match(functionRegex);
    
    if (match) {
      const functionStart = content.indexOf(match[0]);
      const insertIndex = functionStart + match[0].length;
      const hookLine = `
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal()
`;
      
      content = content.slice(0, insertIndex) + hookLine + content.slice(insertIndex);
      updated = true;
    }
  }

  // Update Enquire Now buttons
  const enquireButtonRegex = /<Button[^>]*>\s*Enquire Now\s*<\/Button>/g;
  if (content.match(enquireButtonRegex)) {
    // Extract country/package name from file path
    const pathParts = filePath.split('/');
    let packageName = 'Travel Package';
    let destination = '';
    
    if (pathParts.includes('asia')) {
      const country = pathParts[pathParts.length - 2];
      packageName = `${country.charAt(0).toUpperCase() + country.slice(1)} Travel Packages`;
      destination = country.charAt(0).toUpperCase() + country.slice(1);
    } else if (pathParts.includes('africa')) {
      const country = pathParts[pathParts.length - 2];
      packageName = `${country.charAt(0).toUpperCase() + country.slice(1)} Safari Packages`;
      destination = country.charAt(0).toUpperCase() + country.slice(1);
    } else if (pathParts.includes('group-tours')) {
      packageName = 'Group Tour Packages';
      destination = 'Various Destinations';
    }

    content = content.replace(
      enquireButtonRegex,
      `<Button 
            onClick={() => openModal({
              packageName: "${packageName}",
              packageType: "Country Specific",
              destination: "${destination}"
            })}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
          >
            Enquire Now
          </Button>`
    );
    updated = true;
  }

  // Add modal component before closing main tag
  if (!content.includes('<EnquiryModal')) {
    const mainClosingRegex = /<\/main>/;
    if (content.match(mainClosingRegex)) {
      content = content.replace(
        mainClosingRegex,
        `
      {/* Enquiry Modal */}
      <EnquiryModal 
        isOpen={isOpen}
        onClose={closeModal}
        packageName={modalData.packageName}
        packageType={modalData.packageType}
        destination={modalData.destination}
      />
    </main>`
      );
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Updated: ${filePath}`);
    return true;
  } else {
    console.log(`ℹ️  No changes needed: ${filePath}`);
    return false;
  }
}

// Main execution
console.log('🚀 Starting bulk update of Enquire Now buttons...\n');

let updatedCount = 0;
let totalCount = 0;

filesToUpdate.forEach(filePath => {
  totalCount++;
  if (updateFile(filePath)) {
    updatedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${totalCount}`);
console.log(`   Files updated: ${updatedCount}`);
console.log(`   Files skipped: ${totalCount - updatedCount}`);
console.log('\n✨ Bulk update completed!');
