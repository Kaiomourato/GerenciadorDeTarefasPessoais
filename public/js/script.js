    // Função para buscar e exibir as tarefas
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
                        <button class="edit-btn">Editar</button> <!-- Novo botão -->
                        <button class="update-status-btn" data-status="${task.status}">Atualizar Status</button>
                        <button class="history-btn">Ver Histórico</button>
                        <button class="delete-btn">Excluir</button>
                    </div>
                `;
                ul.appendChild(li);
            });

            taskListContainer.appendChild(ul);
        } catch (error) {
            console.error('Erro ao buscar tarefas:', error);
            taskListContainer.innerHTML = `<p style="color: red;">Erro ao carregar tarefas: ${error.message}</p>`;
        }
    }

// Função para abrir o modal de edição
async function openEditModal(taskId) {
    try {
        // Corrigir a rota para usar /details
        const response = await fetch(`/api/tasks/details`);
        if (!response.ok) {
            throw new Error('Erro ao buscar detalhes da tarefa');
        }
        
        const tasks = await response.json();
        const task = tasks.find(t => t.task_id == taskId);
        
        if (!task) {
            throw new Error('Tarefa não encontrada');
        }
        
        // Preencher o formulário
        document.getElementById('edit-task-id').value = task.task_id;
        document.getElementById('edit-title').value = task.title;
        document.getElementById('edit-description').value = task.description || '';
        
        // Formatar corretamente a data
        const dueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '';
        document.getElementById('edit-due_date').value = dueDate;
        
        document.getElementById('edit-status').value = task.status;
        
        // Preencher dropdowns com valores corretos
        await populateEditDropdowns(
            task.category_id || null, 
            task.priority_id || null
        );
        
        // Exibir o modal
        document.getElementById('editTaskModal').style.display = 'block';
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        alert('Não foi possível carregar os dados da tarefa para edição. ' + error.message);
    }
}

// Função para popular dropdowns do modal de edição
async function populateEditDropdowns(selectedCategoryId, selectedPriorityId) {
    const categorySelect = document.getElementById('edit-category_id');
    const prioritySelect = document.getElementById('edit-priority_id');

    // Limpar dropdowns
    categorySelect.innerHTML = '<option value="">Nenhuma</option>';
    prioritySelect.innerHTML = '<option value="">Nenhuma</option>';

    try {
        // Popular categorias
        const categoriesResponse = await fetch('/api/categories');
        if (categoriesResponse.ok) {
            const categories = await categoriesResponse.json();
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                option.selected = (category.category_id == selectedCategoryId);
                categorySelect.appendChild(option);
            });
        }

        // Popular prioridades
        const prioritiesResponse = await fetch('/api/priorities');
        if (prioritiesResponse.ok) {
            const priorities = await prioritiesResponse.json();
            priorities.forEach(priority => {
                const option = document.createElement('option');
                option.value = priority.priority_id;
                option.textContent = priority.priority_name;
                option.selected = (priority.priority_id == selectedPriorityId);
                prioritySelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Erro ao popular dropdowns de edição:', error);
    }
}

// Função para atualizar a tarefa
    async function updateTask(event) {
        event.preventDefault();
        
        const taskId = document.getElementById('edit-task-id').value;
        const formData = {
            title: document.getElementById('edit-title').value,
            description: document.getElementById('edit-description').value,
            due_date: document.getElementById('edit-due_date').value,
            status: document.getElementById('edit-status').value,
            category_id: document.getElementById('edit-category_id').value || null,
            priority_id: document.getElementById('edit-priority_id').value || null
        };
        
        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || response.statusText);
            }
            
            // Fechar o modal
            document.getElementById('editTaskModal').style.display = 'none';
            
            // Recarregar as tarefas
            fetchAndDisplayTasks();
            alert('Tarefa atualizada com sucesso!');
            
        } catch (error) {
            console.error('Erro ao atualizar tarefa:', error);
            alert(`Erro ao atualizar: ${error.message}`);
        }
    }
    // Função para popular dropdowns
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


    // Função para adicionar nova tarefa
    async function addNewTask(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);
        const taskData = {};
        for (let [key, value] of formData.entries()) {
            if (key === 'category_id' || key === 'priority_id') {
                taskData[key] = value === '' ? null : parseInt(value);
            } else {
                taskData[key] = value;
            }
        }
        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(taskData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Erro ao adicionar tarefa: ${errorData.error || response.statusText}`);
            }
            console.log('Tarefa adicionada com sucesso:', await response.json());
            form.reset();
            fetchAndDisplayTasks();
            populateDropdowns();
        } catch (error) {
            console.error('Erro ao adicionar tarefa:', error);
            alert(`Não foi possível adicionar a tarefa: ${error.message}`);
        }
    }


    // Função para buscar e exibir o histórico de uma tarefa
    async function fetchAndDisplayTaskHistory(taskId) {
        const historyContainer = document.getElementById('taskHistoryContainer');
        historyContainer.innerHTML = '<p>Carregando histórico...</p>';
        try {
            const response = await fetch(`/api/tasks/history/${taskId}`);
            if (!response.ok) throw new Error('Erro ao buscar histórico.');
            const history = await response.json();
            if (history.length === 0) {
                historyContainer.innerHTML = `<p>Nenhum histórico encontrado para a tarefa ${taskId}.</p>`;
                return;
            }
            const ul = document.createElement('ul');
            history.forEach(item => {
                const li = document.createElement('li');
                const date = new Date(item.change_date).toLocaleString('pt-BR');
                li.innerHTML = `
                    <p><strong>Mudança em:</strong> ${date}</p>
                    <p>Status alterado de "${item.old_status}" para "${item.new_status}".</p>
                `;
                ul.appendChild(li);
            });
            historyContainer.innerHTML = '<h3>Histórico de Status da Tarefa:</h3>';
            historyContainer.appendChild(ul);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            historyContainer.innerHTML = `<p style="color: red;">Erro ao carregar histórico: ${error.message}</p>`;
        }
    }


    // Função para contar todas as tarefas via função SQL
    async function countAllTasksFunction() {
        const taskCountResult = document.getElementById('taskCountResultFunction');
        taskCountResult.innerHTML = '<p>Contando tarefas...</p>';
        try {
            const response = await fetch('/api/tasks/total-tasks-function');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || response.statusText);
            }
            const data = await response.json();
            taskCountResult.innerHTML = `<p>O total de tarefas cadastradas é: <strong>${data.total}</strong>.</p>`;
        } catch (error) {
            console.error('Erro ao contar todas as tarefas:', error);
            taskCountResult.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
        }
    }


    // Função para buscar e exibir o resumo de status
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


    // Funções de ação de tarefas
    async function deleteTask(taskId) {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            try {
                const response = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error(`Erro ao excluir tarefa: ${response.statusText}`);
                console.log(`Tarefa ${taskId} excluída com sucesso.`);
                fetchAndDisplayTasks();
                fetchAndDisplayStatusSummary();
            } catch (error) {
                console.error('Erro ao excluir tarefa:', error);
                alert(`Não foi possível excluir a tarefa: ${error.message}`);
            }
        }
    }

    async function updateTaskStatus(taskId, newStatus) {
        // A validação já está no event listener antes de chamar esta função.
        try {
            const response = await fetch(`/api/tasks/${taskId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ novo_status: newStatus }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || response.statusText);
            }
            alert('Status atualizado com sucesso. O trigger registrou a alteração no histórico!');
            fetchAndDisplayTasks();
            fetchAndDisplayStatusSummary();
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
            alert(`Não foi possível atualizar o status: ${error.message}`);
        }
    }


    // Funções de CRUD para Categorias
    async function fetchAndDisplayCategories() {
        const categoryList = document.getElementById('categoryList');
        categoryList.innerHTML = '';
        try {
            const response = await fetch('/api/categories');
            if (!response.ok) throw new Error('Erro ao buscar categorias.');
            const categories = await response.json();
            categories.forEach(category => {
                const li = document.createElement('li');
                li.className = 'list-item';
                li.innerHTML = `
                    <span>${category.category_name}</span>
                    <div>
                        <button onclick="editCategory(${category.category_id}, '${category.category_name}')">Editar</button>
                        <button onclick="deleteCategory(${category.category_id})">Excluir</button>
                    </div>
                `;
                categoryList.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            categoryList.innerHTML = `<p style="color: red;">Erro ao carregar categorias: ${error.message}</p>`;
        }
    }

    async function createCategory(event) {
        event.preventDefault();
        const categoryName = document.getElementById('categoryNameInput').value;
        try {
            await fetch('/api/categories', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ category_name: categoryName }),
            });
            document.getElementById('categoryNameInput').value = '';
            fetchAndDisplayCategories();
            populateDropdowns();
        } catch (error) {
            console.error('Erro ao criar categoria:', error);
            alert(`Não foi possível adicionar a categoria: ${error.message}`);
        }
    }

    async function editCategory(id, currentName) {
        const newName = prompt('Novo nome para a categoria:', currentName);
        if (newName && newName !== currentName) {
            try {
                await fetch(`/api/categories/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ category_name: newName }),
                });
                fetchAndDisplayCategories();
                populateDropdowns();
            } catch (error) {
                console.error('Erro ao editar categoria:', error);
                alert(`Não foi possível editar a categoria: ${error.message}`);
            }
        }
    }

    async function deleteCategory(id) {
        if (confirm('Tem certeza que deseja excluir esta categoria?')) {
            try {
                await fetch(`/api/categories/${id}`, { method: 'DELETE' });
                fetchAndDisplayCategories();
                populateDropdowns();
            } catch (error) {
                console.error('Erro ao excluir categoria:', error);
                alert(`Não foi possível excluir a categoria: ${error.message}`);
            }
        }
    }


    // Funções de CRUD para Prioridades
    async function fetchAndDisplayPriorities() {
        const priorityList = document.getElementById('priorityList');
        priorityList.innerHTML = '';
        try {
            const response = await fetch('/api/priorities');
            if (!response.ok) throw new Error('Erro ao buscar prioridades.');
            const priorities = await response.json();
            priorities.forEach(priority => {
                const li = document.createElement('li');
                li.className = 'list-item';
                li.innerHTML = `
                    <span>${priority.priority_name} (Nível: ${priority.priority_level})</span>
                    <div>
                        <button onclick="editPriority(${priority.priority_id}, '${priority.priority_name}', ${priority.priority_level})">Editar</button>
                        <button onclick="deletePriority(${priority.priority_id})">Excluir</button>
                    </div>
                `;
                priorityList.appendChild(li);
            });
        } catch (error) {
            console.error('Erro ao buscar prioridades:', error);
            priorityList.innerHTML = `<p style="color: red;">Erro ao carregar prioridades: ${error.message}</p>`;
        }
    }

    async function createPriority(event) {
        event.preventDefault();
        const priorityName = document.getElementById('priorityNameInput').value;
        const priorityLevel = document.getElementById('priorityLevelInput').value;
        try {
            await fetch('/api/priorities', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priority_name: priorityName, priority_level: parseInt(priorityLevel) }),
            });
            document.getElementById('priorityNameInput').value = '';
            document.getElementById('priorityLevelInput').value = '';
            fetchAndDisplayPriorities();
            populateDropdowns();
        } catch (error) {
            console.error('Erro ao criar prioridade:', error);
            alert(`Não foi possível adicionar a prioridade: ${error.message}`);
        }
    }

    async function editPriority(id, currentName, currentLevel) {
        const newName = prompt('Novo nome para a prioridade:', currentName);
        const newLevel = prompt('Novo nível para a prioridade:', currentLevel);
        if (newName && newName !== currentName || newLevel && newLevel !== currentLevel) {
            try {
                await fetch(`/api/priorities/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ priority_name: newName, priority_level: parseInt(newLevel) }),
                });
                fetchAndDisplayPriorities();
                populateDropdowns();
            } catch (error) {
                console.error('Erro ao editar prioridade:', error);
                alert(`Não foi possível editar a prioridade: ${error.message}`);
            }
        }
    }

    async function deletePriority(id) {
        if (confirm('Tem certeza que deseja excluir esta prioridade?')) {
            try {
                await fetch(`/api/priorities/${id}`, { method: 'DELETE' });
                fetchAndDisplayPriorities();
                populateDropdowns();
            } catch (error) {
                console.error('Erro ao excluir prioridade:', error);
                alert(`Não foi possível excluir a prioridade: ${error.message}`);
            }
        }
    }


    // Inicialização da aplicação
    document.addEventListener('DOMContentLoaded', () => {
    // Chamadas de inicialização
    fetchAndDisplayTasks();
    populateDropdowns();
    fetchAndDisplayStatusSummary();
    fetchAndDisplayCategories();
    fetchAndDisplayPriorities();
    
    // Event listeners para formulários e botões de ação
    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', addNewTask);
    }

    const countBtn = document.getElementById('countAllTasksFunctionBtn');
    if (countBtn) {
        countBtn.addEventListener('click', countAllTasksFunction);
    }
    
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', createCategory);
    }
    
    const priorityForm = document.getElementById('priorityForm');
    if (priorityForm) {
        priorityForm.addEventListener('submit', createPriority);
    }
    
    // Listener para o formulário de edição de tarefas
    const editTaskForm = document.getElementById('edit-task-form');
    if (editTaskForm) {
        editTaskForm.addEventListener('submit', updateTask);
    }
    
    // Fechar modal ao clicar no "X"
    const closeModalBtn = document.querySelector('.close-modal');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            document.getElementById('editTaskModal').style.display = 'none';
        });
    }
    
    // Fechar modal ao clicar fora da área do modal
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('editTaskModal');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Listener de clique centralizado para ações de tarefas
    const taskListContainer = document.getElementById('task-list-container');
    if (taskListContainer) {
        taskListContainer.addEventListener('click', async (event) => {
            const target = event.target;
            const taskItem = target.closest('.task-item');
            if (!taskItem) return;
            
            const taskId = taskItem.dataset.taskId;
            
            // Ação de deletar
            if (target.classList.contains('delete-btn')) {
                if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                    await deleteTask(taskId);
                }
            }
            
            // Ação de atualizar status
            if (target.classList.contains('update-status-btn')) {
                const currentStatus = target.dataset.status;
                const newStatus = prompt('Digite o novo status (Pendente, Em Progresso, Concluída, Cancelada):', currentStatus);
                if (newStatus) {
                    await updateTaskStatus(taskId, newStatus);
                }
            }
            
            // Ação de ver histórico
            if (target.classList.contains('history-btn')) {
                await fetchAndDisplayTaskHistory(taskId);
            }
            
            // Ação de editar (nova funcionalidade)
            if (target.classList.contains('edit-btn')) {
                await openEditModal(taskId);
            }
        });
    }
});