const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;
const bcrypt = require('bcryptjs');

// Ruta para acceder a login.html
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/login.html'));
});

// Ruta para acceder a register.html
router.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '../front/register.html'));
});

// crea un usuario
router.post('/', (req, res) => {
    (async () => {
        const { username, password } = req.body;
        try {
            const dataPath = path.join(__dirname, 'users.json');
            let users = []; // Inicializar como array vacío
            try {
                const content = await fs.readFile(dataPath, 'utf8');
                users = JSON.parse(content);
            } catch (err) {
                if (err.code !== 'ENOENT') throw err;
            }
            // buscar por nombre y verificar hash si existe
            const found = users.find(u => u.name === username);
            if (found) {
                if (found.passwordHash) {
                    const ok = await bcrypt.compare(password, found.passwordHash);
                    if (ok) {
                        req.session.user = { id: found.id, name: found.name, role: found.role || 'viewer' };
                        return res.status(200).json({ message: 'Bienvenido, Usuario' });
                    }
                    return res.status(401).json({ error: 'Contraseña incorrecta' });

                } else if (found.password === password) {
                    req.session.user = { id: found.id, name: found.name, role: found.role || 'viewer' };
                    return res.status(200).json({ message: 'Bienvenido, Usuario' });
                }
            } 
        } catch {}
        if (username === 'admin' && password === '1234') {
            req.session.user = { id: 1, name: 'admin', role: 'admin' };
            return res.status(200).json({ message: 'Bienvenido, admin' });
        } else if (username === 'user' && password === '5678') {
            req.session.user = { id: 2, name: 'user', role: 'viewer' };
            return res.status(200).json({ message: 'Bienvenido, Usuario' });
        }
        return res.status(401).json({ error: 'Credenciales inválidas' });
    })();
});


//exportar router
module.exports = router;
