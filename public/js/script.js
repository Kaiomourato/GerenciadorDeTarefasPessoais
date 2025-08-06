async function fetchAndDisplayTasks() {
    const taskListContainer = document.getElementById('task-list-container');
    taskListContainer.innerHTML = '<p>Carregando tarefas...</p>';

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

          
            const dueDate = task.due_date? new Date(task.due_date).toLocaleDateString('pt-BR') : 'N/A';

            li.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description || 'Sem descrição'}</p>
                <p><strong>Vencimento:</strong> ${dueDate}</p>
                <p><strong>Status:</strong> ${task.status}</p>
                <p><strong>Prioridade:</strong> ${task.priority_id? task.priority_id : 'N/A'}</p>
                <p><strong>Categoria:</strong> ${task.category_id? task.category_id : 'N/A'}</p>
                `;
            ul.appendChild(li);
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



document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayTasks(); 
    populateDropdowns();   

    const taskForm = document.getElementById('task-form');
    if (taskForm) {
        taskForm.addEventListener('submit', addNewTask); 
    }
});