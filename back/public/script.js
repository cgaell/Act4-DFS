// State
let products = []; // Cambiamos todos por products
let currentFilter = 'all';

// Status configuration (Mapeado a tus clases CSS existentes)
const statusConfig = {
    'in-stock': { label: 'En Stock', class: 'badge-completed' },       // Verde
    'low-stock': { label: 'Bajo Stock', class: 'badge-in-progress' },  // Amarillo
    'out-of-stock': { label: 'Agotado', class: 'badge-not-started' },  // Rojo
    'discontinued': { label: 'Descontinuado', class: 'badge-on-hold' } // Gris
};

// DOM Elements 
const openDialogBtn = document.getElementById('openDialogBtn');
const closeDialogBtn = document.getElementById('closeDialogBtn');
const cancelBtn = document.getElementById('cancelBtn');
const createTaskBtn = document.getElementById('createTaskBtn'); // Ahora crea productos
const taskDialog = document.getElementById('taskDialog');
const taskList = document.getElementById('taskList'); // Ahora lista productos

// Inputs
const taskNameInput = document.getElementById('taskName'); // Será el Nombre del Producto
const statusInput = document.getElementById('status');
const assignedToInput = document.getElementById('assignedTo'); // Será la Categoría
const assignedDateInput = document.getElementById('assignedDate'); // Será Fecha Caducidad

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
    loadProducts(); // Cargar productos
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    if(openDialogBtn) openDialogBtn.addEventListener('click', openDialog);
    if(closeDialogBtn) closeDialogBtn.addEventListener('click', closeDialog);
    if(cancelBtn) cancelBtn.addEventListener('click', closeDialog);
    if(createTaskBtn) createTaskBtn.addEventListener('click', createProduct); // Crear producto

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
    if(taskDialog) {
        taskDialog.addEventListener('click', (e) => {
            if (e.target === taskDialog) {
                closeDialog();
            }
        });
    }

    // Filter buttons
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProducts();
        });
    });
}

// --- AUTH FUNCTIONS (Sin cambios) ---
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
            setTimeout(() => window.location.href = '/', 1000); // Redirigir
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
        const res = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
            registerMessage.textContent = data.message || 'Registro exitoso';
            registerMessage.style.color = 'lightgreen';
            setTimeout(() => window.location.href = '/login', 1500);
        } else {
            registerMessage.textContent = data.error || 'Registro inválido';
            registerMessage.style.color = '#E74C3C';
        }
    } catch (err) {
        registerMessage.textContent = 'Error conectando al servidor';
        registerMessage.style.color = '#E74C3C';
    }
}

// --- UI FUNCTIONS ---
function openDialog() {
    taskDialog.classList.add('active');
}

function closeDialog() {
    taskDialog.classList.remove('active');
    resetForm();
}

function resetForm() {
    taskNameInput.value = '';
    statusInput.value = 'in-stock'; // Valor por defecto
    assignedToInput.value = '';
    assignedDateInput.value = '';
}

// --- CRUD OPERATIONS (Adaptado a Productos) ---

async function createProduct() {
    // Mapeamos los inputs a variables de Producto
    const name = taskNameInput.value.trim();
    const status = statusInput.value;
    const quantity = parseInt(assignedToInput.value);
    const expiryDate = assignedDateInput.value; // Puede estar vacío

    if (!name || !quantity) {
        alert('Por favor llena el nombre y la cantidad');
        return;
    }

    const newProduct = {
        id: Date.now().toString(),
        name,         // Antes taskName
        quantity,     // Antes assignedTo
        status,
        expiryDate,   // Antes assignedDate
        // entryDate se genera en el backend o aquí si prefieres
        entryDate: getTodayDate()
    };

    try {
        const response = await fetch('/products', { // Endpoint cambiado
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newProduct)
        });

        if (response.ok) {
            const savedData = await response.json();
            products.unshift(savedData.product || newProduct);
            renderProducts();
            updateCounts();
            closeDialog();
        } else {
            console.error('Error saving product');
            alert('Failed to save product');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

async function deleteProduct(id) {
    if(!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
        const response = await fetch(`/products/${id}`, { method: 'DELETE' }); // Endpoint cambiado
        if (response.ok) {
            products = products.filter(p => p.id !== id);
            renderProducts();
            updateCounts();
        } else {
            alert('Solo el administrador puede eliminar');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error connecting to server');
    }
}

async function updateProductStatus(id, newStatus) {
    const product = products.find(p => p.id === id);
    if (product) {
        const oldStatus = product.status;
        product.status = newStatus;
        renderProducts();
        updateCounts();

        try {
            const response = await fetch(`/products/${id}`, { // Endpoint cambiado
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            if (!response.ok) {
                product.status = oldStatus;
                renderProducts();
                updateCounts();
                alert('Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error:', error);
            product.status = oldStatus;
            renderProducts();
            updateCounts();
        }
    }
}

// --- RENDER FUNCTIONS ---

async function loadProducts() {
    try {
        const response = await fetch('/products'); // Endpoint cambiado
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        products = data.products || []; // Esperamos "products" del backend
        renderProducts();
        updateCounts();
    } catch (error) {
        console.error('Error loading products:', error);
        products = [];
        renderProducts();
        updateCounts();
    }
}

function renderProducts() {
    const filteredProducts = getFilteredProducts();
    
    if (filteredProducts.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>${products.length === 0 
                    ? 'No hay productos. Agrega el primero al inventario!' 
                    : 'No hay productos en esta categoría'}
                </p>
            </div>
        `;
        return;
    }

    taskList.innerHTML = filteredProducts.map(product => `
        <div class="task-card">
            <div class="task-header">
                <div class="task-info">
                    <div class="task-title-row">
                        <h3 class="task-title">${escapeHtml(product.name)}</h3>
                        <span class="badge ${statusConfig[product.status]?.class || 'badge-not-started'}">
                            ${statusConfig[product.status]?.label || product.status}
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
                            <span>Entrada: ${formatDate(product.entryDate)}</span>
                        </div>
                        
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <span>Q: ${escapeHtml(product.quantity)}</span>
                        </div>

                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                            </svg>
                            <span>User: ${escapeHtml(product.createdBy || 'System')}</span>
                        </div>

                        ${product.expiryDate ? `
                        <div class="task-detail">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>Exp: ${formatDate(product.expiryDate)}</span>
                        </div>` : ''}
                    </div>
                </div>
                
                <div class="task-actions">
                    <select onchange="updateProductStatus('${product.id}', this.value)">
                        <option value="in-stock" ${product.status === 'in-stock' ? 'selected' : ''}>En Stock</option>
                        <option value="low-stock" ${product.status === 'low-stock' ? 'selected' : ''}>Bajo Stock</option>
                        <option value="out-of-stock" ${product.status === 'out-of-stock' ? 'selected' : ''}>Agotado</option>
                        <option value="discontinued" ${product.status === 'discontinued' ? 'selected' : ''}>Descontinuado</option>
                    </select>
                    
                    <button class="btn-delete" onclick="deleteProduct('${product.id}')">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        Borrar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function updateCounts() {
    // Usamos ?. para evitar error si el elemento HTML no existe
    document.getElementById('count-all')?.replaceChildren(document.createTextNode(products.length));
    document.getElementById('count-not-started')?.replaceChildren(document.createTextNode(products.filter(t => t.status === 'out-of-stock').length)); // Rojo
    document.getElementById('count-in-progress')?.replaceChildren(document.createTextNode(products.filter(t => t.status === 'low-stock').length));     // Amarillo
    document.getElementById('count-on-hold')?.replaceChildren(document.createTextNode(products.filter(t => t.status === 'discontinued').length));       // Gris
    document.getElementById('count-completed')?.replaceChildren(document.createTextNode(products.filter(t => t.status === 'in-stock').length));         // Verde
}

// Helper functions
function getFilteredProducts() {
    if (currentFilter === 'all') {
        return products;
    }
    return products.filter(product => product.status === currentFilter);
}

function getTodayDate() {
    return new Date().toISOString().split('T')[0];
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}