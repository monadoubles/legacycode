// import { NextResponse } from 'next/server';
// import { checkDatabaseConnection } from '@/lib/database/connection';

// export async function GET() {
//   try {
//     const healthCheck = {
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       version: '1.0.0',
//       services: {
//         database: 'checking...',
//         ollama: 'checking...',
//         storage: 'checking...',
//       },
//       environment: process.env.NODE_ENV || 'development',
//     };

//     // Check database connection
//     try {
//       const dbHealthy = await checkDatabaseConnection();
//       healthCheck.services.database = dbHealthy ? 'healthy' : 'unhealthy';
//     } catch (error) {
//       healthCheck.services.database = 'unhealthy';
//       healthCheck.status = 'degraded';
//     }

//     // Check Ollama service
//     try {
//       const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
//       const response = await fetch(`${ollamaUrl}/api/tags`, {
//         method: 'GET',
//         signal: AbortSignal.timeout(5000), // 5 second timeout
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         healthCheck.services.ollama = `healthy (${data.models?.length || 0} models)`;
//       } else {
//         healthCheck.services.ollama = 'unhealthy';
//         healthCheck.status = 'degraded';
//       }
//     } catch (error) {
//       healthCheck.services.ollama = 'unreachable';
//       healthCheck.status = 'degraded';
//     }

//     // Check storage (upload directory)
//     try {
//       const { access, constants } = await import('fs/promises');
//       const uploadDir = process.env.UPLOAD_DIR || './uploads';
      
//       await access(uploadDir, constants.F_OK | constants.W_OK);
//       healthCheck.services.storage = 'healthy';
//     } catch (error) {
//       healthCheck.services.storage = 'unhealthy';
//       healthCheck.status = 'degraded';
//     }

//     // Determine overall status
//     const allServicesHealthy = Object.values(healthCheck.services)
//       .every(status => status.startsWith('healthy'));

//     if (!allServicesHealthy && healthCheck.status === 'ok') {
//       healthCheck.status = 'degraded';
//     }

//     const statusCode = healthCheck.status === 'ok' ? 200 : 
//                       healthCheck.status === 'degraded' ? 200 : 503;

//     return NextResponse.json(healthCheck, { status: statusCode });

//   } catch (error) {
//     console.error('Health check error:', error);
    
//     return NextResponse.json(
//       {
//         status: 'error',
//         timestamp: new Date().toISOString(),
//         error: 'Health check failed',
//         message: error.message,
//       },
//       { status: 503 }
//     );
//   }
// }

// // Add detailed health endpoint
// export async function POST() {
//   try {
//     const detailedHealth = {
//       status: 'ok',
//       timestamp: new Date().toISOString(),
//       version: '1.0.0',
//       uptime: process.uptime(),
//       memory: process.memoryUsage(),
//       environment: process.env.NODE_ENV,
//       services: {},
//       metrics: {},
//     };

//     // Database detailed check
//     try {
//       const dbStart = Date.now();
//       const dbHealthy = await checkDatabaseConnection();
//       const dbLatency = Date.now() - dbStart;
      
//       detailedHealth.services.database = {
//         status: dbHealthy ? 'healthy' : 'unhealthy',
//         latency: `${dbLatency}ms`,
//         url: process.env.DATABASE_URL ? 'configured' : 'not configured',
//       };
//     } catch (error) {
//       detailedHealth.services.database = {
//         status: 'error',
//         error: error.message,
//       };
//     }

//     // Ollama detailed check
//     try {
//       const ollamaStart = Date.now();
//       const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434';
      
//       const response = await fetch(`${ollamaUrl}/api/tags`, {
//         method: 'GET',
//         signal: AbortSignal.timeout(10000),
//       });
      
//       const ollamaLatency = Date.now() - ollamaStart;
      
//       if (response.ok) {
//         const data = await response.json();
//         detailedHealth.services.ollama = {
//           status: 'healthy',
//           latency: `${ollamaLatency}ms`,
//           models: data.models || [],
//           modelCount: data.models?.length || 0,
//           url: ollamaUrl,
//         };
//       } else {
//         detailedHealth.services.ollama = {
//           status: 'unhealthy',
//           latency: `${ollamaLatency}ms`,
//           statusCode: response.status,
//           url: ollamaUrl,
//         };
//       }
//     } catch (error) {
//       detailedHealth.services.ollama = {
//         status: 'error',
//         error: error.message,
//         url: process.env.OLLAMA_API_URL || 'http://localhost:11434',
//       };
//     }

//     // File system detailed check
//     try {
//       const { access, constants, stat } = await import('fs/promises');
//       const uploadDir = process.env.UPLOAD_DIR || './uploads';
      
//       await access(uploadDir, constants.F_OK | constants.W_OK);
//       const stats = await stat(uploadDir);
      
//       detailedHealth.services.storage = {
//         status: 'healthy',
//         path: uploadDir,
//         writable: true,
//         created: stats.birthtime,
//       };
//     } catch (error) {
//       detailedHealth.services.storage = {
//         status: 'error',
//         error: error.message,
//         path: process.env.UPLOAD_DIR || './uploads',
//       };
//     }

//     // Calculate metrics
//     const db = await import('@/lib/database/connection').then(m => m.db);
//     const { files } = await import('@/lib/database/models/file');
//     const { count } = await import('drizzle-orm');
    
//     try {
//       const fileStats = await db
//         .select({
//           total: count(),
//         })
//         .from(files);
      
//       detailedHealth.metrics = {
//         totalFiles: fileStats[0]?.total || 0,
//       };
//     } catch (error) {
//       detailedHealth.metrics = {
//         error: 'Could not fetch metrics',
//       };
//     }

//     return NextResponse.json(detailedHealth);

//   } catch (error) {
//     console.error('Detailed health check error:', error);
    
//     return NextResponse.json(
//       {
//         status: 'error',
//         timestamp: new Date().toISOString(),
//         error: 'Detailed health check failed',
//         message: error.message,
//       },
//       { status: 500 }
//     );
//   }
// }
// src/app/api/health/route.ts
// import { NextResponse } from 'next/server';
// import { db } from '@/lib/database/connection';
// import { sql } from 'drizzle-orm';

// export async function GET() {
//   try {
//     // Test the database connection
//     await db.execute(sql`SELECT 1`);
//     return NextResponse.json({ 
//       status: 'ok', 
//       database: 'connected',
//       timestamp: new Date().toISOString()
//     });
//   } catch (error) {
//     console.error('Database connection error:', error);
//     return NextResponse.json(
//       { 
//         status: 'error', 
//         error: 'Database connection failed',
//         message: error instanceof Error ? error.message : 'Unknown error'
//       },
//       { status: 500 }
//     );
//   }
// }