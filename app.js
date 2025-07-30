// app.js

const express = require('express');
const { initializeDatabase } = require('./config/db'); 
const tasksRoutes = require('./routes/tasksRoutes'); 
const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());


app.use(express.static('public'));



app.use('/api/tasks', tasksRoutes); 


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});



app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log('🛑 Pressione CTRL+C para parar o servidor');
});