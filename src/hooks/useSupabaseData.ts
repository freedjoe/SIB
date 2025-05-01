// Re-export from the refactored modules for backward compatibility
import {
  useSupabaseData,
  useSupabaseQuery,
  useSupabaseRealtime,
  useSupabaseMutation,
  useSupabaseBatchMutation,
  QueryOptions,
  MutationOptions,
} from "./supabase";

export { useSupabaseData, useSupabaseQuery, useSupabaseRealtime, useSupabaseMutation, useSupabaseBatchMutation };

export type { QueryOptions, MutationOptions };
