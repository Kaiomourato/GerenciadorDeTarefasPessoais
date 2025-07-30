-- init_db.sql

-- Drop tables if they exist to allow re-creation during development
-- CUIDADO: Isso apaga todos os dados existentes nas tabelas!
DROP TABLE IF EXISTS Task_History CASCADE;
DROP TABLE IF EXISTS Tasks CASCADE;
DROP TABLE IF EXISTS Categories CASCADE;
DROP TABLE IF EXISTS Priorities CASCADE;
DROP TABLE IF EXISTS Users CASCADE;

-- Tabela de Usuários
CREATE TABLE Users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Armazenar hashes de senhas, nunca senhas em texto claro
    email VARCHAR(100) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Prioridades
CREATE TABLE Priorities (
    priority_id SERIAL PRIMARY KEY,
    priority_name VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'Baixa', 'Média', 'Alta', 'Urgente'
    priority_level INTEGER UNIQUE NOT NULL -- Ex: 1 (Baixa), 2 (Média), 3 (Alta), 4 (Urgente)
);

-- Inserir algumas prioridades padrão (opcional, mas bom para começar)
INSERT INTO Priorities (priority_name, priority_level) VALUES
('Baixa', 1),
('Média', 2),
('Alta', 3),
('Urgente', 4);


-- Tabela de Categorias
CREATE TABLE Categories (
    category_id SERIAL PRIMARY KEY,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    user_id INTEGER,
    CONSTRAINT fk_user_category -- Nome da constraint para user_id em Categories
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Tabela de Tarefas
CREATE TABLE Tasks (
    task_id SERIAL PRIMARY KEY,
    user_id INTEGER,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status VARCHAR(20) DEFAULT 'Pendente' NOT NULL, -- Ex: 'Pendente', 'Concluída', 'Atrasada'
    category_id INTEGER,
    priority_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_task -- Nome da constraint para user_id em Tasks
        FOREIGN KEY (user_id)
        REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_category_task -- Nome da constraint para category_id em Tasks
        FOREIGN KEY (category_id)
        REFERENCES Categories(category_id) ON DELETE SET NULL,
    CONSTRAINT fk_priority_task -- Nome da constraint para priority_id em Tasks
        FOREIGN KEY (priority_id)
        REFERENCES Priorities(priority_id) ON DELETE SET NULL
);

-- Tabela para histórico de status de tarefas
CREATE TABLE Task_History (
    history_id SERIAL PRIMARY KEY,
    task_id INTEGER,
    old_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    change_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    CONSTRAINT fk_task_history -- Nome da constraint para task_id em Task_History
        FOREIGN KEY (task_id)
        REFERENCES Tasks(task_id) ON DELETE CASCADE
);