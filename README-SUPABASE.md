# NGE 2026 Supabase Setup Guide

This guide will help you set up Supabase for the Nagaland Gaming Expo 2026 registration system. Supabase provides a managed PostgreSQL database with built-in authentication, real-time subscriptions, and a powerful API.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (free tier is sufficient)

## 🚀 Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign in"
3. Click "New Project"
4. Select your organization (or create one)
5. Enter project details:
   - **Project Name**: `NGE 2026`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (2-3 minutes)

### 2. Get Your Supabase Credentials

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy the following values:
   - **Project URL** (starts with `https://`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (for admin operations)

### 3. Set Up Database Schema

1. Go to **SQL Editor** in your Supabase project
2. Click "New query"
3. Copy and paste the entire contents of `database-schema-postgresql.sql`
4. Click "Run" to execute the schema

### 4. Configure Row Level Security (RLS)

Supabase uses RLS to secure your data. For this project, we'll allow public access for registration:

```sql
-- Allow public read access to games
CREATE POLICY "Public can view games" ON games
    FOR SELECT USING (true);

-- Allow public read access to colleges
CREATE POLICY "Public can view colleges" ON colleges
    FOR SELECT USING (true);

-- Allow public read access to sponsorship tiers
CREATE POLICY "Public can view sponsorship tiers" ON sponsorship_tiers
    FOR SELECT USING (true);

-- Allow public insert for teams
CREATE POLICY "Public can insert teams" ON teams
    FOR INSERT WITH CHECK (true);

-- Allow public read access to teams (their own data)
CREATE POLICY "Public can view teams" ON teams
    FOR SELECT USING (true);

-- Allow public insert for team members
CREATE POLICY "Public can insert team members" ON team_members
    FOR INSERT WITH CHECK (true);

-- Allow public read access to team members
CREATE POLICY "Public can view team members" ON team_members
    FOR SELECT USING (true);

-- Allow public insert for sponsor registrations
CREATE POLICY "Public can insert sponsor registrations" ON sponsor_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public read access to sponsor registrations
CREATE POLICY "Public can view sponsor registrations" ON sponsor_registrations
    FOR SELECT USING (true);

-- Allow public insert for visitor registrations
CREATE POLICY "Public can insert visitor registrations" ON visitor_registrations
    FOR INSERT WITH CHECK (true);

-- Allow public read access to visitor registrations
CREATE POLICY "Public can view visitor registrations" ON visitor_registrations
    FOR SELECT USING (true);
```

### 5. Enable RLS on Tables

```sql
-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorship_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsor_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_registrations ENABLE ROW LEVEL SECURITY;
```

## 🔧 Frontend Setup

### 1. Install Dependencies

```bash
# Install Supabase client library
npm install
```

### 2. Environment Configuration

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Server Configuration (if using backend)
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

Replace the values with your actual Supabase credentials.

### 3. Start the Frontend

```bash
npm run dev
```

The frontend should start on `http://localhost:5173`

## 🧪 Test the Connection

### 1. Check Database Connection

Open your browser and navigate to your app. The registration form should load without errors.

### 2. Test Registration

1. Click "Register Now" → "College Team"
2. Fill out the registration form
3. Submit the form
4. Check your Supabase dashboard → **Table Editor** → **teams** to see the new registration

### 3. Verify Data in Supabase

In your Supabase dashboard:

1. Go to **Table Editor**
2. Click on the `teams` table - you should see new registrations
3. Click on the `team_members` table - you should see player data
4. Click on the `visitor_registrations` table - you should see visitor data

## 📊 Real-time Features (Optional)

Supabase supports real-time subscriptions. You can add real-time updates to see registrations as they happen:

```typescript
// Example: Real-time registration updates
import { supabase } from './lib/supabase';

// Subscribe to new team registrations
const subscription = supabase
  .channel('team_registrations')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'teams' },
    (payload) => {
      console.log('New team registration:', payload.new);
      // Update your UI in real-time
    }
  )
  .subscribe();
```

## 🔍 Troubleshooting

### Common Issues

#### 1. "Invalid JWT" Error
- Make sure your `.env` file has the correct keys
- Check that you're using the `anon` key for frontend operations

#### 2. "Permission denied" Errors
- Make sure RLS policies are properly set up
- Check that RLS is enabled on the tables

#### 3. "Table not found" Error
- Make sure you ran the database schema in Supabase SQL Editor
- Check table names match exactly (case-sensitive)

#### 4. CORS Errors
- Make sure your frontend URL is added to Supabase CORS settings
- Go to **Project Settings** → **API** → **Config** → **Additional Headers**

### Database Commands in Supabase

You can run SQL commands directly in the Supabase SQL Editor:

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- View recent registrations
SELECT registration_id, team_name, status, created_at 
FROM teams 
ORDER BY created_at DESC 
LIMIT 10;

-- Check team composition
SELECT t.team_name, COUNT(tm.id) as player_count
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
GROUP BY t.id, t.team_name;
```

## 🚀 Production Considerations

### 1. Security

- Use environment variables for all secrets
- Consider implementing authentication for admin features
- Review RLS policies for production use
- Use the `service_role` key only on the backend

### 2. Performance

- Monitor your Supabase dashboard for usage
- Consider implementing pagination for large datasets
- Use Supabase Edge Functions for complex server-side logic
- Set up proper indexes for frequently queried columns

### 3. Backups

- Supabase automatically creates daily backups
- Consider additional backups for critical data
- Test your restore process

### 4. Scaling

- Supabase automatically scales PostgreSQL connections
- Monitor your usage and upgrade plan if needed
- Consider read replicas for high-traffic applications

## 📞 Support

If you encounter issues:

1. Check the Supabase dashboard for error logs
2. Review the browser console for frontend errors
3. Verify your environment variables
4. Check RLS policies in Supabase SQL Editor

For Supabase-specific issues, refer to the [Supabase Documentation](https://supabase.com/docs).

## 🎉 Next Steps

Once your Supabase is set up:

1. **Test all registration types** (college, open category, sponsor, visitor)
2. **Verify team member validation** (4 for BGMI, 5 for MLBB)
3. **Test substitute player functionality**
4. **Check statistics endpoints** for data accuracy
5. **Set up email notifications** (Supabase has built-in email)

Your NGE 2026 registration system is now running on Supabase! 🎮
