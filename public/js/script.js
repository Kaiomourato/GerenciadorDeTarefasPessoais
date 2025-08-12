async function fetchAndDisplayTasks() {
    const taskListContainer = document.getElementById('task-list-container');
    taskListContainer.innerHTML = '<p>Carregando tarefas...</p>';

    

    try {
        
        const response = await fetch('/api/tasks/details'); 
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
            li.dataset.taskId = task.task_id; 

            const statusClass = task.status ? `status-${task.status.replace(/\s/g, '')}` : '';
            const priorityClass = task.priority_name ? `priority-${task.priority_name.replace(/\s/g, '')}` : '';

            const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'N/A';

            li.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Sem descrição'}</p>
                <p><strong>Vencimento:</strong> ${dueDate}</p>
                <p><strong>Status:</strong> <span class="status ${statusClass}">${task.status}</span></p>
                <p><strong>Prioridade:</strong> <span class="priority ${priorityClass}">${task.priority_name || 'N/A'}</span></p>
                <p><strong>Categoria:</strong> ${task.category_name || 'N/A'}</p>
                <div class="task-actions">
                    <button class="update-status-btn" data-status="${task.status}">Atualizar Status</button>
                    <button class="delete-btn">Excluir</button>
                </div>
            `;
            ul.appendChild(li);
        });

        
        taskListContainer.addEventListener('click', async (event) => {
            if (event.target.classList.contains('delete-btn')) {
                const taskId = event.target.closest('.task-item').dataset.taskId;
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    await deleteTask(taskId);
                }
            }
            if (event.target.classList.contains('update-status-btn')) {
                const taskId = event.target.closest('.task-item').dataset.taskId;
                const currentStatus = event.target.dataset.status;
                const newStatus = prompt('Digite o novo status (Pendente, Em Progresso, Concluída, Cancelada):', currentStatus);
                if (newStatus) {
                    await updateTaskStatus(taskId, newStatus);
                }
            }
        });

        taskListContainer.appendChild(ul);

    } catch (error) {
        console.error('Erro ao buscar tarefas:', error);
        taskListContainer.innerHTML = `<p style="color: red;">Erro ao carregar tarefas: ${error.message}</p>`;
    }
}


async function populateDropdowns() {
    const categorySelect = document.getElementById('category_id');
    const prioritySelect = document.getElementById('priority_id');


    categorySelect.innerHTML = '<option value="">Nenhuma</option>';
    prioritySelect.innerHTML = '<option value="">Nenhuma</option>';

    try {
        const categoriesResponse = await fetch('/api/categories');
        if (!categoriesResponse.ok) throw new Error(`HTTP error! status: ${categoriesResponse.status} ao buscar categorias`);
        const categories = await categoriesResponse.json();
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.category_id;
            option.textContent = category.category_name;
            categorySelect.appendChild(option);
        });

        const prioritiesResponse = await fetch('/api/priorities');
        if (!prioritiesResponse.ok) throw new Error(`HTTP error! status: ${prioritiesResponse.status} ao buscar prioridades`);
        const priorities = await prioritiesResponse.json();
        priorities.forEach(priority => {
            const option = document.createElement('option');
            option.value = priority.priority_id;
            option.textContent = priority.priority_name;
            prioritySelect.appendChild(option);
        });

    } catch (error) {
        console.error('Erro ao popular dropdowns:', error);
    }
}


async function addNewTask(event) {
    event.preventDefault(); 

    const form = event.target;
    const formData = new FormData(form); 

   
    const taskData = {};
    for (let [key, value] of formData.entries()) {
        if (key === 'category_id' || key === 'priority_id') {
            taskData[key] = value === ''? null : parseInt(value); 
        } else {
            taskData[key] = value;
        }
    }

    try {
        const response = await fetch('/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(taskData), 
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao adicionar tarefa: ${errorData.error || response.statusText}`);
        }

        const newTask = await response.json();
        console.log('Tarefa adicionada com sucesso:', newTask);

        form.reset(); 
        fetchAndDisplayTasks(); 
        populateDropdowns(); 

    } catch (error) {
        console.error('Erro ao adicionar tarefa:', error);
        alert(`Não foi possível adicionar a tarefa: ${error.message}`);
    }
}

async function fetchAndDisplayStatusSummary() {
    const summaryContainer = document.getElementById('status-summary-container');
    summaryContainer.innerHTML = '<p>Carregando resumo...</p>';

    try {
        const response = await fetch('/api/tasks/summary/status');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const summary = await response.json();

        summaryContainer.innerHTML = '';
        if (summary.length === 0) {
            summaryContainer.innerHTML = '<p>Nenhum resumo de status encontrado.</p>';
            return;
        }

        const ul = document.createElement('ul');
        summary.forEach(item => {
            const li = document.createElement('li');
            li.textContent = `${item.status}: ${item.total_tasks} tarefas`;
            ul.appendChild(li);
        });
        summaryContainer.appendChild(ul);

    } catch (error) {
        console.error('Erro ao buscar resumo de status:', error);
        summaryContainer.innerHTML = `<p style="color: red;">Erro ao carregar resumo: ${error.message}</p>`;
    }
}

async function deleteTask(taskId) {
    try {
        const response = await fetch(`/api/tasks/${taskId}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`Erro ao excluir tarefa: ${response.statusText}`);
        }
        console.log(`Tarefa ${taskId} excluída com sucesso.`);
        fetchAndDisplayTasks();
        fetchAndDisplayStatusSummary();
    } catch (error) {
        console.error('Erro ao excluir tarefa:', error);
        alert(`Não foi possível excluir a tarefa: ${error.message}`);
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch(`/api/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ novo_status: newStatus }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Erro ao atualizar status: ${errorData.error || response.statusText}`);
        }
        console.log(`Status da tarefa ${taskId} atualizado para ${newStatus}.`);
        fetchAndDisplayTasks();
        fetchAndDisplayStatusSummary();
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert(`Não foi possível atualizar o status: ${error.message}`);
    }
}

async function fetchAndDisplayCategories() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = '';

    const response = await fetch('/api/categories');
    const categories = await response.json();

    categories.forEach(category => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <span>${category.category_name}</span>
            <div>
                <button onclick="editCategory('${category.category_id}', '${category.category_name}')">Editar</button>
                <button onclick="deleteCategory('${category.category_id}')">Excluir</button>
            </div>
        `;
        categoryList.appendChild(li);
    });
}

async function createCategory(event) {
    event.preventDefault();
    const categoryName = document.getElementById('categoryNameInput').value;
    await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category_name: categoryName })
    });
    document.getElementById('categoryNameInput').value = '';
    fetchAndDisplayCategories();
}

async function editCategory(id, currentName) {
    const newName = prompt('Novo nome para a categoria:', currentName);
    if (newName && newName !== currentName) {
        await fetch(`/api/categories/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category_name: newName })
        });
        fetchAndDisplayCategories();
    }
}

async function deleteCategory(id) {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
        await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        fetchAndDisplayCategories();
    }
}

async function fetchAndDisplayPriorities() {
    const priorityList = document.getElementById('priorityList');
    priorityList.innerHTML = '';
    const response = await fetch('/api/priorities');
    const priorities = await response.json();

    priorities.forEach(priority => {
        const li = document.createElement('li');
        li.className = 'list-item';
        li.innerHTML = `
            <span>${priority.priority_name} (Nível: ${priority.priority_level})</span>
            <div>
                <button onclick="editPriority('${priority.priority_id}', '${priority.priority_name}', ${priority.priority_level})">Editar</button>
                <button onclick="deletePriority('${priority.priority_id}')">Excluir</button>
            </div>
        `;
        priorityList.appendChild(li);
    });
}

async function createPriority(event) {
    event.preventDefault();
    const priorityName = document.getElementById('priorityNameInput').value;
    const priorityLevel = document.getElementById('priorityLevelInput').value;
    await fetch('/api/priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority_name: priorityName, priority_level: parseInt(priorityLevel) })
    });
    document.getElementById('priorityNameInput').value = '';
    document.getElementById('priorityLevelInput').value = '';
    fetchAndDisplayPriorities();
}

async function editPriority(id, currentName, currentLevel) {
    const newName = prompt('Novo nome para a prioridade:', currentName);
    const newLevel = prompt('Novo nível para a prioridade:', currentLevel);
    if (newName && newName !== currentName || newLevel && newLevel !== currentLevel) {
        await fetch(`/api/priorities/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ priority_name: newName, priority_level: parseInt(newLevel) })
        });
        fetchAndDisplayPriorities();
    }
}

async function deletePriority(id) {
    if (confirm('Tem certeza que deseja excluir esta prioridade?')) {
        await fetch(`/api/priorities/${id}`, { method: 'DELETE' });
        fetchAndDisplayPriorities();
    }
}


document.addEventListener('DOMContentLoaded', () => {
    
    fetchAndDisplayTasks();
    populateDropdowns();
    fetchAndDisplayStatusSummary();
    fetchAndDisplayCategories(); 
    fetchAndDisplayPriorities(); 

    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', addNewTask);
    }

   
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', createCategory);
    }

    const priorityForm = document.getElementById('priorityForm');
    if (priorityForm) {
        priorityForm.addEventListener('submit', createPriority);
    }
});