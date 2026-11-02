
const db = require('../config/database');

// Consultar todas las productoras
const obtenerProductoras = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM productoras ORDER BY id ASC'
        );

        res.status(200).json({
            estado: 'OK',
            total: datos.length,
            datos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar productoras' });
    }
};

// Consultar productora por ID
const obtenerProductoraPorId = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM productoras WHERE id = ?',
            [req.params.id]
        );

        if (datos.length === 0) {
            return res.status(404).json({ error: 'Productora no encontrada' });
        }

        res.status(200).json({ estado: 'OK', datos: datos[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar la productora' });
    }
};

// Crear productora
const crearProductora = async (req, res) => {
    try {
        const { nombre, estado, slogan, descripcion } = req.body;

        if (!nombre || !estado) {
            return res.status(400).json({
                error: 'Los campos nombre y estado son obligatorios'
            });
        }

        if (!['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({
                error: 'El estado debe ser Activo o Inactivo'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO productoras
             (nombre, estado, slogan, descripcion)
             VALUES (?, ?, ?, ?)`,
            [nombre.trim(), estado, slogan || null, descripcion || null]
        );

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Productora creada correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe una productora con ese nombre'
            });
        }

        res.status(500).json({ error: 'Error al crear la productora' });
    }
};

// Actualizar productora
const actualizarProductora = async (req, res) => {
    try {
        const { nombre, estado, slogan, descripcion } = req.body;

        if (!nombre || !estado) {
            return res.status(400).json({
                error: 'Los campos nombre y estado son obligatorios'
            });
        }

        if (!['Activo', 'Inactivo'].includes(estado)) {
            return res.status(400).json({
                error: 'El estado debe ser Activo o Inactivo'
            });
        }

        const [resultado] = await db.query(
            `UPDATE productoras
             SET nombre = ?, estado = ?, slogan = ?, descripcion = ?
             WHERE id = ?`,
            [nombre.trim(), estado, slogan || null, descripcion || null, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            const [existente] = await db.query(
                'SELECT id FROM productoras WHERE id = ?',
                [req.params.id]
            );

            if (existente.length === 0) {
                return res.status(404).json({ error: 'Productora no encontrada' });
            }
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Productora actualizada correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe otra productora con ese nombre'
            });
        }

        res.status(500).json({ error: 'Error al actualizar la productora' });
    }
};

// Eliminar productora
const eliminarProductora = async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM productoras WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Productora no encontrada' });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Productora eliminada correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.errno === 1644 || error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar la productora porque está asociada a una película o serie'
            });
        }

        res.status(500).json({ error: 'Error al eliminar la productora' });
    }
};

module.exports = {
    obtenerProductoras,
    obtenerProductoraPorId,
    crearProductora,
    actualizarProductora,
    eliminarProductora
};
