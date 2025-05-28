import inquirer from 'inquirer';
import chalk from 'chalk';
import { checkSystemRequirements } from '../modules/systemCheck.js';
import { setupDrives } from '../modules/driveSetup.js';
import { installGamingDependencies } from '../modules/gamingSetup.js';
import { installDeveloperTools } from '../modules/devSetup.js';
import { optimizeSystem } from '../modules/optimization.js';
import { initLogger } from './logger.js';

const logger = initLogger();

export async function displayMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: '1. Check System Requirements', value: 'check' },
        { name: '2. Format Drives & Create Folder Structure', value: 'drives' },
        { name: '3. Install Gaming Dependencies & Clients', value: 'gaming' },
        { name: '4. Install Developer Tools & Environments', value: 'dev' },
        { name: '5. Optimize System Performance', value: 'optimize' },
        { name: '6. Run Complete Setup (All of the above)', value: 'all' },
        { name: '7. Exit', value: 'exit' }
      ],
      loop: false
    }
  ]);

  switch (action) {
    case 'check':
      await checkSystemRequirements(true); // true to display results
      break;
    case 'drives':
      await setupDrives();
      break;
    case 'gaming':
      await installGamingDependencies();
      break;
    case 'dev':
      await installDeveloperTools();
      break;
    case 'optimize':
      await optimizeSystem();
      break;
    case 'all':
      // Confirm before running all operations
      const { confirmAll } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmAll',
          message: chalk.yellow.bold('⚠️ This will run all operations including formatting drives. Are you sure?'),
          default: false
        }
      ]);
      
      if (confirmAll) {
        logger.info('Starting complete setup process');
        await checkSystemRequirements(true);
        await setupDrives();
        await installGamingDependencies();
        await installDeveloperTools();
        await optimizeSystem();
        console.log(chalk.green.bold('✓ Complete setup finished successfully!'));
      } else {
        console.log(chalk.yellow('Complete setup cancelled.'));
      }
      break;
    case 'exit':
      console.log(chalk.blue('Thank you for using LunrLust! Exiting...'));
      process.exit(0);
      break;
  }
  
  // Return to menu after operation completes
  if (action !== 'exit') {
    const { returnToMenu } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'returnToMenu',
        message: 'Return to main menu?',
        default: true
      }
    ]);
    
    if (returnToMenu) {
      await displayMenu();
    } else {
      console.log(chalk.blue('Thank you for using LunrLust! Exiting...'));
      process.exit(0);
    }
  }
}