const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { validateUserID, isAdmin } = require('./middleware.js');

const DATA_PATH = path.join(__dirname, 'users.json'); //se guardan los datos posteados en users.json

async function readUsers() { 
  try {
    const data = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}
// Ruta para obtener todos los usuarios
router.get('/', isAdmin, async (req, res) => {
  try {
    const usuarios = await readUsers();
    res.status(200).json({ total: usuarios.length, usuarios });
  } catch {
    res.status(500).json({ error: 'Error leyendo usuarios' });
  }
});

// Ruta para obtener un usuario por ID
router.get('/:id', validateUserID, async (req, res) => {
  try {
    const usuarios = await readUsers();
    const user = usuarios.find(u => String(u.id) === String(req.params.id));
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch {
    res.status(500).json({ error: 'Error leyendo usuarios' });
  }
});

//exportar router para ser usado en server.js
module.exports = router;
