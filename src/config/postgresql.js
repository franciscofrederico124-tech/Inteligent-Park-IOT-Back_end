const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function Connect() {

  try {

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    console.log(`
  > •••••••••••••••••••••••••••••
  >
  > Tabela 'users' criada/verificada com sucesso ✓
  >
  > •••••••••••••••••••••••••••••
  `);
  
  } catch (error) {

    console.log(`
  > •••••••••••••••••••••••
  >  Erro ao conectar com PostgreSQL: ${error}
  > ••••••••••••••••••••••
    `);

  }

}

Connect();

module.exports = pool;