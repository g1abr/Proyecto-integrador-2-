
const db = require('../config/database');

// Consultar todos los directores
const obtenerDirectores = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM directores ORDER BY id ASC'
        );

        res.status(200).json({
            estado: 'OK',
            total: datos.length,
            datos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar directores' });
    }
};

// Consultar director por ID
const obtenerDirectorPorId = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM directores WHERE id = ?',
            [req.params.id]
        );

        if (datos.length === 0) {
            return res.status(404).json({ error: 'Director no encontrado' });
        }

        res.status(200).json({ estado: 'OK', datos: datos[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el director' });
    }
};

// Crear director
const crearDirector = async (req, res) => {
    try {
        const { nombres, estado } = req.body;

        if (!nombres || !estado) {
            return res.status(400).json({
                error: 'Los campos nombres y estado son obligatorios'
            });
        }

        if (!['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({
                error: 'El estado debe ser Activo o Inactivo'
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO directores (nombres, estado) VALUES (?, ?)',
            [nombres.trim(), estado]
        );

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Director creado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el director' });
    }
};

// Actualizar director
const actualizarDirector = async (req, res) => {
    try {
        const { nombres, estado } = req.body;

        if (!nombres || !estado) {
            return res.status(400).json({
                error: 'Los campos nombres y estado son obligatorios'
            });
        }

        if (!['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({
                error: 'El estado debe ser Activo o Inactivo'
            });
        }

        const [resultado] = await db.query(
            'UPDATE directores SET nombres = ?, estado = ? WHERE id = ?',
            [nombres.trim(), estado, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            const [existente] = await db.query(
                'SELECT id FROM directores WHERE id = ?',
                [req.params.id]
            );

            if (existente.length === 0) {
                return res.status(404).json({ error: 'Director no encontrado' });
            }
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Director actualizado correctamente'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el director' });
    }
};

// Eliminar director
const eliminarDirector = async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM directores WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Director no encontrado' });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Director eliminado correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.errno === 1644 || error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar el director porque está asociado a una película o serie'
            });
        }

        res.status(500).json({ error: 'Error al eliminar el director' });
    }
};

module.exports = {
    obtenerDirectores,
    obtenerDirectorPorId,
    crearDirector,
    actualizarDirector,
    eliminarDirector
};
