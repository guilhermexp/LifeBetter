import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.42.0'
import { OAuth2Client } from 'https://deno.land/x/oauth2_client@v1.0.2/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Initialize OAuth client with Google OAuth configurations
const oAuth2Client = new OAuth2Client({
  clientId: Deno.env.get('GOOGLE_CLIENT_ID') || '793965186408-ggkco6gvupbg1roavbts649dedpbojkl.apps.googleusercontent.com',
  clientSecret: Deno.env.get('GOOGLE_CLIENT_SECRET') || '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',
  authorizationEndpointUri: 'https://accounts.google.com/o/oauth2/auth',
  tokenUri: 'https://oauth2.googleapis.com/token',
  redirectUri: Deno.env.get('GOOGLE_REDIRECT_URI') || 'https://tjauuyydxagnugqvmigm.supabase.co/functions/v1/google-calendar-auth/callback',
  defaults: {
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  },
});

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, method } = req;
    const requestUrl = new URL(url);
    
    // Log the full URL for debugging
    console.log(`Request URL: ${url}`);
    console.log(`Request pathname: ${requestUrl.pathname}`);
    
    // Improved path detection using endsWith instead of exact matching
    const pathname = requestUrl.pathname;
    let endpoint = '';
    
    if (pathname.endsWith('/authorize')) {
      endpoint = 'authorize';
    } else if (pathname.endsWith('/callback')) {
      endpoint = 'callback';
    } else if (pathname.endsWith('/events')) {
      endpoint = 'events';
    }
    
    console.log(`Determined endpoint: ${endpoint}`);

    // Handle GET requests
    if (method === 'GET') {
      // Handle authorization initiation
      if (endpoint === 'authorize') {
        const redirectParam = requestUrl.searchParams.get('redirect') || '';
        console.log(`Initiating auth with redirect to: ${redirectParam}`);
        
        // Generate authorization URL
        const authUrl = await oAuth2Client.code.getAuthorizationUri({
          scope: ['https://www.googleapis.com/auth/calendar.readonly'],
          state: redirectParam,
          access_type: 'offline',
          prompt: 'consent',
        });
        
        console.log(`Redirecting to Google auth URL: ${authUrl.toString()}`);
        
        // Redirect the user to Google's authorization page
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: authUrl.toString(),
          },
        });
      }

      // Handle authorization callback with code
      if (endpoint === 'callback') {
        const code = requestUrl.searchParams.get('code');
        const state = requestUrl.searchParams.get('state'); // Contains the redirect URL
        
        console.log(`Received callback with state: ${state}`);
        
        if (!code) {
          console.error('No code provided in callback');
          return new Response(JSON.stringify({ error: 'No code provided' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Exchange code for tokens
        console.log('Exchanging code for tokens');
        const tokens = await oAuth2Client.code.getToken(requestUrl);
        console.log('Tokens received successfully');
        
        // Get the user details to determine which user to associate the tokens with
        console.log('Fetching user info');
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${tokens.accessToken}`,
          },
        });
        
        if (!userResponse.ok) {
          console.error('Failed to fetch user information');
          throw new Error('Failed to fetch user information');
        }
        
        const userData = await userResponse.json();
        const userEmail = userData.email;
        console.log(`User email: ${userEmail}`);
        
        // Get Supabase client with admin privileges
        console.log('Initializing Supabase admin client');
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '',
        );
        
        // Get the user ID from the email
        console.log('Looking up user ID from email');
        const { data: userData2, error: userError } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .eq('email', userEmail)
          .single();
        
        let userId = null;
          
        if (userError) {
          console.log('Trying to find user in auth.users table');
          // Try to find user in auth.users if not in profiles
          const { data: authUsers, error: authUserError } = await supabaseAdmin
            .auth
            .admin
            .listUsers();
            
          if (authUserError || !authUsers) {
            console.error('User not found:', authUserError);
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          const authUser = authUsers.users.find(u => u.email === userEmail);
          
          if (!authUser) {
            console.error('User not found in auth.users');
            return new Response(JSON.stringify({ error: 'User not found' }), {
              status: 404,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          userId = authUser.id;
          console.log(`Found user in auth.users: ${userId}`);
        } else {
          userId = userData2.id;
          console.log(`Found user in profiles: ${userId}`);
        }
        
        if (!userId) {
          console.error('Could not determine user ID');
          return new Response(JSON.stringify({ error: 'User not found' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Store tokens in the database
        console.log('Storing tokens in the database');
        const { error: insertError } = await supabaseAdmin
          .from('google_calendar_integration')
          .upsert({
            user_id: userId,
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            token_expiry: new Date(Date.now() + (tokens.expiresIn * 1000)).toISOString(),
            is_enabled: true,
          });
          
        if (insertError) {
          console.error('Failed to store tokens:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to store tokens' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Ensure user has preferences record
        console.log('Creating default preferences');
        const { error: prefError } = await supabaseAdmin
          .from('google_calendar_preferences')
          .upsert({
            user_id: userId,
            import_meetings: true,
            import_personal: true,
            import_all: true,
          });
          
        if (prefError) {
          console.error('Failed to create default preferences:', prefError);
          // Continue anyway as this is not critical
        }
        
        // Add success parameter to the redirect URL
        const redirectUrl = new URL(state || window.location.origin);
        redirectUrl.searchParams.set('google-auth', 'success');
        const finalRedirectUrl = redirectUrl.toString();
        
        console.log(`Redirecting to: ${finalRedirectUrl}`);
        
        // Redirect to app with success parameter
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            Location: finalRedirectUrl,
          },
        });
      }
    }

    // Handle POST requests
    if (method === 'POST') {
      // Handle fetch events request
      if (endpoint === 'events') {
        const { authorization } = req.headers;
        if (!authorization) {
          return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Parse the request body
        const reqData = await req.json();
        const { startDate, endDate } = reqData;
        
        // Get Supabase client
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') || '',
          Deno.env.get('SUPABASE_ANON_KEY') || '',
          {
            global: { headers: { Authorization: authorization } },
          }
        );
        
        // Get the current user
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Get the user's tokens
        const { data: integration, error: integrationError } = await supabaseClient
          .from('google_calendar_integration')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (integrationError || !integration) {
          return new Response(JSON.stringify({ error: 'Google Calendar not connected' }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        // Check if token is expired
        const tokenExpiry = new Date(integration.token_expiry);
        if (tokenExpiry < new Date()) {
          // Refresh token
          try {
            const newTokens = await oAuth2Client.refreshToken.refresh(integration.refresh_token);
            
            // Update tokens in the database
            const { error: updateError } = await supabaseClient
              .from('google_calendar_integration')
              .update({
                access_token: newTokens.accessToken,
                token_expiry: new Date(Date.now() + (newTokens.expiresIn * 1000)).toISOString(),
              })
              .eq('user_id', user.id);
              
            if (updateError) {
              throw new Error('Failed to update tokens');
            }
            
            // Update the access token for the current request
            integration.access_token = newTokens.accessToken;
          } catch (error) {
            console.error('Failed to refresh token:', error);
            return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
              status: 401,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
        
        // Get user preferences
        const { data: preferences, error: preferencesError } = await supabaseClient
          .from('google_calendar_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (preferencesError) {
          console.error('Failed to get preferences:', preferencesError);
          // Continue with default preferences
        }
        
        // Fetch events from Google Calendar
        const calendarParams = new URLSearchParams({
          timeMin: startDate || new Date().toISOString(),
          timeMax: endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
        });
        
        const calendarResponse = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/primary/events?${calendarParams}`,
          {
            headers: {
              Authorization: `Bearer ${integration.access_token}`,
            },
          }
        );
        
        if (!calendarResponse.ok) {
          const errorData = await calendarResponse.json();
          return new Response(JSON.stringify({ error: 'Failed to fetch events', details: errorData }), {
            status: calendarResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        const calendarData = await calendarResponse.json();
        
        // Filter events based on user preferences if needed
        let events = calendarData.items || [];
        
        if (preferences) {
          if (!preferences.import_all) {
            events = events.filter((event) => {
              const isMeeting = event.summary?.toLowerCase().includes('meeting') || 
                               event.summary?.toLowerCase().includes('reunião') || 
                               event.description?.toLowerCase().includes('meeting') ||
                               event.description?.toLowerCase().includes('reunião');
                               
              const isPersonal = !isMeeting;
              
              return (isMeeting && preferences.import_meetings) || 
                     (isPersonal && preferences.import_personal);
            });
          }
        }
        
        return new Response(JSON.stringify({ events }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Default response for unhandled routes - provide detailed error information for debugging
    return new Response(JSON.stringify({ 
      error: 'Not found', 
      endpoint,
      requestedPath: requestUrl.pathname,
      method 
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in Google Calendar function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
