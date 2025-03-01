import * as XLSX from 'xlsx';
import { db } from '../db';
import { members, type NewMember } from '../db/schema';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file (relative to this script)
const excelFilePath = path.resolve(__dirname, '../../../nouasseur/memdata.xlsx');

// Define an interface for the Excel data
interface ExcelMember {
  [key: string]: any;
  ID?: number;
  status?: string;
  fname?: string;
  mdinit?: string;
  school?: string;
  nicname1?: string;
  nicname2?: string;
  lmname?: string;
  marrname?: string;
  spname?: string;
  type?: string;
  addr1?: string;
  addr2?: string;
  addr3?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  hphone?: string;
  wphone?: string;
  fax?: string;
  namsento?: string;
  emailaddr1?: string;
  emailaddr2?: string;
  memlic?: string;
  spolic?: string;
  memssn?: string;
  spossn?: string;
  locdate?: string | number | Date;
  source?: string;
  loccost?: string;
  gradyr?: string;
  ncbgrd?: string;
  grattend?: string;
  datesattend?: string;
  oschool1?: string;
  datesgrade1?: string;
  oschool2?: string;
  datesgrade2?: string;
  oschool3?: string;
  datesgrade3?: string;
  parfather?: string;
  parmother?: string;
  paraddr?: string;
  sentmra?: string;
  quesent?: string | number | Date;
  queret?: string;
  dateret?: string | number | Date;
  dirreq?: string;
  amtrec?: string;
  dirsent?: string | number | Date;
  abiodat?: string;
  sbiodat?: string;
  nbionew?: string;
  comments?: string;
  reuattend?: string;
}

/**
 * Converts a date to the SQL-compatible 'YYYY-MM-DD' format
 */
function formatDateForDb(date: Date | string | null): string | null {
  if (!date) return null;
  
  let dateObj: Date;
  if (typeof date === 'string') {
    // Try to parse the date string
    dateObj = new Date(date);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      // Try to handle different date formats (MM/DD/YYYY)
      const parts = date.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1; // Months are 0-indexed in JS
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        dateObj = new Date(year, month, day);
        
        // Still invalid? Return null
        if (isNaN(dateObj.getTime())) {
          return null;
        }
      } else {
        return null; // Invalid format
      }
    }
  } else {
    dateObj = date;
  }
  
  // Format date as YYYY-MM-DD
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

async function importMembers() {
  try {
    console.log('Starting import of members from Excel file...');
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const membersData = XLSX.utils.sheet_to_json<ExcelMember>(worksheet);
    
    console.log(`Found ${membersData.length} members in Excel file.`);
    
    // Delete existing members (optional - comment out if you want to keep existing data)
    console.log('Deleting existing members...');
    await db.delete(members);
    
    // Process and insert each member
    let successCount = 0;
    let errorCount = 0;
    
    for (const member of membersData) {
      try {
        // Handle dates
        const locatedDate = member.locdate 
          ? formatDateForDb(typeof member.locdate === 'string' ? member.locdate : XLSX.SSF.parse_date_code(member.locdate as number))
          : null;
          
        const questionnaireDate = member.quesent 
          ? formatDateForDb(typeof member.quesent === 'string' ? member.quesent : XLSX.SSF.parse_date_code(member.quesent as number))
          : null;
          
        const dateReturned = member.dateret 
          ? formatDateForDb(typeof member.dateret === 'string' ? member.dateret : XLSX.SSF.parse_date_code(member.dateret as number))
          : null;
          
        const directorySent = member.dirsent 
          ? formatDateForDb(typeof member.dirsent === 'string' ? member.dirsent : XLSX.SSF.parse_date_code(member.dirsent as number))
          : null;
        
        // Create member data object
        const memberData: NewMember = {
          memberId: member.ID,
          status: member.status || undefined,
          firstName: member.fname || undefined,
          middleInitial: member.mdinit || undefined,
          school: member.school || undefined,
          nickname1: member.nicname1 || undefined,
          nickname2: member.nicname2 || undefined,
          lastName: member.lmname || undefined,
          marriedName: member.marrname || undefined,
          spouseName: member.spname || undefined,
          memberType: member.type || undefined,
          address1: member.addr1 || undefined,
          address2: member.addr2 || undefined,
          address3: member.addr3 || undefined,
          city: member.city || undefined,
          state: member.state || undefined,
          zipCode: member.zip || undefined,
          country: member.country || undefined,
          homePhone: member.hphone || undefined,
          workPhone: member.wphone || undefined,
          fax: member.fax || undefined,
          mailingOption: member.namsento || undefined,
          email1: member.emailaddr1 || undefined,
          email2: member.emailaddr2 || undefined,
          memberLicense: member.memlic || undefined,
          spouseLicense: member.spolic || undefined,
          memberSSN: member.memssn || undefined,
          spouseSSN: member.spossn || undefined,
          locatedDate: locatedDate || undefined,
          source: member.source || undefined,
          locationCost: member.loccost || undefined,
          graduationYear: member.gradyr || undefined,
          ncbGraduate: member.ncbgrd || undefined,
          gradesAttended: member.grattend || undefined,
          datesAttended: member.datesattend || undefined,
          otherSchool1: member.oschool1 || undefined,
          datesGrades1: member.datesgrade1 || undefined,
          otherSchool2: member.oschool2 || undefined,
          datesGrades2: member.datesgrade2 || undefined,
          otherSchool3: member.oschool3 || undefined,
          datesGrades3: member.datesgrade3 || undefined,
          parentFather: member.parfather || undefined,
          parentMother: member.parmother || undefined,
          parentAddress: member.paraddr || undefined,
          sentMRA: member.sentmra || undefined,
          questionnaireDate: questionnaireDate || undefined,
          questionnaireReturn: member.queret || undefined,
          dateReturned: dateReturned || undefined,
          directoryRequested: member.dirreq || undefined,
          amountReceived: member.amtrec || undefined,
          directorySent: directorySent || undefined,
          memberBio: member.abiodat || undefined,
          spouseBio: member.sbiodat || undefined,
          newBio: member.nbionew || undefined,
          comments: member.comments || undefined,
          reunionAttended: member.reuattend || undefined,
        };
        
        // Insert the member
        await db.insert(members).values(memberData);
        successCount++;
        
        if (successCount % 100 === 0) {
          console.log(`Imported ${successCount} members so far...`);
        }
      } catch (err) {
        console.error(`Error importing member: ${JSON.stringify(member.ID)}`, err);
        errorCount++;
      }
    }
    
    console.log(`Import completed. Successfully imported ${successCount} members. Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import function
importMembers()
  .then(() => {
    console.log('Import process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
  }); 