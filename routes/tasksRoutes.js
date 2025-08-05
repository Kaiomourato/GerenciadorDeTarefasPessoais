

const express = require('express');
const router = express.Router(); 
const { pool } = require('../config/supabaseClient'); 


router.get('/', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT task_id, title, description, due_date, status, category_id, priority_id, created_at, updated_at FROM Tasks ORDER BY due_date ASC, created_at ASC;');
        client.release();
        res.json(result.rows);
    } catch (err) {
        console.error('Erro ao listar tarefas:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao listar tarefas.' });
    }
});


router.post('/', async (req, res) => {
    const { title, description, due_date, status, category_id, priority_id } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: 'Título e data de vencimento são obrigatórios.' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            'INSERT INTO Tasks (title, description, due_date, status, category_id, priority_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;',
            [title, description, due_date, status || 'Pendente', category_id, priority_id]
        );
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar tarefa:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao criar tarefa.' });
    }
});


// Rota para atualizar uma tarefa existente (UPDATE - PUT)
router.put('/:id', async (req, res) => {
    const taskId = req.params.id;
    const { title, description, due_date, status, category_id, priority_id } = req.body;

    if (!title || !due_date) {
        return res.status(400).json({ error: 'Título e data de vencimento são obrigatórios.' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(
            `UPDATE Tasks SET
                title = $1,
                description = $2,
                due_date = $3,
                status = $4,
                category_id = $5,
                priority_id = $6,
                updated_at = CURRENT_TIMESTAMP
             WHERE task_id = $7
             RETURNING *;`, 
            [title, description, due_date, status, category_id, priority_id, taskId]
        );
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }

        res.json(result.rows[0]); // Retorna a tarefa atualizada
    } catch (err) {
        console.error('Erro ao atualizar tarefa:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar tarefa.' });
    }
});

// Rota para excluir uma tarefa (DELETE - DELETE)
router.delete('/:id', async (req, res) => {
    const taskId = req.params.id; 

    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM Tasks WHERE task_id = $1;', [taskId]);
        client.release();

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Tarefa não encontrada.' });
        }
        res.status(204).send(); 
    } catch (err) {
        console.error('Erro ao excluir tarefa:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao excluir tarefa.' });
    }
});

module.exports = router;