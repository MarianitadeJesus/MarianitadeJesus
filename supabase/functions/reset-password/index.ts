// deno-lint-ignore-file no-window
// @ts-ignore - Deno is available in Edge Functions environment
import { serve } from "https://deno.land/std@0.208.0/http/server.ts"

interface RequestBody {
  email: string
  newPassword: string
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }
  
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const { email, newPassword } = await req.json() as RequestBody

    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    // Create Supabase admin client
    // @ts-ignore - Deno environment
    const SUPABASE_URL = (Deno as any).env.get("SUPABASE_URL")
    // @ts-ignore - Deno environment
    const SUPABASE_SERVICE_ROLE_KEY = (Deno as any).env.env.get("SUPABASE_SERVICE_ROLE_KEY")

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: "Supabase credentials not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    // Import Supabase admin SDK
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.3")

    // @ts-ignore - type checking
    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Update user password
    const { error } = await adminClient.auth.admin.updateUserById(email, {
      password: newPassword
    })

    if (error) {
      console.error("Error updating password:", error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      )
    }

    console.log(`✅ Password updated for ${email}`)

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("Error:", errorMessage)
    return new Response(
      JSON.stringify({ error: "Internal server error", details: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    )
  }
})
