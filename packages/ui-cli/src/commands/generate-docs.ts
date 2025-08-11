import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';

interface DocsOptions {
  format: string;
  output: string;
}

export async function generateDocs(options: DocsOptions) {
  const spinner = ora('Generating documentation...').start();

  try {
    // Find all component files
    spinner.text = 'Scanning components...';
    const componentFiles = await glob('src/components/**/[!_]*.tsx', {
      ignore: ['**/*.test.tsx', '**/*.stories.tsx'],
    });

    const components = [];
    
    for (const file of componentFiles) {
      const content = await fs.readFile(file, 'utf-8');
      
      // Extract component info using regex
      const componentNameMatch = content.match(/export\s+(?:function|const)\s+(\w+)/);
      const propsMatch = content.match(/interface\s+(\w+Props)[\s\S]*?{([\s\S]*?)}/m);
      
      if (componentNameMatch) {
        const componentName = componentNameMatch[1];
        const componentPath = file.replace('src/', '');
        
        let props = [];
        if (propsMatch) {
          const propsContent = propsMatch[2];
          const propLines = propsContent.split('\n').filter(line => line.includes(':'));
          
          props = propLines.map(line => {
            const [name, type] = line.split(':').map(s => s.trim());
            const isOptional = name.includes('?');
            const cleanName = name.replace('?', '');
            
            return {
              name: cleanName,
              type: type.replace(/[;,]$/, ''),
              optional: isOptional,
            };
          }).filter(p => p.name && !p.name.includes('//'));
        }
        
        components.push({
          name: componentName,
          path: componentPath,
          props,
        });
      }
    }
    
    spinner.text = 'Generating documentation files...';
    
    // Create output directory
    await fs.mkdir(options.output, { recursive: true });
    
    if (options.format === 'markdown') {
      // Generate README.md
      let readmeContent = `# Dainabase UI Components Documentation\n\n`;
      readmeContent += `Generated on ${new Date().toLocaleDateString()}\n\n`;
      readmeContent += `## Components (${components.length})\n\n`;
      
      // Table of contents
      components.forEach(comp => {
        readmeContent += `- [${comp.name}](#${comp.name.toLowerCase()})\n`;
      });
      readmeContent += '\n---\n\n';
      
      // Component details
      for (const comp of components) {
        readmeContent += `## ${comp.name}\n\n`;
        readmeContent += `**Path:** \`${comp.path}\`\n\n`;
        readmeContent += `**Import:**\n\`\`\`typescript\nimport { ${comp.name} } from '@dainabase/ui'\n\`\`\`\n\n`;
        
        if (comp.props.length > 0) {
          readmeContent += `### Props\n\n`;
          readmeContent += `| Prop | Type | Required | Description |\n`;
          readmeContent += `|------|------|----------|-------------|\n`;
          
          comp.props.forEach(prop => {
            readmeContent += `| ${prop.name} | \`${prop.type}\` | ${prop.optional ? 'No' : 'Yes'} | - |\n`;
          });
          readmeContent += '\n';
        }
        
        readmeContent += `### Example\n\n`;
        readmeContent += `\`\`\`tsx\n`;
        readmeContent += `<${comp.name}`;
        
        // Add example props
        const requiredProps = comp.props.filter(p => !p.optional);
        if (requiredProps.length > 0) {
          readmeContent += '\n';
          requiredProps.forEach(prop => {
            const exampleValue = 
              prop.type.includes('string') ? '"example"' :
              prop.type.includes('number') ? '42' :
              prop.type.includes('boolean') ? 'true' :
              prop.type.includes('function') ? '{() => {}}' :
              '{}';
            readmeContent += `  ${prop.name}=${exampleValue}\n`;
          });
        }
        
        readmeContent += `/>\n\`\`\`\n\n---\n\n`;
      }
      
      await fs.writeFile(path.join(options.output, 'README.md'), readmeContent);
      
      // Generate individual component docs
      for (const comp of components) {
        const compDocPath = path.join(options.output, 'components', `${comp.name}.md`);
        await fs.mkdir(path.dirname(compDocPath), { recursive: true });
        
        let compDoc = `# ${comp.name}\n\n`;
        compDoc += `## Overview\n\n`;
        compDoc += `The ${comp.name} component is part of the Dainabase UI Design System.\n\n`;
        
        compDoc += `## Installation\n\n`;
        compDoc += `\`\`\`bash\nnpm install @dainabase/ui\n\`\`\`\n\n`;
        
        compDoc += `## Import\n\n`;
        compDoc += `\`\`\`typescript\nimport { ${comp.name} } from '@dainabase/ui'\n\`\`\`\n\n`;
        
        if (comp.props.length > 0) {
          compDoc += `## Props\n\n`;
          comp.props.forEach(prop => {
            compDoc += `### ${prop.name}\n`;
            compDoc += `- **Type:** \`${prop.type}\`\n`;
            compDoc += `- **Required:** ${prop.optional ? 'No' : 'Yes'}\n`;
            compDoc += `\n`;
          });
        }
        
        await fs.writeFile(compDocPath, compDoc);
      }
    } else if (options.format === 'json') {
      // Generate JSON documentation
      const jsonDoc = {
        name: '@dainabase/ui',
        version: '1.0.1-beta.1',
        components: components.map(comp => ({
          name: comp.name,
          path: comp.path,
          props: comp.props,
        })),
        generated: new Date().toISOString(),
      };
      
      await fs.writeFile(
        path.join(options.output, 'components.json'),
        JSON.stringify(jsonDoc, null, 2)
      );
    }
    
    spinner.succeed(chalk.green('✅ Documentation generated successfully!'));
    console.log(chalk.blue(`📁 Location: ${options.output}`));
    console.log(chalk.yellow('\n📝 Generated files:'));
    
    if (options.format === 'markdown') {
      console.log('  - README.md (main documentation)');
      console.log(`  - components/*.md (${components.length} component docs)`);
    } else if (options.format === 'json') {
      console.log('  - components.json');
    }
    
    console.log(chalk.gray(`\nFound and documented ${components.length} components`));
  } catch (error) {
    spinner.fail(chalk.red(`Failed to generate docs: ${error.message}`));
    process.exit(1);
  }
}