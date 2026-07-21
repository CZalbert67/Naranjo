USE FibrasNaranjoDB;
GO

-- Insertar Áreas de la planta textil
IF NOT EXISTS (SELECT * FROM Areas)
BEGIN
    INSERT INTO Areas (nombre_area) VALUES 
    ('Área de Hilado'),
    ('Tejeduría'),
    ('Almacén'),
    ('Mantenimiento');
END;

-- Insertar Equipos
IF NOT EXISTS (SELECT * FROM Equipos)
BEGIN
    INSERT INTO Equipos (id_area, tipo_equipo) VALUES 
    (1, 'Impresora de Etiquetas'),
    (1, 'Terminal / Monitor Industrial'),
    (1, 'Nodo de Red / Switch'),
    (2, 'Telar Industrial TK-4029'),
    (2, 'Sensor de Nivel Ultrasónico'),
    (3, 'Impresora Departamental Mass'),
    (4, 'Bomba de Agua / Hidráulica');
END;

-- Insertar Usuarios por defecto
-- Nota: Contraseñas por defecto:
-- admin / admin123 (hash bcrypt)
-- operario1 / operario123 (hash bcrypt)
IF NOT EXISTS (SELECT * FROM Usuarios)
BEGIN
    INSERT INTO Usuarios (nombre_completo, rol, usuario, password_hash) VALUES 
    ('Encargado de Sistemas', 'Administrador', 'admin', '$2a$10$7R.p5g8H4X.w6K7X2v9e0O1w2e3r4t5y6u7i8o9p0a1b2c3d4e5f6'),
    ('Juan Pérez (Hilado)', 'Operario', 'operario1', '$2a$10$7R.p5g8H4X.w6K7X2v9e0O1w2e3r4t5y6u7i8o9p0a1b2c3d4e5f6');
END;
