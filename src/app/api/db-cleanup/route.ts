import { NextResponse } from 'next/server';
import pool from '../../lib/db';
import { getSession } from '@auth0/nextjs-auth0';

export const runtime = 'nodejs';

export async function POST() {
  try {
    // Check authentication
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required",
        authenticated: false
      }, { status: 401 });
    }
    
    console.log('Starting PGVector cleanup...');
    
    // Connect to the database
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    // Start a transaction
    await client.query('BEGIN');
    
    try {
      // Find all tables with vector columns
      const vectorColumnsResult = await client.query(`
        SELECT 
          table_name,
          column_name
        FROM 
          information_schema.columns
        WHERE 
          table_schema = 'public'
          AND udt_name = 'vector'
        ORDER BY
          table_name, column_name
      `);
      
      const vectorColumns = vectorColumnsResult.rows;
      console.log(`Found ${vectorColumns.length} vector columns to remove`);
      
      // Find all vector indexes (IVFFlat, HNSW, etc.)
      const indexesResult = await client.query(`
        SELECT 
          tablename,
          indexname,
          indexdef
        FROM 
          pg_indexes
        WHERE 
          schemaname = 'public'
          AND (indexdef ILIKE '%using ivfflat%' OR indexdef ILIKE '%using hnsw%')
        ORDER BY
          tablename, indexname
      `);
      
      const vectorIndexes = indexesResult.rows;
      console.log(`Found ${vectorIndexes.length} vector indexes to remove`);
      
      // Track operations
      const operations = {
        droppedIndexes: [],
        droppedColumns: [],
        errors: []
      };
      
      // Drop vector indexes first
      for (const index of vectorIndexes) {
        try {
          await client.query(`DROP INDEX IF EXISTS "${index.indexname}"`);
          operations.droppedIndexes.push({
            table: index.tablename,
            index: index.indexname,
            definition: index.indexdef
          });
          console.log(`Dropped index ${index.indexname} on table ${index.tablename}`);
        } catch (error) {
          console.error(`Error dropping index ${index.indexname}:`, error);
          operations.errors.push({
            type: 'index',
            name: index.indexname,
            table: index.tablename,
            error: error.message
          });
        }
      }
      
      // Drop vector columns
      for (const column of vectorColumns) {
        try {
          await client.query(`
            ALTER TABLE "${column.table_name}" 
            DROP COLUMN IF EXISTS "${column.column_name}"
          `);
          operations.droppedColumns.push({
            table: column.table_name,
            column: column.column_name
          });
          console.log(`Dropped column ${column.column_name} from table ${column.table_name}`);
        } catch (error) {
          console.error(`Error dropping column ${column.column_name} from ${column.table_name}:`, error);
          operations.errors.push({
            type: 'column',
            name: column.column_name,
            table: column.table_name,
            error: error.message
          });
        }
      }
      
      // Check for and remove any API files related to embeddings
      // (This part would need to be done separately as it's a file system operation)
      
      // Commit the transaction
      await client.query('COMMIT');
      
      return NextResponse.json({
        success: true,
        message: 'PGVector cleanup completed',
        operations,
        summary: {
          droppedIndexes: operations.droppedIndexes.length,
          droppedColumns: operations.droppedColumns.length,
          errors: operations.errors.length
        }
      });
    } catch (queryError) {
      // Rollback on error
      await client.query('ROLLBACK');
      console.error('Database query error:', queryError);
      return NextResponse.json({
        success: false,
        message: 'PGVector cleanup failed',
        error: queryError.message
      }, { status: 500 });
    } finally {
      // Always release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
} 