import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/**
 * Hook for setting up Supabase realtime subscriptions
 * Enhanced version to ensure immediate UI updates within the same instance
 */
export function useSupabaseRealtime(table: string, queryKey: string[] = [], options: { select?: string } = {}) {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  // Track component mount state
  const isMounted = useRef(true);

  // Store the table and queryKey in refs to avoid subscription recreation
  const tableRef = useRef(table);
  const queryKeyRef = useRef(queryKey);
  const selectRef = useRef(options.select || "*");

  // Skip setup if empty queryKey is passed (disabled realtime)
  const realtimeEnabled = queryKey.length > 0;

  // Update refs when dependencies change
  useEffect(() => {
    queryKeyRef.current = queryKey;
    tableRef.current = table;
    selectRef.current = options.select || "*";
  }, [queryKey, table, options.select]);

  // Set up and teardown the realtime subscription
  useEffect(() => {
    if (!realtimeEnabled) return;

    isMounted.current = true;

    // Create a unique channel name
    const channelId = `${table}_changes_${Math.random().toString(36).substring(2, 7)}`;

    try {
      console.log(`Setting up realtime subscription for ${table} with keys: [${queryKey.join(", ")}]`);

      const newChannel = supabase
        .channel(channelId)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
            schema: "public",
            table,
          },
          async (payload) => {
            if (!isMounted.current) return;

            console.log(`[REALTIME] Update received for ${table}:`, payload.eventType, payload);

            // Construct the React Query key
            const queryKeyToUpdate = [tableRef.current, ...queryKeyRef.current];
            console.log(`[REALTIME] Processing update for query key:`, queryKeyToUpdate);

            try {
              // STEP 1: Update the cache directly for immediate UI refresh
              const currentData = queryClient.getQueryData(queryKeyToUpdate);

              if (currentData) {
                // Process different event types
                let updatedData;

                if (payload.eventType === "INSERT") {
                  if (Array.isArray(currentData)) {
                    // Check if the record already exists to avoid duplicates
                    const exists = currentData.some((item) => item.id === payload.new.id);
                    updatedData = exists ? currentData : [...currentData, payload.new];
                    console.log(`[REALTIME] Added new record to ${tableRef.current} cache`);
                  } else if (typeof currentData === "object" && currentData !== null) {
                    // For single record, only update if it matches our record
                    updatedData = payload.new.id === currentData.id ? { ...currentData, ...payload.new } : currentData;
                  }
                } else if (payload.eventType === "UPDATE") {
                  if (Array.isArray(currentData)) {
                    updatedData = currentData.map((item) => (item.id === payload.new.id ? { ...item, ...payload.new } : item));
                    console.log(`[REALTIME] Updated record in ${tableRef.current} cache`);
                  } else if (typeof currentData === "object" && currentData !== null) {
                    // For single object updates
                    updatedData = payload.new.id === currentData.id ? { ...currentData, ...payload.new } : currentData;
                  }
                } else if (payload.eventType === "DELETE") {
                  if (Array.isArray(currentData)) {
                    updatedData = currentData.filter((item) => item.id !== payload.old.id);
                    console.log(`[REALTIME] Removed record from ${tableRef.current} cache`);
                  } else if (typeof currentData === "object" && currentData !== null) {
                    // For single object deletion - set to null if it's our object
                    updatedData = payload.old.id === currentData.id ? null : currentData;
                  }
                }

                // Only update if we actually made changes
                if (updatedData !== undefined && JSON.stringify(updatedData) !== JSON.stringify(currentData)) {
                  // IMPORTANT: Force immediate cache update
                  queryClient.setQueryData(queryKeyToUpdate, updatedData);
                  console.log(`[REALTIME] Cache updated for ${tableRef.current}`, updatedData);

                  // Notify React Query that this data was updated
                  queryClient.invalidateQueries({
                    queryKey: queryKeyToUpdate,
                    refetchType: "none", // Prevent actual refetch as we already have the data
                  });
                }
              } else {
                // No cached data, force a refetch
                console.log(`[REALTIME] No cached data found, invalidating query`);
                queryClient.invalidateQueries({
                  queryKey: queryKeyToUpdate,
                  refetchType: "active",
                });
              }

              // STEP 2: Broadcast a custom event to ensure all components update
              // This helps with instances where React Query might not trigger re-renders
              const customEvent = new CustomEvent("supabase-update", {
                detail: {
                  table: tableRef.current,
                  queryKey: queryKeyToUpdate,
                  payload,
                },
              });
              window.dispatchEvent(customEvent);
            } catch (error) {
              console.error(`[REALTIME] Error handling update for ${tableRef.current}:`, error);
              // Fallback to query invalidation in case of error
              queryClient.invalidateQueries({
                queryKey: queryKeyToUpdate,
                refetchType: "active",
              });
            }
          }
        )
        .subscribe((status) => {
          console.log(`[REALTIME] Subscription status for ${table}:`, status);
        });

      if (isMounted.current) {
        setChannel(newChannel);
      }
    } catch (error) {
      console.error(`[REALTIME] Error setting up subscription for ${table}:`, error);
    }

    // Add a global listener for app-wide cache updates
    const handleAppWideUpdates = (event: Event) => {
      // This ensures all components using the same data get updated
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.table === tableRef.current) {
        console.log(`[REALTIME] Received app-wide update for ${tableRef.current}`);
      }
    };

    window.addEventListener("supabase-update", handleAppWideUpdates);

    // Cleanup subscription on unmount
    return () => {
      console.log(`[REALTIME] Cleaning up subscription for ${table}`);
      isMounted.current = false;

      window.removeEventListener("supabase-update", handleAppWideUpdates);

      if (channel) {
        supabase.removeChannel(channel).catch((error) => {
          console.error(`[REALTIME] Error removing channel for ${table}:`, error);
        });
      }
    };
  }, [table, queryClient, realtimeEnabled]); // Only re-run when these dependencies change

  return channel;
}
