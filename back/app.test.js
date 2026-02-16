/** @jest-environment node */
const request = require('supertest');
const app = require('../server'); 
const Product = require('../models/Product');
const User = require('../models/User');

// --- MOCKS DE MIDDLEWARE ---
// Saltamos la seguridad para probar solo la lógica de las rutas
jest.mock('../middleware.js', () => ({
    validateSession: (req, res, next) => {
        req.session = { user: { name: 'testuser', role: 'admin' } };
        next();
    },
    logRequest: (req, res, next) => next(),
    validateUserID: (req, res, next) => next(),
    validateTaskID: (req, res, next) => next(),
    isAdmin: (req, res, next) => next()
}));

// --- MOCKS DE MODELOS (MongoDB) ---
// Evitamos la conexión real a Atlas para pruebas unitarias rápidas
jest.mock('../models/Product');
jest.mock('../models/User');

describe('Suite de Pruebas Unitarias - Inventario y Usuarios', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    // --- PRUEBAS DE PRODUCTOS (CRUD) ---
    describe('Operaciones de Productos', () => {
        test('GET /products - Debería listar todos los productos', async () => {
            const mockItems = [{ name: 'Producto A', quantity: 10 }];
            Product.find.mockResolvedValue(mockItems);

            const res = await request(app).get('/products');
            
            expect(res.statusCode).toBe(200);
            expect(res.body.products).toHaveLength(1);
            expect(Product.find).toHaveBeenCalled();
        });

        test('POST /products - Debería crear un producto nuevo', async () => {
            const newProd = { name: 'Monitor', quantity: 5, status: 'in-stock' };
            Product.create.mockResolvedValue(newProd);

            const res = await request(app).post('/products').send(newProd);

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Producto creado');
            expect(Product.create).toHaveBeenCalled();
        });

        test('DELETE /products/:id - Debería eliminar un producto', async () => {
            Product.findOneAndDelete.mockResolvedValue({ id: '123' });

            const res = await request(app).delete('/products/123');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Producto eliminado');
        });
    });

    // --- PRUEBAS DE USUARIOS (REGISTRO Y LOGIN) ---
    describe('Gestión de Usuarios', () => {
        test('POST /register - Debería registrar un usuario nuevo', async () => {
            User.findOne.mockResolvedValue(null); // Usuario no existe aún
            User.create.mockResolvedValue({ name: 'nuevo', role: 'viewer' });

            const res = await request(app)
                .post('/register')
                .send({ username: 'nuevo', password: 'password123' });

            expect(res.statusCode).toBe(201);
            expect(res.body.message).toBe('Registro exitoso');
        });

        test('POST /login - Debería fallar con credenciales incorrectas', async () => {
            User.findOne.mockResolvedValue(null); // No encuentra al usuario

            const res = await request(app)
                .post('/login')
                .send({ username: 'error', password: '123' });

            expect(res.statusCode).toBe(401);
            expect(res.body.error).toBeDefined();
        });
    });
});