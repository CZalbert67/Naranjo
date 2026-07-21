import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '132569',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'FibrasNaranjoDB',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false, // For local SQL Server / SSMS
    trustServerCertificate: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

// Singleton Pattern for MSSQL Pool to reuse connections in SSR
declare global {
  var _mssqlPool: sql.ConnectionPool | undefined;
}

export async function getDbPool(): Promise<sql.ConnectionPool> {
  if (global._mssqlPool && global._mssqlPool.connected) {
    return global._mssqlPool;
  }

  try {
    if (global._mssqlPool) {
      await global._mssqlPool.close();
    }
    const pool = new sql.ConnectionPool(config);
    global._mssqlPool = await pool.connect();
    console.log('[DB] Conexión exitosa a SQL Server (FibrasNaranjoDB)');
    return global._mssqlPool;
  } catch (error) {
    console.error('[DB Error] Error al conectar con SQL Server:', error);
    throw error;
  }
}

export { sql };
