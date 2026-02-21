import { createSupabaseClient } from "./supabase/client/supabaseBrowserClient";

const supabase = createSupabaseClient();

interface EmailPayload {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

/**
 * Sends an email by invoking the 'email' Supabase Edge Function.
 * 
 * @param payload - The email details (to, subject, text/html)
 * @returns An object indicating success and any returned data or error
 */
export const sendEmail = async (payload: EmailPayload) => {
    try {
        const { data, error } = await supabase.functions.invoke('email', {
            body: payload,
        });

        if (error) {
            console.error('Supabase Function Error:', error);
            throw error;
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('Error calling email function:', error.message || error);
        return { success: false, error: error.message || 'Failed to send email' };
    }
};
