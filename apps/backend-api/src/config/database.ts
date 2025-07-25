import { PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';

// Global instance to prevent multiple connections
let prisma: PrismaClient;

// Prisma configuration
const prismaConfig = {
  log: [
    {
      emit: 'event' as const,
      level: 'query' as const,
    },
    {
      emit: 'event' as const,
      level: 'error' as const,
    },
    {
      emit: 'event' as const,
      level: 'info' as const,
    },
    {
      emit: 'event' as const,
      level: 'warn' as const,
    },
  ],
  errorFormat: 'pretty' as const,
};

// Create Prisma client
export function createPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient(prismaConfig);
    
    // Log slow queries in development
    if (process.env.NODE_ENV === 'development') {
      prisma.$on('query', (e) => {
        if (e.duration > 1000) { // Log queries taking more than 1 second
          logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
        }
      });
    }

    // Log errors
    prisma.$on('error', (e) => {
      logger.error('Prisma error:', e);
    });

    // Log info and warnings
    prisma.$on('info', (e) => {
      logger.info(`Prisma info: ${e.message}`);
    });

    prisma.$on('warn', (e) => {
      logger.warn(`Prisma warning: ${e.message}`);
    });
  }
  
  return prisma;
}

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    if (!prisma) {
      prisma = createPrismaClient();
    }

    // Test the connection
    await prisma.$connect();
    logger.info('Successfully connected to PostgreSQL database');

    // Run any pending migrations in production
    if (process.env.NODE_ENV === 'production') {
      logger.info('Running database migrations...');
      // Note: In production, migrations should be run separately
      // This is just for demonstration
    }

  } catch (error) {
    logger.error('Failed to connect to database:', error);
    throw new Error('Database connection failed');
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    if (prisma) {
      await prisma.$disconnect();
      logger.info('Disconnected from database');
    }
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
  }
}

// Health check for database
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    if (!prisma) {
      return false;
    }

    // Simple query to check if database is responsive
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    logger.error('Database health check failed:', error);
    return false;
  }
}

// Database transaction helper
export async function transaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const client = getPrismaClient();
  return client.$transaction(callback);
}

// Get the Prisma client instance
export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = createPrismaClient();
  }
  return prisma;
}

// Database metrics for monitoring
export async function getDatabaseMetrics() {
  try {
    const client = getPrismaClient();
    
    // Get basic connection info
    const connectionInfo = await client.$queryRaw`
      SELECT 
        count(*) as active_connections,
        current_database() as database_name,
        version() as database_version
      FROM pg_stat_activity 
      WHERE state = 'active'
    ` as any[];

    // Get table sizes
    const tableSizes = await client.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    ` as any[];

    return {
      connection: connectionInfo[0],
      tableSizes,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get database metrics:', error);
    return null;
  }
}

// Cleanup function for graceful shutdown
export async function cleanup(): Promise<void> {
  try {
    await disconnectDatabase();
  } catch (error) {
    logger.error('Error during database cleanup:', error);
  }
}

// Handle process termination
process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

export default prisma;