import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );

  try {
    // Look up the primary user to assign these OCR offers to
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    if (userError || !users?.users?.length) {
      throw new Error('Failed to identify target user for OCR ingestion.');
    }
    
    // Assign to the first user found (for this single-tenant prototype architecture)
    const targetUserId = users.users[0].id;

    const offerData = req.body;

    const dbPayload = {
      user_id: targetUserId,
      platform: offerData.platform || 'Spark',
      pay: offerData.pay,
      tips: offerData.tips || 0,
      miles: offerData.miles,
      miles_back: offerData.miles_back || 0,
      time_minutes: offerData.time_minutes || 30,
      items: offerData.items || 0,
      dropoff_zone: offerData.dropoff_zone || 'Unknown',
      rating: offerData.rating || 'Pending',
      net_profit: offerData.net_profit || offerData.pay,
      hourly_rate: offerData.hourly_rate || 0,
      per_mile_rate: offerData.per_mile_rate || 0,
      gas_cost: offerData.gas_cost || 0
    };

    const { error: insertError } = await supabase.from('offers').insert([dbPayload]);
    if (insertError) throw insertError;

    return res.status(200).json({ success: true, message: 'Telemetry uplink secured' });
  } catch (error) {
    console.error('Error during OCR ingest:', error);
    return res.status(500).json({ error: error.message });
  }
}
