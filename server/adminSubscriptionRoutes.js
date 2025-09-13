const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// POST /add-plan - add a new subscription plan (admin only)
router.post('/add-plan', async (req, res) => {
  const { userId, productId, name, price, autoRenewalAllowed, status } = req.body;
  try {
    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from('User_Data')
      .select('role')
      .eq('User Id', userId)
      .single();
    if (userError || !userData || userData.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admin can add plans' });
    }
    // Insert new plan
    const { data, error } = await supabase
      .from('subscription_plans')
      .insert([
        {
          "Product Id": Number(productId),
          Name: name,
          Price: Number(price),
          "Auto Renewal Allowed": autoRenewalAllowed,
          Status: status
        }
      ]);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, plan: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
