const express = require('express');
const router = express.Router();
const User = require('./models/User'); // Modelo
const { validateUserID, isAdmin } = require('./middleware.js');



// Obtener todos los usuarios
router.get('/', isAdmin, async (req, res) => {
    try {
        // .select('-passwordHash') sirve para NO devolver la contraseña al front
        const usuarios = await User.find().select('-passwordHash'); 
        res.status(200).json({ total: usuarios.length, usuarios });
    } catch (err) {
        res.status(500).json({ error: 'Error leyendo usuarios' });
    }
});

// Obtener un usuario
router.get('/:id', validateUserID, async (req, res) => {
    try {
        const user = await User.findOne({ id: req.params.id }).select('-passwordHash');
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error del servidor' });
    }
});

module.exports = router;