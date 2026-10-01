const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Tablas iniciales
db.exec(`
    CREATE TABLE IF NOT EXISTS config (
        clave TEXT PRIMARY KEY,
        valor TEXT
    );

    CREATE TABLE IF NOT EXISTS sugerencias_votos (
        mensajeId TEXT,
        userId TEXT,
        tipo TEXT,
        PRIMARY KEY (mensajeId, userId)
    );

    CREATE TABLE IF NOT EXISTS niveles (
        userId TEXT PRIMARY KEY,
        xp INTEGER DEFAULT 0,
        nivel INTEGER DEFAULT 1,
        ultimoMensaje INTEGER DEFAULT 0
    );
`);

module.exports = db;