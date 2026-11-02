
const db = require('../config/database');

// Consultar todos los tipos
const obtenerTipos = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM tipos ORDER BY id ASC'
        );

        res.status(200).json({
            estado: 'OK',
            total: datos.length,
            datos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar los tipos' });
    }
};

// Consultar tipo por ID
const obtenerTipoPorId = async (req, res) => {
    try {
        const [datos] = await db.query(
            'SELECT * FROM tipos WHERE id = ?',
            [req.params.id]
        );

        if (datos.length === 0) {
            return res.status(404).json({ error: 'Tipo no encontrado' });
        }

        res.status(200).json({ estado: 'OK', datos: datos[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el tipo' });
    }
};

// Crear tipo
const crearTipo = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El campo nombre es obligatorio'
            });
        }

        const [resultado] = await db.query(
            'INSERT INTO tipos (nombre, descripcion) VALUES (?, ?)',
            [nombre.trim(), descripcion || null]
        );

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Tipo creado correctamente',
            id: resultado.insertId
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe un tipo con ese nombre'
            });
        }

        res.status(500).json({ error: 'Error al crear el tipo' });
    }
};

// Actualizar tipo
const actualizarTipo = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;

        if (!nombre || !nombre.trim()) {
            return res.status(400).json({
                error: 'El campo nombre es obligatorio'
            });
        }

        const [resultado] = await db.query(
            'UPDATE tipos SET nombre = ?, descripcion = ? WHERE id = ?',
            [nombre.trim(), descripcion || null, req.params.id]
        );

        if (resultado.affectedRows === 0) {
            const [existente] = await db.query(
                'SELECT id FROM tipos WHERE id = ?',
                [req.params.id]
            );

            if (existente.length === 0) {
                return res.status(404).json({ error: 'Tipo no encontrado' });
            }
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Tipo actualizado correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe otro tipo con ese nombre'
            });
        }

        res.status(500).json({ error: 'Error al actualizar el tipo' });
    }
};

// Eliminar tipo
const eliminarTipo = async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM tipos WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ error: 'Tipo no encontrado' });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Tipo eliminado correctamente'
        });
    } catch (error) {
        console.error(error);

        if (error.errno === 1644 || error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar el tipo porque está asociado a una película o serie'
            });
        }

        res.status(500).json({ error: 'Error al eliminar el tipo' });
    }
};

module.exports = {
    obtenerTipos,
    obtenerTipoPorId,
    crearTipo,
    actualizarTipo,
    eliminarTipo
};
