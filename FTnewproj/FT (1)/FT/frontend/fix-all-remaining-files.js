const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx files with the duplicate pattern
function findFilesWithDuplicates(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findFilesWithDuplicates(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Check for the duplicate pattern
        if (content.match(/\d+"use client"/)) {
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`Error reading ${fullPath}:`, error.message);
      }
    }
  }
  
  return files;
}

// Find all files with duplicates
const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';
const filesWithDuplicates = findFilesWithDuplicates(basePath);

console.log(`Found ${filesWithDuplicates.length} files with duplicate content:`);
filesWithDuplicates.forEach(file => console.log(file));

// Fix each file
filesWithDuplicates.forEach(fullPath => {
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Find where the duplicate content starts
    const duplicatePattern = /\d+"use client"/;
    const match = content.match(duplicatePattern);
    
    if (match) {
      const duplicateStart = content.indexOf(match[0]);
      const beforeDuplicate = content.substring(0, duplicateStart);
      
      // Find the last proper closing brace
      const lines = beforeDuplicate.split('\n');
      let properEndLine = -1;
      
      // Look for the last line that's just a closing brace
      for (let i = lines.length - 1; i >= 0; i--) {
        const trimmed = lines[i].trim();
        if (trimmed === '}') {
          properEndLine = i;
          break;
        }
      }
      
      if (properEndLine !== -1) {
        // Keep content up to the proper function end
        const cleanLines = lines.slice(0, properEndLine + 1);
        let cleanContent = cleanLines.join('\n');
        
        // Add missing imports if not present
        if (!cleanContent.includes('import EnquiryModal')) {
          cleanContent = cleanContent.replace(
            'import Image from \'next/image\';',
            `import Image from 'next/image';
import EnquiryModal from "@/components/EnquiryModal"
import { useEnquiryModal } from "@/hooks/useEnquiryModal"`
          );
        }
        
        // Add useEnquiryModal hook if missing
        const functionMatch = cleanContent.match(/export default function (\w+)\(\) \{/);
        if (functionMatch && !cleanContent.includes('useEnquiryModal()')) {
          cleanContent = cleanContent.replace(
            /export default function \w+\(\) \{\s*const \[/,
            `${functionMatch[0]}
  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();
  const [packages, setPackages] = useState<Package[]>([]);
  const [`
          );
        }
        
        fs.writeFileSync(fullPath, cleanContent);
        console.log(`Fixed: ${fullPath}`);
      } else {
        console.log(`Could not find proper function end in: ${fullPath}`);
      }
    }
  } catch (error) {
    console.error(`Error processing ${fullPath}:`, error.message);
  }
});

console.log('All remaining files processed!');
