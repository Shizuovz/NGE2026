import { motion } from "framer-motion";
import { Users, Building2, Eye, Trophy, Gamepad2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { supabaseApiService as apiService } from "@/services/supabase-api";
import { toast } from "sonner";

const RegistrationSection = () => {
  const [registrationType, setRegistrationType] = useState<"college" | "open" | "sponsor" | "visitor" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationId, setRegistrationId] = useState("");
  const [games, setGames] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [sponsorshipTiers, setSponsorshipTiers] = useState([]);
  
  // Helper function to map sponsor type string to tier ID
  const getSponsorshipTierId = (sponsorType: string, tiers: any[]) => {
    // Direct mapping for the exact dropdown values
    const directMapping: { [key: string]: number } = {
      'Title Sponsor': 1,
      'Powered By Sponsor': 2,
      'Associate Sponsor': 3,
      'Category Partner': 4
    };
    
    return directMapping[sponsorType] || null;
  };
  
  const [formData, setFormData] = useState({
    teamName: "",
    collegeName: "",
    captainName: "",
    captainEmail: "",
    captainPhone: "",
    game: "",
    category: "",
    sponsorType: "",
    companyName: "",
    contactPerson: "",
    companyEmail: "",
    companyPhone: "",
    message: "",
    agreeTerms: false,
    teamMembers: [
      { ign: "", gameId: "" },
      { ign: "", gameId: "" },
      { ign: "", gameId: "" },
      { ign: "", gameId: "" },
      { ign: "", gameId: "" }
    ],
    substitute: { ign: "", gameId: "" }
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [gamesData, collegesData, tiersData] = await Promise.all([
          apiService.getGames(),
          apiService.getColleges(),
          apiService.getSponsorshipTiers()
        ]);
        
        setGames(gamesData);
        setColleges(collegesData);
        setSponsorshipTiers(tiersData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        toast.error('Failed to load registration data');
      }
    };
    
    loadInitialData();
  }, []);

  // Generate registration ID when type is selected
  useEffect(() => {
    if (registrationType && !registrationId) {
      const generateId = async () => {
        try {
          const id = await apiService.generateRegistrationId(registrationType);
          setRegistrationId(id);
        } catch (error) {
          console.error('Failed to generate registration ID:', error);
          toast.error('Failed to generate registration ID');
        }
      };
      
      generateId();
    }
  }, [registrationType, registrationId]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTeamMemberChange = (index: number, field: "ign" | "gameId", value: string) => {
    setFormData(prev => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubstituteChange = (field: "ign" | "gameId", value: string) => {
    setFormData(prev => ({
      ...prev,
      substitute: { ...prev.substitute, [field]: value }
    }));
  };

  const getRequiredTeamSize = () => {
    // Convert game ID to game name for comparison
    const gameData = games.find(g => g.id.toString() === formData.game);
    return gameData?.name === "bgmi" ? 4 : 5;
  };

  const getTeamMemberFields = () => {
    const requiredSize = getRequiredTeamSize();
    return formData.teamMembers.slice(0, requiredSize);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (registrationType === 'college' || registrationType === 'open') {
        // Team registration
        const teamData = {
          registrationId,
          teamName: formData.teamName,
          registrationType: registrationType === 'college' ? 'college' : 'open_category',
          gameId: formData.game,
          collegeId: registrationType === 'college' ? formData.collegeName : null,
          teamCategory: registrationType === 'open' ? formData.category : null,
          captainName: formData.captainName,
          captainEmail: formData.captainEmail,
          captainPhone: formData.captainPhone,
          teamMembers: getTeamMemberFields().map((member, index) => ({
            ...member,
            isSubstitute: false
          })),
          substitute: formData.substitute.ign ? {
            ...formData.substitute,
            isSubstitute: true
          } : null,
          additionalMessage: formData.message,
          termsAccepted: formData.agreeTerms
        };
        
        result = await apiService.submitTeamRegistration(teamData);
        toast.success(`Team registration successful! Your registration ID is: ${result.registrationId}`);
        
      } else if (registrationType === 'sponsor') {
        // Sponsor registration
        const sponsorData = {
          registrationId,
          companyName: formData.companyName,
          sponsorshipTierId: getSponsorshipTierId(formData.sponsorType, sponsorshipTiers),
          contactPerson: formData.contactPerson,
          contactEmail: formData.companyEmail,
          contactPhone: formData.companyPhone,
          message: formData.message
        };
        
        await apiService.submitSponsorRegistration(sponsorData);
        toast.success(`Sponsor registration successful! Your registration ID is: ${registrationId}`);
        
      } else if (registrationType === 'visitor') {
        // Visitor registration
        const visitorData = {
          registrationId,
          fullName: formData.captainName,
          email: formData.captainEmail,
          phone: formData.captainPhone
        };
        
        result = await apiService.submitVisitorRegistration(visitorData);
        toast.success(`Visitor registration successful! Your registration ID is: ${result.registrationId}`);
      }
      
      // Reset form after successful submission
      setFormData({
        teamName: "",
        collegeName: "",
        captainName: "",
        captainEmail: "",
        captainPhone: "",
        game: "",
        category: "",
        sponsorType: "",
        companyName: "",
        contactPerson: "",
        companyEmail: "",
        companyPhone: "",
        message: "",
        agreeTerms: false,
        teamMembers: [
          { ign: "", gameId: "" },
          { ign: "", gameId: "" },
          { ign: "", gameId: "" },
          { ign: "", gameId: "" },
          { ign: "", gameId: "" }
        ],
        substitute: { ign: "", gameId: "" }
      });
      
      setRegistrationId("");
      
    } catch (error) {
      console.error('Registration submission error:', error);
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRegistrationForm = () => {
    if (!registrationType) return null;

    const forms = {
      college: (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Inter-College Tournament Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange("teamName", e.target.value)}
                    placeholder="Enter your team name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="collegeName">College Name *</Label>
                  <Select value={formData.collegeName} onValueChange={(value) => handleInputChange("collegeName", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent>
                      {colleges.map((college) => (
                        <SelectItem key={college.id} value={college.id.toString()}>
                          {college.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="captainName">Team Captain Name *</Label>
                  <Input
                    id="captainName"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange("captainName", e.target.value)}
                    placeholder="Captain's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="captainEmail">Captain Email *</Label>
                  <Input
                    id="captainEmail"
                    type="email"
                    value={formData.captainEmail}
                    onChange={(e) => handleInputChange("captainEmail", e.target.value)}
                    placeholder="captain@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="captainPhone">Captain Phone *</Label>
                <Input
                  id="captainPhone"
                  value={formData.captainPhone}
                  onChange={(e) => handleInputChange("captainPhone", e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <Label htmlFor="game">Select Game *</Label>
                <Select value={formData.game} onValueChange={(value) => handleInputChange("game", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your tournament game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Members Section */}
              {formData.game && (
                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    Team Members ({getRequiredTeamSize()} Players Required)
                  </Label>
                  <div className="space-y-4">
                    {getTeamMemberFields().map((member, index) => (
                      <div key={index} className="grid md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-card">
                        <div>
                          <Label htmlFor={`member-${index}-ign`}>Player {index + 1} IGN *</Label>
                          <Input
                            id={`member-${index}-ign`}
                            value={member.ign}
                            onChange={(e) => handleTeamMemberChange(index, "ign", e.target.value)}
                            placeholder="Enter in-game name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`member-${index}-gameId`}>Player {index + 1} Game ID *</Label>
                          <Input
                            id={`member-${index}-gameId`}
                            value={member.gameId}
                            onChange={(e) => handleTeamMemberChange(index, "gameId", e.target.value)}
                            placeholder="Enter game ID/UID"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Substitute Player Section */}
              {formData.game && (
                <div className="p-4 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
                  <Label className="text-base font-semibold mb-4 block text-primary">
                    Substitute Player (Optional - One Permitted)
                  </Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="substitute-ign">Substitute IGN</Label>
                      <Input
                        id="substitute-ign"
                        value={formData.substitute.ign}
                        onChange={(e) => handleSubstituteChange("ign", e.target.value)}
                        placeholder="Enter substitute in-game name (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="substitute-gameId">Substitute Game ID</Label>
                      <Input
                        id="substitute-gameId"
                        value={formData.substitute.gameId}
                        onChange={(e) => handleSubstituteChange("gameId", e.target.value)}
                        placeholder="Enter substitute game ID/UID (optional)"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Optional: One substitute player can be registered for emergency replacements
                  </p>
                </div>
              )}

              <div className="bg-primary/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Team Requirements:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• BGMI: 4 players per team</li>
                  <li>• Mobile Legends: 5 players per team</li>
                  <li>• All players must be from the same college</li>
                  <li>• Valid college ID required for verification</li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the tournament rules and terms of participation *
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={!formData.agreeTerms}>
                Submit College Registration
              </Button>
            </form>
          </CardContent>
        </Card>
      ),

      open: (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-orange-500" />
              Open Category Tournament Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName">Team Name *</Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => handleInputChange("teamName", e.target.value)}
                    placeholder="Enter your team name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Team Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professionals">Working Professionals</SelectItem>
                      <SelectItem value="semi-pro">Semi-Professional Gamers</SelectItem>
                      <SelectItem value="community">Community Teams</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="captainName">Team Captain Name *</Label>
                  <Input
                    id="captainName"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange("captainName", e.target.value)}
                    placeholder="Captain's full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="captainEmail">Captain Email *</Label>
                  <Input
                    id="captainEmail"
                    type="email"
                    value={formData.captainEmail}
                    onChange={(e) => handleInputChange("captainEmail", e.target.value)}
                    placeholder="captain@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="captainPhone">Captain Phone *</Label>
                <Input
                  id="captainPhone"
                  value={formData.captainPhone}
                  onChange={(e) => handleInputChange("captainPhone", e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div>
                <Label htmlFor="game">Select Game *</Label>
                <Select value={formData.game} onValueChange={(value) => handleInputChange("game", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your tournament game" />
                  </SelectTrigger>
                  <SelectContent>
                    {games.map((game) => (
                      <SelectItem key={game.id} value={game.id.toString()}>
                        {game.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Members Section */}
              {formData.game && (
                <div>
                  <Label className="text-base font-semibold mb-4 block">
                    Team Members ({getRequiredTeamSize()} Players Required)
                  </Label>
                  <div className="space-y-4">
                    {getTeamMemberFields().map((member, index) => (
                      <div key={index} className="grid md:grid-cols-2 gap-4 p-4 border border-border rounded-lg bg-card">
                        <div>
                          <Label htmlFor={`open-member-${index}-ign`}>Player {index + 1} IGN *</Label>
                          <Input
                            id={`open-member-${index}-ign`}
                            value={member.ign}
                            onChange={(e) => handleTeamMemberChange(index, "ign", e.target.value)}
                            placeholder="Enter in-game name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor={`open-member-${index}-gameId`}>Player {index + 1} Game ID *</Label>
                          <Input
                            id={`open-member-${index}-gameId`}
                            value={member.gameId}
                            onChange={(e) => handleTeamMemberChange(index, "gameId", e.target.value)}
                            placeholder="Enter game ID/UID"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Substitute Player Section */}
              {formData.game && (
                <div className="p-4 border-2 border-dashed border-orange-500/30 rounded-lg bg-orange-500/5">
                  <Label className="text-base font-semibold mb-4 block text-orange-500">
                    Substitute Player (Optional - One Permitted)
                  </Label>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="open-substitute-ign">Substitute IGN</Label>
                      <Input
                        id="open-substitute-ign"
                        value={formData.substitute.ign}
                        onChange={(e) => handleSubstituteChange("ign", e.target.value)}
                        placeholder="Enter substitute in-game name (optional)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="open-substitute-gameId">Substitute Game ID</Label>
                      <Input
                        id="open-substitute-gameId"
                        value={formData.substitute.gameId}
                        onChange={(e) => handleSubstituteChange("gameId", e.target.value)}
                        placeholder="Enter substitute game ID/UID (optional)"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Optional: One substitute player can be registered for emergency replacements
                  </p>
                </div>
              )}

              <div className="bg-orange-500/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Open Category Details:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Open to professionals, semi-pros, and community teams</li>
                  <li>• Higher competition level than college category</li>
                  <li>• Direct entry to tournament brackets</li>
                  <li>• Prize pool separate from college tournament</li>
                </ul>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="agreeTerms"
                  checked={formData.agreeTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeTerms", checked as boolean)}
                />
                <Label htmlFor="agreeTerms" className="text-sm">
                  I agree to the tournament rules and terms of participation *
                </Label>
              </div>

              <Button type="submit" className="w-full">
                Register Team
              </Button>
            </form>
          </CardContent>
        </Card>
      ),

      sponsor: (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-secondary" />
              Sponsorship Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="sponsorType">Sponsorship Tier *</Label>
                <Select value={formData.sponsorType} onValueChange={(value) => setFormData({ ...formData, sponsorType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sponsorship tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Title Sponsor">Title Sponsor (₹5,00,000+)</SelectItem>
                    <SelectItem value="Powered By Sponsor">Powered By Sponsor (₹2,50,000)</SelectItem>
                    <SelectItem value="Associate Sponsor">Associate Sponsor (₹1,00,000)</SelectItem>
                    <SelectItem value="Category Partner">Category Partner (Custom/In-Kind)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange("companyName", e.target.value)}
                  placeholder="Your company name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="contactPerson">Contact Person *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange("contactPerson", e.target.value)}
                  placeholder="Name of contact person"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyEmail">Email *</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                    placeholder="company@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="companyPhone">Phone *</Label>
                  <Input
                    id="companyPhone"
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Additional Information</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Tell us about your sponsorship interests or any specific requirements"
                  rows={4}
                />
              </div>

              <Button type="submit" className="w-full">
                Submit Sponsorship Inquiry
              </Button>
            </form>
          </CardContent>
        </Card>
      ),

      visitor: (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-accent" />
              Visitor Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="captainName">Full Name *</Label>
                  <Input
                    id="captainName"
                    value={formData.captainName}
                    onChange={(e) => handleInputChange("captainName", e.target.value)}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="captainEmail">Email *</Label>
                  <Input
                    id="captainEmail"
                    type="email"
                    value={formData.captainEmail}
                    onChange={(e) => handleInputChange("captainEmail", e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="captainPhone">Phone *</Label>
                <Input
                  id="captainPhone"
                  value={formData.captainPhone}
                  onChange={(e) => handleInputChange("captainPhone", e.target.value)}
                  placeholder="+91 98765 43210"
                  required
                />
              </div>

              <div className="bg-accent/10 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Visitor Benefits:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Free entry to the expo</li>
                  <li>• Watch live tournament matches</li>
                  <li>• Access to expo zones and showcases</li>
                  <li>• Networking opportunities</li>
                  <li>• Exclusive merchandise discounts</li>
                </ul>
              </div>

              <Button type="submit" className="w-full">
                Register as Visitor
              </Button>
            </form>
          </CardContent>
        </Card>
      )
    };

    return forms[registrationType as keyof typeof forms];
  };

  if (registrationType) {
    return (
      <section id="register" className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              variant="outline"
              onClick={() => setRegistrationType(null)}
              className="mb-4"
            >
              ← Back to Registration Options
            </Button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {renderRegistrationForm()}
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="register" className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="font-['Rajdhani'] text-4xl md:text-5xl font-bold mb-4">
            Register for <span className="text-gradient">NGE 2026</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join Northeast India's biggest gaming expo. Choose your registration type below.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          <motion.div
            className="rounded-2xl border border-border bg-card p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0 * 0.15 }}
            onClick={() => setRegistrationType("college")}
          >
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-['Rajdhani'] text-xl font-bold text-foreground mb-3">College Team</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Register your college team for BGMI or Mobile Legends tournaments
            </p>
            <Button className="w-full glow-primary">Register Now</Button>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            onClick={() => setRegistrationType("open")}
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
            <h3 className="font-['Rajdhani'] text-xl font-bold text-foreground mb-3">Open Category</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Professionals, semi-pros, and community teams
            </p>
            <Button className="w-full" variant="outline">Register Now</Button>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onClick={() => setRegistrationType("sponsor")}
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Building2 className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="font-['Rajdhani'] text-xl font-bold text-foreground mb-3">Sponsorship</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Partner with us and showcase your brand
            </p>
            <Button className="w-full" variant="outline">Become Partner</Button>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-8 text-center hover:shadow-xl transition-all group cursor-pointer"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            onClick={() => setRegistrationType("visitor")}
          >
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform">
              <Eye className="h-8 w-8 text-accent" />
            </div>
            <h3 className="font-['Rajdhani'] text-xl font-bold text-foreground mb-3">Visitor</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Free entry for spectators and gaming enthusiasts
            </p>
            <Button className="w-full" variant="outline">Sign Up</Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default RegistrationSection;
