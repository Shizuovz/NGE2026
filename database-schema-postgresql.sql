-- ========================================
-- Nagaland Gaming Expo 2026 Database Schema (PostgreSQL)
-- ========================================

-- ========================================
-- Core Tables
-- ========================================

-- Colleges table (for college team verification)
CREATE TABLE colleges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    abbreviation VARCHAR(50),
    location VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Games table
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    team_size INTEGER NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sponsorship tiers table
CREATE TABLE sponsorship_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2),
    description TEXT,
    benefits JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Registration Tables
-- ========================================

-- Teams table (main registration)
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE, -- Unique registration ID like NGE2026-TEAM-12345
    team_name VARCHAR(255) NOT NULL,
    registration_type VARCHAR(20) NOT NULL CHECK (registration_type IN ('college', 'open_category', 'sponsor', 'visitor')),
    game_id INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'withdrawn')),
    
    -- College specific fields
    college_id INTEGER,
    
    -- Open category specific fields
    team_category VARCHAR(20) CHECK (team_category IN ('professionals', 'semi_pro', 'community')),
    
    -- Captain details
    captain_name VARCHAR(255) NOT NULL,
    captain_email VARCHAR(255) NOT NULL,
    captain_phone VARCHAR(20) NOT NULL,
    
    -- Additional fields
    additional_message TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (college_id) REFERENCES colleges(id)
);

-- Team members table
CREATE TABLE team_members (
    id SERIAL PRIMARY KEY,
    team_id INTEGER NOT NULL,
    player_number INTEGER NOT NULL, -- 1, 2, 3, 4, 5
    ign VARCHAR(255) NOT NULL, -- In-game name
    game_id VARCHAR(255) NOT NULL, -- Game ID/UID
    is_substitute BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    
    -- Unique constraints
    UNIQUE (team_id, player_number)
);

-- Sponsor registrations table
CREATE TABLE sponsor_registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    company_name VARCHAR(255) NOT NULL,
    sponsorship_tier_id INTEGER,
    contact_person VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(20) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'confirmed', 'rejected')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (sponsorship_tier_id) REFERENCES sponsorship_tiers(id)
);

-- Visitor registrations table
CREATE TABLE visitor_registrations (
    id SERIAL PRIMARY KEY,
    registration_id VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- Tournament Management Tables
-- ========================================

-- Tournament brackets/matches
CREATE TABLE tournament_matches (
    id SERIAL PRIMARY KEY,
    tournament_type VARCHAR(20) NOT NULL CHECK (tournament_type IN ('college', 'open_category')),
    game_id INTEGER NOT NULL,
    round_number INTEGER NOT NULL,
    match_number INTEGER NOT NULL,
    team1_id INTEGER,
    team2_id INTEGER,
    winner_team_id INTEGER,
    match_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    score_details JSONB, -- Store match scores and details
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    FOREIGN KEY (game_id) REFERENCES games(id),
    FOREIGN KEY (team1_id) REFERENCES teams(id),
    FOREIGN KEY (team2_id) REFERENCES teams(id),
    FOREIGN KEY (winner_team_id) REFERENCES teams(id)
);

-- ========================================
-- Functions for PostgreSQL
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_colleges_updated_at BEFORE UPDATE ON colleges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON team_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sponsor_registrations_updated_at BEFORE UPDATE ON sponsor_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visitor_registrations_updated_at BEFORE UPDATE ON visitor_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tournament_matches_updated_at BEFORE UPDATE ON tournament_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique registration ID
CREATE OR REPLACE FUNCTION generate_registration_id(registration_type TEXT)
RETURNS TEXT AS $$
DECLARE
    new_id TEXT;
    counter INTEGER;
    type_prefix TEXT;
BEGIN
    -- Convert registration type to prefix
    CASE registration_type
        WHEN 'college' THEN type_prefix := 'COLLEGE';
        WHEN 'open_category' THEN type_prefix := 'OPEN';
        WHEN 'sponsor' THEN type_prefix := 'SPONSOR';
        WHEN 'visitor' THEN type_prefix := 'VISITOR';
        ELSE type_prefix := 'UNKNOWN';
    END CASE;
    
    -- Get next counter
    SELECT COALESCE(MAX(CAST(SUBSTRING(registration_id, '-([0-9]+)$') AS INTEGER)), 0) + 1 
    INTO counter
    FROM teams 
    WHERE registration_type = registration_type;
    
    -- Generate ID
    new_id := 'NGE2026-' || type_prefix || '-' || LPAD(counter::TEXT, 5, '0');
    
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Function to validate team composition
CREATE OR REPLACE FUNCTION validate_team_composition(team_id_param INTEGER)
RETURNS TABLE(required_size INTEGER, main_players INTEGER, substitutes INTEGER, valid_composition BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        g.team_size,
        COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END),
        COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END),
        (COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) = g.team_size AND COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END) <= 1)
    FROM teams t
    JOIN games g ON t.game_id = g.id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    WHERE t.id = team_id_param
    GROUP BY g.team_size;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- Triggers for Data Integrity
-- ========================================

-- Trigger to validate team member count before insertion
CREATE OR REPLACE FUNCTION validate_team_members()
RETURNS TRIGGER AS $$
DECLARE
    current_main_players INTEGER;
    current_substitutes INTEGER;
    max_players INTEGER;
BEGIN
    -- Get current team composition
    SELECT 
        COUNT(CASE WHEN is_substitute = FALSE THEN 1 END),
        COUNT(CASE WHEN is_substitute = TRUE THEN 1 END)
    INTO current_main_players, current_substitutes
    FROM team_members 
    WHERE team_id = NEW.team_id;
    
    -- Get max players for this game
    SELECT g.team_size INTO max_players
    FROM teams t
    JOIN games g ON t.game_id = g.id
    WHERE t.id = NEW.team_id;
    
    -- Validate constraints
    IF NEW.is_substitute = FALSE AND current_main_players >= max_players THEN
        RAISE EXCEPTION 'Maximum main players reached for this game';
    END IF;
    
    IF NEW.is_substitute = TRUE AND current_substitutes >= 1 THEN
        RAISE EXCEPTION 'Maximum one substitute allowed';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_team_members_before_insert
BEFORE INSERT ON team_members
FOR EACH ROW EXECUTE FUNCTION validate_team_members();

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
GROUP BY t.id, g.name, g.team_size, c.name;

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
-- Indexes for Performance
-- ========================================

-- Additional indexes for better query performance
CREATE INDEX idx_teams_registration_type ON teams(registration_type);
CREATE INDEX idx_teams_status ON teams(status);
CREATE INDEX idx_teams_game_id ON teams(game_id);
CREATE INDEX idx_teams_college_id ON teams(college_id);
CREATE INDEX idx_teams_captain_email ON teams(captain_email);
CREATE INDEX idx_teams_created_at ON teams(created_at);

CREATE INDEX idx_team_members_team_id ON team_members(team_id);
CREATE INDEX idx_team_members_is_substitute ON team_members(is_substitute);
CREATE INDEX idx_team_members_ign ON team_members(ign);

CREATE INDEX idx_sponsor_registrations_company_name ON sponsor_registrations(company_name);
CREATE INDEX idx_sponsor_registrations_status ON sponsor_registrations(status);
CREATE INDEX idx_sponsor_registrations_email ON sponsor_registrations(contact_email);
CREATE INDEX idx_sponsor_registrations_tier_id ON sponsor_registrations(sponsorship_tier_id);

CREATE INDEX idx_visitor_registrations_email ON visitor_registrations(email);
CREATE INDEX idx_visitor_registrations_status ON visitor_registrations(status);

CREATE INDEX idx_tournament_matches_type ON tournament_matches(tournament_type);
CREATE INDEX idx_tournament_matches_game_id ON tournament_matches(game_id);
CREATE INDEX idx_tournament_matches_round_number ON tournament_matches(round_number);
CREATE INDEX idx_tournament_matches_date ON tournament_matches(match_date);

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
GROUP BY t.id, g.name, g.team_size
HAVING COUNT(tm.id) < g.team_size;

-- Get sponsor registrations by tier
SELECT st.name as tier, COUNT(sr.id) as registrations, SUM(st.price) as potential_revenue
FROM sponsor_registrations sr
JOIN sponsorship_tiers st ON sr.sponsorship_tier_id = st.id
WHERE sr.status = 'confirmed'
GROUP BY st.id;

-- Generate a new registration ID
SELECT generate_registration_id('college');

-- Validate team composition
SELECT * FROM validate_team_composition(1);
*/
