import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '4mb', // iOS screenshots can be large
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Expecting a JSON body from the iOS Shortcut: { "image_base64": "...", "user_id": "...", "feedback_preference": "speak" | "banner" }
  const { image_base64, user_id, feedback_preference = 'speak' } = req.body;

  if (!image_base64) {
    return res.status(400).json({ error: 'Missing image_base64 in request body' });
  }

  // Initialize Supabase Admin Client
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
  );

  try {
    let targetUserId = user_id;

    // If no user_id is provided, fallback to the primary user (Single-Tenant MVP)
    if (!targetUserId) {
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      if (!userError && users?.users?.length) {
        targetUserId = users.users[0].id;
      }
    }

    const systemPrompt = `You are RunIQ, an elite AI assistant for gig economy drivers. Your job is to extract data from this delivery screenshot and evaluate it.
    
    1. Extract: Pay (total payout), Miles (total distance), Items, and Dropoff Zone.
    2. Evaluate: Is this a good offer? (Under $1.50/mile is bad. Under $15/hr net is terrible.)
    3. Generate a concise, 1-sentence punchy reasoning.
    
    Calculate the following metrics assuming 25 MPG, $3.50/gal gas, and 20 miles driven per hour on average (if time isn't visible, estimate it based on miles):
    - Gas Cost
    - Net Profit (Pay - Gas Cost)
    - $/Mile
    - Est. $/Hour
    
    Your output MUST be ONLY a valid JSON object matching exactly this structure:
    {
      "platform": "Spark",
      "pay": 22.50,
      "tips": 0.0,
      "miles": 8.2,
      "time_minutes": 25,
      "items": 15,
      "dropoff_zone": "Residential",
      "rating": "Good",
      "reasoning": "Solid $2.74/mile ratio and quick completion time.",
      "metrics": {
        "net_profit": 21.35,
        "hourly_rate": 51.24,
        "per_mile_rate": 2.74,
        "gas_cost": 1.15
      }
    }`;

    // Call Claude 3 Haiku for Vision Processing
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg", // claude handles jpeg/png/webp
                data: image_base64.replace(/^data:image\/\w+;base64,/, ''),
              },
            },
            {
              type: "text",
              text: systemPrompt
            }
          ],
        }
      ],
    });

    const content = response.content[0].text;
    let extractedData;
    
    try {
      extractedData = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        extractedData = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI JSON output");
      }
    }

    // Insert the extracted data into Supabase
    const dbPayload = {
      user_id: targetUserId || null,
      platform: extractedData.platform || 'Spark',
      pay: extractedData.pay || 0,
      tips: extractedData.tips || 0,
      miles: extractedData.miles || 0,
      miles_back: 0,
      time_minutes: extractedData.time_minutes || 30,
      items: extractedData.items || 0,
      dropoff_zone: extractedData.dropoff_zone || 'Unknown',
      rating: extractedData.rating || 'Pending',
      net_profit: extractedData.metrics?.net_profit || 0,
      hourly_rate: extractedData.metrics?.hourly_rate || 0,
      per_mile_rate: extractedData.metrics?.per_mile_rate || 0,
      gas_cost: extractedData.metrics?.gas_cost || 0
    };

    const { error: insertError } = await supabase.from('offers').insert([dbPayload]);
    if (insertError) {
      console.error('Database Insert Error:', insertError);
      // We don't throw here so we can still return the evaluation to the driver!
    }

    // Return the response formatted for the iOS Shortcut
    return res.status(200).json({
      success: true,
      feedback_action: feedback_preference, // 'speak' or 'banner'
      spoken_text: `${extractedData.rating} offer. ${extractedData.reasoning}`,
      banner_title: `RunIQ: ${extractedData.rating}`,
      banner_subtitle: `$${extractedData.pay} | ${extractedData.miles}mi | ${extractedData.items} items`,
      banner_body: extractedData.reasoning,
      data: extractedData
    });

  } catch (error) {
    console.error('iOS Ingest Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
