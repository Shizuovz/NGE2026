// Simple test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js';

// Load environment variables
const supabaseUrl = 'https://tgugghvvieuoehspztpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRndWdnaHZ2aWV1b2Voc3B6dHBsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NDc1NjksImV4cCI6MjA4NzQyMzU2OX0.8d_UeOpoU16ZxkKmop1Cz4BN21WJu7KZfE6ehV9DjQs';

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Anon Key:', supabaseAnonKey.substring(0, 20) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection by checking if we can access the database
async function testConnection() {
  try {
    console.log('\n🔍 Testing database connection...');
    
    // Test 1: Check if we can read from games table
    console.log('📊 Testing games table access...');
    const { data: games, error: gamesError } = await supabase
      .from('games')
      .select('id, name, team_size')
      .limit(1);
    
    if (gamesError) {
      console.error('❌ Games table error:', gamesError);
      console.log('💡 You may need to run the database schema first');
      return false;
    }
    
    console.log('✅ Games table accessible:', games?.length || 0, 'records found');
    
    // Test 2: Check if colleges table exists
    console.log('🏫 Testing colleges table access...');
    const { data: colleges, error: collegesError } = await supabase
      .from('colleges')
      .select('id, name')
      .limit(1);
    
    if (collegesError) {
      console.error('❌ Colleges table error:', collegesError);
    } else {
      console.log('✅ Colleges table accessible:', colleges?.length || 0, 'records found');
    }
    
    // Test 3: Check if teams table exists
    console.log('👥 Testing teams table access...');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('id, team_name')
      .limit(1);
    
    if (teamsError) {
      console.error('❌ Teams table error:', teamsError);
    } else {
      console.log('✅ Teams table accessible:', teams?.length || 0, 'records found');
    }
    
    // Test 4: Check RLS policies
    console.log('🔒 Testing Row Level Security...');
    const { data: rlsTest, error: rlsError } = await supabase
      .from('games')
      .select('*');
    
    if (rlsError) {
      console.error('❌ RLS error:', rlsError);
    } else {
      console.log('✅ RLS policies working:', rlsTest?.length || 0, 'games accessible');
    }
    
    console.log('\n🎉 Supabase connection test completed successfully!');
    console.log('📋 Your database is ready for the NGE 2026 registration system.');
    
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    console.log('\n💡 Troubleshooting:');
    console.log('1. Check if your Supabase project URL is correct');
    console.log('2. Verify your anon key is valid');
    console.log('3. Make sure you ran the database schema in Supabase SQL Editor');
    console.log('4. Check if RLS policies are properly configured');
    return false;
  }
}

// Run the test
testConnection().then(success => {
  if (success) {
    console.log('\n✅ All tests passed! You can now start the development server.');
    console.log('💻 Run: npm run dev');
  } else {
    console.log('\n❌ Some tests failed. Please fix the issues above.');
  }
}).catch(error => {
  console.error('❌ Test script failed:', error);
});
