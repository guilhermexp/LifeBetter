
import { supabase } from "@/integrations/supabase/client";

// Base URL for the Google Calendar edge function
const FUNCTION_URL = import.meta.env.VITE_SUPABASE_URL ? 
  `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/google-calendar-auth` : 
  'https://tjauuyydxagnugqvmigm.supabase.co/functions/v1/google-calendar-auth';

/**
 * Initiates the Google Calendar authorization flow
 */
export const initiateGoogleAuth = async () => {
  try {
    // Get the current URL to use as redirect after authentication
    const redirectUrl = window.location.origin + '/settings?tab=interacoes';
    
    // Log values for debugging
    console.log('Function URL:', FUNCTION_URL);
    
    // Create a properly formatted URL with query parameters
    const authUrl = `${FUNCTION_URL}/authorize?redirect=${encodeURIComponent(redirectUrl)}`;
    console.log('Making request to:', authUrl);
    
    // Redirect to the authorize endpoint
    window.location.href = authUrl;
  } catch (error) {
    console.error('Error initiating Google auth:', error);
    throw error;
  }
};

/**
 * Fetches events from Google Calendar
 */
export const fetchGoogleCalendarEvents = async (startDate?: string, endDate?: string) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    // Use the events endpoint with proper URL construction
    const eventsUrl = `${FUNCTION_URL}/events`;
    console.log('Fetching events from:', eventsUrl);
    
    const response = await fetch(eventsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ startDate, endDate }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch events');
    }
    
    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error);
    throw error;
  }
};

/**
 * Checks if the user has connected their Google Calendar
 */
export const checkGoogleCalendarConnection = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { connected: false };
    }
    
    const { data: integration, error } = await supabase
      .from('google_calendar_integration')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking Google Calendar connection:', error);
      throw error;
    }
    
    return { 
      connected: !!integration, 
      integration 
    };
  } catch (error) {
    console.error('Error checking Google Calendar connection:', error);
    throw error;
  }
};

/**
 * Saves Google Calendar preferences
 */
export const saveGoogleCalendarPreferences = async (preferences: {
  import_meetings?: boolean;
  import_personal?: boolean;
  import_all?: boolean;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('google_calendar_preferences')
      .upsert({
        user_id: user.id,
        ...preferences,
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error saving Google Calendar preferences:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving Google Calendar preferences:', error);
    throw error;
  }
};

/**
 * Gets user's Google Calendar preferences
 */
export const getGoogleCalendarPreferences = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { data, error } = await supabase
      .from('google_calendar_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      console.error('Error getting Google Calendar preferences:', error);
      throw error;
    }
    
    return data || {
      import_meetings: true,
      import_personal: true,
      import_all: true,
    };
  } catch (error) {
    console.error('Error getting Google Calendar preferences:', error);
    throw error;
  }
};

/**
 * Disconnects Google Calendar integration
 */
export const disconnectGoogleCalendar = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    const { error } = await supabase
      .from('google_calendar_integration')
      .delete()
      .eq('user_id', user.id);
      
    if (error) {
      console.error('Error disconnecting Google Calendar:', error);
      throw error;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error disconnecting Google Calendar:', error);
    throw error;
  }
};
