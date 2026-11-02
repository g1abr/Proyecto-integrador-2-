
require('dotenv').config();

const app = require('./app');
const db = require('./config/database');

const PORT = process.env.PORT || 3000;

async function iniciarServidor() {
    try {
        // Verificar conexion con MySQL
        const conexion = await db.getConnection();

        console.log('MySQL conectado correctamente');

        conexion.release();

        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`API ejecutandose en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error de conexion con MySQL:', error.message);
        process.exit(1);
    }
}

iniciarServidor();
