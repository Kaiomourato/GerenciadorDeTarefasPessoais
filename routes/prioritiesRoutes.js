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

// Criar nova prioridade
router.post('/', async (req, res) => {
    const { priority_name, priority_level } = req.body;
    if (!priority_name || priority_level == null) {
        return res.status(400).json({ error: 'Nome e nível de prioridade são obrigatórios.' });
    }
    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO priorities (priority_name, priority_level) VALUES ($1, $2) RETURNING *;', [priority_name, priority_level]);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar prioridade:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao criar prioridade.' });
    }
});

// Atualizar prioridade
router.put('/:id', async (req, res) => {
    const priorityId = req.params.id;
    const { priority_name, priority_level } = req.body;
    if (!priority_name || priority_level == null) {
        return res.status(400).json({ error: 'Nome e nível de prioridade são obrigatórios.' });
    }
    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE priorities SET priority_name = $1, priority_level = $2 WHERE priority_id = $3 RETURNING *;', [priority_name, priority_level, priorityId]);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Prioridade não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar prioridade:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar prioridade.' });
    }
});

// Deletar prioridade
router.delete('/:id', async (req, res) => {
    const priorityId = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM priorities WHERE priority_id = $1;', [priorityId]);
        client.release();
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Prioridade não encontrada.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Erro ao excluir prioridade:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao excluir prioridade.' });
    }
});
module.exports = router;