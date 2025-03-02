import { Elysia, t } from 'elysia';
import { db } from '../db';
import { directories, type NewDirectory } from '../db/schema';
import { eq, sql, and, like, or } from 'drizzle-orm';

export const directoriesApi = new Elysia({ prefix: '/api/directories' })
  // Get all directories with pagination
  .get('/', async ({ query }) => {
    const page = Number(query?.page) || 1;
    const pageSize = Number(query?.pageSize) || 10;
    const offset = (page - 1) * pageSize;
    
    const category = query?.category;
    const searchTerm = query?.search;
    
    let whereClause = undefined;
    
    // Add category filter if provided
    if (category) {
      whereClause = eq(directories.category, category);
    }
    
    // Add search functionality if search term is provided
    if (searchTerm) {
      const searchFilter = or(
        like(directories.name, `%${searchTerm}%`),
        like(directories.organization, `%${searchTerm}%`),
        like(directories.position, `%${searchTerm}%`),
        like(directories.email, `%${searchTerm}%`),
        like(directories.department, `%${searchTerm}%`),
        like(directories.description, `%${searchTerm}%`)
      );
      
      whereClause = whereClause ? and(whereClause, searchFilter) : searchFilter;
      
      console.log(`Searching directories with term: "${searchTerm}"`);
    }

    const [results, countResult] = await Promise.all([
      db.select().from(directories)
        .where(whereClause)
        .limit(pageSize)
        .offset(offset)
        .orderBy(directories.sortOrder, directories.name),
      db.select({ count: sql<number>`count(*)` }).from(directories)
        .where(whereClause)
    ]);

    const totalCount = countResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: results,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages
      }
    };
  })
  
  // Get categories
  .get('/categories', async () => {
    const results = await db
      .selectDistinct({ category: directories.category })
      .from(directories)
      .where(sql`${directories.category} is not null`);
    
    return results.map(r => r.category);
  })
  
  // Get a single directory entry by ID
  .get('/:id', async ({ params }) => {
    const { id } = params;
    const result = await db
      .select()
      .from(directories)
      .where(eq(directories.id, Number(id)))
      .limit(1);
    
    if (result.length === 0) {
      return new Response(JSON.stringify({ error: 'Directory entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return result[0];
  })
  
  // Create a new directory entry
  .post('/', async ({ body }) => {
    const directoryData = body as NewDirectory;
    const newDirectory = await db.insert(directories).values(directoryData).returning();
    return newDirectory[0];
  }, {
    body: t.Object({
      name: t.String(),
      position: t.Optional(t.String()),
      organization: t.Optional(t.String()),
      department: t.Optional(t.String()),
      address: t.Optional(t.String()),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      zipCode: t.Optional(t.String()),
      country: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
      website: t.Optional(t.String()),
      category: t.Optional(t.String()),
      subCategory: t.Optional(t.String()),
      description: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      sortOrder: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean())
    })
  })
  
  // Update an existing directory entry
  .put('/:id', async ({ params, body }) => {
    const { id } = params;
    const directoryData = body as Partial<NewDirectory>;
    const updatedDirectory = await db
      .update(directories)
      .set({ ...directoryData, updatedAt: new Date() })
      .where(eq(directories.id, Number(id)))
      .returning();
    
    if (updatedDirectory.length === 0) {
      return new Response(JSON.stringify({ error: 'Directory entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return updatedDirectory[0];
  }, {
    body: t.Object({
      name: t.Optional(t.String()),
      position: t.Optional(t.String()),
      organization: t.Optional(t.String()),
      department: t.Optional(t.String()),
      address: t.Optional(t.String()),
      city: t.Optional(t.String()),
      state: t.Optional(t.String()),
      zipCode: t.Optional(t.String()),
      country: t.Optional(t.String()),
      phone: t.Optional(t.String()),
      email: t.Optional(t.String()),
      website: t.Optional(t.String()),
      category: t.Optional(t.String()),
      subCategory: t.Optional(t.String()),
      description: t.Optional(t.String()),
      notes: t.Optional(t.String()),
      sortOrder: t.Optional(t.Number()),
      isActive: t.Optional(t.Boolean())
    })
  })
  
  // Delete a directory entry
  .delete('/:id', async ({ params }) => {
    const { id } = params;
    const deletedDirectory = await db
      .delete(directories)
      .where(eq(directories.id, Number(id)))
      .returning();
    
    if (deletedDirectory.length === 0) {
      return new Response(JSON.stringify({ error: 'Directory entry not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return { success: true, message: 'Directory entry deleted successfully' };
  }); 