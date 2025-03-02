#!/usr/bin/env bun

import * as XLSX from 'xlsx';
import path from 'path';
import fs from 'fs';

// Path to the Excel file
const excelFilePath = path.resolve(process.cwd(), 'Nouasseur 2.xlsx');

try {
  console.log(`Examining Excel file at: ${excelFilePath}`);
  
  if (!fs.existsSync(excelFilePath)) {
    console.error(`File not found: ${excelFilePath}`);
    process.exit(1);
  }

  // Read the Excel file
  const workbook = XLSX.readFile(excelFilePath);
  
  // Get information about available sheets
  console.log('\nAvailable sheets:');
  workbook.SheetNames.forEach((sheetName, index) => {
    console.log(`${index + 1}. ${sheetName}`);
  });

  // Get a sample of data from the first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  
  // Convert to JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  // Print header (first row) if exists
  if (data.length > 0) {
    console.log('\nColumn headers:');
    console.log(data[0]);
  }
  
  // Print first few rows as sample data
  if (data.length > 1) {
    console.log('\nSample data (first 3 rows):');
    for (let i = 1; i < Math.min(4, data.length); i++) {
      console.log(`Row ${i}:`, data[i]);
    }
  }
  
  // Count rows
  console.log(`\nTotal rows: ${data.length - 1} (excluding header)`);
  
} catch (error) {
  console.error('Error examining Excel file:', error);
  process.exit(1);
} 