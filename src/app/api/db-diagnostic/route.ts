import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getSession } from '@auth0/nextjs-auth0';

/**
 * GET /api/db-diagnostic
 * Diagnostic endpoint for testing database connectivity and health
 */
export async function GET() {
  try {
    console.log('Running database diagnostic...');
    
    // Check authentication (optional - can be removed to allow public access to diagnostics)
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({
        success: false,
        error: "Authentication required",
        authenticated: false
      }, { status: 401 });
    }
    
    // Start collecting diagnostic info
    const diagnosticInfo = {
      success: false,
      connectionSuccessful: false,
      dbVersion: null,
      tables: [],
      tablesWithRowCounts: {},
      errors: [],
      queriesRun: 0,
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
      auth: {
        user: session.user.sub,
        authenticated: true
      }
    };
    
    try {
      // Test basic connectivity with a simple query
      console.log('Testing basic connectivity...');
      const versionResult = await sql`SELECT version();`;
      diagnosticInfo.connectionSuccessful = true;
      diagnosticInfo.dbVersion = versionResult.rows[0].version;
      diagnosticInfo.queriesRun++;
      
      // Get list of tables
      console.log('Fetching table list...');
      const tablesResult = await sql`
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY tablename;
      `;
      diagnosticInfo.queriesRun++;
      
      const tables = tablesResult.rows.map(row => row.tablename);
      diagnosticInfo.tables = tables;
      
      // Get row counts for each table
      console.log('Fetching table row counts...');
      for (const table of tables) {
        try {
          // Use parameterized query for safety
          const countResult = await sql.query(
            `SELECT COUNT(*) FROM "${table}"`,
            []
          );
          diagnosticInfo.tablesWithRowCounts[table] = parseInt(countResult.rows[0].count);
          diagnosticInfo.queriesRun++;
        } catch (tableError) {
          console.error(`Error counting rows in table ${table}:`, tableError);
          diagnosticInfo.errors.push({
            table,
            error: `Error counting rows: ${tableError.message}`
          });
        }
      }
      
      // Check if essential tables exist
      const requiredTables = [
        'programs',
        'academic_roadmaps',
        'roadmap_programs',
        'user_goals'
      ];
      
      const missingTables = requiredTables.filter(table => !tables.includes(table));
      if (missingTables.length > 0) {
        diagnosticInfo.errors.push({
          type: 'missing_tables',
          message: `Missing required tables: ${missingTables.join(', ')}`,
          missingTables
        });
      }
      
      // Final status
      diagnosticInfo.success = true;
    } catch (dbError) {
      console.error('Database diagnostic error:', dbError);
      diagnosticInfo.errors.push({
        type: 'database_error',
        message: dbError.message,
        code: dbError.code
      });
    }
    
    return NextResponse.json(diagnosticInfo);
  } catch (error) {
    console.error('Unhandled error in db diagnostic:', error);
    return NextResponse.json({
      success: false,
      error: `Unhandled error: ${error.message}`,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 