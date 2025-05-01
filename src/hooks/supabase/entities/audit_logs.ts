import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_data: any;
  new_data: any;
  ip_address: string;
  created_at: string;
}

export const useAuditLogs = (options: { staleTime?: number } = {}) => {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditLog[];
    },
    staleTime: options.staleTime,
  });
};

export const useAuditLogMutation = () => {
  return useMutation({
    mutationFn: async (variables: { type: "INSERT" | "UPDATE" | "DELETE"; id?: string; data: Partial<AuditLog> }) => {
      const { type, id, data } = variables;

      switch (type) {
        case "INSERT":
          const { data: insertedData, error: insertError } = await supabase.from("audit_logs").insert(data).select().single();

          if (insertError) throw insertError;
          return insertedData;

        case "UPDATE":
          if (!id) throw new Error("ID is required for updates");
          const { data: updatedData, error: updateError } = await supabase.from("audit_logs").update(data).eq("id", id).select().single();

          if (updateError) throw updateError;
          return updatedData;

        case "DELETE":
          if (!id) throw new Error("ID is required for deletion");
          const { error: deleteError } = await supabase.from("audit_logs").delete().eq("id", id);

          if (deleteError) throw deleteError;
          return { id };

        default:
          throw new Error("Invalid mutation type");
      }
    },
  });
};
