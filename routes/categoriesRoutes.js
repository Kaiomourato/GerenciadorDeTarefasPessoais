const express = require('express');
const router = express.Router();

const { pool } = require('../config/supabaseClient'); 

// Listar Categorias
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

// Criar nova categoria
router.post('/', async (req, res) => {
    const { category_name } = req.body;
    if (!category_name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }
    try {
        const client = await pool.connect();
        const result = await client.query('INSERT INTO categories (category_name) VALUES ($1) RETURNING *;', [category_name]);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao criar categoria:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao criar categoria.' });
    }
});

// Atualizar categoria
router.put('/:id', async (req, res) => {
    const categoryId = req.params.id;
    const { category_name } = req.body;
    if (!category_name) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório.' });
    }
    try {
        const client = await pool.connect();
        const result = await client.query('UPDATE categories SET category_name = $1 WHERE category_id = $2 RETURNING *;', [category_name, categoryId]);
        client.release();
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Erro ao atualizar categoria:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar categoria.' });
    }
});

// Deletar categoria
router.delete('/:id', async (req, res) => {
    const categoryId = req.params.id;
    try {
        const client = await pool.connect();
        const result = await client.query('DELETE FROM categories WHERE category_id = $1;', [categoryId]);
        client.release();
        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Categoria não encontrada.' });
        }
        res.status(204).send();
    } catch (err) {
        console.error('Erro ao excluir categoria:', err.stack);
        res.status(500).json({ error: 'Erro interno do servidor ao excluir categoria.' });
    }
});

module.exports = router;