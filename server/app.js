import express from 'express'
import cors from 'cors'
import supabase from './supabaseClient.js'

const app = express()

  try {
    const { email, password, name } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) throw authError

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id,
        name,
        email,
        role: 'user'
      }])

    if (profileError) throw profileError

    res.status(201).json({ message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

})

// Admin Registration
authRouter.post('/admin/register', async (req, res) => {
  try {
    const { email, password, name, adminSecret } = req.body

    if (!email || !password || !name || !adminSecret) {
      return res.status(400).json({ error: 'Email, password, name, and admin secret are required' })
    }

    // Verify admin secret (you should store this in environment variables)
    if (adminSecret !== 'your-admin-secret') {
      return res.status(403).json({ error: 'Invalid admin secret' })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password
    })

    if (authError) throw authError

    // Create admin profile
    const { error: profileError } = await supabase
      .from('users')
      .insert([{ 
        id: authData.user.id,
        name,
        email,
        role: 'admin'
      }])

    if (profileError) throw profileError

    res.status(201).json({ message: 'Admin registered successfully' })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Admin Login
authRouter.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Verify admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userError) throw userError

    if (userData.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required')
    }

    res.json({
      user: data.user,
      role: userData.role,
      session: data.session
    })
  } catch (error) {
    res.status(401).json({ error: error.message })
  }
})

// Mount auth routes
app.use('/auth', authRouter)

// Start server
app.listen(3000, () => console.log('Server running on http://localhost:3000'))
