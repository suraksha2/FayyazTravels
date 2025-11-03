const fs = require('fs');
const path = require('path');

// Function to find files that use EnquiryModal but missing useEnquiryModal hook
function findFilesWithMissingHooks(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findFilesWithMissingHooks(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Check if file uses EnquiryModal but doesn't have useEnquiryModal hook call
        if (content.includes('<EnquiryModal') && 
            content.includes('isOpen={isOpen}') && 
            !content.includes('useEnquiryModal()')) {
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`Error reading ${fullPath}:`, error.message);
      }
    }
  }
  
  return files;
}

// Find all files with missing hooks
const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';
const filesWithMissingHooks = findFilesWithMissingHooks(basePath);

console.log(`Found ${filesWithMissingHooks.length} files with missing useEnquiryModal hooks:`);

filesWithMissingHooks.forEach(fullPath => {
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Find the function declaration and add the hook
    const functionMatch = content.match(/export default function (\w+)\(\) \{/);
    if (functionMatch) {
      const functionDeclaration = functionMatch[0];
      
      // Check if the hook is not already present
      if (!content.includes('useEnquiryModal()')) {
        // Add the hook right after the function declaration
        content = content.replace(
          functionDeclaration,
          `${functionDeclaration}\n  const { isOpen, modalData, openModal, closeModal } = useEnquiryModal();`
        );
        hasChanges = true;
      }
    }
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed missing hook in: ${fullPath.replace(basePath, '')}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${fullPath}:`, error.message);
  }
});

console.log('Missing hook fixes completed!');
