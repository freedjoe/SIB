import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Hook for invoking Supabase Edge Functions
 */
export function useFunction<T = any, U = any>(functionName: string) {
  return useMutation({
    mutationFn: async (payload: T) => {
      const { data, error } = await supabase.functions.invoke<U>(functionName, {
        body: payload,
      });

      if (error) throw error;
      return data;
    },
  });
}
