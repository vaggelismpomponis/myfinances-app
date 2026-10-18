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
    const getPeriodEnd = (sub) => {
      const ts = sub.current_period_end || sub.items?.data?.[0]?.current_period_end;
      return ts ? new Date(ts * 1000).toISOString() : null;
    };

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        
        if (userId) {
          let expiry = null;
          if (session.subscription) {
            try {
              const sub = await stripe.subscriptions.retrieve(session.subscription);
              expiry = getPeriodEnd(sub);
            } catch (e) {
              console.error('Error fetching subscription in checkout:', e);
            }
          }

          await supabase.from('profiles').update({
            subscription_status: 'pro',
            subscription_expiry: expiry,
            stripe_customer_id: customerId,
            has_used_trial: true
          }).eq('id', userId);
        }
        break;
      }
      case 'invoice.payment_succeeded':
      case 'invoice.paid': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          try {
            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const expiry = getPeriodEnd(sub);

            await supabase.from('profiles').update({
              subscription_status: 'pro',
              subscription_expiry: expiry,
              has_used_trial: true
            }).eq('stripe_customer_id', customerId);
          } catch (e) {
            console.error('Error handling invoice payment success:', e);
          }
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;
        const status = subscription.status; // e.g. active, canceled
        const currentPeriodEnd = getPeriodEnd(subscription);

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
