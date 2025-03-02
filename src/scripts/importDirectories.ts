import * as XLSX from 'xlsx';
import { db } from '../db';
import { directories, type NewDirectory } from '../db/schema';
import path from 'path';
import fs from 'fs';

// Function to read and parse Excel file
async function readExcelFile(filePath: string): Promise<any[]> {
  console.log(`Reading Excel file from ${filePath}`);
  
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Read the file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert sheet to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`Successfully read ${data.length} rows from Excel file`);
    
    return data;
  } catch (error) {
    console.error(`Error reading Excel file: ${error}`);
    throw error;
  }
}

// Function to clean up and transform row data
function transformRowData(row: any): NewDirectory {
  // Extract category based on 'type' field
  let category = 'Unknown';
  if (row['type']) {
    const type = String(row['type']).toUpperCase().trim();
    if (type.includes('FACULTY')) {
      category = 'Faculty';
    } else if (type.includes('STUDENT')) {
      category = 'Student';
    } else if (type.includes('STAFF')) {
      category = 'Staff';
    } else if (type.includes('DEPENDENT')) {
      category = 'Dependent';
    } else {
      category = type;
    }
  }
  
  // Create full name from fname, mdinit, and lmname
  const firstName = row['fname'] || '';
  const middleInitial = row['mdinit'] || '';
  const lastName = row['lmname'] || row['marrname'] || '';
  
  // Combine parts with proper spacing
  let fullName = firstName.trim();
  if (middleInitial) {
    fullName += ` ${middleInitial.trim()}`;
  }
  if (lastName) {
    fullName += ` ${lastName.trim().replace(/[()]/g, '')}`;  // Remove parentheses
  }
  
  // Create a full address
  const address1 = row['addr1'] || '';
  const address2 = row['addr2'] || '';
  const address3 = row['addr3'] || '';
  
  let fullAddress = '';
  if (address1) fullAddress += address1.trim();
  if (address2) {
    if (fullAddress) fullAddress += '\n';
    fullAddress += address2.trim();
  }
  if (address3) {
    if (fullAddress) fullAddress += '\n';
    fullAddress += address3.trim();
  }
  
  // Extract relevant details for the description
  let description = '';
  
  // Add graduation info
  if (row['gradyr']) {
    description += `Graduation Year: ${row['gradyr']}\n`;
  }
  
  // Add school attendance
  if (row['grattend'] || row['datesattend']) {
    description += `Grades Attended: ${row['grattend'] || 'Unknown'}\n`;
    description += `Dates Attended: ${row['datesattend'] || 'Unknown'}\n\n`;
  }
  
  // Add other schools attended
  if (row['oschool1']) {
    description += `Other School: ${row['oschool1']}\n`;
    if (row['datesgrade1']) {
      description += `Dates/Grades: ${row['datesgrade1']}\n\n`;
    }
  }
  
  if (row['oschool2']) {
    description += `Other School: ${row['oschool2']}\n`;
    if (row['datesgrade2']) {
      description += `Dates/Grades: ${row['datesgrade2']}\n\n`;
    }
  }
  
  if (row['oschool3']) {
    description += `Other School: ${row['oschool3']}\n`;
    if (row['datesgrade3']) {
      description += `Dates/Grades: ${row['datesgrade3']}\n\n`;
    }
  }
  
  // Create notes from comments
  const notes = row['comments'] || '';
  
  // Check for active status
  const status = row['status'] || '';
  const isActive = !(status.toUpperCase().includes('NOT LOCATED') || status.toUpperCase().includes('DECEASED'));
  
  // Map Excel columns to database fields
  return {
    name: fullName || 'Unknown',
    position: row['type'] || null,
    organization: row['school'] || 'Nouasseur',
    department: null,
    address: fullAddress || null,
    city: row['city'] || null,
    state: row['state'] || null,
    zipCode: row['zip'] || null,
    country: row['country'] || null,
    phone: row['hphone'] || row['wphone'] || null,
    email: row['emailaddr1'] || row['emailaddr2'] || null,
    website: null,
    category: category,
    subCategory: row['type'] || null,
    description: description || null,
    notes: notes || null,
    sortOrder: row['ID'] ? Number(row['ID']) : null,
    isActive: isActive,
  };
}

// Main function to import directory data
export async function importDirectories(filePath: string): Promise<void> {
  try {
    console.log('Starting directory import process...');
    
    // Get data from Excel file
    const excelData = await readExcelFile(filePath);
    
    // Transform the data
    const directoryEntries = excelData.map(transformRowData);
    
    console.log(`Prepared ${directoryEntries.length} directory entries for import`);
    
    // Clear existing data if needed (optional)
    console.log('Clearing existing directory data...');
    await db.delete(directories);
    
    // Batch insert records for better performance
    const batchSize = 100;
    for (let i = 0; i < directoryEntries.length; i += batchSize) {
      const batch = directoryEntries.slice(i, i + batchSize);
      
      console.log(`Importing batch ${i / batchSize + 1} of ${Math.ceil(directoryEntries.length / batchSize)}`);
      
      await db.insert(directories).values(batch);
    }
    
    console.log(`Successfully imported ${directoryEntries.length} directory entries`);
  } catch (error) {
    console.error('Error importing directories:', error);
    throw error;
  }
}

// If this script is run directly
if (require.main === module) {
  // Default file path - adjust as needed
  const defaultFilePath = path.resolve(process.cwd(), 'Nouasseur 2.xlsx');
  const filePath = process.argv[2] || defaultFilePath;
  
  importDirectories(filePath)
    .then(() => {
      console.log('Directory import completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Directory import failed:', error);
      process.exit(1);
    });
} 