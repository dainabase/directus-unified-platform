#!/usr/bin/env node

/**
 * Script to fix common import and dependency issues in the UI package
 */

const fs = require('fs').promises;
const path = require('path');

async function fixFile(filePath, fixes) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;

    for (const [pattern, replacement] of fixes) {
      if (content.includes(pattern)) {
        content = content.replace(new RegExp(pattern, 'g'), replacement);
        modified = true;
        console.log(`✅ Fixed: ${path.basename(filePath)} - ${pattern}`);
      }
    }

    if (modified) {
      await fs.writeFile(filePath, content);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}:`, error.message);
    return false;
  }
}

async function fixImports() {
  console.log('🔧 Starting import fixes...\n');

  const fixes = [
    // Fix cmdk imports to use named imports
    ['import \\* as cmdk from [\'"]cmdk[\'"]', 'import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "cmdk"'],
    ['import \\* as Cmdk from [\'"]cmdk[\'"]', 'import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "cmdk"'],
    ['<cmdk\\.Input', '<CommandInput'],
    ['<cmdk\\.List', '<CommandList'],
    ['<cmdk\\.Empty', '<CommandEmpty'],
    ['<cmdk\\.Group', '<CommandGroup'],
    ['<cmdk\\.Item', '<CommandItem'],
    ['<Cmdk\\.Input', '<CommandInput'],
    ['<Cmdk\\.List', '<CommandList'],
    ['<Cmdk\\.Empty', '<CommandEmpty'],
    ['<Cmdk\\.Group', '<CommandGroup'],
    ['<Cmdk\\.Item', '<CommandItem'],
    
    // Remove unused imports
    ['import \\{ twMerge \\} from [\'"]tailwind-merge[\'"];?\\n', ''],
    ['const twMerge = require\\([\'"]tailwind-merge[\'"]\\);?\\n', ''],
    
    // Fix incorrect path imports
    ['from [\'"]@/lib/utils[\'"]', 'from "../../lib/utils"'],
    ['from [\'"]@/components/', 'from "../'],
  ];

  const componentsDir = path.join(process.cwd(), 'src', 'components');
  
  // Get all TypeScript files
  const files = [];\n  async function getFiles(dir) {\n    const entries = await fs.readdir(dir, { withFileTypes: true });\n    for (const entry of entries) {\n      const fullPath = path.join(dir, entry.name);\n      if (entry.isDirectory()) {\n        await getFiles(fullPath);\n      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {\n        files.push(fullPath);\n      }\n    }\n  }\n\n  await getFiles(componentsDir);\n\n  let fixedCount = 0;\n  for (const file of files) {\n    const fixed = await fixFile(file, fixes);\n    if (fixed) fixedCount++;\n  }\n\n  console.log(`\\n✨ Fixed ${fixedCount} files`);\n}\n\nasync function fixPackageJson() {\n  console.log('\\n📦 Fixing package.json dependencies...');\n  \n  const packagePath = path.join(process.cwd(), 'package.json');\n  const pkg = JSON.parse(await fs.readFile(packagePath, 'utf8'));\n  \n  // Ensure correct React versions\n  if (pkg.peerDependencies) {\n    pkg.peerDependencies.react = '^18.2.0';\n    pkg.peerDependencies['react-dom'] = '^18.2.0';\n  }\n  \n  // Ensure cmdk is in optionalDependencies with correct version\n  if (pkg.optionalDependencies) {\n    pkg.optionalDependencies.cmdk = '^0.2.0';\n  }\n  \n  // Remove any React 19.x references\n  const pkgString = JSON.stringify(pkg, null, 2);\n  const fixedPkgString = pkgString.replace(/\"19\\.\\d+\\.\\d+\"/g, '\"18.2.0\"');\n  \n  await fs.writeFile(packagePath, fixedPkgString);\n  console.log('✅ package.json fixed');\n}\n\nasync function main() {\n  console.log('🚀 UI Package Fix Script\\n');\n  console.log('Working directory:', process.cwd());\n  \n  await fixImports();\n  await fixPackageJson();\n  \n  console.log('\\n✨ All fixes completed!');\n  console.log('\\n📝 Next steps:');\n  console.log('1. Run: npm install');\n  console.log('2. Run: npm run build');\n  console.log('3. Run: npm test');\n}\n\nmain().catch(console.error);
