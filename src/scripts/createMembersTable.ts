import { db } from '../db';
import { sql } from 'drizzle-orm';

async function createMembersTable() {
  try {
    console.log('Creating members table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS members (
        id SERIAL PRIMARY KEY,
        member_id INTEGER,
        status VARCHAR(50),
        first_name VARCHAR(100),
        middle_initial VARCHAR(10),
        school VARCHAR(100),
        nickname1 VARCHAR(100),
        nickname2 VARCHAR(100),
        last_name VARCHAR(100),
        married_name VARCHAR(100),
        spouse_name VARCHAR(100),
        member_type VARCHAR(50),
        address1 VARCHAR(255),
        address2 VARCHAR(255),
        address3 VARCHAR(255),
        city VARCHAR(100),
        state VARCHAR(50),
        zip_code VARCHAR(20),
        country VARCHAR(100),
        home_phone VARCHAR(50),
        work_phone VARCHAR(50),
        fax VARCHAR(50),
        mailing_option VARCHAR(10),
        email1 VARCHAR(255),
        email2 VARCHAR(255),
        member_license VARCHAR(50),
        spouse_license VARCHAR(50),
        member_ssn VARCHAR(50),
        spouse_ssn VARCHAR(50),
        located_date DATE,
        source VARCHAR(255),
        location_cost VARCHAR(50),
        graduation_year VARCHAR(20),
        ncb_graduate VARCHAR(10),
        grades_attended VARCHAR(100),
        dates_attended VARCHAR(100),
        other_school1 VARCHAR(255),
        dates_grades1 VARCHAR(100),
        other_school2 VARCHAR(255),
        dates_grades2 VARCHAR(100),
        other_school3 VARCHAR(255),
        dates_grades3 VARCHAR(100),
        parent_father VARCHAR(255),
        parent_mother VARCHAR(255),
        parent_address VARCHAR(255),
        sent_mra VARCHAR(10),
        questionnaire_date DATE,
        questionnaire_return VARCHAR(10),
        date_returned DATE,
        directory_requested VARCHAR(10),
        amount_received VARCHAR(50),
        directory_sent DATE,
        member_bio TEXT,
        spouse_bio TEXT,
        new_bio VARCHAR(10),
        comments TEXT,
        reunion_attended VARCHAR(10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('Members table created successfully!');
  } catch (error) {
    console.error('Error creating members table:', error);
  }
}

// Run the function
createMembersTable()
  .then(() => {
    console.log('Database migration completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database migration failed:', error);
    process.exit(1);
  }); 