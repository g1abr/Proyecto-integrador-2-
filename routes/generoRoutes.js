const express = require('express');
const router = express.Router();

const {
    obtenerGeneros,
    obtenerGeneroPorId,
    crearGenero,
    actualizarGenero,
    eliminarGenero
} = require('../controllers/generoController');

// Consultar todos los géneros
router.get('/', obtenerGeneros);

// Consultar un género por ID
router.get('/:id', obtenerGeneroPorId);

// Crear un género
router.post('/', crearGenero);

// Actualizar un género
router.put('/:id', actualizarGenero);

// Eliminar un género
router.delete('/:id', eliminarGenero);

module.exports = router;