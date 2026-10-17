INSERT INTO country (code, name) VALUES
('IN', 'India'),
('US', 'United States'),
('GB', 'United Kingdom'),
('AE', 'United Arab Emirates'),
('AU', 'Australia'),
('CA', 'Canada'),
('DE', 'Germany'),
('SG', 'Singapore')
ON DUPLICATE KEY UPDATE name = VALUES(name);
