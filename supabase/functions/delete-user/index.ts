import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }

  try {
    console.log("🔑 Environment check:", {
      hasSupabaseUrl: !!Deno.env.get("SUPABASE_URL"),
      hasServiceRoleKey: !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    });

    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) throw new Error("Unauthorized");

    console.log("✅ Authenticated user:", user.id);

    // Check role
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) throw new Error("Profile not found");

    if (profile.user_type !== "super_admin") {
      throw new Error("Unauthorized: Only super_admin can delete users");
    }

    // Parse request - handle both formats: { user_id: ... } and { data: { user_id: ... } }
    const body = await req.json();
    const user_id = body.user_id || body.data?.user_id;

    if (!user_id) throw new Error("Missing user_id");

    // Prevent self-deletion
    if (user_id === user.id) {
      throw new Error("Cannot delete your own account");
    }

    // Fetch target profile with identification
    const { data: targetProfile, error: targetError } = await supabaseAdmin
      .from("profiles")
      .select("user_type, email, identification")
      .eq("id", user_id)
      .single();

    if (targetError || !targetProfile) throw new Error("Target user not found");

    console.log("🎯 Target user:", targetProfile);

    // Delete identification file from storage if it exists
    if (targetProfile.identification) {
      try {
        // The identification field now contains just the filename/key
        const fileName = targetProfile.identification;

        const { error: storageError } = await supabaseAdmin.storage
          .from("identification")
          .remove([fileName]);

        // Log error but don't fail the deletion if file doesn't exist
        if (storageError && !storageError.message.includes("not found")) {
          console.error("⚠️ Failed to delete identification file:", storageError);
        }
      } catch (storageErr) {
        console.error("⚠️ Error deleting identification file:", storageErr);
      }
    }

    // ✅ Instead of deleting, anonymize the user in auth.users
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      email: `deleted_${user_id}@anonymized.local`
    });

    if (updateError) {
      console.error("⚠️ Auth anonymization failed:", updateError.message);
      throw new Error(`Auth anonymization failed: ${updateError.message}`);
    }

    // 🧹 Mark the profile as inactive or delete it from public.profiles
    const { error: dbError } = await supabaseAdmin
      .from("profiles")
      .update({
        user_type: "deleted",
        email: null,
        identification: null
      })
      .eq("id", user_id);

    if (dbError) {
      console.warn("⚠️ Profile cleanup failed:", dbError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `User (${targetProfile.email}) anonymized and deactivated successfully.`
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 200
      }
    );
  } catch (error) {
    console.error("🔥 Error in delete-user:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      }
    );
  }
});






