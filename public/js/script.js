
async function fetchAndDisplayTasks() {
    const taskListContainer = document.getElementById('task-list-container');
    taskListContainer.innerHTML = '<p>Carregando tarefas...</p>'; // Mensagem de carregamento

    try {
        
        const response = await fetch('/api/tasks');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const tasks = await response.json(); 

        taskListContainer.innerHTML = '';

        if (tasks.length === 0) {
            taskListContainer.innerHTML = '<p>Nenhuma tarefa encontrada. Comece adicionando uma!</p>';
            return;
        }

        const ul = document.createElement('ul');
        ul.classList.add('task-list'); 

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item'); 

            li.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Sem descrição'}</p>
                <p><strong>Vencimento:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Prioridade:</strong> ${task.priority_id ? task.priority_id : 'N/A'}</p>
                <p><strong>Categoria:</strong> ${task.category_id ? task.category_id : 'N/A'}</p>
                `;
            ul.appendChild(li);
        });

        taskListContainer.appendChild(ul);

    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        taskListContainer.innerHTML = `<p style="color: red;">Erro ao carregar tarefas: ${error.message}</p>`;
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplayTasks);