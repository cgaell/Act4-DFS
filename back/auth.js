const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcryptjs');
const User = require('./models/User.js'); // Asegúrate que la ruta sea correcta

// ----------------------
// RUTAS DE VISTAS (HTML)
// ----------------------

// Ruta para ver el formulario de Login
router.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Ruta para ver el formulario de Registro
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/register.html'));
});

// ----------------------
// RUTAS DE LÓGICA (API)
// ----------------------

// PROCESAR REGISTRO (POST /register)
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username y password son requeridos' });
    }

    try {
        // 1. Verificar si el usuario ya existe en Mongo
        const existingUser = await User.findOne({ name: username });
        if (existingUser) {
            return res.status(409).json({ error: 'Usuario ya existe' });
        }

        // 2. Encriptar contraseña
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Crear usuario en MongoDB
        // Nota: Mongoose crea el _id automáticamente, pero guardamos 'id' manual 
        // si tu front lo necesita, o usamos Date.now() como tenías.
        const newUser = await User.create({
            id: Date.now().toString(), 
            name: username,
            passwordHash: passwordHash,
            role: 'viewer'
        });

        // 4. Iniciar sesión automáticamente
        req.session.user = { 
            id: newUser.id, 
            name: newUser.name, 
            role: newUser.role 
        };

        return res.status(201).json({ message: 'Registro exitoso' });

    } catch (error) {
        console.error("Error en registro:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PROCESAR LOGIN (POST /login)
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Buscar usuario en Mongo
        const user = await User.findOne({ name: username });

        if (!user) {
            // (Opcional) Backdoor hardcodeado admin/1234
            if (username === 'admin' && password === '1234') {
                req.session.user = { id: '1', name: 'admin', role: 'admin' };
                return res.status(200).json({ message: 'Bienvenido, admin' });
            }
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        // 2. Comparar contraseña con el hash de la BD
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (isMatch) {
            req.session.user = { 
                id: user.id, 
                name: user.name, 
                role: user.role || 'viewer' 
            };
            return res.status(200).json({ message: 'Bienvenido, Usuario' });
        } else {
            return res.status(401).json({ error: 'Contraseña incorrecta' });
        }

    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;