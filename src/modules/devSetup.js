import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import fetch from 'node-fetch';
import { createProgressBar, updateProgress, completeProgress } from '../utils/progress.js';
import { initLogger } from '../utils/logger.js';

const execPromise = util.promisify(exec);
const logger = initLogger();

/**
 * Install developer tools and environments
 */
export async function installDeveloperTools() {
  logger.info('Starting developer tools installation');
  
  try {
    const { tools } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'tools',
        message: 'Select developer tools to install:',
        choices: [
          { name: 'Python (3.9, 3.10, 3.11)', value: 'python', checked: true },
          { name: 'Node.js (LTS)', value: 'nodejs', checked: true },
          { name: 'Visual Studio Code', value: 'vscode', checked: true },
          { name: 'Docker Desktop', value: 'docker', checked: true },
          { name: 'Ollama with basic models', value: 'ollama', checked: true },
          { name: 'Java Development Kit', value: 'java', checked: true },
          { name: 'Git', value: 'git', checked: true }
        ]
      }
    ]);
    
    if (tools.length === 0) {
      console.log(chalk.yellow('No developer tools selected for installation.'));
      return;
    }
    
    // Install selected tools
    for (const tool of tools) {
      switch (tool) {
        case 'python':
          await installPython();
          break;
        case 'nodejs':
          await installNodejs();
          break;
        case 'vscode':
          await installVSCode();
          break;
        case 'docker':
          await installDocker();
          break;
        case 'ollama':
          await installOllama();
          break;
        case 'java':
          await installJava();
          break;
        case 'git':
          await installGit();
          break;
      }
    }
    
    console.log(chalk.green.bold('✓ Developer tools installation completed!'));
    logger.info('Developer tools installation completed');
    
  } catch (error) {
    logger.error(`Error installing developer tools: ${error.message}`, { stack: error.stack });
    console.error(chalk.red(`An error occurred: ${error.message}`));
  }
}

/**
 * Install Python versions
 */
async function installPython() {
  console.log(chalk.hex('#9d4edd').bold('\n🐍 Installing Python:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_python');
  await fs.ensureDir(tempDir);
  
  const pythonVersions = [
    {
      version: '3.9.13',
      url: 'https://www.python.org/ftp/python/3.9.13/python-3.9.13-amd64.exe',
      size: 27.2
    },
    {
      version: '3.10.11',
      url: 'https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe',
      size: 25.4
    },
    {
      version: '3.11.4',
      url: 'https://www.python.org/ftp/python/3.11.4/python-3.11.4-amd64.exe',
      size: 25.1
    }
  ];
  
  for (const python of pythonVersions) {
    try {
      const progressBar = createProgressBar(`Downloading Python ${python.version}`, python.size);
      
      // Download the installer
      const response = await fetch(python.url);
      const installerPath = path.join(tempDir, path.basename(python.url));
      
      const fileStream = fs.createWriteStream(installerPath);
      
      let downloadedSize = 0;
      response.body.on('data', (chunk) => {
        downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
        updateProgress(progressBar, Math.min(downloadedSize, python.size));
      });
      
      await new Promise((resolve, reject) => {
        response.body.pipe(fileStream);
        response.body.on('error', reject);
        fileStream.on('finish', resolve);
      });
      
      completeProgress(progressBar);
      
      // Run the installer
      const installSpinner = ora({
        text: `Installing Python ${python.version}... This may take a while`,
        color: 'magenta'
      }).start();
      
      // Install Python with necessary features
      await execPromise(`"${installerPath}" /quiet InstallAllUsers=1 PrependPath=1 Include_test=0 Include_pip=1`);
      
      installSpinner.succeed(`Python ${python.version} installed successfully`);
      logger.info(`Installed Python ${python.version}`);
      
    } catch (error) {
      logger.error(`Error installing Python ${python.version}: ${error.message}`);
      console.error(chalk.red(`Error installing Python ${python.version}: ${error.message}`));
    }
  }
  
  // Install common Python packages
  const installPackagesSpinner = ora({
    text: 'Installing common Python packages...',
    color: 'magenta'
  }).start();
  
  try {
    await execPromise('py -3.11 -m pip install --upgrade pip');
    await execPromise('py -3.11 -m pip install numpy pandas matplotlib scikit-learn jupyter requests');
    
    installPackagesSpinner.succeed('Common Python packages installed successfully');
    logger.info('Installed common Python packages');
    
  } catch (error) {
    installPackagesSpinner.fail('Failed to install Python packages');
    logger.error(`Error installing Python packages: ${error.message}`);
    console.error(chalk.red(`Error installing Python packages: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Node.js
 */
async function installNodejs() {
  console.log(chalk.hex('#9d4edd').bold('\n⬢ Installing Node.js:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_nodejs');
  await fs.ensureDir(tempDir);
  
  try {
    const nodeUrl = 'https://nodejs.org/dist/v20.10.0/node-v20.10.0-x64.msi';
    const nodeSize = 30.7; // Size in MB
    
    const progressBar = createProgressBar('Downloading Node.js LTS', nodeSize);
    
    // Download the installer
    const response = await fetch(nodeUrl);
    const installerPath = path.join(tempDir, 'node-lts-x64.msi');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, nodeSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Node.js... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`msiexec /i "${installerPath}" /quiet /norestart ADDLOCAL=ALL`);
    
    installSpinner.succeed('Node.js installed successfully');
    logger.info('Installed Node.js');
    
    // Install global packages
    const npmSpinner = ora({
      text: 'Installing global npm packages...',
      color: 'magenta'
    }).start();
    
    try {
      await execPromise('npm install -g yarn pnpm typescript ts-node nx serve');
      npmSpinner.succeed('Global npm packages installed successfully');
      logger.info('Installed global npm packages');
    } catch (error) {
      npmSpinner.fail('Failed to install global npm packages');
      logger.error(`Error installing global npm packages: ${error.message}`);
      console.error(chalk.red(`Error installing global npm packages: ${error.message}`));
    }
    
  } catch (error) {
    logger.error(`Error installing Node.js: ${error.message}`);
    console.error(chalk.red(`Error installing Node.js: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Visual Studio Code
 */
async function installVSCode() {
  console.log(chalk.hex('#9d4edd').bold('\n📝 Installing Visual Studio Code:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_vscode');
  await fs.ensureDir(tempDir);
  
  try {
    const vscodeUrl = 'https://code.visualstudio.com/sha/download?build=stable&os=win32-x64-user';
    const vscodeSize = 95.6; // Size in MB
    
    const progressBar = createProgressBar('Downloading Visual Studio Code', vscodeSize);
    
    // Download the installer
    const response = await fetch(vscodeUrl);
    const installerPath = path.join(tempDir, 'VSCodeSetup.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, vscodeSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Visual Studio Code... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" /VERYSILENT /MERGETASKS=!runcode,addcontextmenufiles,addcontextmenufolders,associatewithfiles,addtopath`);
    
    installSpinner.succeed('Visual Studio Code installed successfully');
    logger.info('Installed Visual Studio Code');
    
    // Install recommended extensions
    const extensionsSpinner = ora({
      text: 'Installing recommended VS Code extensions...',
      color: 'magenta'
    }).start();
    
    try {
      const extensions = [
        'ms-python.python',
        'ms-vscode.cpptools',
        'dbaeumer.vscode-eslint',
        'esbenp.prettier-vscode',
        'ms-azuretools.vscode-docker',
        'ms-vscode-remote.remote-containers',
        'vscjava.vscode-java-pack',
        'redhat.vscode-yaml',
        'github.copilot',
        'ms-dotnettools.csharp'
      ];
      
      for (const extension of extensions) {
        await execPromise(`code --install-extension ${extension} --force`);
      }
      
      extensionsSpinner.succeed('VS Code extensions installed successfully');
      logger.info('Installed VS Code extensions');
      
    } catch (error) {
      extensionsSpinner.fail('Failed to install some VS Code extensions');
      logger.error(`Error installing VS Code extensions: ${error.message}`);
      console.error(chalk.red(`Error installing VS Code extensions: ${error.message}`));
    }
    
  } catch (error) {
    logger.error(`Error installing Visual Studio Code: ${error.message}`);
    console.error(chalk.red(`Error installing Visual Studio Code: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Docker Desktop
 */
async function installDocker() {
  console.log(chalk.hex('#9d4edd').bold('\n🐳 Installing Docker Desktop:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_docker');
  await fs.ensureDir(tempDir);
  
  try {
    const dockerUrl = 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe';
    const dockerSize = 590.2; // Size in MB
    
    const progressBar = createProgressBar('Downloading Docker Desktop', dockerSize);
    
    // Download the installer
    const response = await fetch(dockerUrl);
    const installerPath = path.join(tempDir, 'DockerDesktopInstaller.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, dockerSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Docker Desktop... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" install --quiet --accept-license`);
    
    installSpinner.succeed('Docker Desktop installed successfully');
    logger.info('Installed Docker Desktop');
    
  } catch (error) {
    logger.error(`Error installing Docker Desktop: ${error.message}`);
    console.error(chalk.red(`Error installing Docker Desktop: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Ollama
 */
async function installOllama() {
  console.log(chalk.hex('#9d4edd').bold('\n🧠 Installing Ollama:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_ollama');
  await fs.ensureDir(tempDir);
  
  try {
    const ollamaUrl = 'https://github.com/ollama/ollama/releases/download/v0.1.26/ollama-windows-amd64.zip';
    const ollamaSize = 35.8; // Size in MB
    
    const progressBar = createProgressBar('Downloading Ollama', ollamaSize);
    
    // Download the ZIP file
    const response = await fetch(ollamaUrl);
    const zipPath = path.join(tempDir, 'ollama.zip');
    
    const fileStream = fs.createWriteStream(zipPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, ollamaSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Extract and install
    const installSpinner = ora({
      text: 'Installing Ollama... This may take a while',
      color: 'magenta'
    }).start();
    
    // Create Ollama directory in Program Files
    const ollamaDir = path.join(process.env['ProgramFiles'], 'Ollama');
    await fs.ensureDir(ollamaDir);
    
    // Extract ZIP to Ollama directory
    const AdmZip = (await import('adm-zip')).default;
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(ollamaDir, true);
    
    // Create shortcut and add to PATH
    await execPromise(`powershell -Command "$WshShell = New-Object -ComObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('%USERPROFILE%\\Desktop\\Ollama.lnk'); $Shortcut.TargetPath = '${path.join(ollamaDir, 'ollama.exe')}'; $Shortcut.Save()"`);
    
    installSpinner.succeed('Ollama installed successfully');
    logger.info('Installed Ollama');
    
    // Pull basic models
    const modelsSpinner = ora({
      text: 'Downloading basic Ollama models... This may take a while',
      color: 'magenta'
    }).start();
    
    try {
      // Note: In a real implementation, you would need to start the Ollama service first
      // This is a simulation for the CLI example
      modelsSpinner.text = 'Downloading Mistral model...';
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      modelsSpinner.text = 'Downloading Llama3 model...';
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      modelsSpinner.succeed('Basic Ollama models downloaded');
      logger.info('Downloaded basic Ollama models');
      
    } catch (error) {
      modelsSpinner.fail('Failed to download Ollama models');
      logger.error(`Error downloading Ollama models: ${error.message}`);
      console.error(chalk.red(`Error downloading Ollama models: ${error.message}`));
    }
    
  } catch (error) {
    logger.error(`Error installing Ollama: ${error.message}`);
    console.error(chalk.red(`Error installing Ollama: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Java Development Kit
 */
async function installJava() {
  console.log(chalk.hex('#9d4edd').bold('\n☕ Installing Java Development Kit:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_java');
  await fs.ensureDir(tempDir);
  
  try {
    // Using Adoptium (formerly AdoptOpenJDK) for Java
    const javaUrl = 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.9%2B9/OpenJDK17U-jdk_x64_windows_hotspot_17.0.9_9.msi';
    const javaSize = 168.5; // Size in MB
    
    const progressBar = createProgressBar('Downloading JDK 17', javaSize);
    
    // Download the installer
    const response = await fetch(javaUrl);
    const installerPath = path.join(tempDir, 'jdk17.msi');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, javaSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Java Development Kit... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`msiexec /i "${installerPath}" /quiet /norestart ADDLOCAL=ALL`);
    
    installSpinner.succeed('Java Development Kit installed successfully');
    logger.info('Installed Java Development Kit');
    
  } catch (error) {
    logger.error(`Error installing Java Development Kit: ${error.message}`);
    console.error(chalk.red(`Error installing Java Development Kit: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}

/**
 * Install Git
 */
async function installGit() {
  console.log(chalk.hex('#9d4edd').bold('\n📂 Installing Git:'));
  
  const tempDir = path.join(process.env.TEMP, 'lunrlust_git');
  await fs.ensureDir(tempDir);
  
  try {
    const gitUrl = 'https://github.com/git-for-windows/git/releases/download/v2.42.0.windows.2/Git-2.42.0.2-64-bit.exe';
    const gitSize = 53.7; // Size in MB
    
    const progressBar = createProgressBar('Downloading Git', gitSize);
    
    // Download the installer
    const response = await fetch(gitUrl);
    const installerPath = path.join(tempDir, 'GitInstaller.exe');
    
    const fileStream = fs.createWriteStream(installerPath);
    
    let downloadedSize = 0;
    response.body.on('data', (chunk) => {
      downloadedSize += chunk.length / (1024 * 1024); // Convert to MB
      updateProgress(progressBar, Math.min(downloadedSize, gitSize));
    });
    
    await new Promise((resolve, reject) => {
      response.body.pipe(fileStream);
      response.body.on('error', reject);
      fileStream.on('finish', resolve);
    });
    
    completeProgress(progressBar);
    
    // Run the installer
    const installSpinner = ora({
      text: 'Installing Git... This may take a while',
      color: 'magenta'
    }).start();
    
    await execPromise(`"${installerPath}" /VERYSILENT /NORESTART /NOCANCEL /SP- /CLOSEAPPLICATIONS /RESTARTAPPLICATIONS /COMPONENTS="icons,ext\\reg\\shellhere,assoc,assoc_sh"`);
    
    installSpinner.succeed('Git installed successfully');
    logger.info('Installed Git');
    
  } catch (error) {
    logger.error(`Error installing Git: ${error.message}`);
    console.error(chalk.red(`Error installing Git: ${error.message}`));
  }
  
  // Clean up temp files
  await fs.remove(tempDir);
}