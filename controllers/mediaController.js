
const db = require('../config/database');

// Consultar todas las películas y series
const obtenerMedia = async (req, res) => {
    try {
        const [datos] = await db.query(`
            SELECT
                m.*,
                g.nombre AS genero,
                d.nombres AS director,
                p.nombre AS productora,
                t.nombre AS tipo
            FROM media m
            INNER JOIN generos g ON m.genero_id = g.id
            INNER JOIN directores d ON m.director_id = d.id
            INNER JOIN productoras p ON m.productora_id = p.id
            INNER JOIN tipos t ON m.tipo_id = t.id
            ORDER BY m.id ASC
        `);

        res.status(200).json({
            estado: 'OK',
            total: datos.length,
            datos
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar películas y series' });
    }
};

// Consultar película o serie por ID
const obtenerMediaPorId = async (req, res) => {
    try {
        const [datos] = await db.query(`
            SELECT
                m.*,
                g.nombre AS genero,
                d.nombres AS director,
                p.nombre AS productora,
                t.nombre AS tipo
            FROM media m
            INNER JOIN generos g ON m.genero_id = g.id
            INNER JOIN directores d ON m.director_id = d.id
            INNER JOIN productoras p ON m.productora_id = p.id
            INNER JOIN tipos t ON m.tipo_id = t.id
            WHERE m.id = ?
        `, [req.params.id]);

        if (datos.length === 0) {
            return res.status(404).json({
                error: 'Película o serie no encontrada'
            });
        }

        res.status(200).json({
            estado: 'OK',
            datos: datos[0]
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al consultar el contenido' });
    }
};

// Crear película o serie
const crearMedia = async (req, res) => {
    try {
        const {
            serial,
            titulo,
            sinopsis,
            url,
            portada,
            anio_estreno,
            genero_id,
            director_id,
            productora_id,
            tipo_id
        } = req.body;

        if (
            !serial || !titulo || !url ||
            anio_estreno === undefined ||
            !genero_id || !director_id ||
            !productora_id || !tipo_id
        ) {
            return res.status(400).json({
                error: 'Faltan campos obligatorios para registrar el contenido'
            });
        }

        const anio = Number(anio_estreno);

        if (!Number.isInteger(anio) || anio < 1888 || anio > 65535) {
            return res.status(400).json({
                error: 'El año de estreno debe ser un número entero válido, desde 1888'
            });
        }

        const [resultado] = await db.query(`
            INSERT INTO media (
                serial, titulo, sinopsis, url, portada,
                anio_estreno, genero_id, director_id,
                productora_id, tipo_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            serial.trim(),
            titulo.trim(),
            sinopsis || null,
            url.trim(),
            portada || null,
            anio,
            genero_id,
            director_id,
            productora_id,
            tipo_id
        ]);

        res.status(201).json({
            estado: 'OK',
            mensaje: 'Película o serie creada correctamente',
            id: resultado.insertId
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El serial o la URL ya están registrados'
            });
        }

        if (error.errno === 1644 || error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Error al registrar la película o serie'
        });
    }
};

// Actualizar película o serie
const actualizarMedia = async (req, res) => {
    try {
        const {
            serial,
            titulo,
            sinopsis,
            url,
            portada,
            anio_estreno,
            genero_id,
            director_id,
            productora_id,
            tipo_id
        } = req.body;

        if (
            !serial || !titulo || !url ||
            anio_estreno === undefined ||
            !genero_id || !director_id ||
            !productora_id || !tipo_id
        ) {
            return res.status(400).json({
                error: 'Debes enviar todos los campos obligatorios para actualizar'
            });
        }

        const anio = Number(anio_estreno);

        if (!Number.isInteger(anio) || anio < 1888 || anio > 65535) {
            return res.status(400).json({
                error: 'El año de estreno debe ser un número entero válido, desde 1888'
            });
        }

        const [resultado] = await db.query(`
            UPDATE media SET
                serial = ?,
                titulo = ?,
                sinopsis = ?,
                url = ?,
                portada = ?,
                anio_estreno = ?,
                genero_id = ?,
                director_id = ?,
                productora_id = ?,
                tipo_id = ?
            WHERE id = ?
        `, [
            serial.trim(),
            titulo.trim(),
            sinopsis || null,
            url.trim(),
            portada || null,
            anio,
            genero_id,
            director_id,
            productora_id,
            tipo_id,
            req.params.id
        ]);

        if (resultado.affectedRows === 0) {
            const [existente] = await db.query(
                'SELECT id FROM media WHERE id = ?',
                [req.params.id]
            );

            if (existente.length === 0) {
                return res.status(404).json({
                    error: 'Película o serie no encontrada'
                });
            }
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Película o serie actualizada correctamente'
        });

    } catch (error) {
        console.error(error);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                error: 'El serial o la URL ya están registrados'
            });
        }

        if (error.errno === 1644 || error.code === 'ER_NO_REFERENCED_ROW_2') {
            return res.status(400).json({
                error: error.message
            });
        }

        res.status(500).json({
            error: 'Error al actualizar la película o serie'
        });
    }
};

// Eliminar película o serie
const eliminarMedia = async (req, res) => {
    try {
        const [resultado] = await db.query(
            'DELETE FROM media WHERE id = ?',
            [req.params.id]
        );

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Película o serie no encontrada'
            });
        }

        res.status(200).json({
            estado: 'OK',
            mensaje: 'Película o serie eliminada correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Error al eliminar la película o serie'
        });
    }
};

module.exports = {
    obtenerMedia,
    obtenerMediaPorId,
    crearMedia,
    actualizarMedia,
    eliminarMedia
};
