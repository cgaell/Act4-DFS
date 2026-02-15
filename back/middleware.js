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

const validateSession = (req, res, next) => {
    // Solo verificamos que exista un usuario en la sesión
    if (req.session && req.session.user) {
        return next();
    } else {
        return res.status(401).json({
            error: 'Acceso denegado. Favor de iniciar sesión.'
        });
    }
};

const isAdmin = (req, res, next) => {
    // Agregamos verificaciones previas para que no truene el servidor
    if (req.session && req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).json({
            error: 'Acceso denegado. Se requiere sesión de administrador.'
        });
    }
};

module.exports = {
    logRequest,
    validateUserID,
    validateTaskID,
    validateSession,
    isAdmin
};