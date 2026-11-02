
const express = require('express');
const router = express.Router();

const {
    obtenerDirectores,
    obtenerDirectorPorId,
    crearDirector,
    actualizarDirector,
    eliminarDirector
} = require('../controllers/directorController');

router.get('/', obtenerDirectores);
router.get('/:id', obtenerDirectorPorId);
router.post('/', crearDirector);
router.put('/:id', actualizarDirector);
router.delete('/:id', eliminarDirector);

module.exports = router;
