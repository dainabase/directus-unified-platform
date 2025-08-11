import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync } from 'child_process';

const iconSets = {
  lucide: {
    package: 'lucide-react',
    description: 'Beautiful & consistent icon toolkit',
    icons: 1000,
    usage: "import { Heart } from 'lucide-react'",
  },
  heroicons: {
    package: '@heroicons/react',
    description: 'Beautiful hand-crafted SVG icons',
    icons: 292,
    usage: "import { HeartIcon } from '@heroicons/react/24/solid'",
  },
  tabler: {
    package: '@tabler/icons-react',
    description: 'Over 3000 free SVG icons',
    icons: 3000,
    usage: "import { IconHeart } from '@tabler/icons-react'",
  },
  phosphor: {
    package: 'phosphor-react',
    description: 'Flexible icon family',
    icons: 1248,
    usage: "import { Heart } from 'phosphor-react'",
  },
  feather: {
    package: 'react-feather',
    description: 'Simply beautiful open source icons',
    icons: 287,
    usage: "import { Heart } from 'react-feather'",
  },
  radix: {
    package: '@radix-ui/react-icons',
    description: 'A crisp set of 15x15 icons',
    icons: 318,
    usage: "import { HeartIcon } from '@radix-ui/react-icons'",
  },
};

export async function addIcons(setName: string) {
  const spinner = ora(`Adding ${setName} icons...`).start();

  try {
    let selectedSet = setName.toLowerCase();
    
    // If not a valid set, ask user to choose
    if (!iconSets[selectedSet]) {
      spinner.stop();
      
      console.log(chalk.blue('\n🎯 Available Icon Sets:\n'));
      Object.entries(iconSets).forEach(([key, info]) => {
        console.log(
          chalk.cyan(`  ${key.padEnd(12)}`),
          chalk.gray(`- ${info.description} (${info.icons} icons)`)
        );
      });
      
      const answer = await inquirer.prompt([
        {
          type: 'list',
          name: 'iconSet',
          message: 'Choose an icon set:',
          choices: Object.keys(iconSets).map(key => ({
            name: `${key} - ${iconSets[key].description}`,
            value: key,
          })),
        },
      ]);
      
      selectedSet = answer.iconSet;
      spinner.start(`Adding ${selectedSet} icons...`);
    }

    const iconInfo = iconSets[selectedSet];
    
    // Install the package
    spinner.text = `Installing ${iconInfo.package}...`;
    
    // Detect package manager
    let packageManager = 'npm';
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      packageManager = 'pnpm';
    } catch {
      try {
        execSync('yarn --version', { stdio: 'ignore' });
        packageManager = 'yarn';
      } catch {
        // npm is the default
      }
    }
    
    const installCommand = 
      packageManager === 'pnpm' ? `pnpm add ${iconInfo.package}` :
      packageManager === 'yarn' ? `yarn add ${iconInfo.package}` :
      `npm install ${iconInfo.package}`;
    
    execSync(installCommand, { stdio: 'inherit' });
    
    spinner.succeed(chalk.green(`✅ ${selectedSet} icons added successfully!`));
    
    console.log(chalk.blue(`\n📦 Package: ${iconInfo.package}`));
    console.log(chalk.blue(`🎯 Icons: ${iconInfo.icons} available icons`));
    console.log(chalk.yellow('\n📝 Usage example:'));
    console.log(chalk.gray(`  ${iconInfo.usage}`));
    
    // Show additional setup if needed
    if (selectedSet === 'heroicons') {
      console.log(chalk.yellow('\n⚠️  Note: Heroicons come in multiple styles:'));
      console.log(chalk.gray('  - /24/solid   (solid 24x24)'));
      console.log(chalk.gray('  - /24/outline (outline 24x24)'));
      console.log(chalk.gray('  - /20/solid   (solid 20x20)'));
    }
    
    if (selectedSet === 'phosphor') {
      console.log(chalk.yellow('\n⚠️  Note: Phosphor icons support weight variants:'));
      console.log(chalk.gray('  <Heart weight="thin" />'));
      console.log(chalk.gray('  <Heart weight="light" />'));
      console.log(chalk.gray('  <Heart weight="regular" />'));
      console.log(chalk.gray('  <Heart weight="bold" />'));
      console.log(chalk.gray('  <Heart weight="fill" />'));
    }
  } catch (error) {
    spinner.fail(chalk.red(`Failed to add icons: ${error.message}`));
    process.exit(1);
  }
}