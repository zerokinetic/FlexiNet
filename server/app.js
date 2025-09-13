import supabase from './supabaseClient.js'

// Insert data
const insertData = async () => {
  const { data, error } = await supabase
    .from('users')
    .insert([{ name: 'Heman', email: 'heman@example.com' }])

  if (error) console.error(error)
  else console.log('Inserted:', data)
}

// Fetch data
const fetchData = async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*')


  if (error) console.error(error)
  else console.log('Fetched:', data)
}

insertData().then(fetchData)

const signUpUser = async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'user@example.com',
      password: 'password123'
    })
  
    if (error) console.error(error)
    else console.log('Signed up:', data)
  }
  
  signUpUser()
  

import express from 'express'
import supabase from './supabaseClient.js'

const app = express()
app.use(express.json())

app.get('/users', async (req, res) => {
  const { data, error } = await supabase.from('users').select('*')
  if (error) return res.status(500).json({ error: error.message })
  res.json(data)
})

app.listen(3000, () => console.log('Server running on http://localhost:3000'))
