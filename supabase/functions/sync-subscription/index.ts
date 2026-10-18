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

    const getPeriodEnd = (sub: any): string | null => {
      const ts = sub?.current_period_end || sub?.items?.data?.[0]?.current_period_end
      return ts ? new Date(ts * 1000).toISOString() : null
    }

    // 1. Check if user profile already has a stripe_customer_id
    const { data: profile } = await supabase
      .from("profiles")
      .select("stripe_customer_id")
      .eq("id", userId)
      .single()

    let activeSub: any = null
    let customerId: string | null = profile?.stripe_customer_id || null

    if (customerId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 5,
        })
        activeSub = subs.data.find((s: any) => s.status === 'active' || s.status === 'trialing')
      } catch (e) {
        console.error("Error querying subscriptions by customerId:", e)
      }
    }

    // 2. If not found by customer ID, search recent checkout sessions
    if (!activeSub) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 20,
      })

      const completedSession = sessions.data.find(
        (s: any) => s.client_reference_id === userId && s.payment_status !== 'unpaid'
      )

      if (completedSession) {
        customerId = (completedSession.customer as string) || customerId
        if (completedSession.subscription) {
          try {
            const sub = await stripe.subscriptions.retrieve(completedSession.subscription as string)
            if (sub.status === 'active' || sub.status === 'trialing') {
              activeSub = sub
            }
          } catch (e) {
            console.error("Error fetching subscription from session:", e)
          }
        }
      }
    }

    if (!activeSub) {
      return new Response(JSON.stringify({ isPro: false, message: "No active subscription found" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    const expiry = getPeriodEnd(activeSub)

    // Grant Pro status in Supabase
    const { error } = await supabase
      .from("profiles")
      .update({
        subscription_status: "pro",
        subscription_expiry: expiry,
        stripe_customer_id: customerId,
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
