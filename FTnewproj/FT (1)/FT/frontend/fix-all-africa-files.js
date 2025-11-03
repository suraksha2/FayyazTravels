const fs = require('fs');
const path = require('path');

// Files that need fixing based on the build errors
const filesToFix = [
  'packages/africa/morocco/page.tsx',
  'packages/africa/mozambique/page.tsx', 
  'packages/africa/namibia/page.tsx',
  'packages/africa/seychelles/page.tsx',
  'packages/africa/uganda/page.tsx'
];

const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';

filesToFix.forEach(file => {
  const fullPath = path.join(basePath, file);
  const countryName = file.split('/')[2]; // Extract country name from path
  const capitalizedCountry = countryName.charAt(0).toUpperCase() + countryName.slice(1);
  
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find where the duplicate content starts (look for the pattern with numbers + "use client")
    const duplicatePattern = /\d+"use client"/;
    const match = content.match(duplicatePattern);
    
    if (match) {
      // Find the position where the duplicate starts
      const duplicateStart = content.indexOf(match[0]);
      // Find the last proper closing of the function before the duplicate
      const beforeDuplicate = content.substring(0, duplicateStart);
      
      // Look for the last proper function ending pattern
      const functionEndPattern = /}\s*$/;
      const properEnd = beforeDuplicate.lastIndexOf('}');
      
      if (properEnd !== -1) {
        // Keep content up to the proper function end
        const cleanContent = beforeDuplicate.substring(0, properEnd + 1);
        
        // Add missing imports at the top if not present
        let finalContent = cleanContent;
        if (!finalContent.includes('import EnquiryModal')) {
          finalContent = finalContent.replace(
            'import Image from \'next/image\';',
            `import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`
          );
        }
        
        // Add the useEnquiryModal hook if missing
        if (!finalContent.includes('useEnquiryModal()')) {
          finalContent = finalContent.replace(
            /export default function \w+PackagesPage\(\) \{\s*const \[loading/,
            `export default function ${capitalizedCountry}PackagesPage() {
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading`
          );
        }
        
        fs.writeFileSync(fullPath, finalContent);
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

console.log('All Africa files processed!');
