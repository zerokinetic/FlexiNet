const express = require('express');
const router = express.Router();
const supabase = require('./supabaseClient');

// GET /plans - return all subscription plans
router.get('/plans', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('Product Id, Name, Price, Auto Renewal Allowed, Status');
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, plans: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /subscribe - subscribe a user to a plan
router.post('/subscribe', async (req, res) => {
  const { userId, productId, subscriptionType, startDate } = req.body;
  try {
    // Fetch plan details
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('Status')
      .eq('Product Id', productId)
      .single();
    if (planError || !planData) {
      return res.status(400).json({ success: false, error: 'Invalid productId or plan not found' });
    }
    // Find max Subscription Id and increment for new subscription
    const { data: maxIdData } = await supabase
      .from('subscription')
      .select('Subscription Id', { head: false })
      .order('Subscription Id', { ascending: false })
      .limit(1);
    const newSubId = maxIdData && maxIdData.length > 0 ? maxIdData[0]["Subscription Id"] + 1 : 1;

    const { data, error } = await supabase
      .from('subscription')
      .insert([
        {
          "Subscription Id": newSubId,
          "Subscription Type": subscriptionType,
          "Product Id": Number(productId),
          "User Id": Number(userId),
          Status: planData.Status,
          "Start Date": startDate,
          "Last Billed Date": '',
          "Last Renewed Date": '',
          "Terminated Date": '',
          "Grace Time": 0
        }
      ]);
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.json({ success: true, subscription: data });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
