const fs = require('fs');
const path = require('path');

// Function to find files with nested Link patterns
function findFilesWithNestedLinks(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findFilesWithNestedLinks(fullPath, files);
    } else if (item.endsWith('.tsx')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        // Check for nested Link patterns
        if (content.includes('<Link') && content.match(/<Link[^>]*>\s*.*<Link/s)) {
          files.push(fullPath);
        }
      } catch (error) {
        console.error(`Error reading ${fullPath}:`, error.message);
      }
    }
  }
  
  return files;
}

// Find all files with nested links
const basePath = '/Users/surakshanigade/Downloads/FT (1)/FT/frontend/app';
const filesWithNestedLinks = findFilesWithNestedLinks(basePath);

console.log(`Found ${filesWithNestedLinks.length} files with potential nested links:`);

filesWithNestedLinks.forEach(fullPath => {
  try {
    let content = fs.readFileSync(fullPath, 'utf8');
    let hasChanges = false;
    
    // Pattern 1: Link wrapping entire card with inner Link for button
    const outerLinkPattern = /<Link href=\{`\/packages\/\$\{[^}]+\}`\} className="block">/g;
    if (outerLinkPattern.test(content)) {
      // Replace outer Link with div and onClick handler
      content = content.replace(
        /<Link href=\{`\/packages\/\$\{([^}]+)\}`\} className="block">/g,
        '<div className="block cursor-pointer" onClick={() => window.location.href = `/packages/${$1}`}>'
      );
      
      // Remove corresponding closing Link tag
      content = content.replace(
        /(\s+)<\/div>\s*<\/Link>/g,
        '$1</div>'
      );
      
      hasChanges = true;
    }
    
    // Pattern 2: More generic nested Link detection and fix
    const cardLinkPattern = /<div[^>]*className="[^"]*bg-white[^"]*rounded[^"]*"[^>]*>\s*<Link[^>]*href=\{`\/packages\/\$\{[^}]+\}`\}[^>]*>/g;
    if (cardLinkPattern.test(content)) {
      content = content.replace(cardLinkPattern, (match) => {
        // Extract the href value
        const hrefMatch = match.match(/href=\{`\/packages\/\$\{([^}]+)\}`\}/);
        if (hrefMatch) {
          const slugVar = hrefMatch[1];
          return match.replace(
            /<Link[^>]*href=\{`\/packages\/\$\{[^}]+\}`\}[^>]*>/,
            ''
          ).replace(
            /<div([^>]*className="[^"]*bg-white[^"]*rounded[^"]*"[^>]*)>/,
            `<div$1 onClick={() => window.location.href = \`/packages/\${${slugVar}}\`}>`
          );
        }
        return match;
      });
      hasChanges = true;
    }
    
    if (hasChanges) {
      fs.writeFileSync(fullPath, content);
      console.log(`Fixed nested links in: ${fullPath.replace(basePath, '')}`);
    }
    
  } catch (error) {
    console.error(`Error processing ${fullPath}:`, error.message);
  }
});

console.log('Nested link fixes completed!');
