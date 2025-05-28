import cliProgress from 'cli-progress';
import chalk from 'chalk';

// Create a custom progress bar theme with violet colors
const progressBarTheme = {
  format: `${chalk.hex('#5a189a').bold('{bar}')} ${chalk.hex('#9d4edd')('{percentage}%')} | ${chalk.hex('#c77dff')('Speed:')} {speed} | ${chalk.hex('#e0aaff')('ETA:')} {eta}s | {value}/{total} MB`,
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true
};

// Create a multi bar container
const multiBar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: progressBarTheme.format
}, cliProgress.Presets.shades_classic);

/**
 * Creates a new progress bar for a download or installation
 * @param {string} task - Name of the task
 * @param {number} totalSize - Total size in MB
 * @returns {object} Progress bar instance
 */
export function createProgressBar(task, totalSize) {
  console.log(chalk.hex('#9d4edd').bold(`\n⏳ ${task}:`));
  
  const bar = multiBar.create(totalSize, 0, {
    speed: "N/A",
    eta: "N/A"
  });
  
  // Store start time to calculate speed
  bar.start = Date.now();
  
  return bar;
}

/**
 * Updates the progress bar with new progress
 * @param {object} bar - Progress bar instance
 * @param {number} value - Current progress value
 */
export function updateProgress(bar, value) {
  // Calculate speed in MB/s
  const elapsedTime = (Date.now() - bar.start) / 1000; // seconds
  const speed = elapsedTime > 0 ? (value / elapsedTime).toFixed(2) + ' MB/s' : 'N/A';
  
  // Calculate ETA
  const eta = elapsedTime > 0 ? ((bar.total - value) / (value / elapsedTime)).toFixed(0) : 'N/A';
  
  bar.update(value, {
    speed: speed,
    eta: eta
  });
}

/**
 * Stops all progress bars
 */
export function stopAllProgress() {
  multiBar.stop();
}

/**
 * Completes a progress bar
 * @param {object} bar - Progress bar instance
 */
export function completeProgress(bar) {
  bar.update(bar.total);
  
  // Optional: Add some separation after the bar completes
  console.log('');
}