import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// We need the raw body to verify the Stripe signature
export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

const mapStripeTier = (priceId) => {
  // Replace these with your actual Stripe Price IDs
  if (priceId === process.env.STRIPE_PRICE_WEEKLY) return 'weekly';
  if (priceId === process.env.STRIPE_PRICE_MONTHLY) return 'monthly';
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual';
  return 'free'; // fallback
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        
        // The userId we passed during checkout
        const userId = subscription.metadata?.userId;
        
        if (!userId) {
          console.log('No userId found in subscription metadata. Skipping.');
          break;
        }

        const priceId = subscription.items.data[0].price.id;
        const tier = mapStripeTier(priceId);
        
        // Convert unix timestamps to ISO
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        // Use the secure RPC function we created in SQL to update the user
        const { error } = await supabaseAdmin.rpc('update_user_subscription', {
          p_user_id: userId,
          p_tier: tier,
          p_status: subscription.status,
          p_stripe_customer_id: subscription.customer,
          p_stripe_subscription_id: subscription.id,
          p_current_period_end: currentPeriodEnd,
          p_cancel_at_period_end: subscription.cancel_at_period_end
        });

        if (error) {
          console.error('Failed to update Supabase subscription:', error);
          throw error;
        }
        
        console.log(`Successfully updated subscription for user ${userId} to ${tier}`);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
}
