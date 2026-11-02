-- API REST DE PELICULAS Y SERIES
-- BASE DE DATOS: api_peliculas
-- Motor recomendado: MySQL 8.0.16 o superior

CREATE DATABASE IF NOT EXISTS api_peliculas
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE api_peliculas;

-- Tabla de generos 


CREATE TABLE IF NOT EXISTS generos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    descripcion TEXT NULL,

    CONSTRAINT uq_generos_nombre UNIQUE (nombre),
    INDEX idx_generos_estado (estado)
) ENGINE=InnoDB;

-- Tabla directores 

CREATE TABLE IF NOT EXISTS directores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombres VARCHAR(150) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_directores_nombres (nombres),
    INDEX idx_directores_estado (estado)
) ENGINE=InnoDB;


-- Tabla productos 

CREATE TABLE IF NOT EXISTS productoras (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    estado ENUM('Activo', 'Inactivo') NOT NULL DEFAULT 'Activo',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    slogan VARCHAR(255) NULL,
    descripcion TEXT NULL,

    CONSTRAINT uq_productoras_nombre UNIQUE (nombre),
    INDEX idx_productoras_estado (estado)
) ENGINE=InnoDB;

-- Tabla de tipos 

CREATE TABLE IF NOT EXISTS tipos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    descripcion TEXT NULL,

    CONSTRAINT uq_tipos_nombre UNIQUE (nombre)
) ENGINE=InnoDB;

-- Tabla media 

CREATE TABLE IF NOT EXISTS media (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    serial VARCHAR(50) NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    sinopsis TEXT NULL,
    url VARCHAR(500) NOT NULL,
    portada VARCHAR(500) NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    anio_estreno SMALLINT UNSIGNED NOT NULL,

    genero_id INT UNSIGNED NOT NULL,
    director_id INT UNSIGNED NOT NULL,
    productora_id INT UNSIGNED NOT NULL,
    tipo_id INT UNSIGNED NOT NULL,

    CONSTRAINT uq_media_serial UNIQUE (serial),
    CONSTRAINT uq_media_url UNIQUE (url),
    CONSTRAINT chk_media_anio CHECK (anio_estreno >= 1888),

    CONSTRAINT fk_media_genero
        FOREIGN KEY (genero_id) REFERENCES generos(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT fk_media_director
        FOREIGN KEY (director_id) REFERENCES directores(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT fk_media_productora
        FOREIGN KEY (productora_id) REFERENCES productoras(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    CONSTRAINT fk_media_tipo
        FOREIGN KEY (tipo_id) REFERENCES tipos(id)
        ON UPDATE RESTRICT ON DELETE RESTRICT,

    INDEX idx_media_titulo (titulo),
    INDEX idx_media_anio (anio_estreno),
    INDEX idx_media_genero (genero_id),
    INDEX idx_media_director (director_id),
    INDEX idx_media_productora (productora_id),
    INDEX idx_media_tipo (tipo_id)
) ENGINE=InnoDB;

-- Tabla para las auditorias 

CREATE TABLE IF NOT EXISTS auditoria_media (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    media_id INT UNSIGNED NOT NULL,
    accion ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    detalle JSON NOT NULL,
    fecha_auditoria TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    usuario_bd VARCHAR(288) NOT NULL,

    INDEX idx_auditoria_media_id (media_id),
    INDEX idx_auditoria_accion (accion),
    INDEX idx_auditoria_fecha (fecha_auditoria)
) ENGINE=InnoDB;



-- VALIDA RELACIONES AL INSERTAR MEDIA

DELIMITER $$

CREATE TRIGGER trg_media_before_insert
BEFORE INSERT ON media
FOR EACH ROW
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM generos
        WHERE id = NEW.genero_id
          AND estado = 'Activo'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El genero debe existir y estar Activo';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM directores
        WHERE id = NEW.director_id
          AND estado = 'Activo'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El director debe existir y estar Activo';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM productoras
        WHERE id = NEW.productora_id
          AND estado = 'Activo'
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'La productora debe existir y estar Activa';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM tipos
        WHERE id = NEW.tipo_id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El tipo debe existir';
    END IF;
END$$

 
-- VALIDAR RELACIONES AL ACTUALIZAR MEDIA


CREATE TRIGGER trg_media_before_update
BEFORE UPDATE ON media
FOR EACH ROW
BEGIN
    IF NOT (NEW.genero_id <=> OLD.genero_id) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM generos
            WHERE id = NEW.genero_id
              AND estado = 'Activo'
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El nuevo genero debe existir y estar Activo';
        END IF;
    END IF;

    IF NOT (NEW.director_id <=> OLD.director_id) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM directores
            WHERE id = NEW.director_id
              AND estado = 'Activo'
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El nuevo director debe existir y estar Activo';
        END IF;
    END IF;

    IF NOT (NEW.productora_id <=> OLD.productora_id) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM productoras
            WHERE id = NEW.productora_id
              AND estado = 'Activo'
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'La nueva productora debe existir y estar Activa';
        END IF;
    END IF;

    IF NOT (NEW.tipo_id <=> OLD.tipo_id) THEN
        IF NOT EXISTS (
            SELECT 1
            FROM tipos
            WHERE id = NEW.tipo_id
        ) THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'El nuevo tipo debe existir';
        END IF;
    END IF;
END$$

-- IMPEDIR ELIMINAR CATALOGOS REFERENCIADOS


CREATE TRIGGER trg_genero_before_delete
BEFORE DELETE ON generos
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM media WHERE genero_id = OLD.id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede eliminar: el genero esta asociado a media. Desactivelo.';
    END IF;
END$$

CREATE TRIGGER trg_director_before_delete
BEFORE DELETE ON directores
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM media WHERE director_id = OLD.id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede eliminar: el director esta asociado a media. Desactivelo.';
    END IF;
END$$

CREATE TRIGGER trg_productora_before_delete
BEFORE DELETE ON productoras
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM media WHERE productora_id = OLD.id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede eliminar: la productora esta asociada a media. Desactivela.';
    END IF;
END$$

CREATE TRIGGER trg_tipo_before_delete
BEFORE DELETE ON tipos
FOR EACH ROW
BEGIN
    IF EXISTS (
        SELECT 1 FROM media WHERE tipo_id = OLD.id
    ) THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'No se puede eliminar: el tipo esta asociado a media.';
    END IF;
END$$

--  AUDITORIA: INSERT

CREATE TRIGGER trg_media_after_insert
AFTER INSERT ON media
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_media (
        media_id, accion, detalle, usuario_bd
    )
    VALUES (
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'serial', NEW.serial,
            'titulo', NEW.titulo,
            'sinopsis', NEW.sinopsis,
            'url', NEW.url,
            'portada', NEW.portada,
            'anio_estreno', NEW.anio_estreno,
            'genero_id', NEW.genero_id,
            'director_id', NEW.director_id,
            'productora_id', NEW.productora_id,
            'tipo_id', NEW.tipo_id
        ),
        CURRENT_USER()
    );
END$$

-
--  AUDITORIA: UPDATE


CREATE TRIGGER trg_media_after_update
AFTER UPDATE ON media
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_media (
        media_id, accion, detalle, usuario_bd
    )
    VALUES (
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'antes', JSON_OBJECT(
                'serial', OLD.serial,
                'titulo', OLD.titulo,
                'sinopsis', OLD.sinopsis,
                'url', OLD.url,
                'portada', OLD.portada,
                'anio_estreno', OLD.anio_estreno,
                'genero_id', OLD.genero_id,
                'director_id', OLD.director_id,
                'productora_id', OLD.productora_id,
                'tipo_id', OLD.tipo_id
            ),
            'despues', JSON_OBJECT(
                'serial', NEW.serial,
                'titulo', NEW.titulo,
                'sinopsis', NEW.sinopsis,
                'url', NEW.url,
                'portada', NEW.portada,
                'anio_estreno', NEW.anio_estreno,
                'genero_id', NEW.genero_id,
                'director_id', NEW.director_id,
                'productora_id', NEW.productora_id,
                'tipo_id', NEW.tipo_id
            )
        ),
        CURRENT_USER()
    );
END$$

-- AUDITORIA: DELETE


CREATE TRIGGER trg_media_after_delete
AFTER DELETE ON media
FOR EACH ROW
BEGIN
    INSERT INTO auditoria_media (
        media_id, accion, detalle, usuario_bd
    )
    VALUES (
        OLD.id,
        'DELETE',
        JSON_OBJECT(
            'serial', OLD.serial,
            'titulo', OLD.titulo,
            'sinopsis', OLD.sinopsis,
            'url', OLD.url,
            'portada', OLD.portada,
            'anio_estreno', OLD.anio_estreno,
            'genero_id', OLD.genero_id,
            'director_id', OLD.director_id,
            'productora_id', OLD.productora_id,
            'tipo_id', OLD.tipo_id
        ),
        CURRENT_USER()
    );
END$$

DELIMITER ;

-- INSERT
INSERT IGNORE INTO generos (nombre, descripcion) VALUES
('Accion', 'Peliculas de accion'),
('Aventura', 'Historias de exploracion y aventuras'),
('Ciencia ficcion', 'Historias futuristas y tecnologicas'),
('Drama', 'Producciones de contenido dramatico'),
('Terror', 'Peliculas de suspenso y terror');

INSERT IGNORE INTO tipos (nombre, descripcion) VALUES
('Pelicula', 'Produccion cinematografica'),
('Serie', 'Produccion audiovisual por episodios');

INSERT INTO directores (nombres, estado)
SELECT 'Christopher Nolan', 'Activo'
WHERE NOT EXISTS (
    SELECT 1 FROM directores WHERE nombres = 'Christopher Nolan'
);

INSERT INTO directores (nombres, estado)
SELECT 'Steven Spielberg', 'Activo'
WHERE NOT EXISTS (
    SELECT 1 FROM directores WHERE nombres = 'Steven Spielberg'
);

INSERT IGNORE INTO productoras (nombre, slogan, descripcion) VALUES
('Warner Bros', 'Entertainment for everyone', 'Productora cinematografica'),
('Universal Pictures', 'The magic of movies', 'Productora de cine');

-- Verificación 
SHOW TABLES;

SELECT * FROM generos;
SELECT * FROM directores;
SELECT * FROM productoras;
SELECT * FROM tipos;
SELECT * FROM media;
SELECT * FROM auditoria_media;

-- Consultar los triggers creados:
SHOW TRIGGERS;
