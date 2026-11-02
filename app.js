
const express = require('express');
const cors = require('cors');

const app = express();

// ==========================================
// IMPORTAR CONEXION Y RUTAS
// ==========================================
const db = require('./config/database');

const generoRoutes = require('./routes/generoRoutes');
const directorRoutes = require('./routes/directorRoutes');
const productoraRoutes = require('./routes/productoraRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

// ==========================================
// CONFIGURACION DE MIDDLEWARES
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// RUTA PRINCIPAL
// ==========================================
app.get('/', (req, res) => {
    res.status(200).json({
        estado: 'OK',
        mensaje: 'API REST de Peliculas y Series',
        version: '1.0.0'
    });
});

// ==========================================
// VERIFICAR CONEXION CON MYSQL
// ==========================================
app.get('/api/health', async (req, res) => {
    try {
        await db.query('SELECT 1');

        res.status(200).json({
            estado: 'OK',
            servidor: 'Funcionando',
            base_datos: 'Conectada'
        });

    } catch (error) {
        console.error('Error de conexion:', error.message);

        res.status(500).json({
            estado: 'ERROR',
            mensaje: 'No fue posible conectar con MySQL'
        });
    }
});

// ==========================================
// RUTAS DE LOS CINCO MODULOS
// ==========================================
app.use('/api/generos', generoRoutes);
app.use('/api/directores', directorRoutes);
app.use('/api/productoras', productoraRoutes);
app.use('/api/tipos', tipoRoutes);
app.use('/api/media', mediaRoutes);

// ==========================================
// MANEJO DE RUTAS INEXISTENTES
// ==========================================
app.use((req, res) => {
    res.status(404).json({
        estado: 'ERROR',
        error: 'Ruta no encontrada'
    });
});

// ==========================================
// EXPORTAR APLICACION
// ==========================================
module.exports = app;
