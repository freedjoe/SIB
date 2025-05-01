import { TableTypes } from "@/types/database.types";
import { useSupabaseQuery, QueryOptions } from "./useSupabaseQuery";
import { useSupabaseRealtime } from "./useSupabaseRealtime";

/**
 * Combined hook for fetching data and optionally setting up realtime subscriptions
 * This improved version prioritizes cache usage with real-time updates for better offline support
 */
export function useSupabaseData<T extends keyof TableTypes>(table: T, queryKey: string[] = [], options: QueryOptions<TableTypes[T]> = {}) {
  const {
    realtime = false, // Realtime is opt-in
    select = "*",
    staleTime = Infinity, // Default to using cached data indefinitely
    cacheTime = Infinity, // Keep cache forever by default
    refetchOnWindowFocus = false, // Don't refetch on window focus by default
    refetchOnMount = false, // Don't refetch on component mount by default
    ...queryOptions
  } = options;

  // Set up query with optimized caching options for offline support
  const query = useSupabaseQuery<T>(table, queryKey, {
    select,
    staleTime,
    cacheTime,
    refetchOnWindowFocus,
    refetchOnMount,
    // Add optimistic network handling for offline use
    networkMode: "offlineFirst", // Prefer cached data first
    ...queryOptions,
  });

  // Setup realtime subscription if enabled
  useSupabaseRealtime(
    String(table),
    realtime ? queryKey : [], // Empty array disables the subscription
    { select }
  );

  return query;
}
