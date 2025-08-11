const express = require('express');
const router = express.Router();
const { pool } = require('../config/supabaseClient');


router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT priority_id, priority_name, priority_level FROM Priorities ORDER BY priority_level ASC;');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar prioridades:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao listar prioridades.' });
    }
});

module.exports = router;