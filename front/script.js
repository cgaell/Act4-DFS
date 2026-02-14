// State
let todos = [];
let currentFilter = 'all';

// Status configuration
const statusConfig = {
    'not-started': { label: 'Not Started', class: 'badge-not-started' },
    'in-progress': { label: 'In Progress', class: 'badge-in-progress' },
    'completed': { label: 'Completed', class: 'badge-completed' },
    'on-hold': { label: 'On Hold', class: 'badge-on-hold' }
};

// DOM Elements
const openDialogBtn = document.getElementById('openDialogBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelBtn = document.getElementById('cancelBtn');
const createTaskBtn = document.getElementById('createTaskBtn');
const taskDialog = document.getElementById('taskDialog');
const taskList = document.getElementById('taskList');

const taskNameInput = document.getElementById('taskName');
const statusInput = document.getElementById('status');
const assignedToInput = document.getElementById('assignedTo');
const assignedDateInput = document.getElementById('assignedDate');
// Auth elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const regUsername = document.getElementById('regUsername');
const regPassword = document.getElementById('regPassword');
const loginMessage = document.getElementById('loginMessage');
const registerMessage = document.getElementById('registerMessage');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadTodos();
    renderTasks();
    updateCounts();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    openDialogBtn.addEventListener('click', openDialog);
    closeDialogBtn.addEventListener('click', closeDialog);
    cancelBtn.addEventListener('click', closeDialog);
    createTaskBtn.addEventListener('click', createTask);
    // Auth forms
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await loginUser();
        });
    }
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await registerUser();
        });
    }
    
    // Close modal when clicking outside
    taskDialog.addEventListener('click', (e) => {
        if (e.target === taskDialog) {
            closeDialog();
        }
    });

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks();
        });
    });
}

async function loginUser() {
    try {
        const payload = {
            username: loginUsername.value.trim(),
            password: loginPassword.value
        };
        const res = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            loginMessage.textContent = data.message || 'Login exitoso';
            loginMessage.style.color = 'lightgreen';
        } else {
            loginMessage.textContent = data.error || 'Login inválido';
            loginMessage.style.color = '#E74C3C';
        }
    } catch (err) {
        loginMessage.textContent = 'Error conectando al servidor';
        loginMessage.style.color = '#E74C3C';
    }
}

async function registerUser() {
    try {
        const payload = {
            username: regUsername.value.trim(),
            password: regPassword.value
        };
        const res = await fetch('/login/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            registerMessage.textContent = data.message || 'Registro exitoso';
            registerMessage.style.color = 'lightgreen';
        } else {
            registerMessage.textContent = data.error || 'Registro inválido';
            registerMessage.style.color = '#E74C3C';
        }
    } catch (err) {
        registerMessage.textContent = 'Error conectando al servidor';
        registerMessage.style.color = '#E74C3C';
    }
}
// Modal functions
function openDialog() {
    taskDialog.classList.add('active');
}

function closeDialog() {
    taskDialog.classList.remove('active');
    resetForm();
}

function resetForm() {
    taskNameInput.value = '';
    statusInput.value = 'not-started';
    assignedToInput.value = '';
    assignedDateInput.value = '';
}

// CRUD Operations
async function createTask() {
    const taskName = taskNameInput.value.trim();
    const status = statusInput.value;
    const assignedTo = assignedToInput.value.trim();
    const assignedDate = assignedDateInput.value || getTodayDate();

    if (!taskName || !assignedTo) {
        alert('Please fill in all required fields');
        return;
    }

    const newTask = {
        id: Date.now().toString(),
        taskName,
        createdDate: getTodayDate(),
        status,
        createdBy: 'System', // Will be replaced with authenticated user later
        assignedTo,
        assignedDate
    };

    try {
        const response = await fetch('/tareas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newTask)
        });

        if (response.ok) {
            todos.unshift(newTask);
            renderTasks();
            updateCounts();
            closeDialog();
        } else {
            console.error('Error saving task to backend');
            alert('Failed to save task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

async function deleteTask(id) {
    try {
        const response = await fetch(`/tareas/${id}`, { method: 'DELETE' });
        if (response.ok) {
            todos = todos.filter(todo => todo.id !== id);
            renderTasks();
            updateCounts();
        } else {
            alert('Failed to delete task');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

async function updateTaskStatus(id, newStatus) {
    const task = todos.find(todo => todo.id === id);
    if (task) {
        const oldStatus = task.status;
        task.status = newStatus;
        renderTasks();
        updateCounts();

        try {
            const response = await fetch(`/tareas/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                task.status = oldStatus;
                renderTasks();
                updateCounts();
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Error:', error);
            task.status = oldStatus;
            renderTasks();
            updateCounts();
            alert('Error connecting to server');
        }
    }
}

// Render functions
function renderTasks() {
    const filteredTodos = getFilteredTodos();
    
    if (filteredTodos.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>${todos.length === 0 
                    ? 'No tasks yet. Create your first task to get started!' 
                    : `No ${currentFilter === 'all' ? '' : statusConfig[currentFilter].label.toLowerCase()} tasks`}
                </p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredTodos.map(task => `
        <div class="task-card">
            <div class="task-header">
                <div class="task-info">
                    <div class="task-title-row">
                        <h3 class="task-title">${escapeHtml(task.taskName)}</h3>
                        <span class="badge ${statusConfig[task.status].class}">
                            ${statusConfig[task.status].label}
                        </span>
                    </div>
                    <div class="task-details">
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>Created: ${formatDate(task.createdDate)}</span>
                        </div>
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Created by: ${escapeHtml(task.createdBy)}</span>
                        </div>
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Assigned to: ${escapeHtml(task.assignedTo)}</span>
                        </div>
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                <line x1="3" y1="10" x2="21" y2="10"></line>
                            </svg>
                            <span>Assigned: ${formatDate(task.assignedDate)}</span>
                        </div>
                    </div>
                </div>
                <div class="task-actions">
                    <select onchange="updateTaskStatus('${task.id}', this.value)" value="${task.status}">
                        <option value="not-started" ${task.status === 'not-started' ? 'selected' : ''}>Not Started</option>
                        <option value="in-progress" ${task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="on-hold" ${task.status === 'on-hold' ? 'selected' : ''}>On Hold</option>
                        <option value="completed" ${task.status === 'completed' ? 'selected' : ''}>Completed</option>
                    </select>
                    <button class="btn-delete" onclick="deleteTask('${task.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Delete
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCounts() {
    document.getElementById('count-all').textContent = todos.length;
    document.getElementById('count-not-started').textContent = todos.filter(t => t.status === 'not-started').length;
    document.getElementById('count-in-progress').textContent = todos.filter(t => t.status === 'in-progress').length;
    document.getElementById('count-on-hold').textContent = todos.filter(t => t.status === 'on-hold').length;
    document.getElementById('count-completed').textContent = todos.filter(t => t.status === 'completed').length;
}

// Helper functions
function getFilteredTodos() {
    if (currentFilter === 'all') {
        return todos;
    }
    return todos.filter(todo => todo.status === currentFilter);
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// LocalStorage functions
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

async function loadTodos() {
    try {
        const response = await fetch('/tareas');
        if (!response.ok) throw new Error('Failed to fetch tasks');
        const data = await response.json();
        todos = data.tareas || [];
        renderTasks();
        updateCounts();
    } catch (error) {
        console.error('Error loading tasks:', error);
        todos = [];
        renderTasks();
        updateCounts();
    }
}
