
const express = require('express');
const router = express.Router();

const {
    obtenerProductoras,
    obtenerProductoraPorId,
    crearProductora,
    actualizarProductora,
    eliminarProductora
} = require('../controllers/productoraController');

router.get('/', obtenerProductoras);
router.get('/:id', obtenerProductoraPorId);
router.post('/', crearProductora);
router.put('/:id', actualizarProductora);
router.delete('/:id', eliminarProductora);

module.exports = router;
