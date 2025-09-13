export const validateSubscriptionAccess = async (supabase, subscriptionId, userId) => {
  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('id', subscriptionId)
    .eq('user_id', userId)
    .single()

  if (error || !subscription) {
    return null
  }

  return subscription
}

export const extendSubscription = (subscription, months = 1) => {
  const newEndDate = new Date(subscription.end_date)
  newEndDate.setMonth(newEndDate.getMonth() + months)
  return newEndDate
}