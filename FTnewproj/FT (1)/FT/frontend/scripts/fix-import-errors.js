#!/usr/bin/env node

/**
 * Script to fix corrupted import statements from the bulk update
 */

const fs = require('fs');
const path = require('path');

// Find all TypeScript/TSX files in the packages directory
function findTsxFiles(dir) {
  const files = [];
  
  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        traverse(fullPath);
      } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
        files.push(fullPath);
      }
    }
  }
  
  traverse(dir);
  return files;
}

function fixImportStatements(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Fix corrupted Image import
    const corruptedImageImport = /import Image from '\s*import EnquiryModal from "@\/components\/EnquiryModal"\s*import { useEnquiryModal } from "@\/hooks\/useEnquiryModal"next\/image';/g;
    if (corruptedImageImport.test(content)) {
      content = content.replace(
        corruptedImageImport,
        `import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`
      );
      hasChanges = true;
    }
    
    // Fix missing useEnquiryModal hook in component function
    const componentFunctionRegex = /export default function (\w+)\(\) \{\s*(const \[.*?\] = useState.*?;\s*)*(const \[.*?\] = useState.*?;\s*)*(const \[.*?\] = useState.*?;\s*)/;
    if (componentFunctionRegex.test(content) && !content.includes('useEnquiryModal()')) {
      content = content.replace(
        componentFunctionRegex,
        (match, componentName, ...stateVars) => {
          const stateDeclarations = stateVars.filter(v => v).join('');
          return `export default function ${componentName}() {
  ${stateDeclarations}const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
`;
        }
      );
      hasChanges = true;
    }
    
    // Fix missing EnquiryModal component at the end
    if (content.includes('useEnquiryModal') && !content.includes('<EnquiryModal')) {
      const mainClosingRegex = /<\/main>\s*\)\s*\}/;
      if (mainClosingRegex.test(content)) {
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
    </main>
  )
}`
        );
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(filePath, content);
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)}`);
      return true;
    } else {
      console.log(`ℹ️  No issues: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing import statement errors...\n');

const packagesDir = path.join(__dirname, '..', 'app', 'packages');
const tsxFiles = findTsxFiles(packagesDir);

let fixedCount = 0;
let totalCount = 0;

tsxFiles.forEach(filePath => {
  totalCount++;
  if (fixImportStatements(filePath)) {
    fixedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${totalCount}`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Files without issues: ${totalCount - fixedCount}`);
console.log('\n✨ Import fixes completed!');
