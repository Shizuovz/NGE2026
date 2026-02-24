import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { isAuthenticated, isLoading, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [teams, setTeams] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Redirect to login if not authenticated
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

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [overviewStats, teamData, sponsorData] = await Promise.all([
        supabaseApiService.getOverviewStats(),
        supabaseApiService.getTeamStats(),
        supabaseApiService.getSponsorStats()
      ]);
      
      setStats(overviewStats);
      setTeams(teamData);
      setSponsors(sponsorData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadAdminData();
  };

  const handleExportData = async (type: 'teams' | 'sponsors' | 'visitors') => {
    try {
      let data;
      let filename;
      
      switch (type) {
        case 'teams':
          data = await supabaseApiService.getTeamStats();
          filename = 'nge-2026-team-registrations.csv';
          break;
        case 'sponsors':
          data = await supabaseApiService.getSponsorStats();
          filename = 'nge-2026-sponsor-registrations.csv';
          break;
        case 'visitors':
          const visitorData = await supabaseApiService.getOverviewStats();
          data = visitorData.filter(stat => stat.type === 'visitor');
          filename = 'nge-2026-visitor-registrations.csv';
          break;
      }
      
      const csv = convertToCSV(data, type);
      downloadCSV(csv, filename);
      toast.success(`Exported ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };

  const convertToCSV = (data: any[], type: string) => {
    if (type === 'teams') {
      const headers = ['Registration ID', 'Team Name', 'Type', 'Game', 'College', 'Captain Name', 'Captain Email', 'Captain Phone', 'Status', 'Players', 'Substitutes', 'Created At'];
      const rows = data.map(team => [
        team.registration_id,
        team.team_name,
        team.registration_type,
        team.game_name,
        team.college_name || 'N/A',
        team.captain_name,
        team.captain_email,
        team.captain_phone,
        team.status,
        team.main_players,
        team.substitutes,
        new Date(team.created_at).toLocaleString()
      ]);
      return [headers, ...rows];
    } else if (type === 'sponsors') {
      const headers = ['Registration ID', 'Company Name', 'Tier', 'Contact Person', 'Email', 'Phone', 'Status', 'Created At'];
      const rows = data.sponsors.map(sponsor => [
        sponsor.registration_id,
        sponsor.company_name,
        sponsor.tier_name || 'N/A',
        sponsor.contact_person,
        sponsor.contact_email,
        sponsor.contact_phone,
        sponsor.status,
        new Date(sponsor.created_at).toLocaleString()
      ]);
      return [headers, ...rows];
    } else if (type === 'visitors') {
      const headers = ['Registration ID', 'Full Name', 'Email', 'Phone', 'Status', 'Created At'];
      const rows = data.map(visitor => [
        visitor.registration_id,
        visitor.full_name,
        visitor.email,
        visitor.phone,
        visitor.status,
        new Date(visitor.created_at).toLocaleString()
      ]);
      return [headers, ...rows];
    }
    return [[], []];
  };

  const downloadCSV = (csv: string[], filename: string) => {
    const csvContent = csv.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    const color = status === 'confirmed' ? 'bg-green-500' : status === 'pending' ? 'bg-yellow-500' : 'bg-red-500';
    return <Badge className={`${color} text-white`}>{status}</Badge>;
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Return null if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <img 
                src="/NGE.png" 
                alt="NGE 2026 Logo" 
                className="h-10 w-auto"
              />
              <div>
                <h1 className="font-['Rajdhani'] text-3xl md:text-4xl font-bold text-foreground">
                  Admin <span className="text-gradient">Dashboard</span>
                </h1>
                <p className="text-muted-foreground">
                  Manage NGE 2026 registrations and view statistics
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={logout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <span className="text-sm text-muted-foreground">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                Registration Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {stats.map((stat) => (
                    <div key={stat.type} className="text-center">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        {stat.total_registrations}
                      </div>
                      <div className="text-sm text-muted-foreground mb-1">
                        {stat.type}
                      </div>
                      <div className="flex justify-center gap-2 text-sm">
                        <span className="text-green-600">{stat.confirmed}</span>
                        <span className="text-yellow-600">{stat.pending}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="teams" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Teams
              <Badge variant="secondary" className="ml-2">
                {teams?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Sponsors
              <Badge variant="secondary" className="ml-2">
                {sponsors?.sponsors?.length || 0}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Visitors
              <Badge variant="secondary" className="ml-2">
                {stats?.find(s => s.type === 'visitor')?.total_registrations || 0}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    College Teams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {stats?.find(s => s.type === 'college')?.total_registrations || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.find(s => s.type === 'college')?.confirmed || 0} confirmed
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-orange-500" />
                    Open Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {stats?.find(s => s.type === 'open_category')?.total_registrations || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.find(s => s.type === 'open_category')?.confirmed || 0} confirmed
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-secondary" />
                    Sponsors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {sponsors?.totals?.total_sponsors || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sponsors?.totals?.confirmed_sponsors || 0} confirmed
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-accent" />
                    Visitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="animate-pulse bg-muted rounded-lg h-20"></div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-foreground mb-2">
                        {stats?.find(s => s.type === 'visitor')?.total_registrations || 0}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {stats?.find(s => s.type === 'visitor')?.confirmed || 0} confirmed
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="teams">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Team Registrations
                  </div>
                  <Button onClick={() => handleExportData('teams')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {teams.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No team registrations yet
                      </div>
                    ) : (
                      teams.map((team) => (
                        <Card key={team.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{team.team_name}</h3>
                                {getStatusBadge(team.status)}
                              </div>
                              <Badge variant="outline">
                                {team.registration_type === 'college' ? 'College' : 'Open'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Game:</span>
                                <span className="font-medium ml-2">{team.game_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">College:</span>
                                <span className="font-medium ml-2">{team.college_name || 'N/A'}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Captain:</span>
                                <span className="font-medium ml-2">{team.captain_name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Players:</span>
                                <span className="font-medium ml-2">{team.main_players}/{team.required_size}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm">
                              <div>
                                <span className="text-muted-foreground">Contact:</span>
                                <span className="font-medium ml-2">{team.captain_email}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Registered:</span>
                                <span className="font-medium ml-2">
                                  {new Date(team.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sponsors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-secondary" />
                    Sponsor Registrations
                  </div>
                  <Button onClick={() => handleExportData('sponsors')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {sponsors.sponsors.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No sponsor registrations yet
                      </div>
                    ) : (
                      sponsors.sponsors.map((sponsor) => (
                        <Card key={sponsor.id} className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-semibold text-lg">{sponsor.company_name}</h3>
                                {getStatusBadge(sponsor.status)}
                              </div>
                              <Badge variant="outline">
                                {sponsor.tier_name || 'No Tier'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Contact:</span>
                                <span className="font-medium ml-2">{sponsor.contact_person}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Email:</span>
                                <span className="font-medium ml-2">{sponsor.contact_email}</span>
                              </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Phone:</span>
                                <span className="font-medium ml-2">{sponsor.contact_phone}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Registered:</span>
                                <span className="font-medium ml-2">
                                  {new Date(sponsor.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            
                            {sponsor.message && (
                              <div className="mt-4 p-3 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                  {sponsor.message}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visitors">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-accent" />
                    Visitor Registrations
                  </div>
                  <Button onClick={() => handleExportData('visitors')} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse bg-muted rounded-lg h-20"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {stats?.find(s => s.type === 'visitor')?.total_registrations === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">
                        No visitor registrations yet
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        Visitor registrations data will appear here once registrations are submitted
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
