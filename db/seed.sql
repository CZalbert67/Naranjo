USE FibrasNaranjoDB;
GO

-- Insertar Áreas de la planta textil
IF NOT EXISTS (SELECT * FROM Areas)
BEGIN
    INSERT INTO Areas (nombre_area) VALUES 
    ('Área de Hilado'),
    ('Tejeduría'),
    ('Almacén'),
    ('Oficinas / Administración');
END;

-- Insertar Equipos EXCLUSIVAMENTE de Soporte de TI
IF NOT EXISTS (SELECT * FROM Equipos)
BEGIN
    INSERT INTO Equipos (id_area, tipo_equipo) VALUES 
    (1, 'Impresora de Etiquetas'),
    (1, 'PC / Terminal Industrial'),
    (1, 'Access Point (AP Wi-Fi)'),
    (2, 'Cámara de Seguridad IP'),
    (2, 'Router Industrial'),
    (2, 'PC / Monitor de Control'),
    (3, 'Impresora Departamental'),
    (3, 'Etiquetadora Térmica Barcode'),
    (3, 'Access Point (AP Wi-Fi)'),
    (4, 'PC de Escritorio'),
    (4, 'Router / Switch de Red'),
    (4, 'Impresora Multifuncional');
END;

-- Insertar Usuarios por defecto
IF NOT EXISTS (SELECT * FROM Usuarios)
BEGIN
    INSERT INTO Usuarios (nombre_completo, rol, usuario, password_hash) VALUES 
    ('Encargado de Sistemas', 'Administrador', 'admin', '$2a$10$7R.p5g8H4X.w6K7X2v9e0O1w2e3r4t5y6u7i8o9p0a1b2c3d4e5f6'),
    ('Juan Pérez (Hilado)', 'Operario', 'operario1', '$2a$10$7R.p5g8H4X.w6K7X2v9e0O1w2e3r4t5y6u7i8o9p0a1b2c3d4e5f6');
END;
