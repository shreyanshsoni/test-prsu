import { NextResponse } from 'next/server';
import pool from '../../../lib/db';

export const runtime = 'nodejs';

export async function GET() {
  try {
    console.log('Inspecting database schema...');
    
    // Connect to the database
    const client = await pool.connect();
    console.log('Successfully connected to database');
    
    try {
      // Get all tables
      const tablesResult = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `);
      
      const tables = tablesResult.rows.map(row => row.table_name);
      
      // Get schema details for each table
      const schemaDetails = {};
      for (const table of tables) {
        // Get columns and their types
        const columnsResult = await client.query(`
          SELECT 
            column_name, 
            data_type,
            udt_name,
            character_maximum_length,
            is_nullable
          FROM 
            information_schema.columns 
          WHERE 
            table_schema = 'public' 
            AND table_name = $1
          ORDER BY 
            ordinal_position
        `, [table]);
        
        // Check for pgvector columns
        const pgvectorColumns = columnsResult.rows
          .filter(col => col.data_type === 'USER-DEFINED' && col.udt_name === 'vector')
          .map(col => col.column_name);
        
        // Check for pgvector indexes
        const indexesResult = await client.query(`
          SELECT 
            indexname,
            indexdef
          FROM 
            pg_indexes
          WHERE 
            tablename = $1
            AND schemaname = 'public'
        `, [table]);
        
        const pgvectorIndexes = indexesResult.rows
          .filter(idx => idx.indexdef.toLowerCase().includes('using ivfflat') || 
                         idx.indexdef.toLowerCase().includes('using hnsw'))
          .map(idx => ({
            name: idx.indexname,
            definition: idx.indexdef
          }));
        
        // Count rows
        const countResult = await client.query(`SELECT COUNT(*) FROM "${table}"`);
        const rowCount = parseInt(countResult.rows[0].count);
        
        // Store the schema details
        schemaDetails[table] = {
          columns: columnsResult.rows.map(col => ({
            name: col.column_name,
            type: col.data_type === 'USER-DEFINED' ? col.udt_name : col.data_type,
            maxLength: col.character_maximum_length,
            nullable: col.is_nullable === 'YES'
          })),
          rowCount,
          hasPgvector: pgvectorColumns.length > 0,
          pgvectorColumns,
          pgvectorIndexes
        };
      }
      
      // Identify tables that might be relevant for opportunities or searchable content
      const potentialContentTables = tables.filter(table => {
        const tableLower = table.toLowerCase();
        return tableLower.includes('opportunit') || 
               tableLower.includes('content') || 
               tableLower.includes('post') ||
               tableLower.includes('article') ||
               tableLower.includes('job') ||
               tableLower.includes('listing') ||
               tableLower.includes('scholarship') ||
               tableLower.includes('internship');
      });
      
      // Check if pgvector extension is installed
      const extensionsResult = await client.query(`
        SELECT extname FROM pg_extension WHERE extname = 'vector'
      `);
      const pgvectorInstalled = extensionsResult.rows.length > 0;
      
      return NextResponse.json({
        success: true,
        pgvectorInstalled,
        tables,
        schemaDetails,
        potentialContentTables,
        summary: {
          totalTables: tables.length,
          tablesWithPgvector: Object.values(schemaDetails).filter(t => t.hasPgvector).length,
          potentialContentTables
        }
      });
    } catch (queryError) {
      console.error('Database query error:', queryError);
      return NextResponse.json({
        success: false,
        message: 'Database connection successful but query failed',
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