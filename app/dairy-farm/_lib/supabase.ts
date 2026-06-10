import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

let _client: SupabaseClient<Database> | undefined;

function getClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_DAIRY_FARM_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_DAIRY_FARM_SUPABASE_KEY!
    );
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop: string | symbol) {
    return (getClient() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
