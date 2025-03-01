import { Elysia, t } from 'elysia';
import { db } from '../db';
import { members, type NewMember } from '../db/schema';
import { eq, sql } from 'drizzle-orm';

export const membersApi = new Elysia({ prefix: '/api/members' })
  // Get all members (paginated)
  .get('/', async ({ query }) => {
    try {
      const page = parseInt(query?.page || '1');
      const pageSize = parseInt(query?.pageSize || '50');
      const offset = (page - 1) * pageSize;
      
      // Get total count for pagination info
      const countResult = await db.select({ count: sql`count(*)` }).from(members);
      const totalCount = Number(countResult[0].count);
      
      // Get paginated members
      const allMembers = await db.select().from(members)
        .orderBy(members.lastName, members.firstName)
        .limit(pageSize)
        .offset(offset);
      
      return { 
        success: true, 
        data: allMembers,
        pagination: {
          page,
          pageSize,
          totalCount,
          totalPages: Math.ceil(totalCount / pageSize)
        }
      };
    } catch (error) {
      console.error('Error fetching members:', error);
      return { success: false, error: 'Failed to fetch members' };
    }
  })
  
  // Get member by id
  .get('/:id', async ({ params }) => {
    try {
      const member = await db.select().from(members)
        .where(eq(members.id, parseInt(params.id)))
        .limit(1);
        
      if (member.length === 0) {
        return { success: false, error: 'Member not found' };
      }
      
      return { success: true, data: member[0] };
    } catch (error) {
      console.error(`Error fetching member with ID ${params.id}:`, error);
      return { success: false, error: 'Failed to fetch member' };
    }
  }, {
    params: t.Object({
      id: t.String()
    })
  })
  
  // Search members
  .get('/search', async ({ query }) => {
    try {
      if (!query.query) {
        return { success: false, error: 'Search query is required' };
      }
      
      const searchResults = await db.select().from(members)
        .where(
          sql`(
            lower(${members.firstName}) LIKE ${'%' + query.query.toLowerCase() + '%'} OR
            lower(${members.lastName}) LIKE ${'%' + query.query.toLowerCase() + '%'} OR
            lower(${members.marriedName}) LIKE ${'%' + query.query.toLowerCase() + '%'} OR
            lower(${members.school}) LIKE ${'%' + query.query.toLowerCase() + '%'} OR
            lower(${members.city}) LIKE ${'%' + query.query.toLowerCase() + '%'} OR
            lower(${members.state}) LIKE ${'%' + query.query.toLowerCase() + '%'}
          )`
        )
        .orderBy(members.lastName, members.firstName)
        .limit(50);
      
      return { success: true, data: searchResults };
    } catch (error) {
      console.error(`Error searching members for "${query.query}":`, error);
      return { success: false, error: 'Failed to fetch member' };
    }
  }); 