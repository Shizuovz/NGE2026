import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabaseApiService } from '@/services/supabase-api';
import { toast } from 'sonner';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { 
  Users, 
  Trophy, 
  Eye, 
  Download, 
  RefreshCw,
  Building2,
  LogOut,
  Mail,
  Phone,
  Gamepad2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<any[] | null>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [sponsors, setSponsors] = useState<any>({ sponsors: [], totals: { total_sponsors: 0, confirmed_sponsors: 0, potential_revenue: 0 } });
  const [sponsorFilters, setSponsorFilters] = useState({ status: null, tier: null });
  const [teamFilters, setTeamFilters] = useState({ status: null, type: null, game: null });
  const [visitors, setVisitors] = useState<any>({ visitors: [], totals: { total_visitors: 0, confirmed_visitors: 0 } });
  const [visitorFilters, setVisitorFilters] = useState({ status: null });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadAdminData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'sponsors') {
      loadSponsorData();
    }
  }, [sponsorFilters, isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'teams') {
      loadTeamData();
    }
  }, [teamFilters, isAuthenticated, activeTab]);

  useEffect(() => {
    if (isAuthenticated && activeTab === 'visitors') {
      loadVisitorData();
    }
  }, [visitorFilters, isAuthenticated, activeTab]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewStats, teamData, sponsorData, visitorData] = await Promise.all([
        supabaseApiService.getOverviewStats(),
        supabaseApiService.getTeamStats(teamFilters),
        supabaseApiService.getSponsorStats(sponsorFilters),
        supabaseApiService.getVisitorStats(visitorFilters)
      ]);
      
      setStats(overviewStats);
      setTeams(teamData);
      setSponsors(sponsorData);
      setVisitors(visitorData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const loadSponsorData = async () => {
    try {
      const sponsorData = await supabaseApiService.getSponsorStats(sponsorFilters);
      setSponsors(sponsorData);
    } catch (error) {
      toast.error('Failed to load sponsor data');
    }
  };

  const loadTeamData = async () => {
    try {
      const teamData = await supabaseApiService.getTeamStats(teamFilters);
      setTeams(teamData);
    } catch (error) {
      toast.error('Failed to load team data');
    }
  };

  const loadVisitorData = async () => {
    try {
      const visitorData = await supabaseApiService.getVisitorStats(visitorFilters);
      setVisitors(visitorData);
    } catch (error) {
      toast.error('Failed to load visitor data');
    }
  };

  const handleRefresh = () => loadAdminData();

  const handleUpdateSponsorStatus = async (sponsorId: number, newStatus: string) => {
    try {
      await supabaseApiService.updateSponsorStatus(sponsorId, newStatus);
      toast.success('Sponsor status updated');
      loadSponsorData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpdateTeamStatus = async (teamId: number, newStatus: string) => {
    try {
      await supabaseApiService.updateTeamStatus(teamId, newStatus);
      toast.success('Team status updated');
      loadAdminData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const handleUpdateVisitorStatus = async (visitorId: number, newStatus: string) => {
    try {
      await supabaseApiService.updateVisitorStatus(visitorId, newStatus);
      toast.success('Visitor status updated');
      loadVisitorData();
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const convertToCSV = (data: any, type: string) => {
    if (type === 'teams') {
      const headers = ['Reg ID', 'Team Name', 'Type', 'Game', 'College', 'Captain', 'Email', 'Phone', 'Status', 'Main Count', 'Sub Count', 'Main Players', 'Substitutes', 'Created'];
      const rows = (data as any[]).map(team => {
        const mainStr = Array.isArray(team.team_members) ? team.team_members.filter((m:any) => !m.is_substitute).map((p: any) => `${p.ign || 'N/A'} (${p.game_id || 'N/A'})`).join(' | ') : '';
        const subStr = Array.isArray(team.team_members) ? team.team_members.filter((m:any) => m.is_substitute).map((p: any) => `${p.ign || 'N/A'} (${p.game_id || 'N/A'})`).join(' | ') : '';
        return [
          team.registration_id, team.team_name, team.registration_type, team.game_name, team.college_name || 'N/A',
          team.captain_name, team.captain_email, team.captain_phone, team.status, team.main_players, team.substitutes,
          `"${mainStr}"`, `"${subStr}"`, new Date(team.created_at).toLocaleString()
        ];
      });
      return [headers, ...rows];
    } else if (type === 'sponsors') {
      const headers = ['ID', 'Company', 'Tier', 'Price', 'Contact', 'Phone', 'Email', 'Status', 'Created'];
      const rows = (data.sponsors || []).map((s: any) => [
        s.registration_id, s.company_name, s.sponsorship_tiers?.name, s.sponsorship_tiers?.price,
        s.contact_person, s.contact_phone, s.contact_email, s.status, new Date(s.created_at).toLocaleString()
      ]);
      return [headers, ...rows];
    } else if (type === 'visitors') {
      const headers = ['ID', 'Name', 'Email', 'Phone', 'Status', 'Created'];
      const rows = (data.visitors || []).map((v: any) => [
        v.registration_id, v.full_name, v.email, v.phone, v.status, new Date(v.created_at).toLocaleString()
      ]);
      return [headers, ...rows];
    }
    return [];
  };

  const downloadCSV = (csv: any[][], filename: string) => {
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleExportData = (type: 'teams' | 'sponsors' | 'visitors') => {
    const data = type === 'teams' ? teams : type === 'sponsors' ? sponsors : visitors;
    const csv = convertToCSV(data, type);
    downloadCSV(csv, `nge-2026-${type}.csv`);
    toast.success(`Exported ${type}`);
  };

  const getStatusBadge = (status: string) => {
    const colors: any = { confirmed: 'bg-green-500', pending: 'bg-yellow-500', rejected: 'bg-red-500', contacted: 'bg-orange-500' };
    return <Badge className={`${colors[status] || 'bg-slate-500'} text-white capitalize`}>{status}</Badge>;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="animate-spin" /></div>;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Responsive Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="flex items-center gap-4">
            <img src="/NGE.png" alt="Logo" className="h-12 w-auto" />
            <div>
              <h1 className="text-3xl font-bold font-['Rajdhani']">Admin <span className="text-primary">Dashboard</span></h1>
              <p className="text-muted-foreground text-sm">NGE 2026 Central Command</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <Button onClick={handleRefresh} variant="outline" size="sm" className="flex-1 lg:flex-none"><RefreshCw className="mr-2 h-4 w-4" /> Refresh</Button>
            <Button onClick={logout} variant="outline" size="sm" className="flex-1 lg:flex-none text-destructive"><LogOut className="mr-2 h-4 w-4" /> Logout</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats?.map((stat) => (
            <Card key={stat.type} className="bg-card/50">
              <CardContent className="pt-6">
                <div className="text-xs font-bold uppercase text-muted-foreground mb-1">{stat.type.replace('_', ' ')}</div>
                <div className="text-3xl font-bold mb-2">{stat.total_registrations}</div>
                <div className="flex gap-3 text-xs font-medium">
                  <span className="text-green-500">Confirmed: {stat.confirmed}</span>
                  <span className="text-yellow-600">Pending: {stat.pending}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="inline-flex w-full md:grid md:grid-cols-4 min-w-[600px]">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="teams">Teams ({teams.length})</TabsTrigger>
              <TabsTrigger value="sponsors">Sponsors ({sponsors.sponsors.length})</TabsTrigger>
              <TabsTrigger value="visitors">Visitors</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="pt-6">
             <div className="grid md:grid-cols-2 gap-6">
                <Card><CardHeader><CardTitle>Latest Activity</CardTitle></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">System is live. Last sync: {lastRefresh.toLocaleTimeString()}</p></CardContent></Card>
                <Card><CardHeader><CardTitle>Revenue Overview</CardTitle></CardHeader>
                <CardContent><div className="text-2xl font-bold text-blue-500">₹{sponsors.totals.potential_revenue.toLocaleString()}</div><p className="text-xs text-muted-foreground">Potential from all tiers</p></CardContent></Card>
             </div>
             
             {/* Game Categories Overview */}
             <Card className="mt-6">
               <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                   <Gamepad2 className="h-5 w-5 text-blue-600" />
                   Team Registrations by Game
                 </CardTitle>
               </CardHeader>
               <CardContent>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                   {['bgmi', 'mobile_legends', 'valorant', 'cs_go', 'fifa'].map((game) => {
                     const gameTeams = teams.filter(team => team.games?.name === game);
                     const confirmedGameTeams = gameTeams.filter(team => team.status === 'confirmed');
                     const displayName = game === 'bgmi' ? 'BGMI' : 
                                      game === 'mobile_legends' ? 'Mobile Legends' :
                                      game === 'cs_go' ? 'CS:GO' :
                                      game.charAt(0).toUpperCase() + game.slice(1);
                     return (
                       <div key={game} className="text-center p-4 bg-muted/30 rounded-lg border">
                         <div className="text-lg font-bold mb-1">🎮 {displayName}</div>
                         <div className="text-2xl font-bold text-primary mb-1">{gameTeams.length}</div>
                         <div className="text-xs text-muted-foreground">
                           {confirmedGameTeams.length} confirmed
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6 pt-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-muted/30 p-4 rounded-lg">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Select value={teamFilters.status || 'all'} onValueChange={(v) => setTeamFilters({...teamFilters, status: v==='all'?null:v})}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem></SelectContent>
                </Select>
                <Select value={teamFilters.type || 'all'} onValueChange={(v) => setTeamFilters({...teamFilters, type: v==='all'?null:v})}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent><SelectItem value="all">All Types</SelectItem><SelectItem value="college">College</SelectItem><SelectItem value="open_category">Open</SelectItem></SelectContent>
                </Select>
                <Select value={teamFilters.game || 'all'} onValueChange={(v) => setTeamFilters({...teamFilters, game: v==='all'?null:v})}>
                  <SelectTrigger className="w-[140px]"><SelectValue placeholder="Game" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Games</SelectItem>
                    <SelectItem value="bgmi">🎮 BGMI</SelectItem>
                    <SelectItem value="mobile_legends">🎮 MLBB</SelectItem>
                    <SelectItem value="valorant">🎮 Valorant</SelectItem>
                    <SelectItem value="cs_go">🎮 CS:GO</SelectItem>
                    <SelectItem value="fifa">🎮 FIFA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={() => handleExportData('teams')} className="w-full md:w-auto"><Download className="mr-2 h-4 w-4" /> Export Teams</Button>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="overflow-hidden">
                  <div className="bg-primary/5 px-6 py-4 border-b flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold">{team.team_name}</h3>
                        {getStatusBadge(team.status)}
                      </div>
                      <div className="flex items-center gap-2 mb-1">
                        <Gamepad2 className="h-4 w-4 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-bold text-sm px-3 py-1">
                          🎮 {team.games?.name === 'bgmi' ? 'BGMI' : 
                               team.games?.name === 'mobile_legends' ? 'Mobile Legends' :
                               team.games?.name === 'cs_go' ? 'CS:GO' :
                               team.games?.name ? team.games.name.charAt(0).toUpperCase() + team.games.name.slice(1).replace('_', ' ') : 'Unknown Game'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <Badge variant="outline" className="text-xs">
                          {team.registration_type === 'college' ? '🏫 College' : '🌟 Open Category'}
                        </Badge>
                        {team.colleges?.name && (
                          <>
                            <span className="text-sm text-muted-foreground">•</span>
                            <span className="text-sm text-muted-foreground">{team.colleges.name}</span>
                          </>
                        )}
                      </div>
                      {/* Game Category Highlight */}
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2">
                          <Gamepad2 className="h-3 w-3 text-blue-600" />
                          <span className="text-xs font-bold text-blue-800 uppercase tracking-wide">
                            Game Category: {team.games?.name === 'bgmi' ? 'BGMI' : 
                                           team.games?.name === 'mobile_legends' ? 'Mobile Legends' :
                                           team.games?.name === 'cs_go' ? 'CS:GO' :
                                           team.games?.name ? team.games.name.charAt(0).toUpperCase() + team.games.name.slice(1).replace('_', ' ') : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Select value={team.status} onValueChange={(v) => handleUpdateTeamStatus(team.id, v)}>
                        <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="grid lg:grid-cols-3 gap-8">
                      {/* Main Players */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary flex justify-between items-center">
                          <span>Main Squad</span>
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                            {team.games?.name === 'bgmi' ? 'BGMI' : 
                             team.games?.name === 'mobile_legends' ? 'Mobile Legends' :
                             team.games?.name === 'cs_go' ? 'CS:GO' :
                             team.games?.name ? team.games.name.charAt(0).toUpperCase() + team.games.name.slice(1).replace('_', ' ') : 'Unknown'}
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          {team.team_members?.filter((m:any) => !m.is_substitute).map((p:any) => (
                            <div key={p.id} className="text-sm p-2 bg-muted/50 rounded border border-border/50">
                              <span className="font-bold block">{p.ign || 'No IGN'}</span>
                              <span className="text-[10px] text-muted-foreground uppercase font-mono">ID: {p.game_id || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Substitutes */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-orange-500 flex justify-between items-center">
                          <span>Substitutes</span>
                          <Badge variant="outline" className="text-xs">
                            {team.substitutes} players
                          </Badge>
                        </h4>
                        <div className="space-y-2">
                          {team.team_members?.filter((m:any) => m.is_substitute).length > 0 ? (
                            team.team_members?.filter((m:any) => m.is_substitute).map((p:any) => (
                              <div key={p.id} className="text-sm p-2 bg-orange-500/5 rounded border border-orange-500/20">
                                <span className="font-bold block">{p.ign || 'No IGN'}</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-mono">ID: {p.game_id || 'N/A'}</span>
                              </div>
                            ))
                          ) : <p className="text-xs text-muted-foreground italic">No substitutes registered</p>}
                        </div>
                      </div>
                      {/* Contact Info */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Point of Contact</h4>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" /> <span>{team.captain_name} (Captain)</span></div>
                          <div className="flex items-center gap-2 text-sm"><Mail className="h-4 w-4 text-primary" /> <span className="break-all">{team.captain_email}</span></div>
                          <div className="flex items-center gap-2 text-sm"><Phone className="h-4 w-4 text-primary" /> <span>{team.captain_phone}</span></div>
                        </div>
                        <div className="pt-4 border-t">
                          <p className="text-[10px] text-muted-foreground uppercase font-semibold">Registered On</p>
                          <p className="text-xs">{new Date(team.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sponsors" className="pt-6 space-y-6">
             <div className="flex justify-between items-center bg-card p-4 rounded-lg border">
                <h3 className="font-bold">Total Sponsors: {sponsors.sponsors.length}</h3>
                <Button variant="outline" onClick={() => handleExportData('sponsors')} size="sm"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
             </div>
             <div className="grid gap-4">
               {sponsors.sponsors.map((s: any) => (
                 <Card key={s.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                   <div>
                     <div className="flex items-center gap-2">
                       <h4 className="font-bold">{s.company_name}</h4>
                       <Badge variant="secondary">{s.sponsorship_tiers?.name}</Badge>
                     </div>
                     <p className="text-sm text-muted-foreground">{s.contact_person} • {s.contact_email}</p>
                   </div>
                   <div className="flex items-center gap-3 w-full md:w-auto">
                     <Select value={s.status} onValueChange={(v) => handleUpdateSponsorStatus(s.id, v)}>
                        <SelectTrigger className="w-full md:w-32"><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="contacted">Contacted</SelectItem><SelectItem value="confirmed">Confirmed</SelectItem></SelectContent>
                     </Select>
                     <div className="text-right min-w-[80px]">
                       <div className="text-xs font-bold">₹{s.sponsorship_tiers?.price?.toLocaleString() || 'N/A'}</div>
                     </div>
                   </div>
                 </Card>
               ))}
             </div>
          </TabsContent>

          <TabsContent value="visitors" className="pt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Visitor Records</CardTitle>
                <Button onClick={() => handleExportData('visitors')} size="sm"><Download className="mr-2 h-4 w-4" /> Export</Button>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {visitors.visitors.map((v: any) => (
                    <div key={v.id} className="p-4 border rounded-lg bg-muted/20">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold">{v.full_name}</div>
                        {getStatusBadge(v.status)}
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div className="flex items-center gap-1"><Mail className="h-3 w-3" /> {v.email}</div>
                        <div className="flex items-center gap-1"><Phone className="h-3 w-3" /> {v.phone}</div>
                      </div>
                      <div className="mt-3 pt-3 border-t flex justify-end">
                        <Select value={v.status} onValueChange={(val) => handleUpdateVisitorStatus(v.id, val)}>
                          <SelectTrigger className="w-28 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                          <SelectContent><SelectItem value="confirmed">Confirmed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;