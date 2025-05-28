import si from 'systeminformation';
import chalk from 'chalk';
import ora from 'ora';
import { initLogger } from '../utils/logger.js';

const logger = initLogger();

/**
 * Check if the system meets the requirements
 * @param {boolean} display - Whether to display the results
 * @returns {object} Object with success status and issues array
 */
export async function checkSystemRequirements(display = false) {
  const spinner = ora({
    text: 'Checking system requirements...',
    color: 'magenta'
  }).start();
  
  logger.info('Starting system requirements check');
  
  const issues = [];
  
  try {
    // Get CPU information
    const cpu = await si.cpu();
    
    // Get memory information
    const mem = await si.mem();
    
    // Get OS information
    const os = await si.osInfo();
    
    // Get graphics information
    const graphics = await si.graphics();
    
    // Get disk information
    const disks = await si.diskLayout();
    
    // Check Windows version
    if (os.platform !== 'win32') {
      issues.push('This script is designed for Windows operating systems only');
    } else if (!os.release.startsWith('10.') && !os.release.startsWith('11.')) {
      issues.push('Windows 10 or 11 recommended');
    }
    
    // Check CPU requirements
    if (cpu.cores < 4) {
      issues.push('CPU should have at least 4 cores');
    }
    
    // Check memory requirements
    const ramGB = Math.round(mem.total / 1024 / 1024 / 1024);
    if (ramGB < 8) {
      issues.push('System should have at least 8GB RAM');
    }
    
    // Check disk space
    const systemDrive = disks.find(disk => disk.device.includes('C:'));
    if (systemDrive) {
      const freeSpace = systemDrive.size - systemDrive.size * (systemDrive.percentageFree / 100);
      if (freeSpace < 50 * 1024 * 1024 * 1024) { // 50GB
        issues.push('System drive should have at least 50GB free space');
      }
    }
    
    // Check for compatible GPU
    const mainGPU = graphics.controllers[0];
    if (mainGPU) {
      // Check if GPU is integrated
      const isIntegrated = mainGPU.vendor.toLowerCase().includes('intel') && 
                           !mainGPU.model.toLowerCase().includes('arc');
      
      if (isIntegrated) {
        issues.push('Dedicated GPU recommended for optimal gaming performance');
      }
      
      // Check VRAM
      if (mainGPU.vram < 2048) {
        issues.push('GPU should have at least 2GB VRAM');
      }
    } else {
      issues.push('No GPU detected');
    }
    
    spinner.succeed('System check completed');
    
    // If display flag is true, show the system information
    if (display) {
      console.log('\n' + chalk.hex('#9d4edd').bold('📊 System Information:'));
      console.log(chalk.hex('#c77dff')('• CPU:      ') + `${cpu.manufacturer} ${cpu.brand} (${cpu.cores} cores)`);
      console.log(chalk.hex('#c77dff')('• Memory:   ') + `${ramGB}GB RAM`);
      console.log(chalk.hex('#c77dff')('• OS:       ') + `${os.distro} ${os.release} ${os.arch}`);
      
      if (mainGPU) {
        console.log(chalk.hex('#c77dff')('• GPU:      ') + `${mainGPU.vendor} ${mainGPU.model} (${mainGPU.vram}MB VRAM)`);
      }
      
      if (issues.length > 0) {
        console.log('\n' + chalk.yellow.bold('⚠️ System Recommendations:'));
        issues.forEach(issue => {
          console.log(chalk.yellow(`• ${issue}`));
        });
      } else {
        console.log('\n' + chalk.green.bold('✓ Your system meets all requirements!'));
      }
    }
    
    logger.info('System check completed', { issues, systemInfo: { cpu: cpu.brand, ram: ramGB, os: os.distro } });
    
    return {
      success: issues.length === 0,
      issues,
      systemInfo: {
        cpu,
        memory: { total: mem.total, free: mem.free },
        os,
        graphics,
        disks
      }
    };
    
  } catch (error) {
    spinner.fail('System check failed');
    logger.error(`Error checking system requirements: ${error.message}`, { stack: error.stack });
    
    return {
      success: false,
      issues: ['Failed to check system requirements: ' + error.message]
    };
  }
}