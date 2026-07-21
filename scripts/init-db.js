import sql from 'mssql';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '132569',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function initDatabase() {
  console.log(' Conectando a SQL Server para inicializar FibrasNaranjoDB...');
  try {
    const pool = await sql.connect(config);

    console.log(' Ejecutando db/schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../db/schema.sql'), 'utf-8');
    // Split GO commands for MSSQL execution
    const schemaBatches = schemaSql.split(/^GO/m);
    for (const batch of schemaBatches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log(' Ejecutando db/seed.sql...');
    const seedSql = fs.readFileSync(path.join(__dirname, '../db/seed.sql'), 'utf-8');
    const seedBatches = seedSql.split(/^GO/m);
    for (const batch of seedBatches) {
      if (batch.trim()) {
        await pool.request().query(batch);
      }
    }

    console.log(' ¡Base de datos FibrasNaranjoDB creada y poblada exitosamente en SQL Server!');
    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error(' Error al inicializar la base de datos en SQL Server:', err);
    console.log('\nAsegúrate de que SQL Server esté iniciado en localhost:1433 con el usuario sa y contraseña 132569.');
    process.exit(1);
  }
}

initDatabase();
