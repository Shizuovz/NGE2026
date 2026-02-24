import express from 'express';
import { query, transaction } from '../config/database.js';

const router = express.Router();

// Get all games
router.get('/games', async (req, res) => {
  try {
    const result = await query('SELECT * FROM games WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch games' });
  }
});

// Get all colleges
router.get('/colleges', async (req, res) => {
  try {
    const result = await query('SELECT * FROM colleges WHERE is_active = true ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch colleges' });
  }
});

// Get sponsorship tiers
router.get('/sponsorship-tiers', async (req, res) => {
  try {
    const result = await query('SELECT * FROM sponsorship_tiers WHERE is_active = true ORDER BY price DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sponsorship tiers' });
  }
});

// Generate unique registration ID
router.post('/generate-id', async (req, res) => {
  try {
    const { registrationType } = req.body;
    
    if (!registrationType) {
      return res.status(400).json({ message: 'Registration type is required' });
    }

    const typePrefix = {
      college: 'COLLEGE',
      open_category: 'OPEN',
      sponsor: 'SPONSOR',
      visitor: 'VISITOR'
    }[registrationType];

    if (!typePrefix) {
      return res.status(400).json({ message: 'Invalid registration type' });
    }

    // Get next counter
    const counterQuery = registrationType === 'sponsor' || registrationType === 'visitor'
      ? `SELECT COALESCE(MAX(CAST(SUBSTRING(registration_id, '-([0-9]+)$') AS INTEGER)), 0) + 1 as counter 
         FROM ${
           registrationType === 'sponsor' ? 'sponsor_registrations' : 'visitor_registrations'
         }`
      : `SELECT COALESCE(MAX(CAST(SUBSTRING(registration_id, '-([0-9]+)$') AS INTEGER)), 0) + 1 as counter 
         FROM teams 
         WHERE registration_type = $1`;

    const counterResult = await query(counterQuery, registrationType === 'sponsor' || registrationType === 'visitor' ? [] : [registrationType]);
    const counter = counterResult.rows[0].counter;
    
    const registrationId = `NGE2026-${typePrefix}-${counter.toString().padStart(5, '0')}`;
    
    res.json({ registrationId });
  } catch (error) {
    console.error('Error generating registration ID:', error);
    res.status(500).json({ message: 'Failed to generate registration ID' });
  }
});

// Submit team registration
router.post('/team', async (req, res) => {
  try {
    const {
      registrationId,
      teamName,
      registrationType,
      gameId,
      collegeId,
      teamCategory,
      captainName,
      captainEmail,
      captainPhone,
      teamMembers,
      substitute,
      additionalMessage,
      termsAccepted
    } = req.body;

    // Validation
    if (!registrationId || !teamName || !registrationType || !gameId || !captainName || !captainEmail || !captainPhone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    if (!termsAccepted) {
      return res.status(400).json({ message: 'Terms must be accepted' });
    }

    // Validate team composition
    const gameResult = await query('SELECT team_size FROM games WHERE id = $1', [gameId]);
    const requiredTeamSize = gameResult.rows[0]?.team_size;
    
    if (!requiredTeamSize) {
      return res.status(400).json({ message: 'Invalid game selected' });
    }

    const mainPlayers = teamMembers.filter(member => !member.isSubstitute);
    const hasSubstitute = substitute && substitute.ign && substitute.gameId;

    if (mainPlayers.length !== requiredTeamSize) {
      return res.status(400).json({ 
        message: `This game requires exactly ${requiredTeamSize} main players` 
      });
    }

    if (hasSubstitute && mainPlayers.length + 1 > requiredTeamSize + 1) {
      return res.status(400).json({ message: 'Only one substitute is allowed' });
    }

    // Use transaction for data integrity
    const result = await transaction(async (client) => {
      // Insert team
      const teamQuery = `
        INSERT INTO teams (
          registration_id, team_name, registration_type, game_id, 
          college_id, team_category, captain_name, captain_email, 
          captain_phone, additional_message, terms_accepted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id
      `;
      
      const teamValues = [
        registrationId, teamName, registrationType, gameId,
        registrationType === 'college' ? collegeId : null,
        registrationType === 'open_category' ? teamCategory : null,
        captainName, captainEmail, captainPhone, additionalMessage, termsAccepted
      ];
      
      const teamResult = await client.query(teamQuery, teamValues);
      const teamId = teamResult.rows[0].id;

      // Insert team members
      for (let i = 0; i < mainPlayers.length; i++) {
        const member = mainPlayers[i];
        await client.query(
          'INSERT INTO team_members (team_id, player_number, ign, game_id, is_substitute) VALUES ($1, $2, $3, $4, $5)',
          [teamId, i + 1, member.ign, member.gameId, false]
        );
      }

      // Insert substitute if provided
      if (hasSubstitute) {
        await client.query(
          'INSERT INTO team_members (team_id, player_number, ign, game_id, is_substitute) VALUES ($1, $2, $3, $4, $5)',
          [teamId, mainPlayers.length + 1, substitute.ign, substitute.gameId, true]
        );
      }

      return teamId;
    });

    res.status(201).json({
      message: 'Team registration successful',
      teamId: result,
      registrationId
    });

  } catch (error) {
    console.error('Team registration error:', error);
    
    // Handle duplicate registration ID
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Registration ID already exists' });
    }
    
    res.status(500).json({ message: 'Failed to register team' });
  }
});

// Submit sponsor registration
router.post('/sponsor', async (req, res) => {
  try {
    const {
      registrationId,
      companyName,
      sponsorshipTierId,
      contactPerson,
      contactEmail,
      contactPhone,
      message
    } = req.body;

    // Validation
    if (!registrationId || !companyName || !contactPerson || !contactEmail || !contactPhone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await query(
      `INSERT INTO sponsor_registrations 
       (registration_id, company_name, sponsorship_tier_id, contact_person, contact_email, contact_phone, message)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [registrationId, companyName, sponsorshipTierId, contactPerson, contactEmail, contactPhone, message]
    );

    res.status(201).json({
      message: 'Sponsor registration successful',
      sponsorId: result.rows[0].id,
      registrationId
    });

  } catch (error) {
    console.error('Sponsor registration error:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Registration ID already exists' });
    }
    
    res.status(500).json({ message: 'Failed to register sponsor' });
  }
});

// Submit visitor registration
router.post('/visitor', async (req, res) => {
  try {
    const {
      registrationId,
      fullName,
      email,
      phone
    } = req.body;

    // Validation
    if (!registrationId || !fullName || !email || !phone) {
      return res.status(400).json({ message: 'Required fields are missing' });
    }

    const result = await query(
      `INSERT INTO visitor_registrations 
       (registration_id, full_name, email, phone)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [registrationId, fullName, email, phone]
    );

    res.status(201).json({
      message: 'Visitor registration successful',
      visitorId: result.rows[0].id,
      registrationId
    });

  } catch (error) {
    console.error('Visitor registration error:', error);
    
    if (error.code === '23505') {
      return res.status(400).json({ message: 'Registration ID already exists' });
    }
    
    res.status(500).json({ message: 'Failed to register visitor' });
  }
});

// Get registration details by ID
router.get('/:registrationId', async (req, res) => {
  try {
    const { registrationId } = req.params;
    
    // Try to find in teams first
    const teamResult = await query(`
      SELECT t.*, g.name as game_name, g.team_size, c.name as college_name
      FROM teams t
      LEFT JOIN games g ON t.game_id = g.id
      LEFT JOIN colleges c ON t.college_id = c.id
      WHERE t.registration_id = $1
    `, [registrationId]);

    if (teamResult.rows.length > 0) {
      const team = teamResult.rows[0];
      
      // Get team members
      const membersResult = await query(
        'SELECT * FROM team_members WHERE team_id = $1 ORDER BY player_number',
        [team.id]
      );
      
      return res.json({
        type: 'team',
        data: team,
        members: membersResult.rows
      });
    }

    // Try sponsor registrations
    const sponsorResult = await query(`
      SELECT sr.*, st.name as tier_name, st.price
      FROM sponsor_registrations sr
      LEFT JOIN sponsorship_tiers st ON sr.sponsorship_tier_id = st.id
      WHERE sr.registration_id = $1
    `, [registrationId]);

    if (sponsorResult.rows.length > 0) {
      return res.json({
        type: 'sponsor',
        data: sponsorResult.rows[0]
      });
    }

    // Try visitor registrations
    const visitorResult = await query(
      'SELECT * FROM visitor_registrations WHERE registration_id = $1',
      [registrationId]
    );

    if (visitorResult.rows.length > 0) {
      return res.json({
        type: 'visitor',
        data: visitorResult.rows[0]
      });
    }

    res.status(404).json({ message: 'Registration not found' });

  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ message: 'Failed to fetch registration' });
  }
});

export default router;
