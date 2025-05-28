import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import si from 'systeminformation';
import fetch from 'node-fetch';
import { createProgressBar, updateProgress, completeProgress } from '../utils/progress.js';
import { initLogger } from '../utils/logger.js';

const execPromise = util.promisify(exec);
const logger = initLogger();

// Base URL for downloading dependencies
const DOWNLOAD_BASE_URL = 'https://download.microsoft.com/download';

/**
 * Install gaming dependencies and clients
 */
export async function installGamingDependencies() {
  logger.info('Starting gaming dependencies installation');
  
  try {
    const { components } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'components',
        message: 'Select gaming components to install:',
        choices: [
          { name: 'Visual C++ Redistributables', value: 'vcredist', checked: true },
          { name: 'DirectX Runtime', value: 'directx', checked: true },
          { name: 'Hardware Drivers (GPU, Audio, Network)', value: 'drivers', checked: true },
          { name: 'Steam', value: 'steam', checked: true },
          { name: 'Epic Games Launcher', value: 'epic', checked: true },
          { name: 'Ubisoft Connect', value: 'ubisoft', checked: true }
        ]
      }
    ]);
    
    if (components.length === 0) {
      console.log(chalk.yellow('No components selected for installation.'));
      return;
    }
    
    // Install selected components
    for (const component of components) {
      switch (component) {
        case 'vcredist':
          await installVCRedist();
          break;
        case 'directx':
          await installDirectX();
          break;
        case 'drivers':
          await installHardwareDrivers();
          break;
        case 'steam':
          await installSteam();
          break;
        case 'epic':
          await installEpicGames();
          break;
        case 'ubisoft':
          await installUbisoftConnect();
          break;
      }
    }
    
    console.log(chalk.green.bold('✓ Gaming dependencies installation completed!'));
    logger.info('Gaming dependencies installation completed');
    
  } catch (error) {
    logger.error(`Error installing gaming dependencies: ${error.message}`, { stack: error.stack });
    console.error(chalk.red(`An error occurred: ${error.message}`));
  }
}

/**
 * Install Visual C++ Redistributables
 */
async function installVCRedist() {
  console.log(chalk.hex('#9d4edd').bold('\n🔧 Installing Visual C++ Redistributables:'));
  
  const vcRedists = [
    { 
      name: 'Visual C++ 2013 Redistributable (x86)',
      url: `${DOWNLOAD_BASE_URL}/0/0/F/00F8D0BD-8E9E-4AB6-A4AA-5B4EF211B3C7/vcredist_x86.exe`,
      size: 6.5,
      args: '/install /quiet /norestart'
    },
    { 
      name: 'Visual C++ 2013 Redistributable (x64)',
      url: `${DOWNLOAD_BASE_URL}/2/E/6/2E61CFA4-993B-4DD4-91DA-3737CD5CD6E3/vcredist_x64.exe`,
      size: 7.2,
      args: '/install /quiet /norestart'
    },
    { 
      name: 'Visual C++ 2015-2022 Redistributable (x86)',
      url: `${DOWNLOAD_BASE_URL}/9/3/F/93FCF1E7-E6A4-478B-96E7-D4B285925B00/vc_redist.x86.exe`,
      size: 14.3,
      args: '/install /quiet /norestart'
    },
    { 
      name: 'Visual C++ 2015-2022 Redistributable (x64)',
      url: `${DOWNLOAD_BASE_URL}/5/1/3/51351D95-75F4-45D5-87C5-1D96AB619724/vc_redist.x64.exe`,
      size: 25.1,
      args: '/install /quiet /norestart'
    }
  ];
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_vcredist');
  await fs.ensureDir(tempDir);
  
  for (const vcRedist of vcRedists) {
    try {
      const progressBar = createProgressBar(`Downloading ${vcRedist.name}`, vcRedist.size);
      
      // Download the installer
      const response = await fetch(vcRedist.url);
      const installerPath = path.join(tempDir, path.basename(vcRedist.url));
      
      const fileStream = fs.createWriteStream(installerPath);
      
      let downloadedSize = 0;
      response.body.on('data', (chunk) => {
        downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
        updateProgress(progressBar, Math.min(downloadedSize, vcRedist.size));
      });
      
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      });
      
      completeProgress(progressBar);
      
      // Run the installer
      const installSpinner = ora({
        text: `Installing ${vcRedist.name}...`,
        color: 'magenta'
      }).start();
      
      await execPromise(`"${installerPath}" ${vcRedist.args}`);
      
      installSpinner.succeed(`${vcRedist.name} installed successfully`);
      logger.info(`Installed ${vcRedist.name}`);
      
    } catch (error) {
      logger.error(`Error installing ${vcRedist.name}: ${error.message}`);
      console.error(chalk.red(`Error installing ${vcRedist.name}: ${error.message}`));
    }
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install DirectX Runtime
 */
async function installDirectX() {
  console.log(chalk.hex('#9d4edd').bold('\n🎮 Installing DirectX Runtime:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_directx');
  await fs.ensureDir(tempDir);
  
  try {
    const directXUrl = 'https://download.microsoft.com/download/1/7/1/1718CCC4-6315-4D8E-9543-8E28A4E18C4C/dxwebsetup.exe';
    const directXSize = 1.8; // Size in MB
    
    const progressBar = createProgressBar('Downloading DirectX Web Setup', directXSize);
    
    // Download the installer
    const response = await fetch(directXUrl);
    const installerPath = path.join(tempDir, 'dxwebsetup.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, directXSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing DirectX Runtime... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" /silent`);
    
    installSpinner.succeed('DirectX Runtime installed successfully');
    logger.info('Installed DirectX Runtime');
    
  } catch (error) {
    logger.error(`Error installing DirectX Runtime: ${error.message}`);
    console.error(chalk.red(`Error installing DirectX Runtime: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install hardware drivers
 */
async function installHardwareDrivers() {
  console.log(chalk.hex('#9d4edd').bold('\n🖥️ Detecting and installing hardware drivers:'));
  
  try {
    const spinner = ora({
      text: 'Detecting hardware...',
      color: 'magenta'
    }).start();
    
    // Get hardware information
    const graphics = await si.graphics();
    const audio = await si.audio();
    const networkInterfaces = await si.networkInterfaces();
    
    spinner.succeed('Hardware detection completed');
    
    // Display detected hardware
    console.log(chalk.hex('#c77dff')('\n• GPU:'));
    graphics.controllers.forEach((gpu, index) => {
      console.log(`  ${index + 1}. ${gpu.vendor} ${gpu.model}`);
    });
    
    console.log(chalk.hex('#c77dff')('\n• Audio:'));
    audio.forEach((device, index) => {
      console.log(`  ${index + 1}. ${device.name}`);
    });
    
    console.log(chalk.hex('#c77dff')('\n• Network:'));
    networkInterfaces.forEach((nic, index) => {
      console.log(`  ${index + 1}. ${nic.iface} (${nic.type})`);
    });
    
    // For a real implementation, we would download and install drivers
    // For this example, we'll just simulate the installation
    console.log(chalk.yellow('\nNote: In a production environment, this would download and install the latest drivers from official sources.'));
    console.log(chalk.yellow('For this simulation, we\'ll skip the actual driver installation.\n'));
    
    logger.info('Hardware drivers detection completed');
    
  } catch (error) {
    logger.error(`Error detecting hardware: ${error.message}`);
    console.error(chalk.red(`Error detecting hardware: ${error.message}`));
  }
}

/**
 * Install Steam
 */
async function installSteam() {
  console.log(chalk.hex('#9d4edd').bold('\n🎮 Installing Steam:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_steam');
  await fs.ensureDir(tempDir);
  
  try {
    const steamUrl = 'https://cdn.akamai.steamstatic.com/client/installer/SteamSetup.exe';
    const steamSize = 4.3; // Size in MB
    
    const progressBar = createProgressBar('Downloading Steam', steamSize);
    
    // Download the installer
    const response = await fetch(steamUrl);
    const installerPath = path.join(tempDir, 'SteamSetup.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, steamSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Steam... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" /S`);
    
    installSpinner.succeed('Steam installed successfully');
    logger.info('Installed Steam');
    
  } catch (error) {
    logger.error(`Error installing Steam: ${error.message}`);
    console.error(chalk.red(`Error installing Steam: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Epic Games Launcher
 */
async function installEpicGames() {
  console.log(chalk.hex('#9d4edd').bold('\n🎮 Installing Epic Games Launcher:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_epic');
  await fs.ensureDir(tempDir);
  
  try {
    const epicUrl = 'https://launcher-public-service-prod06.ol.epicgames.com/launcher/api/installer/download/EpicGamesLauncherInstaller.msi';
    const epicSize = 63.5; // Size in MB
    
    const progressBar = createProgressBar('Downloading Epic Games Launcher', epicSize);
    
    // Download the installer
    const response = await fetch(epicUrl);
    const installerPath = path.join(tempDir, 'EpicGamesLauncherInstaller.msi');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, epicSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Epic Games Launcher... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`msiexec /i "${installerPath}" /quiet /norestart`);
    
    installSpinner.succeed('Epic Games Launcher installed successfully');
    logger.info('Installed Epic Games Launcher');
    
  } catch (error) {
    logger.error(`Error installing Epic Games Launcher: ${error.message}`);
    console.error(chalk.red(`Error installing Epic Games Launcher: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Ubisoft Connect
 */
async function installUbisoftConnect() {
  console.log(chalk.hex('#9d4edd').bold('\n🎮 Installing Ubisoft Connect:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_ubisoft');
  await fs.ensureDir(tempDir);
  
  try {
    const ubisoftUrl = 'https://ubistatic3-a.akamaihd.net/orbit/launcher_installer/UbisoftConnectInstaller.exe';
    const ubisoftSize = 2.8; // Size in MB
    
    const progressBar = createProgressBar('Downloading Ubisoft Connect', ubisoftSize);
    
    // Download the installer
    const response = await fetch(ubisoftUrl);
    const installerPath = path.join(tempDir, 'UbisoftConnectInstaller.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, ubisoftSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Ubisoft Connect... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" /S`);
    
    installSpinner.succeed('Ubisoft Connect installed successfully');
    logger.info('Installed Ubisoft Connect');
    
  } catch (error) {
    logger.error(`Error installing Ubisoft Connect: ${error.message}`);
    console.error(chalk.red(`Error installing Ubisoft Connect: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}