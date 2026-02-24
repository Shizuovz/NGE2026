import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// Get overall registration statistics
router.get('/overview', async (req, res) => {
  try {
    const stats = await query(`
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
      FROM visitor_registrations
    `);

    res.json(stats.rows);
  } catch (error) {
    console.error('Stats overview error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get team registrations with details
router.get('/teams', async (req, res) => {
  try {
    const { status, game, type } = req.query;
    
    let whereClause = 'WHERE t.registration_type IN ($1, $2)';
    let params = ['college', 'open_category'];
    let paramIndex = 3;

    if (status) {
      whereClause += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (game) {
      whereClause += ` AND g.name = $${paramIndex}`;
      params.push(game);
      paramIndex++;
    }

    if (type) {
      whereClause += ` AND t.registration_type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const result = await query(`
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
      ${whereClause}
      GROUP BY t.id, g.name, g.team_size, c.name
      ORDER BY t.created_at DESC
    `, params);

    res.json(result.rows);
  } catch (error) {
    console.error('Teams stats error:', error);
    res.status(500).json({ message: 'Failed to fetch team statistics' });
  }
});

// Get sponsor statistics
router.get('/sponsors', async (req, res) => {
  try {
    const { status, tier } = req.query;
    
    let whereClause = 'WHERE 1=1';
    let params = [];
    let paramIndex = 1;

    if (status) {
      whereClause += ` AND sr.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (tier) {
      whereClause += ` AND st.name = $${paramIndex}`;
      params.push(tier);
      paramIndex++;
    }

    const result = await query(`
      SELECT 
        sr.id,
        sr.registration_id,
        sr.company_name,
        sr.contact_person,
        sr.contact_email,
        sr.contact_phone,
        sr.status,
        sr.created_at,
        st.name as tier_name,
        st.price as tier_price
      FROM sponsor_registrations sr
      LEFT JOIN sponsorship_tiers st ON sr.sponsorship_tier_id = st.id
      ${whereClause}
      ORDER BY sr.created_at DESC
    `, params);

    // Calculate totals
    const totalsResult = await query(`
      SELECT 
        COUNT(*) as total_sponsors,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_sponsors,
        COALESCE(SUM(st.price), 0) as potential_revenue
      FROM sponsor_registrations sr
      LEFT JOIN sponsorship_tiers st ON sr.sponsorship_tier_id = st.id
      ${whereClause}
    `, params);

    res.json({
      sponsors: result.rows,
      totals: totalsResult.rows[0]
    });
  } catch (error) {
    console.error('Sponsor stats error:', error);
    res.status(500).json({ message: 'Failed to fetch sponsor statistics' });
  }
});

// Get game-wise statistics
router.get('/games', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        g.name,
        g.team_size,
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT CASE WHEN t.registration_type = 'college' THEN t.id END) as college_teams,
        COUNT(DISTINCT CASE WHEN t.registration_type = 'open_category' THEN t.id END) as open_teams,
        COUNT(DISTINCT CASE WHEN t.status = 'confirmed' THEN t.id END) as confirmed_teams,
        COUNT(tm.id) as total_players,
        COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) as main_players,
        COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END) as substitutes
      FROM games g
      LEFT JOIN teams t ON g.id = t.game_id AND t.registration_type IN ('college', 'open_category')
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY g.id, g.name, g.team_size
      ORDER BY g.name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Game stats error:', error);
    res.status(500).json({ message: 'Failed to fetch game statistics' });
  }
});

// Get college-wise statistics
router.get('/colleges', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        c.name as college_name,
        c.abbreviation,
        COUNT(DISTINCT t.id) as total_teams,
        COUNT(DISTINCT CASE WHEN t.status = 'confirmed' THEN t.id END) as confirmed_teams,
        COUNT(DISTINCT g.id) as games_participating,
        COUNT(tm.id) as total_players,
        COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) as main_players,
        COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END) as substitutes
      FROM colleges c
      LEFT JOIN teams t ON c.id = t.college_id AND t.registration_type = 'college'
      LEFT JOIN games g ON t.game_id = g.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      GROUP BY c.id, c.name, c.abbreviation
      HAVING COUNT(t.id) > 0
      ORDER BY total_teams DESC, college_name
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('College stats error:', error);
    res.status(500).json({ message: 'Failed to fetch college statistics' });
  }
});

// Get registration timeline (daily registrations)
router.get('/timeline', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    
    const result = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as total_registrations,
        COUNT(CASE WHEN registration_type = 'college' THEN 1 END) as college_registrations,
        COUNT(CASE WHEN registration_type = 'open_category' THEN 1 END) as open_registrations,
        COUNT(CASE WHEN registration_type = 'sponsor' THEN 1 END) as sponsor_registrations,
        COUNT(CASE WHEN registration_type = 'visitor' THEN 1 END) as visitor_registrations
      FROM (
        SELECT registration_type, created_at FROM teams
        UNION ALL
        SELECT 'sponsor' as registration_type, created_at FROM sponsor_registrations
        UNION ALL
        SELECT 'visitor' as registration_type, created_at FROM visitor_registrations
      ) all_registrations
      WHERE created_at >= CURRENT_DATE - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Timeline stats error:', error);
    res.status(500).json({ message: 'Failed to fetch timeline statistics' });
  }
});

// Get incomplete registrations (teams with missing players)
router.get('/incomplete-teams', async (req, res) => {
  try {
    const result = await query(`
      SELECT 
        t.registration_id,
        t.team_name,
        t.registration_type,
        t.status,
        g.name as game_name,
        g.team_size as required_size,
        COUNT(tm.id) as registered_players,
        COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) as main_players,
        COUNT(CASE WHEN tm.is_substitute = TRUE THEN 1 END) as substitutes,
        t.created_at
      FROM teams t
      JOIN games g ON t.game_id = g.id
      LEFT JOIN team_members tm ON t.id = tm.team_id
      WHERE t.registration_type IN ('college', 'open_category')
      AND t.status = 'pending'
      GROUP BY t.id, g.name, g.team_size
      HAVING COUNT(CASE WHEN tm.is_substitute = FALSE THEN 1 END) < g.team_size
      ORDER BY t.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error('Incomplete teams error:', error);
    res.status(500).json({ message: 'Failed to fetch incomplete teams' });
  }
});

export default router;
