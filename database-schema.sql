-- ========================================
-- Nagaland Gaming Expo 2026 Database Schema
-- ========================================

-- Create database
CREATE DATABASE nge_2026;
USE nge_2026;

-- ========================================
-- Core Tables
-- ========================================

-- Colleges table (for college team verification)
CREATE TABLE colleges (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(50),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    team_size INT NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship tiers table
CREATE TABLE sponsorship_tiers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
    description TEXT,
    benefits JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Registration Tables
-- ========================================

-- Teams table (main registration)
CREATE TABLE teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE, -- Unique registration ID like NGE2026-TEAM-12345
    team_name VARCHAR(255) NOT NULL,
    registration_type ENUM('college', 'open_category', 'sponsor', 'visitor') NOT NULL,
    game_id INT NOT NULL,
    status ENUM('pending', 'confirmed', 'rejected', 'withdrawn') DEFAULT 'pending',
    
    -- College specific fields
    college_id INT NULL,
    
    -- Open category specific fields
    team_category ENUM('professionals', 'semi_pro', 'community') NULL,
    
    -- Captain details
    captain_name VARCHAR(255) NOT NULL,
    captain_email VARCHAR(255) NOT NULL,
    captain_phone VARCHAR(20) NOT NULL,
    
    -- Additional fields
    additional_message TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id),
    
    -- Indexes
    INDEX idx_registration_type (registration_type),
    INDEX idx_status (status),
    INDEX idx_game_id (game_id),
    INDEX idx_college_id (college_id)
);

-- Team members table
CREATE TABLE team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    player_number INT NOT NULL, -- 1, 2, 3, 4, 5
    ign VARCHAR(255) NOT NULL, -- In-game name
    game_id VARCHAR(255) NOT NULL, -- Game ID/UID
    is_substitute BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Unique constraints
    UNIQUE KEY unique_team_player (team_id, player_number),
    INDEX idx_team_id (team_id),
    INDEX idx_is_substitute (is_substitute)
);

-- Sponsor registrations table
CREATE TABLE sponsor_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    sponsorship_tier_id INT,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    message TEXT,
    status ENUM('pending', 'contacted', 'confirmed', 'rejected') DEFAULT 'pending',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (sponsorship_tier_id) REFERENCES sponsorship_tiers(id),
    
    -- Indexes
    INDEX idx_company_name (company_name),
    INDEX idx_status (status),
    INDEX idx_sponsorship_tier_id (sponsorship_tier_id)
);

-- Visitor registrations table
CREATE TABLE visitor_registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status ENUM('confirmed', 'cancelled') DEFAULT 'confirmed',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- ========================================
-- Tournament Management Tables
-- ========================================

-- Tournament brackets/matches
CREATE TABLE tournament_matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_type ENUM('college', 'open_category') NOT NULL,
    game_id INT NOT NULL,
    round_number INT NOT NULL,
    match_number INT NOT NULL,
    team1_id INT,
    team2_id INT,
    winner_team_id INT,
    match_date DATETIME,
    status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    score_details JSON, -- Store match scores and details
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (winner_team_id) REFERENCES teams(id),
    
    -- Indexes
    INDEX idx_tournament_type (tournament_type),
    INDEX idx_game_id (game_id),
    INDEX idx_round_number (round_number),
    INDEX idx_match_date (match_date)
);

-- ========================================
-- Insert Initial Data
-- ========================================

-- Insert games
INSERT INTO games (name, full_name, team_size, description) VALUES
('bgmi', 'Battlegrounds Mobile India', 4, 'Battle Royale - Squad-based tactical combat. 4-player teams compete across multiple rounds for survival supremacy.'),
('mobile_legends', 'Mobile Legends: Bang Bang', 5, '5v5 MOBA - Strategic team battles with heroes, lanes, and objectives. Fast-paced action requiring coordination and skill.');

-- Insert sponsorship tiers
INSERT INTO sponsorship_tiers (name, price, description, benefits) VALUES
('Title Sponsor', 500000.00, 'Top-tier sponsorship with naming rights', '["Naming rights", "Top branding across main stage, LED screens, live streams", "Premium booth space with prime location", "On-stage mentions & prize distribution opportunities", "Co-branding with Inter-College Showcase", "All marketing assets inclusion"]'),
('Powered By Sponsor', 250000.00, 'Prominent branding across all platforms', '["Prominent branding on stage & LED screens", "Dedicated booth space at expo", "Live stream visibility during matches", "Match-time brand mentions", "Digital promotions across social media", "Logo on event materials"]'),
('Associate Sponsor', 100000.00, 'Standard sponsorship package', '["Logo placement on all creatives and materials", "Booth presence at the expo", "Social media amplification", "Event day visibility", "Certificate of partnership", "Website listing"]'),
('Category Partner', 0.00, 'Custom or in-kind partnerships', '["Open Tournament Partner", "Streaming Partner", "Internet/Tech Partner", "Cosplay Partner", "Custom partnership opportunities", "In-kind collaboration options"]');

-- Insert sample colleges (can be expanded)
INSERT INTO colleges (name, abbreviation, location) VALUES
('National Institute of Technology Nagaland', 'NIT Nagaland', 'Dimapur'),
('Nagaland University', 'NU', 'Kohima'),
('Mount Carmel College', 'MCC', 'Arunachal Pradesh'),
('Patkai Christian College', 'PCC', 'Dimapur'),
('Sazou College', 'SC', 'Phek');

-- ========================================
-- Views for Common Queries
-- ========================================

-- View for team registrations with details
CREATE VIEW team_registrations_view AS
SELECT 
    t.id,
    t.registration_id,
    t.team_name,
    t.registration_type,
    t.status,
    t.captain_name,
    t.captain_email,
    t.captain_phone,
    g.name as game_name,
    g.team_size as required_team_size,
    c.name as college_name,
    t.team_category,
    t.created_at,
    COUNT(tm.id) as registered_players,
    COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) as main_players,
    COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END) as substitutes
FROM teams t
LEFT JOIN games g ON t.game_id = g.id
LEFT JOIN colleges c ON t.college_id = c.id
LEFT JOIN team_members tm ON t.id = tm.team_id
WHERE t.registration_type IN ('college', 'open_category')
GROUP BY t.id;

-- View for registration statistics
CREATE VIEW registration_stats AS
SELECT 
    'college' as type,
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM teams WHERE registration_type = 'college'
UNION ALL
SELECT 
    'open_category' as type,
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM teams WHERE registration_type = 'open_category'
UNION ALL
SELECT 
    'sponsor' as type,
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM sponsor_registrations
UNION ALL
SELECT 
    'visitor' as type,
    COUNT(*) as total_registrations,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
FROM visitor_registrations;

-- ========================================
-- Stored Procedures (Optional)
-- ========================================

DELIMITER //

-- Procedure to generate unique registration ID
CREATE PROCEDURE generate_registration_id(IN registration_type VARCHAR(50))
BEGIN
    DECLARE new_id VARCHAR(50);
    DECLARE counter INT;
    
    SET counter = (SELECT COALESCE(MAX(CAST(SUBSTRING(registration_id, -5) AS UNSIGNED)), 0) + 1 
                   FROM teams 
                   WHERE registration_type = registration_type);
    
    SET new_id = CONCAT('NGE2026-', UPPER(registration_type), '-', LPAD(counter, 5, '0'));
    
    SELECT new_id as registration_id;
END //

-- Procedure to validate team composition
CREATE PROCEDURE validate_team_composition(IN team_id INT)
BEGIN
    DECLARE required_size INT;
    DECLARE main_players INT;
    DECLARE substitutes INT;
    DECLARE is_valid BOOLEAN;
    
    -- Get required team size
    SELECT g.team_size INTO required_size
    FROM teams t
    JOIN games g ON t.game_id = g.id
    WHERE t.id = team_id;
    
    -- Count registered players
    SELECT 
        COUNT(CASE WHEN is_substitute = FALSE THEN 1 END) INTO main_players,
        COUNT(CASE WHEN is_substitute = TRUE THEN 1 END) INTO substitutes
    FROM team_members 
    WHERE team_id = team_id;
    
    -- Validate
    SET is_valid = (main_players = required_size AND substitutes <= 1);
    
    SELECT 
        required_size,
        main_players,
        substitutes,
        is_valid as valid_composition;
END //

DELIMITER ;

-- ========================================
-- Triggers for Data Integrity
-- ========================================

-- Trigger to validate team member count before insertion
DELIMITER //
CREATE TRIGGER validate_team_members_before_insert
BEFORE INSERT ON team_members
FOR EACH ROW
BEGIN
    DECLARE current_main_players INT;
    DECLARE current_substitutes INT;
    DECLARE max_players INT;
    
    -- Get current team composition
    SELECT 
        COUNT(CASE WHEN is_substitute = FALSE THEN 1 END) INTO current_main_players,
        COUNT(CASE WHEN is_substitute = TRUE THEN 1 END) INTO current_substitutes
    FROM team_members 
    WHERE team_id = NEW.team_id;
    
    -- Get max players for this game
    SELECT g.team_size INTO max_players
    FROM teams t
    JOIN games g ON t.game_id = g.id
    WHERE t.id = NEW.team_id;
    
    -- Validate constraints
    IF NEW.is_substitute = FALSE AND current_main_players >= max_players THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum main players reached for this game';
    END IF;
    
    IF NEW.is_substitute = TRUE AND current_substitutes >= 1 THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Maximum one substitute allowed';
    END IF;
END //
DELIMITER ;

-- ========================================
-- Indexes for Performance
-- ========================================

-- Additional indexes for better query performance
CREATE INDEX idx_teams_captain_email ON teams(captain_email);
CREATE INDEX idx_teams_created_at ON teams(created_at);
CREATE INDEX idx_team_members_ign ON team_members(ign);
CREATE INDEX idx_sponsor_registrations_email ON sponsor_registrations(contact_email);
CREATE INDEX idx_visitor_registrations_email ON visitor_registrations(email);

-- ========================================
-- Sample Queries
-- ========================================

/*
-- Get all confirmed college teams for BGMI
SELECT * FROM team_registrations_view 
WHERE registration_type = 'college' 
AND game_name = 'bgmi' 
AND status = 'confirmed'
ORDER BY created_at DESC;

-- Get registration statistics by type
SELECT * FROM registration_stats;

-- Get teams with incomplete player registration
SELECT t.registration_id, t.team_name, g.name as game_name, g.team_size, COUNT(tm.id) as registered_players
FROM teams t
JOIN games g ON t.game_id = g.id
LEFT JOIN team_members tm ON t.id = tm.team_id AND tm.is_substitute = FALSE
WHERE t.registration_type IN ('college', 'open_category')
AND t.status = 'pending'
GROUP BY t.id
HAVING registered_players < g.team_size;

-- Get sponsor registrations by tier
SELECT st.name as tier, COUNT(sr.id) as registrations, SUM(st.price) as potential_revenue
FROM sponsor_registrations sr
JOIN sponsorship_tiers st ON sr.sponsorship_tier_id = st.id
WHERE sr.status = 'confirmed'
GROUP BY st.id;
*/
