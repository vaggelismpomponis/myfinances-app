import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get("Stripe-Signature")
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")

  if (!signature || !webhookSecret) {
    return new Response("Missing signature or secret", { status: 400 })
  }

  try {
    const body = await req.text()
    
    // Verify webhook signature to prevent spoofing
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    // Setup Supabase Client (bypassing RLS with SERVICE_ROLE_KEY)
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log(`Received event type: ${event.type}`)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const userId = session.client_reference_id
        const customerId = session.customer

        if (userId) {
          // Get subscription details to find expiry
          let expiry = null;
          if (session.subscription) {
            try {
              const sub = await stripe.subscriptions.retrieve(session.subscription as string);
              expiry = new Date(sub.current_period_end * 1000).toISOString();
            } catch (e) {
              console.error("Error fetching subscription for expiry:", e);
            }
          }

          // Grant Pro status
          const { error } = await supabase
            .from("profiles")
            .update({
              subscription_status: "pro",
              subscription_expiry: expiry,
              stripe_customer_id: customerId,
              has_used_trial: true,
            })
            .eq("id", userId)

          if (error) throw error
        }
        break
      }
      
      case "customer.subscription.deleted": {
        const subscription = event.data.object
        const customerId = subscription.customer

        // Revoke Pro status
        const { error } = await supabase
          .from("profiles")
          .update({
            subscription_status: "free",
          })
          .eq("stripe_customer_id", customerId)

        if (error) throw error
        break
      }

      // Handle subscription updates (e.g., payment failed, renewed)
      case "customer.subscription.updated": {
        const subscription = event.data.object
        const customerId = subscription.customer
        const status = subscription.status // 'active', 'past_due', 'canceled', etc.

        if (status === 'active' || status === 'trialing') {
          const expiry = new Date(subscription.current_period_end * 1000).toISOString()
          await supabase
            .from("profiles")
            .update({ 
              subscription_status: "pro",
              subscription_expiry: expiry 
            })
            .eq("stripe_customer_id", customerId)
        } else if (status === 'canceled' || status === 'unpaid' || status === 'past_due') {
          await supabase
            .from("profiles")
            .update({ subscription_status: "free" })
            .eq("stripe_customer_id", customerId)
        }
        break
      }
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 })

  } catch (err) {
    console.error(`Webhook Error: ${err.message}`)
    return new Response(JSON.stringify({ error: err.message }), { status: 400 })
  }
})
