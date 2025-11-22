import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) throw new Error('Unauthorized');

    // Check if caller is super_admin
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Unauthorized: Profile not found');

    if (profile.role !== 'super_admin') {
      throw new Error(`Unauthorized: Only super_admin can create admin users. Your role: ${profile.role}`);
    }

    // Parse request body - handle both formats: { data: {...} } and direct fields
    const body = await req.json();
    const requestData = body.data || body;
    const { email, password, first_name, last_name, user_type, identification } = requestData;

    if (!email || !password) throw new Error('Email and password are required');

    if (user_type && !['admin', 'super_admin'].includes(user_type)) {
      throw new Error('Invalid user_type. Must be "admin" or "super_admin"');
    }

    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        user_type: user_type || 'admin',
        first_name: first_name || '',
        last_name: last_name || ''
      }
    });

    if (createError) throw createError;

    // Update profile with identification path if provided
    // Profile should be created by trigger, but we'll update it with identification
    if (identification && newUser.user?.id) {
      // Wait a bit for trigger to create profile (if it exists)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to update profile with identification - retry up to 3 times
      let profileUpdated = false;
      let lastError = null;
      
      for (let attempt = 0; attempt < 3; attempt++) {
        const { data: updateData, error: profileUpdateError } = await supabaseAdmin
          .from('profiles')
          .update({ identification })
          .eq('id', newUser.user.id)
          .select();
        
        if (!profileUpdateError && updateData && updateData.length > 0) {
          profileUpdated = true;
          break;
        } else {
          lastError = profileUpdateError;
          // Wait before retrying
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }
      
      // If update still fails, try to insert the profile with identification
      if (!profileUpdated) {
        const { error: insertError } = await supabaseAdmin
          .from('profiles')
          .insert({
            id: newUser.user.id,
            identification,
            email: email,
            first_name: first_name || '',
            last_name: last_name || '',
            role: user_type || 'admin'
          });
        
        if (insertError) {
          console.error('Failed to insert profile with identification:', insertError);
          // Return error so we know what went wrong
          throw new Error(`Failed to save identification: ${insertError.message}`);
        }
      }
    }

    // ✅ Profile creation handled by trigger, identification updated above

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user created successfully',
        user: {
          id: newUser.user?.id,
          email: newUser.user?.email,
          user_type: user_type || 'admin'
        }
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 200
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 400
      }
    );
  }
});

