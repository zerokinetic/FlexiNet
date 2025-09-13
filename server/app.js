import express from 'express'
import cors from 'cors'
import supabase from './supabaseClient.js'

const app = express()
const PORT = process.env.PORT || 3001 // Changed to 3001 to avoid conflict with Next.js

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())

// Routes
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*')
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

// Create user endpoint
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, email }])
      .select()
    
    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({ error: error.message })
    }
    res.status(201).json(data)
  } catch (err) {
    console.error('Server error:', err)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
