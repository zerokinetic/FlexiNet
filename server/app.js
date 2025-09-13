import express from 'express'
import cors from 'cors'
import supabase from './supabaseClient.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { validateSubscriptionAccess, extendSubscription } from './utils/subscriptionHelpers.js'

const app = express()
const router = express.Router()
const authRouter = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key' // In production, use environment variable

// Middleware
app.use(cors())
app.use(express.json())

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' })
  }

  try {
    const user = jwt.verify(token, JWT_SECRET)
    req.user = user
    next()
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' })
  }
}

// Role-based authorization middleware
const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403).json({ error: 'Admin access required' })
  }
}

// Plan Management Routes
// List active plans
app.get('/plans', async (req, res) => {
  try {
    const { product_id, as_of } = req.query
    let query = supabase.from('plans').select('id, name, price, quota_gb, features')

    if (product_id) {
      query = query.eq('product_id', product_id)
    }

    if (as_of) {
      query = query.lte('start_date', as_of)
        .gte('end_date', as_of)
    }

    const { data, error } = await query.order('price', { ascending: true })
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    
    res.json(data)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Create new plan (admin only)
app.post('/plans', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, price, quota_gb, features, start_date, end_date, product_id } = req.body

    if (!name || !price || !quota_gb || !product_id) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const { data: newPlan, error } = await supabase
      .from('plans')
      .insert([{
        name,
        price,
        quota_gb,
        features,
        start_date,
        end_date,
        product_id,
        created_by: req.user.id
      }])
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json(newPlan)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Update plan (admin only)
app.patch('/plans/:id', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Remove any undefined fields
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key])

    const { data: updatedPlan, error } = await supabase
      .from('plans')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Plan not found' })
    }

    res.json(updatedPlan)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// User Registration
authRouter.post('/register', async (req, res) => {
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
