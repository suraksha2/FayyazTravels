#!/usr/bin/env node

/**
 * Script to fix all "Enquire Now" buttons across the website to work consistently
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

function fixEnquireButtons(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasChanges = false;
    
    // Skip if file already has useEnquiryModal import
    if (content.includes('useEnquiryModal')) {
      console.log(`ℹ️  Already fixed: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
    // Skip if no "Enquire Now" buttons found
    if (!content.includes('Enquire Now')) {
      return false;
    }
    
    // Add imports after existing imports
    const importRegex = /import.*from.*['"].*['"];?\s*$/gm;
    const imports = content.match(importRegex);
    
    if (imports && !content.includes('useEnquiryModal')) {
      const lastImport = imports[imports.length - 1];
      const lastImportIndex = content.lastIndexOf(lastImport) + lastImport.length;
      
      const newImports = `
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`;
      
      content = content.slice(0, lastImportIndex) + newImports + content.slice(lastImportIndex);
      hasChanges = true;
    }
    
    // Add useEnquiryModal hook to component function
    const componentFunctionRegex = /export default function (\w+)\(\) \{/;
    const match = content.match(componentFunctionRegex);
    
    if (match && !content.includes('useEnquiryModal()')) {
      const componentName = match[1];
      const hookLine = `  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();`;
      
      content = content.replace(
        componentFunctionRegex,
        `export default function ${componentName}() {
${hookLine}`
      );
      hasChanges = true;
    }
    
    // Extract destination/package info from file path and content
    const pathParts = filePath.split('/');
    let destination = 'Unknown';
    let packageType = 'Travel Package';
    
    // Try to extract from path
    if (pathParts.includes('packages')) {
      const packageIndex = pathParts.indexOf('packages');
      if (pathParts[packageIndex + 1]) {
        const category = pathParts[packageIndex + 1];
        destination = pathParts[packageIndex + 2] || category;
        
        // Clean up destination name
        destination = destination.replace(/[-_]/g, ' ')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        // Set package type based on category
        const categoryMap = {
          'asia': 'Asia Package',
          'europe': 'Europe Package',
          'africa': 'Africa Package',
          'south-america': 'South America Package',
          'north-america': 'North America Package',
          'oceania': 'Oceania Package',
          'middle-east': 'Middle East Package',
          'south-east-asia': 'South East Asia Package',
          'south-east-europe': 'South East Europe Package',
          'scandinavia': 'Scandinavia Package',
          'the-caribbean': 'Caribbean Package',
          'multi-city': 'Multi-City Package',
          'group-tours': 'Group Tour Package',
          'safari': 'Safari Package',
          'beach': 'Beach Package',
          'cultural': 'Cultural Package'
        };
        
        packageType = categoryMap[category] || 'Travel Package';
      }
    }
    
    // Try to extract from content (look for large headings)
    const headingMatch = content.match(/<h1[^>]*>([^<]+)</);
    if (headingMatch) {
      destination = headingMatch[1].replace(/[A-Z]{2,}/g, match => 
        match.charAt(0) + match.slice(1).toLowerCase()
      );
    }
    
    // Fix hero section "Enquire Now" buttons (without onClick)
    const heroButtonRegex = /<Button\s+className="bg-white text-black hover:bg-white\/90 text-lg px-8 py-6"\s*>\s*Enquire Now\s*<\/Button>/g;
    
    content = content.replace(heroButtonRegex, `<Button 
            onClick={() => openModal({
              packageName: "${destination} Travel Packages",
              packageType: "${packageType}",
              destination: "${destination}"
            })}
            className="bg-white text-black hover:bg-white/90 text-lg px-8 py-6"
          >
            Enquire Now
          </Button>`);
    
    if (heroButtonRegex.test(content)) {
      hasChanges = true;
    }
    
    // Fix package card "Enquire Now" buttons
    const packageButtonRegex = /<Button\s+onClick=\{\(\) => openModal\(\{\s*packageName: pkg\.p_name,\s*packageType: "[^"]*",\s*destination: "[^"]*"\s*\}\)\}\s+className="[^"]*"\s*>\s*Enquire Now\s*<\/Button>/g;
    
    // If there are package cards, ensure they have proper onClick handlers
    if (content.includes('packages.map') && content.includes('pkg.p_name')) {
      // Fix package card buttons that might be missing onClick
      const cardButtonRegex = /<Button\s+className="bg-\[#002147\][^"]*"\s*>\s*Enquire Now\s*<\/Button>/g;
      
      content = content.replace(cardButtonRegex, `<Button 
                        onClick={() => openModal({
                          packageName: pkg.p_name,
                          packageType: "${packageType}",
                          destination: "${destination}"
                        })}
                        className="bg-[#002147] hover:bg-[#001a38] text-white px-6 py-2.5 rounded-lg font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        Enquire Now
                      </Button>`);
      
      if (cardButtonRegex.test(content)) {
        hasChanges = true;
      }
    }
    
    // Add EnquiryModal component at the end before closing main tag
    if (!content.includes('<EnquiryModal')) {
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
      console.log(`✅ Fixed: ${path.relative(process.cwd(), filePath)} (${destination})`);
      return true;
    } else {
      console.log(`ℹ️  No changes needed: ${path.relative(process.cwd(), filePath)}`);
      return false;
    }
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Fixing all "Enquire Now" buttons across the website...\n');

const packagesDir = path.join(__dirname, '..', 'app', 'packages');
const tsxFiles = findTsxFiles(packagesDir);

let fixedCount = 0;
let totalCount = 0;

tsxFiles.forEach(filePath => {
  totalCount++;
  if (fixEnquireButtons(filePath)) {
    fixedCount++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Total files processed: ${totalCount}`);
console.log(`   Files fixed: ${fixedCount}`);
console.log(`   Files already working: ${totalCount - fixedCount}`);
console.log('\n✨ All "Enquire Now" buttons are now consistent across the website!');
