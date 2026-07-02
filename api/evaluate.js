import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    platform, pay, tips, miles, miles_back, time_minutes, items, dropoff_zone, mpg, gas_price, timestamp
  } = req.body;

  if (!platform || !pay || !miles || !time_minutes) {
    return res.status(400).json({ error: 'Missing required offer details' });
  }

  // Pre-calculate hard metrics
  const total_miles = miles + (miles_back || 0);
  const gas_cost = (total_miles / (mpg || 25)) * (gas_price || 3.5);
  const net_profit = pay - gas_cost;
  const hourly_rate = (net_profit / time_minutes) * 60;
  const per_mile_rate = pay / total_miles;
  const timeString = new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const dayString = new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });

  const systemPrompt = `You are RunIQ, an elite AI assistant for gig economy drivers. Your job is to analyze delivery/rideshare offers and give brutal, context-aware advice on whether to accept or decline.

DRIVER CONTEXT:
- Time: ${timeString} on a ${dayString}
- Platform: ${platform}
- Total Payout: $${pay} (includes $${tips} tips)
- Delivery Miles: ${miles} mi
- Deadhead (Miles Back): ${miles_back || 0} mi
- Total Miles: ${total_miles} mi
- Est. Time: ${time_minutes} min
- Items: ${items || 'N/A'}
- Dropoff Zone: ${dropoff_zone || 'Unknown'}
- Gas Cost: $${gas_cost.toFixed(2)}
- Net Profit: $${net_profit.toFixed(2)}
- $/Mile: $${per_mile_rate.toFixed(2)}
- Est. $/Hour: $${hourly_rate.toFixed(2)}

EVALUATION RULES:
1. $/mile: Under $1.50/mile is generally bad. Over $2.00 is good.
2. Est. $/hour: This dictates if it beats minimum wage. Under $15/hr net is terrible.
3. Dead miles: Flag if deadhead is high relative to paid miles.
4. Dropoff Zone: Consider if the dropoff takes the driver into a dead zone or high-demand area.
5. Opportunity Cost: Consider the time of day. A mediocre order during peak rush hour (e.g. 12pm lunch, 6pm dinner Friday) is worse than the same order at 3pm Tuesday.
6. Platform Specifics:
   - Spark: Warn about heavy items for large orders. Note that tips often post-delivery.
   - DoorDash: Mention Peak Pay possibilities, beware long-distance catering.
   - Instacart: Assess item count vs pay ratio. High items + low pay = bad.
   - Uber Eats: Mention surge zone and back-to-back positioning.
7. Stack Potential: Short, high-paying orders are great bases for a double stack.

Your output MUST be a valid JSON object matching exactly this structure:
{
  "rating": "Great" | "Good" | "Fair" | "Bad",
  "reasoning": "A concise, 1-2 sentence punchy explanation tailored to a driver.",
  "flags": ["Short string flag 1", "Short string flag 2"]
}
`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 300,
      system: "You are a JSON-only API. Only output valid JSON.",
      messages: [
        { role: "user", content: systemPrompt }
      ]
    });

    const content = response.content[0].text;
    let aiResult;
    try {
      aiResult = JSON.parse(content);
    } catch (e) {
      // fallback parsing if claude included markdown blocks
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        aiResult = JSON.parse(match[0]);
      } else {
        throw new Error("Failed to parse AI JSON output");
      }
    }

    return res.status(200).json({
      ...aiResult,
      metrics: {
        total_miles,
        gas_cost,
        net_profit,
        hourly_rate,
        per_mile_rate
      }
    });

  } catch (error) {
    console.error("AI Evaluation error:", error);
    return res.status(500).json({ error: 'Failed to evaluate offer.' });
  }
}
