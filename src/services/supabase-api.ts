import { supabase, handleSupabaseError, DatabaseInsert, DatabaseRow } from '../lib/supabase';
import { toast } from 'sonner';

// API Service object using Supabase
export const supabaseApiService = {
  // Health check
  async healthCheck() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      return { 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'NGE 2026 Registration API (Supabase)'
      };
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Games
  async getGames() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Colleges
  async getColleges() {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select('*')
        .eq('is_active', true)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Sponsorship Tiers
  async getSponsorshipTiers() {
    try {
      const { data, error } = await supabase
        .from('sponsorship_tiers')
        .select('*')
        .order('price', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Generate unique registration ID
  async generateRegistrationId(registrationType: string) {
    try {
      const typePrefix = {
        college: 'COLLEGE',
        open_category: 'OPEN',
        sponsor: 'SPONSOR',
        visitor: 'VISITOR'
      }[registrationType];

      if (!typePrefix) {
        throw new Error('Invalid registration type');
      }

      // Generate unique ID with timestamp and random component to avoid collisions
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const counter = timestamp.toString().slice(-6); // Last 6 digits of timestamp
      
      const registrationId = `NGE2026-${typePrefix}-${counter}-${random}`;
      
      return registrationId;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Submit team registration
  async submitTeamRegistration(teamData: any) {
    try {
      // Start a transaction-like operation
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          registration_id: teamData.registrationId,
          team_name: teamData.teamName,
          registration_type: teamData.registrationType,
          game_id: teamData.gameId,
          college_id: teamData.collegeId,
          team_category: teamData.teamCategory,
          captain_name: teamData.captainName,
          captain_email: teamData.captainEmail,
          captain_phone: teamData.captainPhone,
          additional_message: teamData.additionalMessage,
          terms_accepted: teamData.termsAccepted
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Insert team members
      const teamMembers = teamData.teamMembers.map((member: any, index: number) => ({
        team_id: team.id,
        player_number: index + 1,
        ign: member.ign,
        game_id: member.gameId,
        is_substitute: false
      }));

      if (teamMembers.length > 0) {
        const { error: membersError } = await supabase
          .from('team_members')
          .insert(teamMembers);
        
        if (membersError) throw membersError;
      }

      // Insert substitute if provided
      if (teamData.substitute && teamData.substitute.ign) {
        const { error: substituteError } = await supabase
          .from('team_members')
          .insert({
            team_id: team.id,
            player_number: teamMembers.length + 1,
            ign: teamData.substitute.ign,
            game_id: teamData.substitute.gameId,
            is_substitute: true
          });
        
        if (substituteError) throw substituteError;
      }

      return {
        message: 'Team registration successful',
        teamId: team.id,
        registrationId: teamData.registrationId
      };

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Submit sponsor registration
  async submitSponsorRegistration(sponsorData: any) {
    try {
      const { data, error } = await supabase
        .from('sponsor_registrations')
        .insert({
          registration_id: sponsorData.registrationId,
          company_name: sponsorData.companyName,
          sponsorship_tier_id: sponsorData.sponsorshipTierId,
          contact_person: sponsorData.contactPerson,
          contact_email: sponsorData.contactEmail,
          contact_phone: sponsorData.contactPhone,
          message: sponsorData.message
        })
        .select()
        .single();

      if (error) throw error;

      return {
        message: 'Sponsor registration successful',
        sponsorId: data.id,
        registrationId: sponsorData.registrationId
      };

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Submit visitor registration
  async submitVisitorRegistration(visitorData: any) {
    try {
      const { data, error } = await supabase
        .from('visitor_registrations')
        .insert({
          registration_id: visitorData.registrationId,
          full_name: visitorData.fullName,
          email: visitorData.email,
          phone: visitorData.phone
        })
        .select()
        .single();

      if (error) throw error;

      return {
        message: 'Visitor registration successful',
        visitorId: data.id,
        registrationId: visitorData.registrationId
      };

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Get registration details by ID
  async getRegistrationDetails(registrationId: string) {
    try {
      // Try teams first
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select(`
          *,
          games(name, team_size),
          colleges(name)
        `)
        .eq('registration_id', registrationId)
        .single();

      if (teamData && !teamError) {
        // Get team members
        const { data: members } = await supabase
          .from('team_members')
          .select('*')
          .eq('team_id', teamData.id)
          .order('player_number');

        return {
          type: 'team',
          data: teamData,
          members: members || []
        };
      }

      // Try sponsor registrations
      const { data: sponsorData, error: sponsorError } = await supabase
        .from('sponsor_registrations')
        .select(`
          *,
          sponsorship_tiers(name, price)
        `)
        .eq('registration_id', registrationId)
        .single();

      if (sponsorData && !sponsorError) {
        return {
          type: 'sponsor',
          data: sponsorData
        };
      }

      // Try visitor registrations
      const { data: visitorData, error: visitorError } = await supabase
        .from('visitor_registrations')
        .select('*')
        .eq('registration_id', registrationId)
        .single();

      if (visitorData && !visitorError) {
        return {
          type: 'visitor',
          data: visitorData
        };
      }

      throw new Error('Registration not found');

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  // Statistics
  async getOverviewStats() {
    try {
      const [collegeStats, openStats, sponsorStats, visitorStats] = await Promise.all([
        supabase.from('teams').select('status').eq('registration_type', 'college'),
        supabase.from('teams').select('status').eq('registration_type', 'open_category'),
        supabase.from('sponsor_registrations').select('status'),
        supabase.from('visitor_registrations').select('status')
      ]);

      const formatStats = (data: any[], type: string) => ({
        type,
        total_registrations: data.length,
        confirmed: data.filter(item => item.status === 'confirmed').length,
        pending: data.filter(item => item.status === 'pending').length
      });

      return [
        formatStats(collegeStats.data || [], 'college'),
        formatStats(openStats.data || [], 'open_category'),
        formatStats(sponsorStats.data || [], 'sponsor'),
        formatStats(visitorStats.data || [], 'visitor')
      ];

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getTeamStats(filters: any = {}) {
    try {
      let query = supabase
        .from('teams')
        .select(`
          *,
          games(name, team_size),
          colleges(name),
          team_members!inner(
            id,
            ign,
            game_id,
            is_substitute
          )
        `)
        .in('registration_type', ['college', 'open_category']);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      if (filters.game) {
        query = query.eq('games.name', filters.game);
      }

      if (filters.type) {
        query = query.eq('registration_type', filters.type);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      // Process the data to include member counts and details
      return data?.map(team => {
        const mainPlayers = team.team_members?.filter((m: any) => !m.is_substitute) || [];
        const substitutePlayers = team.team_members?.filter((m: any) => m.is_substitute) || [];
        
        return {
          ...team,
          team_members: team.team_members || [],
          main_players: mainPlayers.length,
          substitutes: substitutePlayers.length,
          main_player_details: mainPlayers,
          substitute_player_details: substitutePlayers
        };
      }) || [];

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getSponsorStats(filters: any = {}) {
    try {
      let query = supabase
        .from('sponsor_registrations')
        .select(`
          *,
          sponsorship_tiers(name, price)
        `);

      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.tier) {
        query = query.eq('sponsorship_tiers.name', filters.tier);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      const sponsors = data || [];
      const totals = {
        total_sponsors: sponsors.length,
        confirmed_sponsors: sponsors.filter(s => s.status === 'confirmed').length,
        potential_revenue: sponsors.reduce((sum, s) => sum + (s.sponsorship_tiers?.price || 0), 0)
      };

      return { sponsors, totals };

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateSponsorStatus(sponsorId: number, status: string) {
    try {
      const { data, error } = await supabase
        .from('sponsor_registrations')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', sponsorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateTeamStatus(teamId: number, status: string) {
    try {
      const { data, error } = await supabase
        .from('teams')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getVisitorStats(filters: any = {}) {
    try {
      let query = supabase
        .from('visitor_registrations')
        .select('*');

      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;

      const visitors = data || [];
      const totals = {
        total_visitors: visitors.length,
        confirmed_visitors: visitors.filter(v => v.status === 'confirmed').length,
        cancelled_visitors: visitors.filter(v => v.status === 'cancelled').length
      };

      return { visitors, totals };

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async updateVisitorStatus(visitorId: number, status: string) {
    try {
      const { data, error } = await supabase
        .from('visitor_registrations')
        .update({ 
          status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', visitorId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getGameStats() {
    try {
      const { data, error } = await supabase
        .from('games')
        .select(`
          name,
          team_size,
          teams!inner(
            id,
            registration_type,
            status,
            team_members(id, is_substitute)
          )
        `)
        .eq('teams.registration_type', 'college')
        .or('teams.registration_type.eq.open_category');

      if (error) throw error;

      return data?.map(game => {
        const teams = game.teams || [];
        const allMembers = teams.flatMap((team: any) => team.team_members || []);
        
        return {
          name: game.name,
          team_size: game.team_size,
          total_teams: teams.length,
          college_teams: teams.filter((t: any) => t.registration_type === 'college').length,
          open_teams: teams.filter((t: any) => t.registration_type === 'open_category').length,
          confirmed_teams: teams.filter((t: any) => t.status === 'confirmed').length,
          total_players: allMembers.length,
          main_players: allMembers.filter((m: any) => !m.is_substitute).length,
          substitutes: allMembers.filter((m: any) => m.is_substitute).length
        };
      }) || [];

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getCollegeStats() {
    try {
      const { data, error } = await supabase
        .from('colleges')
        .select(`
          name,
          abbreviation,
          teams!inner(
            id,
            status,
            game_id,
            team_members(id, is_substitute)
          )
        `);

      if (error) throw error;

      return data?.map(college => {
        const teams = college.teams || [];
        const allMembers = teams.flatMap((team: any) => team.team_members || []);
        
        return {
          college_name: college.name,
          abbreviation: college.abbreviation,
          total_teams: teams.length,
          confirmed_teams: teams.filter((t: any) => t.status === 'confirmed').length,
          games_participating: [...new Set(teams.map((t: any) => t.game_id))].length,
          total_players: allMembers.length,
          main_players: allMembers.filter((m: any) => !m.is_substitute).length,
          substitutes: allMembers.filter((m: any) => m.is_substitute).length
        };
      }).filter(college => college.total_teams > 0) || [];

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getTimelineStats(days: number = 30) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all registrations in the date range
      const [teams, sponsors, visitors] = await Promise.all([
        supabase.from('teams').select('registration_type, created_at').gte('created_at', startDate.toISOString()),
        supabase.from('sponsor_registrations').select('created_at').gte('created_at', startDate.toISOString()),
        supabase.from('visitor_registrations').select('created_at').gte('created_at', startDate.toISOString())
      ]);

      // Group by date
      const groupByDate = (items: any[], type: string) => {
        return items.reduce((acc: any, item) => {
          const date = new Date(item.created_at).toISOString().split('T')[0];
          if (!acc[date]) {
            acc[date] = {
              date,
              total_registrations: 0,
              college_registrations: 0,
              open_registrations: 0,
              sponsor_registrations: 0,
              visitor_registrations: 0
            };
          }
          acc[date].total_registrations++;
          acc[date][`${type}_registrations`]++;
          return acc;
        }, {});
      };

      const teamData = groupByDate(teams.data || [], 'college');
      const sponsorData = groupByDate(sponsors.data || [], 'sponsor');
      const visitorData = groupByDate(visitors.data || [], 'visitor');

      // Merge all data
      const allDates = new Set([
        ...Object.keys(teamData),
        ...Object.keys(sponsorData),
        ...Object.keys(visitorData)
      ]);

      return Array.from(allDates).map(date => ({
        date,
        total_registrations: (teamData[date]?.total_registrations || 0) + (sponsorData[date]?.total_registrations || 0) + (visitorData[date]?.total_registrations || 0),
        college_registrations: teamData[date]?.college_registrations || 0,
        open_registrations: teamData[date]?.open_registrations || 0,
        sponsor_registrations: sponsorData[date]?.sponsor_registrations || 0,
        visitor_registrations: visitorData[date]?.visitor_registrations || 0
      })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },

  async getIncompleteTeams() {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          registration_id,
          team_name,
          registration_type,
          status,
          games(name, team_size),
          team_members(id, is_substitute),
          created_at
        `)
        .in('registration_type', ['college', 'open_category'])
        .eq('status', 'pending');

      if (error) throw error;

      return data?.filter(team => {
        const members = team.team_members || [];
        const mainPlayers = members.filter((m: any) => !m.is_substitute);
        return mainPlayers.length < team.games.team_size;
      }).map(team => ({
        registration_id: team.registration_id,
        team_name: team.team_name,
        registration_type: team.registration_type,
        status: team.status,
        game_name: team.games.name,
        required_size: team.games.team_size,
        registered_players: team.team_members?.length || 0,
        main_players: team.team_members?.filter((m: any) => !m.is_substitute).length || 0,
        substitutes: team.team_members?.filter((m: any) => m.is_substitute).length || 0,
        created_at: team.created_at
      })) || [];

    } catch (error) {
      throw new Error(handleSupabaseError(error));
    }
  },
};
