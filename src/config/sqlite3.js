const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database('./park.db');

function Connect() {
  try {
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      password TEXT NOT NULL
    )`);
    console.log("Tabela 'users' criada/verificada com sucesso!");
  } catch (error) {
    console.log("Deu ruim ao conectar com o banco de dados: ", error.message);
  }
}

Connect();

module.exports = db;
