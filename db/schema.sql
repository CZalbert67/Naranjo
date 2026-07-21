-- Crear la base de datos
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'FibrasNaranjoDB')
BEGIN
    CREATE DATABASE FibrasNaranjoDB;
END;
GO

USE FibrasNaranjoDB;
GO

-- 1. Tabla de Áreas
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Areas')
BEGIN
    CREATE TABLE Areas (
        id_area INT IDENTITY(1,1) PRIMARY KEY,
        nombre_area VARCHAR(50) NOT NULL
    );
END;

-- 2. Tabla de Equipos
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Equipos')
BEGIN
    CREATE TABLE Equipos (
        id_equipo INT IDENTITY(1,1) PRIMARY KEY,
        id_area INT NOT NULL,
        tipo_equipo VARCHAR(50) NOT NULL,
        FOREIGN KEY (id_area) REFERENCES Areas(id_area)
    );
END;

-- 3. Tabla de Usuarios
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Usuarios')
BEGIN
    CREATE TABLE Usuarios (
        id_usuario INT IDENTITY(1,1) PRIMARY KEY,
        nombre_completo VARCHAR(100) NOT NULL,
        rol VARCHAR(20) NOT NULL CHECK (rol IN ('Operario', 'Administrador')),
        usuario VARCHAR(50) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL
    );
END;

-- 4. Tabla de Tickets (Órdenes de Trabajo)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tickets')
BEGIN
    CREATE TABLE Tickets (
        id_ticket INT IDENTITY(1,1) PRIMARY KEY,
        id_usuario INT NOT NULL,
        id_equipo INT NOT NULL,
        descripcion TEXT NOT NULL,
        estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'En Proceso', 'Resuelto')),
        fecha_reporte DATETIME DEFAULT GETDATE(),
        FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario),
        FOREIGN KEY (id_equipo) REFERENCES Equipos(id_equipo)
    );
END;
