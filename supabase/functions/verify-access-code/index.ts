import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Verify the user
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get the code from request body
    const { code } = await req.json();

    // Get the correct access code from environment
    const correctCode = Deno.env.get('MRP_DEALS_ACCESS_CODE');

    if (!correctCode) {
      console.error('MRP_DEALS_ACCESS_CODE not set');
      throw new Error('Server configuration error');
    }

    console.log('Verifying access code for user:', user.id);

    // Check if code matches
    if (code === correctCode) {
      // Update user profile to grant full access
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ has_full_access: true })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }

      console.log('Access granted to user:', user.id);

      return new Response(
        JSON.stringify({ success: true }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    } else {
      console.log('Invalid code provided for user:', user.id);
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid code' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }
  } catch (error) {
    console.error('Error in verify-access-code function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});