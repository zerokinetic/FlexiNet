const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// Signup endpoint
router.post('/signup', async (req, res) => {
  const { Name, Phone, Email, Status, role, password } = req.body;
  try {
    // Find max User Id and increment for new user
    const { data: maxIdData } = await supabase
      .from('User_Data')
      .select('User Id', { head: false })
      .order('User Id', { ascending: false })
      .limit(1);
    const newUserId = maxIdData && maxIdData.length > 0 ? maxIdData[0]["User Id"] + 1 : 1;

    const { data, error } = await supabase
      .from('User_Data')
      .insert([
        { "User Id": newUserId, Name, Phone, Email, Status, role, password }
      ]);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, role });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Signin endpoint
router.post('/signin', async (req, res) => {
  const { Email, Name } = req.body;
  try {
    const { data, error } = await supabase
      .from('User_Data')
      .select('role')
      .eq('Email', Email)
      .eq('Name', Name)
      .limit(1);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    if (data && data.length > 0) {
      return res.json({ success: true, role: data[0].role });
    } else {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
