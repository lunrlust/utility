import cliProgress from 'cli-progress';
import chalk from 'chalk';

// Create a custom progress bar theme with violet colors
const progressBarTheme = {
  format: `${chalk.hex('#5a189a').bold('{bar}')} ${chalk.hex('#9d4edd')('{percentage}%')} | ${chalk.hex('#c77dff')('Speed:')} {speed} MB/s | ${chalk.hex('#e0aaff')('ETA:')} {eta}s | {value}/{total} MB`,
  barCompleteChar: '█',
  barIncompleteChar: '░',
  hideCursor: true
};

// Create a multi bar container
const multiBar = new cliProgress.MultiBar({
  clearOnComplete: false,
  hideCursor: true,
  format: progressBarTheme.format,
  barsize: 30,
  stopOnComplete: true,
  forceRedraw: true
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
  bar.lastUpdate = Date.now();
  bar.lastValue = 0;
  
  return bar;
}

/**
 * Updates the progress bar with new progress
 * @param {object} bar - Progress bar instance
 * @param {number} value - Current progress value
 */
export function updateProgress(bar, value) {
  const now = Date.now();
  const timeDiff = (now - bar.lastUpdate) / 1000; // seconds
  const valueDiff = value - bar.lastValue;
  
  // Calculate speed (only update if enough time has passed)
  let speed = "N/A";
  if (timeDiff >= 0.1) { // Update speed every 100ms
    speed = (valueDiff / timeDiff).toFixed(2);
    bar.lastUpdate = now;
    bar.lastValue = value;
  }
  
  // Calculate ETA
  const elapsedTime = (now - bar.start) / 1000; // seconds
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
  bar.update(bar.total, {
    speed: "Done",
    eta: "0"
  });
  
  // Optional: Add some separation after the bar completes
  console.log('');
}