const express = require('express');
const router = express.Router();
const { validateTaskID, isAdmin } = require('./middleware.js');
const Task = require('./models/Task.js');


router.get('/', async (req, res) => {
    try {
        const tareas = await Task.find(); // Mongoose hace la magia
        res.status(200).json({ total: tareas.length, tareas });
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo tareas' });
    }
});


//funcion para poder agregar tareas
router.post('/', async (req, res) => {
    try {
        const { taskName, status, assignedTo, assignedDate, id } = req.body;
        
        // Creamos la tarea en Mongo
        const nuevaTarea = await Task.create({
            id: id || Date.now().toString(), // Usamos tu logica de ID o generamos uno
            taskName,
            status,
            assignedTo,
            assignedDate,
            createdBy: req.session.user ? req.session.user.name : 'System'
        });

        res.status(201).json({ message: 'Tarea creada', tarea: nuevaTarea });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando tarea' });
    }
});

//funcion para actualizar el status de la tarea
router.put('/:id', validateTaskID, async (req, res) => {
    try {
        const { status } = req.body;
        const tarea = await Task.findOneAndUpdate(
            { id: req.params.id }, 
            { status },
            { new: true } // Para que devuelva el objeto actualizado
        );

        if (!tarea) return res.status(404).json({ message: 'Tarea no encontrada' });
        
        res.status(200).json({ message: 'Tarea actualizada', tarea });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando tarea' });
    }
});

//funcion para poder eliminar tareas
router.delete('/:id', validateTaskID, isAdmin, async (req, res) => {
    try {
        const resultado = await Task.findOneAndDelete({ id: req.params.id });
        
        if (!resultado) return res.status(404).json({ message: 'Tarea no encontrada' });

        res.status(200).json({ message: 'Tarea eliminada' });
    } catch (err) {
        res.status(500).json({ message: 'Error eliminando' });
    }
});

//ejemplo de clase
router.get('/nuevo', validateTaskID, (req, res) => {
    res.status(201).json({
        message: 'Se agregó una nueva tarea',
        timestamp: new Date()
    });
});

//ejemplo de clase
router.get('/:id', validateTaskID, (req, res) => {
    res.status(200).json({
        message: `Detalle de la tarea encontrada: ${req.params.id}`
    });
});


//exportar el router
module.exports = router;
