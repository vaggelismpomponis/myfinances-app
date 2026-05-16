import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4"
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno"

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      return new Response(JSON.stringify({ error: "Missing userId" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Search Stripe for completed checkout sessions belonging to this user
    // client_reference_id is set to userId when the session is created
    const sessions = await stripe.checkout.sessions.list({
      limit: 5,
    })

    // Find a completed session with this user's ID as client_reference_id
    const completedSession = sessions.data.find(
      (s) => s.client_reference_id === userId && s.payment_status !== 'unpaid'
    )

    if (!completedSession) {
      // No completed session found — subscription not active
      return new Response(JSON.stringify({ isPro: false, message: "No completed session found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // Get subscription details for expiry
    let expiry: string | null = null
    let stripeCustomerId = completedSession.customer as string | null

    if (completedSession.subscription) {
      try {
        const sub = await stripe.subscriptions.retrieve(completedSession.subscription as string)
        // Accept active or trialing subscriptions
        if (sub.status === 'active' || sub.status === 'trialing') {
          expiry = new Date(sub.current_period_end * 1000).toISOString()
        } else {
          // Subscription exists but is not active
          return new Response(JSON.stringify({ isPro: false, message: `Subscription status: ${sub.status}` }), {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          })
        }
      } catch (e) {
        console.error("Error fetching subscription:", e)
      }
    }

    // Grant Pro status in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "pro",
        subscription_expiry: expiry,
        stripe_customer_id: stripeCustomerId,
        has_used_trial: true,
      })
      .eq("id", userId)

    if (error) {
      console.error("Supabase update error:", error)
      throw error
    }

    console.log(`sync-subscription: granted Pro to user ${userId}`)

    return new Response(JSON.stringify({ isPro: true, expiry }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })

  } catch (error) {
    console.error("sync-subscription error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
