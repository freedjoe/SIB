import { QueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Cache is kept for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch on window focus since we have realtime
      refetchOnReconnect: false, // Don't refetch on reconnect since we have realtime
      retry: 3, // Retry failed requests 3 times
    },
  },
});

// Helper function to prefetch collection data
export async function prefetchCollection(collection: string, queryKey: string | string[], select: string = "*") {
  const key = Array.isArray(queryKey) ? queryKey : [queryKey];
  await queryClient.prefetchQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, error } = await supabase.from(collection).select(select);
      if (error) throw error;
      return data;
    },
  });
}
