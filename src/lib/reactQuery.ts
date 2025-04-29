import { QueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/supabase";
import { supabase } from "./supabase";

// Create a client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
    },
  },
});

// Type helpers for React Query keys
export type TableNames = keyof Database["public"]["Tables"];

export type TableRow<T extends TableNames> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableNames> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableNames> = Database["public"]["Tables"][T]["Update"];

// Type helpers for React Query key factories
export const createQueryKey = <T extends TableNames>(table: T, ...parts: (string | number | null | undefined)[]) =>
  [table, ...parts.filter(Boolean)] as const;

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
