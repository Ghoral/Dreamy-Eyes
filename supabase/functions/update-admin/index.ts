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
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) throw new Error('Unauthorized: Profile not found');

    if (profile.user_type !== 'super_admin') {
      throw new Error(`Unauthorized: Only super_admin can update admin users. Your role: ${profile.user_type}`);
    }

    // Parse request body
    const body = await req.json();
    const requestData = body.data || body;
    const { user_id, email, password, first_name, last_name, user_type, identification, update_password } = requestData;

    if (!user_id) throw new Error('user_id is required');
    if (!email) throw new Error('Email is required');

    if (user_type && !['admin', 'super_admin'].includes(user_type)) {
      throw new Error('Invalid user_type. Must be "admin" or "super_admin"');
    }

    // Prevent self-modification of user_type
    if (user_id === user.id && user_type && user_type !== profile.user_type) {
      throw new Error('Cannot change your own user type');
    }

    // Update user in auth.users
    const updateUserData: any = {
      email: email,
      user_metadata: {
        user_type: user_type || 'admin',
        first_name: first_name || '',
        last_name: last_name || ''
      }
    };

    // Only update password if provided and update_password is true
    if (password && update_password) {
      updateUserData.password = password;
    }

    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(user_id, updateUserData);

    if (updateUserError) throw updateUserError;

    // Update profile
    const profileUpdateData: any = {
      email: email,
      first_name: first_name || '',
      last_name: last_name || '',
      role: user_type || 'admin'
    };

    // Update identification if provided
    if (identification !== undefined) {
      profileUpdateData.identification = identification;
    }

    const { error: profileUpdateError } = await supabaseAdmin
      .from('profiles')
      .update(profileUpdateData)
      .eq('id', user_id);

    if (profileUpdateError) {
      console.error('Failed to update profile:', profileUpdateError);
      throw new Error(`Failed to update profile: ${profileUpdateError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Admin user updated successfully',
        user: {
          id: user_id,
          email: email,
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




