const express = require('express');
const path = require('path'); // Importante para manejar rutas de carpetas
const app = express();
const session = require('express-session'); // Para manejar sesiones
const PORT = 3000;
const fs = require('fs').promises; //para manejar archivos
const bcrypt = require('bcryptjs'); //para encriptar contraseñas

const { logRequest, isAdmin } = require('./middleware.js'); //importar middleware con logrequest y la validacion de que si es admin o no

//Importar las rutas de JS 
const usuariosRouter = require('./users.js'); //importar rutas de usuarios
const tareasRouter = require('./tareas.js'); //importar rutas de tareas
const authRouter = require('./auth.js'); //importar rutas de autenticacion

app.use(logRequest); // Middleware global: SE COLOCA ANTES DE TODAS LAS RUTAS
app.use(express.json()); // Middleware para parsear JSON
app.use(session({
    secret: 'contraseña', //secret equivale a la contraseña
    resave: false, //no guarda de nuevo
    saveUninitialized: false, //no guarda si no hay cambios
    cookie: {secure: false} //en true solo trabaja con https y guarda cookies
}));

// Ruta raíz: si no hay sesión, redirige a /login; si hay sesión, sirve el index
app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        return res.sendFile(path.join(__dirname, '../front/index.html'));
    } else {
        return res.redirect('/login');
    }
});

// Esto reemplaza la necesidad de hacer require del index.html
app.use(express.static(path.join(__dirname, '../front')));

// usar enrutadores de JS para usuarios, autenticacion y tareas
app.use('/users', usuariosRouter);
app.use('/login', authRouter);
app.use('/tareas', require('./middleware.js').validateSession, tareasRouter); //validar sesion antes de acceder a rutas de tareas

app.get('/register', (req, res) => { //ruta para registrarse
    res.sendFile(path.join(__dirname, '../front/register.html')); //enviar archivo register.html
});

app.post('/register', (req, res) => { //ruta para registrarse
    (async () => {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }
        const dataPath = path.join(__dirname, 'users.json'); //se guardan los datos posteados en users.json
        let users = []; //se crea una lista vacia para los usuarios
        try {
            const content = await fs.readFile(dataPath, 'utf8');
            users = JSON.parse(content);
        } catch (err) {
            if (err.code !== 'ENOENT') {
                return res.status(500).json({ error: 'Error leyendo usuarios' });
            }
        }
        if (users.some(u => u.name === username)) {
            return res.status(409).json({ error: 'Usuario ya existe' });
        }
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds); //encriptar contraseña con bcrypt
        const user = { id: Date.now(), name: username, passwordHash, role: 'viewer' }; //se crea un usuario con id, nombre, contraseña encriptada y rol viewer (usuario normal)
        users.push(user);
        try {
            await fs.writeFile(dataPath, JSON.stringify(users, null, 2), 'utf8'); //guardar usuarios en users.json
        } catch {
            return res.status(500).json({ error: 'Error guardando usuarios' });
        }
        req.session.user = { id: user.id, name: user.name, role: user.role };
        return res.status(201).json({ message: 'Registro exitoso' });
    })();
});

app.get('/admin/tareas', isAdmin, (req, res) => { //ruta para acceder a tareas de admin
    // Definimos la ruta hacia el archivo tareas.json
    const filePath = path.join(__dirname, 'tareas.json'); //se guardan las tareas posteadas en tareas.json
    
    // Enviamos el archivo físico al navegador
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error("Error al enviar el archivo:", err);
            res.status(500).json({ error: "No se encontró el archivo de tareas" });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
