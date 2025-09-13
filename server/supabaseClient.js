import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// Get credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error('Missing SUPABASE_URL environment variable')
}

if (!supabaseKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

// Test the connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true })
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
    } else {
      console.log('✅ Supabase connection successful')
    }
  } catch (err) {
    console.warn('Supabase connection test failed:', err.message)
  }
}

// Test connection on startup
testConnection()

export default supabase
