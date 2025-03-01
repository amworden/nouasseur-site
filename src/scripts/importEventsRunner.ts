import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Make sure scripts directory exists
if (!fs.existsSync(__dirname)) {
  fs.mkdirSync(__dirname, { recursive: true });
  console.log('Created scripts directory');
}

// Run the import script
console.log('Starting events import process...');
try {
  execSync('bun run src/scripts/importEvents.ts', { stdio: 'inherit' });
  console.log('Events import completed successfully!');
} catch (error) {
  console.error('Error running events import:', error);
  process.exit(1);
} 