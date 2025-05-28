#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import figlet from 'figlet';
import boxen from 'boxen';
import isAdmin from 'is-admin';
import { initLogger } from './utils/logger.js';
import { displayMenu } from './utils/menu.js';
import { checkSystemRequirements } from './modules/systemCheck.js';
import { setupDrives } from './modules/driveSetup.js';
import { installGamingDependencies } from './modules/gamingSetup.js';
import { installDeveloperTools } from './modules/devSetup.js';
import { optimizeSystem } from './modules/optimization.js';

// Initialize logger
const logger = initLogger();

async function main() {
  try {
    // Display welcome banner
    console.log(
      chalk.bold(
        figlet.textSync('LunrLust', {
          font: 'Standard',
          horizontalLayout: 'default',
          verticalLayout: 'default',
          width: 80,
          whitespaceBreak: true
        })
      )
    );

    console.log(
      boxen(
        chalk.hex('#9d4edd')('Windows Setup & Optimization Tool for Gaming and Development'),
        {
          padding: 1,
          margin: 1,
          borderStyle: 'round',
          borderColor: '#5a189a'
        }
      )
    );

    // Check for admin privileges
    const admin = await isAdmin();
    if (!admin) {
      console.log(chalk.red.bold('❌ Administrator privileges required'));
      console.log(
        chalk.yellow('Please run this script as administrator to ensure all features work correctly.')
      );
      process.exit(1);
    }
    
    console.log(chalk.green.bold('✓ Running with administrator privileges'));
    logger.info('Started with administrator privileges');

    // Set up command line interface
    const program = new Command();
    program
      .name('lunrlust')
      .description('Windows Setup & Optimization Tool for Gaming and Development')
      .version('1.0.0');

    program
      .option('-y, --yes', 'Answer yes to all prompts')
      .option('-v, --verbose', 'Enable verbose logging')
      .option('-q, --quiet', 'Suppress all output except errors')
      .option('-s, --skip-checks', 'Skip system requirement checks');

    program.parse(process.argv);
    const options = program.opts();

    // Run system checks if not skipped
    if (!options.skipChecks) {
      const systemChecks = await checkSystemRequirements();
      if (!systemChecks.success) {
        console.log(chalk.red.bold('❌ System requirements not met:'));
        systemChecks.issues.forEach(issue => {
          console.log(chalk.yellow(`• ${issue}`));
        });
        
        const { proceed } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'proceed',
            message: 'System requirements not fully met. Do you want to proceed anyway?',
            default: false
          }
        ]);
        
        if (!proceed) {
          console.log(chalk.yellow('Exiting. Please address the system requirements issues.'));
          process.exit(0);
        }
      } else {
        console.log(chalk.green.bold('✓ System requirements met'));
      }
    }

    // Show main menu and handle user input
    await displayMenu();

  } catch (error) {
    logger.error(`Error in main execution: ${error.message}`, { stack: error.stack });
    console.error(chalk.red.bold(`An error occurred: ${error.message}`));
    console.log(chalk.yellow('Check the logs for more details.'));
  }
}

main();