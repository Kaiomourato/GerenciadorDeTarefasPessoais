 

const { Pool } = require('pg');
const fs = require('fs');


const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'GerenciadorDeTarefasPessoais',
    password: 'KMMoura555!',
    port: 5432,
});


async function initializeDatabase() {
    try {
        const client = await pool.connect();
        const sql = fs.readFileSync('./init_db.sql').toString(); 
        await client.query(sql);
        console.log('✅ Tabelas criadas e dados iniciais inseridos com sucesso!');
        client.release();
    } catch (err) {
        console.error('❌ Erro ao inicializar o banco de dados:', err.stack);
    
    }
}


pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Erro ao conectar ao banco de dados:', err.stack);
    }
    console.log('✅ Conexão bem-sucedida ao banco de dados PostgreSQL!');
    client.query('SELECT NOW()', (err, result) => {
        release();
        if (err) {
            return console.error('❌ Erro ao executar query de teste', err.stack);
        }
        console.log('📦 Query de teste executada com sucesso:', result.rows[0].now);
    });
});


module.exports = {
    pool,
    initializeDatabase
};