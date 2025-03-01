import { pgTable, serial, varchar, text, timestamp, integer, date, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow()
});

export const members = pgTable('members', {
  id: serial('id').primaryKey(),
  memberId: integer('member_id'),
  status: varchar('status', { length: 50 }),
  firstName: varchar('first_name', { length: 100 }),
  middleInitial: varchar('middle_initial', { length: 255 }),
  school: varchar('school', { length: 100 }),
  nickname1: varchar('nickname1', { length: 100 }),
  nickname2: varchar('nickname2', { length: 100 }),
  lastName: varchar('last_name', { length: 100 }),
  marriedName: varchar('married_name', { length: 100 }),
  spouseName: varchar('spouse_name', { length: 100 }),
  memberType: varchar('member_type', { length: 50 }),
  address1: varchar('address1', { length: 255 }),
  address2: varchar('address2', { length: 255 }),
  address3: varchar('address3', { length: 255 }),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 50 }),
  zipCode: varchar('zip_code', { length: 20 }),
  country: varchar('country', { length: 100 }),
  homePhone: varchar('home_phone', { length: 50 }),
  workPhone: varchar('work_phone', { length: 50 }),
  fax: varchar('fax', { length: 50 }),
  mailingOption: varchar('mailing_option', { length: 255 }),
  email1: varchar('email1', { length: 255 }),
  email2: varchar('email2', { length: 255 }),
  memberLicense: varchar('member_license', { length: 50 }),
  spouseLicense: varchar('spouse_license', { length: 50 }),
  memberSSN: varchar('member_ssn', { length: 50 }),
  spouseSSN: varchar('spouse_ssn', { length: 50 }),
  locatedDate: date('located_date'),
  source: varchar('source', { length: 255 }),
  locationCost: varchar('location_cost', { length: 50 }),
  graduationYear: varchar('graduation_year', { length: 20 }),
  ncbGraduate: varchar('ncb_graduate', { length: 255 }),
  gradesAttended: varchar('grades_attended', { length: 100 }),
  datesAttended: varchar('dates_attended', { length: 100 }),
  otherSchool1: varchar('other_school1', { length: 255 }),
  datesGrades1: varchar('dates_grades1', { length: 100 }),
  otherSchool2: varchar('other_school2', { length: 255 }),
  datesGrades2: varchar('dates_grades2', { length: 100 }),
  otherSchool3: varchar('other_school3', { length: 255 }),
  datesGrades3: varchar('dates_grades3', { length: 100 }),
  parentFather: varchar('parent_father', { length: 255 }),
  parentMother: varchar('parent_mother', { length: 255 }),
  parentAddress: varchar('parent_address', { length: 255 }),
  sentMRA: varchar('sent_mra', { length: 255 }),
  questionnaireDate: date('questionnaire_date'),
  questionnaireReturn: varchar('questionnaire_return', { length: 255 }),
  dateReturned: date('date_returned'),
  directoryRequested: varchar('directory_requested', { length: 255 }),
  amountReceived: varchar('amount_received', { length: 50 }),
  directorySent: date('directory_sent'),
  memberBio: text('member_bio'),
  spouseBio: text('spouse_bio'),
  newBio: varchar('new_bio', { length: 255 }),
  comments: text('comments'),
  reunionAttended: varchar('reunion_attended', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 255 }).notNull(),
  eventSubtitle: varchar('event_subtitle', { length: 255 }),
  eventLoc: varchar('event_loc', { length: 255 }),
  eventDatebeg: date('event_datebeg'),
  eventDateend: date('event_dateend'),
  eventTime: varchar('event_time', { length: 100 }),
  eventDesc: text('event_desc'),
  eventPhoto1: varchar('event_photo1', { length: 255 }),
  eventPhoto2: varchar('event_photo2', { length: 255 }),
  eventPhoto3: varchar('event_photo3', { length: 255 }),
  eventPhoto4: varchar('event_photo4', { length: 255 }),
  eventStatus: varchar('event_status', { length: 50 }),
  eventModdate: timestamp('event_moddate', { withTimezone: true }).defaultNow(),
  eventModuser: varchar('event_moduser', { length: 255 }),
  eventSortcode: integer('event_sortcode'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert; 