import * as XLSX from 'xlsx';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file
const excelFilePath = path.resolve(__dirname, '../../../nouasseur/memdata.xlsx');

// Function to examine Excel file
async function examineExcelFile() {
  try {
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    
    // Get all sheet names
    console.log('Sheet names:', workbook.SheetNames);
    
    // Examine first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    // Display headers (first row)
    if (data.length > 0) {
      console.log('Headers (first row):', data[0]);
      
      // Display first two rows of data as example
      if (data.length > 2) {
        console.log('Example row 1:', data[1]);
        console.log('Example row 2:', data[2]);
      }
      
      // Count total rows
      console.log(`Total rows: ${data.length}`);
    } else {
      console.log('No data found in the sheet');
    }
  } catch (error) {
    console.error('Error examining Excel file:', error);
  }
}

// Run the function
examineExcelFile()
  .then(() => {
    console.log('Examination completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Examination failed:', error);
    process.exit(1);
  }); 