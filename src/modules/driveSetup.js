import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import si from 'systeminformation';
import { initLogger } from '../utils/logger.js';
import { createProgressBar, updateProgress, completeProgress } from '../utils/progress.js';

const execPromise = util.promisify(exec);
const logger = initLogger();

/**
 * Format drives and create folder structure
 */
export async function setupDrives() {
  logger.info('Starting drive setup process');
  
  try {
    // Get available drives
    const spinner = ora({
      text: 'Detecting available drives...',
      color: 'magenta'
    }).start();
    
    const { disks } = await si.diskLayout();
    const fsSize = await si.fsSize();
    
    // Filter internal disks (exclude the Windows drive, external drives, and removable media)
    const internalDisks = fsSize.filter(disk => {
      // Skip the Windows drive (usually C:)
      if (disk.mount.toLowerCase() === 'c:') return false;
      
      // Skip drives with no mount point
      if (!disk.mount) return false;
      
      // Skip removable drives (USB drives, etc.)
      if (disk.type === 'removable') return false;
      
      return true;
    });
    
    spinner.succeed('Drives detected');
    
    if (internalDisks.length === 0) {
      console.log(chalk.yellow('No eligible drives found for formatting.'));
      return;
    }
    
    // Display available drives
    console.log('\n' + chalk.hex('#9d4edd').bold('📀 Available Drives:'));
    internalDisks.forEach((disk, index) => {
      const sizeGB = Math.round(disk.size / 1024 / 1024 / 1024);
      console.log(chalk.hex('#c77dff')(`${index + 1}. ${disk.mount} (${disk.type}): `) + 
                 `${sizeGB}GB total, ${Math.round(disk.used / 1024 / 1024 / 1024)}GB used`);
    });
    
    // Confirm which drives to format
    const { selectedDrives } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedDrives',
        message: chalk.yellow.bold('⚠️ Select drives to format (ALL DATA WILL BE LOST):'),
        choices: internalDisks.map((disk, index) => ({
          name: `${disk.mount} (${Math.round(disk.size / 1024 / 1024 / 1024)}GB)`,
          value: index
        }))
      }
    ]);
    
    if (selectedDrives.length === 0) {
      console.log(chalk.yellow('No drives selected for formatting.'));
      return;
    }
    
    // Double confirm formatting
    const { confirmFormat } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmFormat',
        message: chalk.red.bold('⚠️ WARNING: All selected drives will be formatted and ALL DATA WILL BE LOST. Are you absolutely sure?'),
        default: false
      }
    ]);
    
    if (!confirmFormat) {
      console.log(chalk.yellow('Drive formatting cancelled.'));
      return;
    }
    
    // Format selected drives
    for (const index of selectedDrives) {
      const disk = internalDisks[index];
      const driveLetter = disk.mount.charAt(0).toUpperCase();
      
      console.log(chalk.hex('#9d4edd').bold(`\n🔄 Formatting drive ${driveLetter}:`));
      
      const formattingSpinner = ora({
        text: `Formatting drive ${driveLetter}:... This may take a while`,
        color: 'magenta'
      }).start();
      
      try {
        // Format drive using Windows command
        await execPromise(`format ${driveLetter}: /fs:NTFS /v:"Local Disk" /q`);
        formattingSpinner.succeed(`Drive ${driveLetter}: formatted successfully`);
        logger.info(`Formatted drive ${driveLetter}:`);
        
        // Create folder structure
        await createFolderStructure(driveLetter);
      } catch (error) {
        formattingSpinner.fail(`Failed to format drive ${driveLetter}:`);
        logger.error(`Error formatting drive ${driveLetter}: ${error.message}`);
        console.error(chalk.red(`Error: ${error.message}`));
      }
    }
    
  } catch (error) {
    logger.error(`Error in drive setup: ${error.message}`, { stack: error.stack });
    console.error(chalk.red(`An error occurred: ${error.message}`));
  }
}

/**
 * Create the folder structure on a formatted drive
 * @param {string} driveLetter - Drive letter (e.g., 'D')
 */
async function createFolderStructure(driveLetter) {
  const rootPath = `${driveLetter}:`;
  
  const folderStructure = [
    // Apps folder structure
    'Apps/Games/Steam/Files',
    'Apps/Games/Epic/Files',
    'Apps/Games/Ubisoft/Files',
    'Apps/Games/Pirated/Files',
    'Apps/Games/Indie/Files',
    'Apps/Packages/Windows/Updates',
    'Apps/Packages/Windows/Drivers',
    'Apps/Packages/Windows/Utilities',
    'Apps/Packages/Windows/Installers',
    'Apps/Packages/Libraries/C++',
    'Apps/Packages/Libraries/Python',
    'Apps/Packages/Libraries/JavaScript',
    'Apps/Packages/Libraries/Others',
    'Apps/Packages/Mods/Games',
    'Apps/Packages/Mods/Apps',
    'Apps/Packages/Mods/Tools',
    'Apps/Packages/Mods/Backup',
    'Apps/Packages/SDKs/Android',
    'Apps/Packages/SDKs/iOS',
    'Apps/Packages/SDKs/Web',
    'Apps/Packages/SDKs/CrossPlatform',
    'Apps/Drivers/Graphics/Nvidia',
    'Apps/Drivers/Graphics/AMD',
    'Apps/Drivers/Graphics/Intel',
    'Apps/Drivers/Network/Ethernet',
    'Apps/Drivers/Network/WiFi',
    'Apps/Drivers/Network/Bluetooth',
    'Apps/Drivers/Audio/Realtek',
    'Apps/Drivers/Audio/Creative',
    'Apps/Drivers/Audio/Others',
    'Apps/Drivers/USB/Storage',
    'Apps/Drivers/USB/Peripherals',
    'Apps/Drivers/USB/Hubs',
    
    // Documents folder structure
    'Documents/Personal/IDs',
    'Documents/Personal/Certificates',
    'Documents/Personal/Letters',
    'Documents/Personal/Journals',
    'Documents/Finance/Taxes',
    'Documents/Finance/Bills',
    'Documents/Finance/BankStatements',
    'Documents/Finance/Investments',
    'Documents/Education/Courses',
    'Documents/Education/Notes',
    'Documents/Education/Projects',
    'Documents/Writing/Articles',
    'Documents/Writing/Drafts',
    'Documents/Writing/Ideas',
    'Documents/Miscellaneous',
    
    // Developers folder structure
    'Developers/Networking/Protocols',
    'Developers/Networking/Tools',
    'Developers/Networking/Scripts',
    'Developers/Networking/Configs',
    'Developers/Networking/Docs',
    'Developers/Web/Frontend',
    'Developers/Web/Backend',
    'Developers/Web/Fullstack',
    'Developers/Web/Frameworks',
    'Developers/Web/Assets',
    'Developers/GameDevelopment/Engines',
    'Developers/GameDevelopment/Assets',
    'Developers/GameDevelopment/Scripts',
    'Developers/GameDevelopment/Levels',
    'Developers/GameDevelopment/Docs',
    'Developers/AI/Models',
    'Developers/AI/Datasets',
    'Developers/AI/Experiments',
    'Developers/AI/Scripts',
    'Developers/AI/Docs',
    'Developers/Mobile/Android',
    'Developers/Mobile/iOS',
    'Developers/Mobile/CrossPlatform',
    'Developers/Mobile/SDKs',
    'Developers/Mobile/Resources',
    
    // Share folder structure
    'Share/Media/Videos/Movies/Trailers',
    'Share/Media/Videos/Movies/Shorts',
    'Share/Media/Videos/Movies/Documentaries',
    'Share/Media/Videos/Movies/Adult',
    'Share/Media/Videos/Movies/Collections',
    'Share/Media/Videos/Tutorials/Coding',
    'Share/Media/Videos/Tutorials/Design',
    'Share/Media/Videos/Tutorials/Hardware',
    'Share/Media/Videos/Tutorials/Software',
    'Share/Media/Videos/Tutorials/Language',
    'Share/Media/Videos/Clips',
    'Share/Media/Videos/Vlogs',
    'Share/Media/Videos/Recorded',
    'Share/Media/Videos/Archives',
    'Share/Media/Videos/Animations',
    'Share/Media/Videos/Webinars',
    'Share/Media/Videos/Events',
    'Share/Media/Videos/MusicVideos',
    'Share/Media/Audio/Songs/Albums',
    'Share/Media/Audio/Songs/Singles',
    'Share/Media/Audio/Songs/Genres/Rock',
    'Share/Media/Audio/Songs/Genres/Pop',
    'Share/Media/Audio/Songs/Genres/Jazz',
    'Share/Media/Audio/Songs/Genres/Others',
    'Share/Media/Audio/Songs/Playlists',
    'Share/Media/Audio/Podcasts/Technology',
    'Share/Media/Audio/Podcasts/Education',
    'Share/Media/Audio/Podcasts/News',
    'Share/Media/Audio/Podcasts/Entertainment',
    'Share/Media/Audio/Audiobooks',
    'Share/Media/Audio/SoundEffects',
    'Share/Media/Audio/Recordings',
    'Share/Media/Images/Photos/Family',
    'Share/Media/Images/Photos/Friends',
    'Share/Media/Images/Photos/Travel',
    'Share/Media/Images/Photos/Events/Birthdays',
    'Share/Media/Images/Photos/Events/Weddings',
    'Share/Media/Images/Photos/Events/Graduations',
    'Share/Media/Images/Photos/Events/Celebrations',
    'Share/Media/Images/Photos/Selfies',
    'Share/Media/Images/Photos/Portraits',
    'Share/Media/Images/Photos/Random',
    'Share/Media/Images/Screenshots/Web',
    'Share/Media/Images/Screenshots/Apps',
    'Share/Media/Images/Screenshots/Errors',
    'Share/Media/Images/Screenshots/Chat',
    'Share/Media/Images/Wallpapers/Nature',
    'Share/Media/Images/Wallpapers/Abstract',
    'Share/Media/Images/Wallpapers/Minimal',
    'Share/Media/Images/Wallpapers/Dark',
    'Share/Media/Images/Wallpapers/4K',
    'Share/Media/Images/Edited/ColorGraded',
    'Share/Media/Images/Edited/Retouched',
    'Share/Media/Images/Edited/Filters',
    'Share/Media/Images/Edited/Memes',
    'Share/Media/Images/Archives/Old',
    'Share/Media/Images/Archives/Duplicates',
    'Share/Media/Images/Archives/ToSort'
  ];
  
  console.log(chalk.hex('#9d4edd').bold(`\n📁 Creating folder structure on ${driveLetter}:`));
  
  const progressBar = createProgressBar('Creating folders', folderStructure.length);
  
  try {
    for (let i = 0; i < folderStructure.length; i++) {
      const folderPath = path.join(rootPath, folderStructure[i]);
      await fs.ensureDir(folderPath);
      
      // Create README.md file in each folder
      const readmePath = path.join(folderPath, 'README.md');
      const folderName = path.basename(folderPath);
      const folderPurpose = getFolderDescription(folderPath);
      
      const readmeContent = `# ${folderName}\n\n${folderPurpose}\n\n*Created by LunrLust Windows Setup Tool*`;
      await fs.writeFile(readmePath, readmeContent);
      
      updateProgress(progressBar, i + 1);
    }
    
    completeProgress(progressBar);
    console.log(chalk.green.bold(`✓ Folder structure created successfully on drive ${driveLetter}:`));
    logger.info(`Created folder structure on drive ${driveLetter}:`);
    
  } catch (error) {
    logger.error(`Error creating folder structure on drive ${driveLetter}: ${error.message}`);
    console.error(chalk.red(`Error creating folder structure: ${error.message}`));
  }
}

/**
 * Get a description for a folder based on its path
 * @param {string} folderPath - Path to the folder
 * @returns {string} Description of the folder
 */
function getFolderDescription(folderPath) {
  // Extract folder categories from path
  const parts = folderPath.split(path.sep);
  
  // Remove drive letter and empty parts
  const cleanParts = parts.filter(part => part && !part.endsWith(':'));
  
  // Generate appropriate description based on path
  switch (cleanParts[0]) {
    case 'Apps':
      if (cleanParts[1] === 'Games') {
        return `This folder is for storing ${cleanParts[2] || 'game'} files and related content.`;
      } else if (cleanParts[1] === 'Packages') {
        return `This folder contains ${cleanParts[2] || 'software'} packages and installers.`;
      } else if (cleanParts[1] === 'Drivers') {
        return `This folder stores ${cleanParts[2] || 'hardware'} drivers and related software.`;
      }
      return 'This folder contains application files and related content.';
      
    case 'Documents':
      if (cleanParts[1] === 'Personal') {
        return 'This folder contains personal documents and important files.';
      } else if (cleanParts[1] === 'Finance') {
        return 'This folder stores financial documents and records.';
      } else if (cleanParts[1] === 'Education') {
        return 'This folder contains educational materials, notes, and related content.';
      } else if (cleanParts[1] === 'Writing') {
        return 'This folder is for writing projects, drafts, and creative content.';
      }
      return 'This folder contains important documents and files.';
      
    case 'Developers':
      if (cleanParts[1] === 'Networking') {
        return 'This folder contains networking tools, scripts, and configurations.';
      } else if (cleanParts[1] === 'Web') {
        return 'This folder is for web development projects and assets.';
      } else if (cleanParts[1] === 'GameDevelopment') {
        return 'This folder contains game development resources and projects.';
      } else if (cleanParts[1] === 'AI') {
        return 'This folder is for AI development, models, and datasets.';
      } else if (cleanParts[1] === 'Mobile') {
        return 'This folder contains mobile development projects and resources.';
      }
      return 'This folder contains development resources and projects.';
      
    case 'Share':
      if (cleanParts[1] === 'Media') {
        if (cleanParts[2] === 'Videos') {
          return 'This folder contains video files and related content.';
        } else if (cleanParts[2] === 'Audio') {
          return 'This folder stores audio files, music, and sound content.';
        } else if (cleanParts[2] === 'Images') {
          return 'This folder contains images, photos, and visual content.';
        }
        return 'This folder contains media files for sharing.';
      }
      return 'This folder contains shared files and content.';
      
    default:
      return 'This folder is part of the LunrLust organized folder structure.';
  }
}