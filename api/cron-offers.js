import { createClient } from '@supabase/supabase-js';

// Vercel Serverless Function to run as a Cron Job
// Configured in vercel.json to run periodically
export default async function handler(req, res) {
  // Verify Cron secret if deployed (Vercel adds this header)
  const authHeader = req.headers.authorization;
  if (
    process.env.CRON_SECRET && 
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );

  try {
    // Fetch all users who should receive offers
    const { data: users, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;

    const mockOffers = [];

    // Generate 1-2 mock offers for each user
    for (const user of users?.users || []) {
      const numOffers = Math.floor(Math.random() * 2) + 1;
      
      for (let i = 0; i < numOffers; i++) {
        const basePay = (Math.random() * 15 + 7).toFixed(2);
        const tips = Math.random() > 0.3 ? (Math.random() * 10).toFixed(2) : "0.00";
        const miles = (Math.random() * 8 + 1).toFixed(1);
        const time = Math.floor(Math.random() * 30 + 15);
        
        mockOffers.push({
          user_id: user.id,
          platform: "Spark",
          pay: parseFloat(basePay),
          tips: parseFloat(tips),
          miles: parseFloat(miles),
          miles_back: 0,
          time_minutes: time,
          items: Math.floor(Math.random() * 40 + 5),
          dropoff_zone: "Residential",
          rating: Math.random() > 0.5 ? "Good" : "Fair",
          metrics: {
            net_profit: (parseFloat(basePay) + parseFloat(tips) - parseFloat(miles) * 0.65).toFixed(2),
            hourly_rate: (((parseFloat(basePay) + parseFloat(tips)) / time) * 60).toFixed(2),
            per_mile_rate: ((parseFloat(basePay) + parseFloat(tips)) / parseFloat(miles)).toFixed(2),
            gas_cost: (parseFloat(miles) * 0.15).toFixed(2)
          }
        });
      }
    }

    if (mockOffers.length > 0) {
      const { error: insertError } = await supabase.from('offers').insert(mockOffers);
      if (insertError) throw insertError;
    }

    return res.status(200).json({ success: true, count: mockOffers.length });
  } catch (error) {
    console.error('Error generating cron offers:', error);
    return res.status(500).json({ error: error.message });
  }
}
