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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId, email } = await req.json()

    if (!priceId || !userId) {
      return new Response(JSON.stringify({ error: "Missing priceId or userId" }), { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      })
    }

    // Determine return URLs based on the origin
    const origin = req.headers.get("origin") || "http://localhost:5173"

    // Setup Supabase Client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Fetch user profile to check trial status
    const { data: profile } = await supabase
      .from("profiles")
      .select("has_used_trial")
      .eq("id", userId)
      .single()

    const hasUsedTrial = profile?.has_used_trial || false
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || "your_admin@email.com" // Update this in your Supabase Env Vars!
    const isAdmin = email === adminEmail
    
    const isEligibleForTrial = isAdmin || !hasUsedTrial

    const sessionConfig: any = {
      automatic_payment_methods: { enabled: true },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/?upgraded=true`,
      cancel_url: `${origin}/?canceled=true`,
      client_reference_id: userId,
      customer_email: email, // Pre-fill email
    }

    if (isEligibleForTrial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
      }
    }

    // Create Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
