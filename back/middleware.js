const jwt = require('jsonwebtoken');
const secret = 'llave-secreta';



const logRequest = (req, res, next) => {
    //registrar el metodo {get, post y la ruta {path}}
    console.log(`Solicitud recibida: ${req.method} en ${req.path}`);
    //permite que el flujo continue al siguiente middleware
    next();
}

// Ruta para obtener un usuario por ID
const validateUserID = (req, res, next) => {
    const { id } = req.params;
    if (id && id.length <= 2){
        return res.status(400).json({ error: 'Formato de ID de usuario no valido. Debe de tener mas de 2 caracteres.' });
    }

    //si todo esta bien, continua
    next();
}

// Ruta para obtener una tarea por ID
const validateTaskID = (req, res, next) => {
    const { id } = req.params;
    if (id && id.length <= 3){
        return res.status(402).json({ error: 'Formato de ID de tarea no valido. Debe de tener mas de 3 caracteres.' });
    }

    //si todo esta bien, continua
    next();
}

const validateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
        return res.status(401).json({ error: 'Acceso denegado. No se envió token.' });
    }

    // El formato estándar es "Bearer <token>"
    const token = authHeader.split(' ')[1]; 

    if (!token) {
        return res.status(401).json({ error: 'Formato de token inválido.' });
    }

    try {
        // Verifica y decodifica el payload
        const user = jwt.verify(token, SECRET_KEY);
        req.user = user; // Guardamos los datos en la petición para usarlos en isAdmin
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Token inválido o expirado.' });
    }
};

const isAdmin = (req, res, next) => {
    // Ahora leemos de req.user, que fue llenado por validateToken
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            error: 'Acceso denegado. Se requiere rol de administrador.'
        });
    }
};

module.exports = {
    logRequest,
    validateUserID,
    validateTaskID,
    validateToken,
    isAdmin
};