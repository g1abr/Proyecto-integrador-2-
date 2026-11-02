const db = require('../config/database');

// Consultar todos los generos
const obtenerGeneros = async (req, res) => {
    try {
        const [generos] = await db.query(
            'SELECT * FROM generos ORDER BY id ASC'
        );

        res.status(200).json({
            estado: 'OK',
            total: generos.length,
            datos: generos
        });

    } catch (error) {
        console.error('Error al consultar géneros:', error.message);
        res.status(500).json({
            error: 'Error al consultar los géneros'
        });
    }
};

// Consultar genero por ID

const obtenerGeneroPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const [generos] = await db.query(
            'SELECT * FROM generos WHERE id = ?',
            [id]
        );

        if (generos.length === 0) {
            return res.status(404).json({
                error: 'El género solicitado no existe'
            });
        }

        res.status(200).json({
            estado: 'OK',
            datos: generos[0]
        });

    } catch (error) {
        console.error('Error al consultar el género:', error.message);
        res.status(500).json({
            error: 'Error al consultar el género'
        });
    }
};

// Registrar un genero 

const crearGenero = async (req, res) => {
    try {
        const { nombre, estado, descripcion } = req.body;

        if (!nombre || !estado) {
            return res.status(400).json({
                error: 'Los campos nombre y estado son obligatorios'
            });
        }

        const [resultado] = await db.query(
            `INSERT INTO generos (nombre, estado, descripcion)
            VALUES (?, ?, ?)`,
            [nombre.trim(), estado, descripcion || null]
        );

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Género creado correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error('Error al crear género:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe un género con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al registrar el género'
        });
    }
};

// Actualizar un genero
const actualizarGenero = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, estado, descripcion } = req.body;

        if (!nombre || !estado) {
            return res.status(400).json({
                error: 'Los campos nombre y estado son obligatorios'
            });
        }

        const [resultado] = await db.query(
            `UPDATE generos
            SET nombre = ?, estado = ?, descripcion = ?
            WHERE id = ?`,
            [nombre.trim(), estado, descripcion || null, id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'El género solicitado no existe'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Género actualizado correctamente'
        });

    } catch (error) {
        console.error('Error al actualizar género:', error.message);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'Ya existe otro género con ese nombre'
            });
        }

        res.status(500).json({
            error: 'Error al actualizar el género'
        });
    }
};

// Eliminar un registro  
const eliminarGenero = async (req, res) => {
    try {
        const { id } = req.params;

        const [resultado] = await db.query(
            'DELETE FROM generos WHERE id = ?',
            [id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'El género solicitado no existe'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Género eliminado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar género:', error.message);

        if (error.errno === 1644 || error.code === 'ER_ROW_IS_REFERENCED_2') {
            return res.status(409).json({
                error: 'No se puede eliminar el género porque está asociado a una película o serie'
            });
        }

        res.status(500).json({
            error: 'Error al eliminar el género'
        });
    }
};

// Exportar funciones
module.exports = {
    obtenerGeneros,
    obtenerGeneroPorId,
    crearGenero,
    actualizarGenero,
    eliminarGenero
};