import { db } from '../db';
import { sql } from 'drizzle-orm';

async function updateMembersTable() {
  try {
    console.log('Starting to update members table column widths...');
    
    // Array of columns to alter
    const columnsToUpdate = [
      'middle_initial',
      'mailing_option',
      'ncb_graduate',
      'sent_mra',
      'questionnaire_return',
      'directory_requested',
      'new_bio',
      'reunion_attended'
    ];
    
    // Execute ALTER TABLE commands for each column
    for (const column of columnsToUpdate) {
      console.log(`Updating column ${column} to VARCHAR(255)...`);
      
      await db.execute(sql`
        ALTER TABLE members 
        ALTER COLUMN ${sql.identifier(column)} TYPE VARCHAR(255)
      `);
      
      console.log(`Successfully updated ${column}`);
    }
    
    console.log('All columns have been updated successfully!');
  } catch (error) {
    console.error('Error updating members table:', error);
    process.exit(1);
  }
}

// Run the migration
updateMembersTable()
  .then(() => {
    console.log('Migration completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 