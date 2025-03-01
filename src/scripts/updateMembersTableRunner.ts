import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check if the scripts directory exists, if not create it
const scriptsDir = path.join(__dirname);
if (!fs.existsSync(scriptsDir)) {
  fs.mkdirSync(scriptsDir, { recursive: true });
  console.log(`Created scripts directory at ${scriptsDir}`);
}

try {
  // Run the updateMembersTable script
  console.log('Running migration to update members table column widths...');
  execSync('bun run src/scripts/updateMembersTable.ts', { stdio: 'inherit' });
  console.log('Migration completed successfully.');
} catch (error) {
  console.error('Error running migration:', error);
  process.exit(1);
} 