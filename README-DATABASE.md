# NGE 2026 Database Setup Guide

This guide will help you set up the PostgreSQL database and backend API for the Nagaland Gaming Expo 2026 registration system.

## 📋 Prerequisites

- **Node.js** (v18 or higher)
- **PostgreSQL** (v13 or higher)
- **npm** or **yarn**

## 🗄️ Database Setup

### 1. Install PostgreSQL

**Windows:**
```bash
# Download and install from https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

**macOS:**
```bash
# Using Homebrew:
brew install postgresql
brew services start postgresql
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE nge_2026;

# Create user (optional, for better security)
CREATE USER nge_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nge_2026 TO nge_user;

# Exit
\q
```

### 3. Run Database Schema

```bash
# Navigate to project directory
cd c:/projects/NGE(NESS)

# Run the PostgreSQL schema
psql -U postgres -d nge_2026 -f database-schema-postgresql.sql

# Or if you created a specific user:
psql -U nge_user -d nge_2026 -f database-schema-postgresql.sql
```

## 🔧 Backend Setup

### 1. Install Dependencies

```bash
# Install all dependencies including backend packages
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your database credentials
```

**Example `.env` file:**
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nge_2026
DB_USER=postgres
DB_PASSWORD=your_password_here

# Server Configuration
PORT=3001
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Backend Server

```bash
# For development (with auto-restart)
npm run server:dev

# Or for production
npm run server
```

The server should start on `http://localhost:3001`

## 🚀 Frontend Setup

### 1. Start the Frontend Development Server

```bash
# In a new terminal window
npm run dev
```

The frontend should start on `http://localhost:5173`

## 🧪 Test the Connection

### 1. Health Check

Open your browser or use curl to test the API:

```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2026-02-23T12:00:00.000Z",
  "service": "NGE 2026 Registration API"
}
```

### 2. Test Database Connection

The health check will also verify the database connection. Check the server console for:
- "Database connection successful"
- "All required tables are present"

## 📊 API Endpoints

### Registration Endpoints

- `GET /api/registration/games` - Get all available games
- `GET /api/registration/colleges` - Get all colleges
- `GET /api/registration/sponsorship-tiers` - Get sponsorship tiers
- `POST /api/registration/generate-id` - Generate unique registration ID
- `POST /api/registration/team` - Submit team registration
- `POST /api/registration/sponsor` - Submit sponsor registration
- `POST /api/registration/visitor` - Submit visitor registration
- `GET /api/registration/:registrationId` - Get registration details

### Statistics Endpoints

- `GET /api/stats/overview` - Overall registration statistics
- `GET /api/stats/teams` - Team registration statistics
- `GET /api/stats/sponsors` - Sponsor statistics
- `GET /api/stats/games` - Game-wise statistics
- `GET /api/stats/colleges` - College-wise statistics
- `GET /api/stats/timeline` - Registration timeline
- `GET /api/stats/incomplete-teams` - Teams with incomplete registration

## 🔍 Troubleshooting

### Common Issues

#### 1. "Connection refused" error
- Make sure PostgreSQL is running
- Check if the database exists: `psql -U postgres -l`
- Verify your `.env` file has correct credentials

#### 2. "Database connection failed"
- Check PostgreSQL service status:
  ```bash
  # Windows
  Get-Service postgresql*
  
  # macOS/Linux
  sudo systemctl status postgresql
  ```

#### 3. "Table doesn't exist" errors
- Run the schema file again: `psql -U postgres -d nge_2026 -f database-schema-postgresql.sql`
- Check if tables were created: `psql -U postgres -d nge_2026 -c "\dt"`

#### 4. Frontend can't connect to API
- Make sure both servers are running
- Check CORS settings in `.env`
- Verify the API URL in the frontend

### Database Commands

```bash
# Connect to database
psql -U postgres -d nge_2026

# List tables
\dt

# View table structure
\d teams

# Check registrations
SELECT registration_id, team_name, status FROM teams LIMIT 5;

# Reset database (if needed)
DROP DATABASE nge_2026;
CREATE DATABASE nge_2026;
# Then re-run the schema
```

## 🚀 Production Deployment

### 1. Environment Variables

Set these environment variables in production:

```env
NODE_ENV=production
DB_HOST=your_production_db_host
DB_PORT=5432
DB_NAME=nge_2026
DB_USER=your_production_user
DB_PASSWORD=your_secure_password
PORT=3001
FRONTEND_URL=https://your-domain.com
```

### 2. Security Considerations

- Use strong database passwords
- Enable SSL for database connections
- Set up proper CORS origins
- Use environment variables for all secrets
- Consider using a connection pooler like PgBouncer

### 3. Performance Optimization

- Monitor database connections
- Set up proper indexing
- Consider read replicas for high traffic
- Implement caching for frequently accessed data

## 📞 Support

If you encounter any issues:

1. Check the server console for error messages
2. Verify database connectivity with `psql`
3. Test API endpoints individually
4. Check the browser console for frontend errors

For additional help, refer to the PostgreSQL documentation or create an issue in the project repository.
