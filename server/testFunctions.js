const supabase = require('./supabaseClient.js');

// Test functions for development/testing purposes
// These can be run independently to test your Supabase connection

// Insert data
const insertData = async () => {
  try {
    const { data, error } = await supabase
      .from('User_Data')
      .insert([
        {
          "User Id": 102,
          Name: 'Heman',
          Phone: 1234567890,
          Email: 'heman@example.com',
          Status: 'active',
          role: 'user',
          password: 'Lumen@123'
        }
      ])

    if (error) {
      console.error('Insert error:', error)
      return { success: false, error }
    }
    
    console.log('✅ Inserted:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Insert exception:', err)
    return { success: false, error: err }
  }
}

// Fetch data
const fetchData = async () => {
  try {
    const { data, error } = await supabase
      .from('User_Data')
      .select('*')

    if (error) {
      console.error('Fetch error:', error)
      return { success: false, error }
    }
    
    console.log('✅ Fetched:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Fetch exception:', err)
    return { success: false, error: err }
  }
}

// Sign up user
const signUpUser = async (email = 'user10@example.com', password = 'Lumen@123') => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      console.error('Sign up error:', error)
      return { success: false, error }
    }
    
    console.log('✅ Signed up:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Sign up exception:', err)
    return { success: false, error: err }
  }
}

// Run all tests
const runAllTests = async () => {
  console.log('🧪 Running Supabase tests...\n')
  
  console.log('1. Testing data insertion...')
  await insertData()
  
  console.log('\n2. Testing data fetch...')
  await fetchData()
  
  console.log('\n3. Testing user signup...')
  await signUpUser()
  
  console.log('\n✅ All tests completed!')
}

// Uncomment the line below to run tests when this file is executed directly
runAllTests()

module.exports = {
  insertData,
  fetchData,
  signUpUser,
  runAllTests
};
