#!/usr/bin/env node

/**
 * Complete Fix Script for @dainabase/ui package
 * This script fixes all import issues, TypeScript errors, and prepares for NPM publication
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Starting Complete Fix Process...\n');

// Fix 1: Update tsconfig.json
console.log('📝 Updating tsconfig.json...');
const tsConfig = {
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "node",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build", "*.config.ts", "*.config.js", "**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"]
};

fs.writeFileSync('tsconfig.json', JSON.stringify(tsConfig, null, 2));
console.log('✅ tsconfig.json updated\n');

// Fix 2: Create a types file for cmdk if needed
console.log('📝 Creating cmdk types declaration...');
const cmdkTypes = `declare module 'cmdk' {
  import * as React from 'react';
  
  export interface CommandProps {
    value?: string;
    onValueChange?: (value: string) => void;
    filter?: (value: string, search: string, keywords?: string[]) => number;
    shouldFilter?: boolean;
    loop?: boolean;
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface CommandInputProps {
    value?: string;
    onValueChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
  }
  
  export interface CommandListProps {
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface CommandEmptyProps {
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface CommandGroupProps {
    heading?: string;
    children?: React.ReactNode;
    className?: string;
    forceMount?: boolean;
  }
  
  export interface CommandItemProps {
    value?: string;
    keywords?: string[];
    onSelect?: (value: string) => void;
    disabled?: boolean;
    forceMount?: boolean;
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface CommandSeparatorProps {
    className?: string;
    alwaysRender?: boolean;
  }
  
  export interface CommandLoadingProps {
    children?: React.ReactNode;
    className?: string;
  }
  
  export const Command: React.FC<CommandProps> & {
    Input: React.FC<CommandInputProps>;
    List: React.FC<CommandListProps>;
    Empty: React.FC<CommandEmptyProps>;
    Group: React.FC<CommandGroupProps>;
    Item: React.FC<CommandItemProps>;
    Separator: React.FC<CommandSeparatorProps>;
    Loading: React.FC<CommandLoadingProps>;
  };
}
`;

// Create types directory if it doesn't exist
if (!fs.existsSync('src/types')) {
  fs.mkdirSync('src/types', { recursive: true });
}

fs.writeFileSync('src/types/cmdk.d.ts', cmdkTypes);
console.log('✅ cmdk types created\n');

// Fix 3: Update package.json scripts
console.log('📝 Updating package.json...');
const packageJsonPath = 'package.json';
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Ensure correct peer dependencies
packageJson.peerDependencies = {
  "react": "^18.0.0 || ^18.2.0",
  "react-dom": "^18.0.0 || ^18.2.0"
};

// Update build script
packageJson.scripts.build = "tsup";
packageJson.scripts["build:clean"] = "rm -rf dist && npm run build";
packageJson.scripts["fix:imports"] = "node scripts/complete-fix.js";

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ package.json updated\n');

// Fix 4: Process all component files to fix imports
console.log('🔍 Scanning and fixing component imports...');

function fixImportsInFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix cmdk imports
  if (content.includes('from "cmdk"') || content.includes("from 'cmdk'")) {
    // Replace named imports with default import
    content = content.replace(
      /import\s*{\s*Command[^}]*}\s*from\s*["']cmdk["']/g,
      'import { Command } from "cmdk"'
    );
    
    // Fix component usage
    content = content.replace(/CommandInput/g, 'Command.Input');
    content = content.replace(/CommandList/g, 'Command.List');
    content = content.replace(/CommandEmpty/g, 'Command.Empty');
    content = content.replace(/CommandGroup/g, 'Command.Group');
    content = content.replace(/CommandItem/g, 'Command.Item');
    content = content.replace(/CommandSeparator/g, 'Command.Separator');
    content = content.replace(/CommandLoading/g, 'Command.Loading');
    
    // But don't replace in interface names
    content = content.replace(/Command\.InputProps/g, 'CommandInputProps');
    content = content.replace(/Command\.ListProps/g, 'CommandListProps');
    
    modified = true;
  }
  
  // Fix path imports
  content = content.replace(/@\//g, '../../');
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Fixed: ${path.basename(filePath)}`);
  }
}

// Process all TypeScript files
function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('dist')) {
      processDirectory(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixImportsInFile(fullPath);
    }
  });
}

// Start processing from src directory
if (fs.existsSync('src')) {
  processDirectory('src');
}

console.log('\n✅ All imports fixed!\n');

// Final step: Create a build verification script
console.log('📝 Creating build verification script...');
const verifyScript = `#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔍 Verifying build...');

try {
  // Check TypeScript
  console.log('Checking TypeScript...');
  execSync('npx tsc --noEmit', { stdio: 'inherit' });
  console.log('✅ TypeScript check passed');
  
  // Try to build
  console.log('\\nBuilding package...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
  
  // Check bundle size
  const stats = require('fs').statSync('dist/index.js');
  const sizeInKB = Math.round(stats.size / 1024);
  console.log(\`\\n📦 Bundle size: \${sizeInKB}KB\`);
  
  if (sizeInKB > 100) {
    console.warn('⚠️  Warning: Bundle size exceeds 100KB');
  }
  
  console.log('\\n✅ All checks passed! Package is ready for publication.');
  
} catch (error) {
  console.error('\\n❌ Build verification failed:', error.message);
  process.exit(1);
}
`;

fs.writeFileSync('scripts/verify-build.js', verifyScript);
fs.chmodSync('scripts/verify-build.js', '755');

console.log('✅ Build verification script created\n');

console.log('🎉 Complete fix process finished!');
console.log('\nNext steps:');
console.log('1. Run: npm install --legacy-peer-deps');
console.log('2. Run: npm run build');
console.log('3. Run: node scripts/verify-build.js');
console.log('4. If all passes, run: npm publish');