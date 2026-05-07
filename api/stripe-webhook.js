import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Needs admin bypass for webhooks
);

// Disable Next.js body parsing (if this was Next.js), but for Vercel raw body:
export const config = {
  api: { bodyParser: false }
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        
        if (userId) {
          // They just subscribed. We don't get expiry here, but we get it on subscription.updated
          await supabase.from('profiles').update({
            subscription_status: 'pro',
            stripe_customer_id: customerId
          }).eq('id', userId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // e.g. active, canceled
        const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

        let subStatus = 'free';
        if (status === 'active' || status === 'trialing') subStatus = 'pro';
        if (status === 'canceled') subStatus = 'cancelled';

        await supabase.from('profiles').update({
          subscription_status: subStatus,
          subscription_expiry: currentPeriodEnd
        }).eq('stripe_customer_id', customerId);
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook handler error:', err);
    res.status(500).send('Webhook handler failed');
  }
}
