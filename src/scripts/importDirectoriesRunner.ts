#!/usr/bin/env bun
/**
 * Script to import directory data from the Excel file.
 * 
 * Usage:
 * bun run src/scripts/importDirectoriesRunner.ts [path/to/excel/file]
 */

import { importDirectories } from './importDirectories';
import path from 'path';

// Get the file path from the command line arguments or use the default
const defaultFilePath = path.resolve(process.cwd(), 'Nouasseur 2.xlsx');
const filePath = process.argv[2] || defaultFilePath;

console.log(`
============================================================
Directory Import Tool
============================================================
File path: ${filePath}
Date: ${new Date().toLocaleString()}
============================================================
`);

importDirectories(filePath)
  .then(() => {
    console.log(`
============================================================
Directory import completed successfully.
============================================================
`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(`
============================================================
Directory import failed:
${error}
============================================================
`);
    process.exit(1);
  }); 