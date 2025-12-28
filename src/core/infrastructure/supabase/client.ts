// src/core/infrastructure/supabase/client.ts

/**
 * Re-export the auto-configured Supabase client.
 *
 * This file provides a stable import path for infrastructure adapters
 * without leaking Supabase integration details to the domain or
 * application layers.
 */
export { supabase } from "@/integrations/supabase/client";
