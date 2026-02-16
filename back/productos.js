const express = require('express');
const router = express.Router();
const { validateTaskID, isAdmin } = require('./middleware.js');
const Product = require('./models/Product.js');


router.get('/', async (req, res) => {
    try {
        const productos = await Product.find(); // Mongoose hace la magia
        res.status(200).json({ total: productos.length, productos });
    } catch (err) {
        res.status(500).json({ message: 'Error obteniendo productos' });
    }
});


//funcion para poder agregar productos
router.post('/', async (req, res) => {
    try {
        const { name, category, expiryDate, id } = req.body;
        
        // Creamos el producto en Mongo
        const nuevoProducto = await Product.create({
            id: id || Date.now().toString(), // Usamos tu logica de ID o generamos uno
            name,
            category,
            expiryDate,
            createdBy: req.session.user ? req.session.user.name : 'System'
        });

        res.status(201).json({ message: 'Producto creado', producto: nuevoProducto });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creando producto' });
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

        if (!tarea) return res.status(404).json({ message: 'Producto no encontrado' });
        
        res.status(200).json({ message: 'Producto actualizado', producto: tarea });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error actualizando producto' });
    }
});

//funcion para poder eliminar tareas
router.delete('/:id', validateTaskID, isAdmin, async (req, res) => {
    try {
        const resultado = await Product.findOneAndDelete({ id: req.params.id });
        
        if (!resultado) return res.status(404).json({ message: 'Producto no encontrado' });

        res.status(200).json({ message: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ message: 'Error eliminando producto' });
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
