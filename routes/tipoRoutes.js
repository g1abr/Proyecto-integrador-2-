
const express = require('express');
const router = express.Router();

const {
    obtenerTipos,
    obtenerTipoPorId,
    crearTipo,
    actualizarTipo,
    eliminarTipo
} = require('../controllers/tipoController');

router.get('/', obtenerTipos);
router.get('/:id', obtenerTipoPorId);
router.post('/', crearTipo);
router.put('/:id', actualizarTipo);
router.delete('/:id', eliminarTipo);

module.exports = router;
