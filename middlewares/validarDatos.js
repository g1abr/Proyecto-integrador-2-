
const validarDatos = (camposObligatorios) => {
    return (req, res, next) => {
        const camposFaltantes = camposObligatorios.filter((campo) => {
            const valor = req.body[campo];

            return (
                valor === undefined ||
                valor === null ||
                (typeof valor === 'string' && !valor.trim())
            );
        });

        if (camposFaltantes.length > 0) {
            return res.status(400).json({
                estado: 'ERROR',
                mensaje: 'Faltan campos obligatorios',
                campos: camposFaltantes
            });
        }

        next();
    };
};

module.exports = validarDatos;
