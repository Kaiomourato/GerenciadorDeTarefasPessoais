const express = require('express');
const router = express.Router();

const { pool } = require('../config/supabaseClient'); 


router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        
        const result = await client.query('SELECT category_id, category_name FROM Categories ORDER BY category_name ASC;');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar categorias:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao listar categorias.' });
    }
});

module.exports = router;