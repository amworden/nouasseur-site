import * as XLSX from 'xlsx';
import { db } from '../db';
import { events, type NewEvent } from '../db/schema';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the Excel file (relative to this script)
const excelFilePath = path.resolve(__dirname, '../../events.xlsx');

// Define an interface for the Excel data
interface ExcelEvent {
  [key: string]: any;
  event_name?: string;
  EventName?: string;
  Name?: string;
  event_subtitle?: string;
  EventSubtitle?: string;
  Subtitle?: string;
  event_loc?: string;
  EventLoc?: string;
  Location?: string;
  event_datebeg?: string | number | Date;
  EventDatebeg?: string | number | Date;
  StartDate?: string | number | Date;
  event_dateend?: string | number | Date;
  EventDateend?: string | number | Date;
  EndDate?: string | number | Date;
  event_time?: string;
  EventTime?: string;
  Time?: string;
  event_desc?: string;
  EventDesc?: string;
  Description?: string;
  event_photo1?: string;
  EventPhoto1?: string;
  Photo1?: string;
  event_photo2?: string;
  EventPhoto2?: string;
  Photo2?: string;
  event_photo3?: string;
  EventPhoto3?: string;
  Photo3?: string;
  event_photo4?: string;
  EventPhoto4?: string;
  Photo4?: string;
  event_status?: string;
  EventStatus?: string;
  Status?: string;
  event_sortcode?: number;
  EventSortcode?: number;
  SortCode?: number;
}

/**
 * Converts a date to the SQL-compatible 'YYYY-MM-DD' format
 */
function formatDateForDb(date: Date | null): string | null {
  if (!date) return null;
  
  // Format date as YYYY-MM-DD
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

async function importEvents() {
  try {
    console.log('Starting import of events from Excel file...');
    console.log(`Reading Excel file from: ${excelFilePath}`);
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const eventsData = XLSX.utils.sheet_to_json<ExcelEvent>(worksheet);
    
    console.log(`Found ${eventsData.length} events in Excel file.`);
    
    // Delete existing events (optional - comment out if you want to keep existing data)
    console.log('Deleting existing events...');
    await db.delete(events);
    
    // Process and insert each event
    let successCount = 0;
    let errorCount = 0;
    
    for (const event of eventsData) {
      try {
        // Extract raw values
        const rawName = event.event_name || event.EventName || event.Name || '';
        const rawSubtitle = event.event_subtitle || event.EventSubtitle || event.Subtitle || '';
        const rawLoc = event.event_loc || event.EventLoc || event.Location || '';
        let rawDateBeg = event.event_datebeg || event.EventDatebeg || event.StartDate || null;
        let rawDateEnd = event.event_dateend || event.EventDateend || event.EndDate || null;
        const rawTime = event.event_time || event.EventTime || event.Time || '';
        const rawDesc = event.event_desc || event.EventDesc || event.Description || '';
        const rawPhoto1 = event.event_photo1 || event.EventPhoto1 || event.Photo1 || '';
        const rawPhoto2 = event.event_photo2 || event.EventPhoto2 || event.Photo2 || '';
        const rawPhoto3 = event.event_photo3 || event.EventPhoto3 || event.Photo3 || '';
        const rawPhoto4 = event.event_photo4 || event.EventPhoto4 || event.Photo4 || '';
        const rawStatus = event.event_status || event.EventStatus || event.Status || 'active';
        const rawSortcode = event.event_sortcode || event.EventSortcode || event.SortCode || 100;
        
        // Handle date conversions
        let startDate: Date | null = null;
        if (rawDateBeg) {
          if (typeof rawDateBeg === 'number') {
            startDate = XLSX.SSF.parse_date_code(rawDateBeg);
          } else if (typeof rawDateBeg === 'string') {
            startDate = new Date(rawDateBeg);
          } else if (rawDateBeg instanceof Date) {
            startDate = rawDateBeg;
          }
        }
        
        let endDate: Date | null = null;
        if (rawDateEnd) {
          if (typeof rawDateEnd === 'number') {
            endDate = XLSX.SSF.parse_date_code(rawDateEnd);
          } else if (typeof rawDateEnd === 'string') {
            endDate = new Date(rawDateEnd);
          } else if (rawDateEnd instanceof Date) {
            endDate = rawDateEnd;
          }
        }
        
        // Format dates for database (as strings)
        const formattedStartDate = formatDateForDb(startDate);
        const formattedEndDate = formatDateForDb(endDate);
        
        // Create event data object that conforms to NewEvent type
        const eventData: NewEvent = {
          eventName: rawName,
          eventSubtitle: rawSubtitle || undefined,
          eventLoc: rawLoc || undefined,
          eventDatebeg: formattedStartDate || undefined,
          eventDateend: formattedEndDate || undefined,
          eventTime: rawTime || undefined,
          eventDesc: rawDesc || undefined,
          eventPhoto1: rawPhoto1 || undefined,
          eventPhoto2: rawPhoto2 || undefined,
          eventPhoto3: rawPhoto3 || undefined,
          eventPhoto4: rawPhoto4 || undefined,
          eventStatus: rawStatus || undefined,
          eventModuser: 'import_script',
          eventSortcode: typeof rawSortcode === 'number' ? rawSortcode : undefined,
        };
        
        // Ensure name field is present
        if (!eventData.eventName) {
          console.warn(`Skipping event with missing name: ${JSON.stringify(event)}`);
          errorCount++;
          continue;
        }
        
        // Insert the event
        await db.insert(events).values(eventData);
        successCount++;
        console.log(`Imported event: ${eventData.eventName}`);
      } catch (err) {
        console.error(`Error importing event: ${JSON.stringify(event)}`, err);
        errorCount++;
      }
    }
    
    console.log(`Import completed. Successfully imported ${successCount} events. Errors: ${errorCount}`);
  } catch (error) {
    console.error('Error during import:', error);
  }
}

// Run the import function
importEvents()
  .then(() => {
    console.log('Import process finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Import process failed:', error);
    process.exit(1);
  }); 